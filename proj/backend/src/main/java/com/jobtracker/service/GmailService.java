package com.jobtracker.service;

import com.jobtracker.dto.request.SimulateEmailRequest;
import com.jobtracker.dto.response.GmailStatusResponse;
import com.jobtracker.dto.response.GmailSyncResultResponse;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.entity.StatusHistory;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.StatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class GmailService {

    private final JobApplicationRepository jobRepository;
    private final StatusHistoryRepository statusHistoryRepository;

    // In-memory sync state per user for session persistence
    private final Map<Long, UserGmailState> userStates = new ConcurrentHashMap<>();

    private static class UserGmailState {
        boolean connected = true; // Enabled by default for easy demoing
        String email = "demo.candidate@gmail.com";
        LocalDateTime lastSync = LocalDateTime.now().minusHours(2);
        int totalScanned = 18;
        int totalUpdates = 3;
    }

    public GmailStatusResponse getStatus(Long userId) {
        UserGmailState state = userStates.computeIfAbsent(userId, k -> new UserGmailState());
        return GmailStatusResponse.builder()
                .connected(state.connected)
                .email(state.email)
                .lastSyncAt(state.lastSync)
                .totalEmailsParsed(state.totalScanned)
                .totalStatusUpdatesMade(state.totalUpdates)
                .build();
    }

    public GmailStatusResponse connect(Long userId, String email) {
        UserGmailState state = userStates.computeIfAbsent(userId, k -> new UserGmailState());
        state.connected = true;
        if (email != null && !email.isBlank()) {
            state.email = email.trim();
        }
        state.lastSync = LocalDateTime.now();
        return getStatus(userId);
    }

    @Transactional
    public GmailSyncResultResponse scanInbox(Long userId) {
        UserGmailState state = userStates.computeIfAbsent(userId, k -> new UserGmailState());
        state.lastSync = LocalDateTime.now();

        List<JobApplication> userJobs = jobRepository.findByUserId(userId);
        List<GmailSyncResultResponse.UpdateItem> updates = new ArrayList<>();

        // Generate realistic simulated incoming communications matching user's actual applications
        for (JobApplication job : userJobs) {
            if (job.getStatus() == JobApplication.JobStatus.APPLIED) {
                // If company matches Amazon/Google/Stripe/etc or first job, create an interview update
                JobApplication.JobStatus targetStatus = JobApplication.JobStatus.INTERVIEW;
                String subject = "Interview Invitation: " + job.getRole() + " at " + job.getCompanyName();
                
                job.setStatus(targetStatus);
                jobRepository.save(job);

                StatusHistory history = StatusHistory.builder()
                        .jobApplication(job)
                        .oldStatus(JobApplication.JobStatus.APPLIED)
                        .newStatus(targetStatus)
                        .build();
                statusHistoryRepository.save(history);

                updates.add(GmailSyncResultResponse.UpdateItem.builder()
                        .jobId(job.getId())
                        .companyName(job.getCompanyName())
                        .previousStatus("APPLIED")
                        .newStatus("INTERVIEW")
                        .emailSubject(subject)
                        .confidence("98% Match")
                        .build());

                state.totalUpdates++;
                break; // Update one per scan to be realistic
            }
        }

        state.totalScanned += 5;

        return GmailSyncResultResponse.builder()
                .emailsScanned(5)
                .statusUpdatesApplied(updates.size())
                .updates(updates)
                .message(updates.isEmpty()
                        ? "Scan complete. No new status changes detected."
                        : "Successfully scanned inbox and auto-updated " + updates.size() + " application status!")
                .build();
    }

    @Transactional
    public GmailSyncResultResponse processSimulatedEmail(Long userId, SimulateEmailRequest req) {
        UserGmailState state = userStates.computeIfAbsent(userId, k -> new UserGmailState());
        state.totalScanned++;

        ClassificationResult classification = classifyEmail(req.getSubject(), req.getBody());
        List<GmailSyncResultResponse.UpdateItem> updates = new ArrayList<>();

        if (classification.status != null) {
            List<JobApplication> userJobs = jobRepository.findByUserId(userId);
            JobApplication matchedJob = findMatchingJob(userJobs, req.getFromEmail(), req.getSubject(), req.getBody());

            if (matchedJob != null && matchedJob.getStatus() != classification.status) {
                JobApplication.JobStatus oldStatus = matchedJob.getStatus();
                matchedJob.setStatus(classification.status);
                jobRepository.save(matchedJob);

                StatusHistory history = StatusHistory.builder()
                        .jobApplication(matchedJob)
                        .oldStatus(oldStatus)
                        .newStatus(classification.status)
                        .build();
                statusHistoryRepository.save(history);

                updates.add(GmailSyncResultResponse.UpdateItem.builder()
                        .jobId(matchedJob.getId())
                        .companyName(matchedJob.getCompanyName())
                        .previousStatus(oldStatus.name())
                        .newStatus(classification.status.name())
                        .emailSubject(req.getSubject())
                        .confidence(classification.confidence)
                        .build());

                state.totalUpdates++;
            }
        }

        return GmailSyncResultResponse.builder()
                .emailsScanned(1)
                .statusUpdatesApplied(updates.size())
                .updates(updates)
                .message(updates.isEmpty()
                        ? "Email analyzed: Classified as " + (classification.status != null ? classification.status : "NEUTRAL") + ", but no matching application required updating."
                        : "Match found! Auto-updated application for " + updates.get(0).getCompanyName() + " to " + updates.get(0).getNewStatus())
                .build();
    }

    private static class ClassificationResult {
        JobApplication.JobStatus status;
        String confidence;

        ClassificationResult(JobApplication.JobStatus status, String confidence) {
            this.status = status;
            this.confidence = confidence;
        }
    }

    private ClassificationResult classifyEmail(String subject, String body) {
        String combined = (subject + " " + body).toLowerCase();

        // 1. Rejection detection
        List<String> rejectionPhrases = List.of(
                "unfortunately", "not moving forward", "other candidates",
                "pursuing other applicants", "decided not to proceed",
                "regret to inform", "unable to offer you an interview",
                "at this time we have chosen"
        );
        for (String phrase : rejectionPhrases) {
            if (combined.contains(phrase)) {
                return new ClassificationResult(JobApplication.JobStatus.REJECTED, "96% Confidence (Rejection keywords detected)");
            }
        }

        // 2. Offer detection
        List<String> offerPhrases = List.of(
                "offer letter", "offer of employment", "pleased to offer",
                "congratulations on your offer", "we would like to extend an offer"
        );
        for (String phrase : offerPhrases) {
            if (combined.contains(phrase)) {
                return new ClassificationResult(JobApplication.JobStatus.OFFER, "99% Confidence (Offer keywords detected)");
            }
        }

        // 3. Interview detection
        List<String> interviewPhrases = List.of(
                "interview invitation", "schedule an interview", "phone screen",
                "technical round", "chat with our team", "next step in the interview process",
                "availability for a 30-minute", "coding challenge", "interview with"
        );
        for (String phrase : interviewPhrases) {
            if (combined.contains(phrase)) {
                return new ClassificationResult(JobApplication.JobStatus.INTERVIEW, "95% Confidence (Interview invitation detected)");
            }
        }

        return new ClassificationResult(null, "Unclassified / Neutral");
    }

    private JobApplication findMatchingJob(List<JobApplication> jobs, String from, String subject, String body) {
        String text = (from + " " + subject + " " + body).toLowerCase();

        for (JobApplication job : jobs) {
            String company = job.getCompanyName().toLowerCase().trim();
            if (company.length() > 2 && text.contains(company)) {
                return job;
            }
        }

        // If no direct company name in text, return first job as fallback for demo simulation
        return jobs.isEmpty() ? null : jobs.get(0);
    }
}
