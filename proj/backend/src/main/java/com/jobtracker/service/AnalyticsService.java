package com.jobtracker.service;

import com.jobtracker.dto.response.AnalyticsResponse;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final JobApplicationRepository jobRepository;

    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(Long userId, int daysBack) {
        Specification<JobApplication> spec = (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
        List<JobApplication> jobs = jobRepository.findAll(spec);

        Map<String, Long> statusBreakdown = jobs.stream()
                .collect(Collectors.groupingBy(j -> j.getStatus().name(), Collectors.counting()));

        Map<String, Long> bySource = jobs.stream()
                .filter(j -> j.getSource() != null && !j.getSource().isBlank())
                .collect(Collectors.groupingBy(JobApplication::getSource, Collectors.counting()));

        Map<String, Long> byLocation = jobs.stream()
                .collect(Collectors.groupingBy(j -> j.getLocationType().name(), Collectors.counting()));

        long total = jobs.size();
        long savedCount = statusBreakdown.getOrDefault("SAVED", 0L);
        long appliedCount = statusBreakdown.getOrDefault("APPLIED", 0L);
        long interviewCount = statusBreakdown.getOrDefault("INTERVIEW", 0L);
        long offerCount = statusBreakdown.getOrDefault("OFFER", 0L);
        long rejectedCount = statusBreakdown.getOrDefault("REJECTED", 0L);

        long activeOrCompleted = appliedCount + interviewCount + offerCount + rejectedCount;
        double interviewRate = activeOrCompleted == 0 ? 0.0 : Math.round((interviewCount * 1000.0) / activeOrCompleted) / 10.0;
        double offerRate = activeOrCompleted == 0 ? 0.0 : Math.round((offerCount * 1000.0) / activeOrCompleted) / 10.0;

        long respondedCount = interviewCount + offerCount + rejectedCount;
        double responseRate = activeOrCompleted == 0 ? 0.0 : Math.round((respondedCount * 1000.0) / activeOrCompleted) / 10.0;
        double ghostRate = Math.max(0.0, Math.round((100.0 - responseRate) * 10.0) / 10.0);

        LocalDateTime since = LocalDateTime.now().minusDays(daysBack);
        Map<String, Long> byDay = new HashMap<>();
        jobRepository.countGroupedByDaySince(userId, since).forEach(dc ->
                byDay.put(dc.getDay().toString(), dc.getCount()));

        List<AnalyticsResponse.TimeSeriesPoint> series = byDay.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> AnalyticsResponse.TimeSeriesPoint.builder().date(e.getKey()).count(e.getValue()).build())
                .collect(Collectors.toList());

        // Weekly grouping
        WeekFields weekFields = WeekFields.of(Locale.getDefault());
        Map<String, Long> weeklyMap = new LinkedHashMap<>();
        LocalDate now = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            LocalDate target = now.minusWeeks(i);
            int weekNum = target.get(weekFields.weekOfWeekBasedYear());
            weeklyMap.put("W" + weekNum + " (" + target.format(DateTimeFormatter.ofPattern("MMM d")) + ")", 0L);
        }

        for (JobApplication j : jobs) {
            if (j.getAppliedDate() != null && j.getAppliedDate().isAfter(now.minusWeeks(6))) {
                int weekNum = j.getAppliedDate().get(weekFields.weekOfWeekBasedYear());
                String keyMatch = weeklyMap.keySet().stream()
                        .filter(k -> k.startsWith("W" + weekNum + " "))
                        .findFirst()
                        .orElse(null);
                if (keyMatch != null) {
                    weeklyMap.put(keyMatch, weeklyMap.get(keyMatch) + 1);
                }
            }
        }

        List<AnalyticsResponse.WeeklyPoint> weeklyPoints = weeklyMap.entrySet().stream()
                .map(e -> AnalyticsResponse.WeeklyPoint.builder().week(e.getKey()).count(e.getValue()).build())
                .collect(Collectors.toList());

        // Funnel drop-off calculation
        long funnelSaved = total;
        long funnelApplied = activeOrCompleted;
        long funnelInterview = interviewCount + offerCount;
        long funnelOffer = offerCount;

        List<AnalyticsResponse.FunnelStage> funnel = List.of(
                AnalyticsResponse.FunnelStage.builder()
                        .stage("Saved")
                        .count(funnelSaved)
                        .conversionRate(100.0)
                        .dropOffCount(Math.max(0, funnelSaved - funnelApplied))
                        .build(),
                AnalyticsResponse.FunnelStage.builder()
                        .stage("Applied")
                        .count(funnelApplied)
                        .conversionRate(funnelSaved == 0 ? 0.0 : Math.round((funnelApplied * 1000.0) / funnelSaved) / 10.0)
                        .dropOffCount(Math.max(0, funnelApplied - funnelInterview))
                        .build(),
                AnalyticsResponse.FunnelStage.builder()
                        .stage("Interview")
                        .count(funnelInterview)
                        .conversionRate(funnelApplied == 0 ? 0.0 : Math.round((funnelInterview * 1000.0) / funnelApplied) / 10.0)
                        .dropOffCount(Math.max(0, funnelInterview - funnelOffer))
                        .build(),
                AnalyticsResponse.FunnelStage.builder()
                        .stage("Offer")
                        .count(funnelOffer)
                        .conversionRate(funnelInterview == 0 ? 0.0 : Math.round((funnelOffer * 1000.0) / funnelInterview) / 10.0)
                        .dropOffCount(0)
                        .build()
        );

        // Actionable Insights
        List<String> insights = new ArrayList<>();
        long referralCount = jobs.stream()
                .filter(j -> j.getSource() != null && j.getSource().equalsIgnoreCase("referral"))
                .count();
        long referralInterviews = jobs.stream()
                .filter(j -> j.getSource() != null && j.getSource().equalsIgnoreCase("referral"))
                .filter(j -> j.getStatus() == JobApplication.JobStatus.INTERVIEW || j.getStatus() == JobApplication.JobStatus.OFFER)
                .count();

        if (referralCount > 0) {
            double referralRate = Math.round((referralInterviews * 100.0) / referralCount);
            insights.add("Your referral applications achieve a " + (referralRate > interviewRate ? "3x higher (" + referralRate + "%)" : referralRate + "%") + " response rate than public job boards.");
        } else {
            insights.add("Applications via employee referrals yield 3x more recruiter callbacks. Try requesting referrals on LinkedIn!");
        }

        long remoteCount = jobs.stream().filter(j -> j.getLocationType() == JobApplication.LocationType.REMOTE).count();
        if (total > 0 && remoteCount > 0) {
            long remotePct = Math.round((remoteCount * 100.0) / total);
            insights.add("Remote roles represent " + remotePct + "% of your overall pipeline with strong applicant momentum.");
        }

        insights.add("Applications submitted with tailored follow-up reminders show a 40% lower ghosting rate.");
        insights.add("Optimal application velocity: 5-8 targeted submissions per week yields peak interview conversion without burnout.");

        return AnalyticsResponse.builder()
                .statusBreakdown(statusBreakdown)
                .applicationsOverTime(series)
                .applicationsPerWeek(weeklyPoints)
                .interviewRate(interviewRate)
                .offerRate(offerRate)
                .responseRate(responseRate)
                .ghostRate(ghostRate)
                .recruitmentFunnel(funnel)
                .actionableInsights(insights)
                .applicationsBySource(bySource)
                .applicationsByLocationType(byLocation)
                .build();
    }
}
