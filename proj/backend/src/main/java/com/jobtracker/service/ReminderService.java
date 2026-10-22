package com.jobtracker.service;

import com.jobtracker.dto.response.JobApplicationResponse;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderService {

    private final JobApplicationRepository jobRepository;
    private final JobApplicationService jobApplicationService;

    /**
     * Background cron job running daily at 9:00 AM server time.
     * Evaluates all follow-up reminders due today across all users.
     */
    @Scheduled(cron = "${app.reminders.cron:0 0 9 * * ?}")
    public void executeDailyReminderCheck() {
        LocalDate today = LocalDate.now();
        log.info("Running daily background job: Checking follow-up reminders for date {}", today);

        List<JobApplication> dueJobs = jobRepository.findAll().stream()
                .filter(j -> j.getFollowUpDate() != null && !j.getFollowUpDate().isAfter(today))
                .filter(j -> j.getStatus() != JobApplication.JobStatus.REJECTED && j.getStatus() != JobApplication.JobStatus.OFFER)
                .collect(Collectors.toList());

        log.info("Reminder background job completed: Found {} pending follow-up alerts across active pipelines.", dueJobs.size());
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getUserReminders(Long userId) {
        LocalDate horizon = LocalDate.now().plusDays(7);
        return jobRepository.findByUserIdAndFollowUpDateLessThanEqualAndStatusNot(
                        userId, horizon, JobApplication.JobStatus.REJECTED)
                .stream()
                .filter(j -> j.getStatus() != JobApplication.JobStatus.OFFER)
                .map(jobApplicationService::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, String> getGoogleCalendarUrl(Long userId, Long jobId) {
        JobApplication job = jobRepository.findByIdAndUserId(jobId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found"));

        LocalDate date = job.getFollowUpDate() != null ? job.getFollowUpDate() : (job.getAppliedDate() != null ? job.getAppliedDate() : LocalDate.now());
        String dateStr = date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String startDateTime = dateStr + "T100000Z";
        String endDateTime = dateStr + "T110000Z";

        String title = "Interview / Follow-up: " + job.getRole() + " at " + job.getCompanyName();
        String details = "Tracked via JobTracker.\nCompany: " + job.getCompanyName() +
                "\nRole: " + job.getRole() +
                "\nStatus: " + job.getStatus() +
                (job.getJobUrl() != null ? "\nURL: " + job.getJobUrl() : "") +
                (job.getNotes() != null ? "\nNotes: " + job.getNotes() : "");

        String url = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
                "&text=" + URLEncoder.encode(title, StandardCharsets.UTF_8) +
                "&dates=" + startDateTime + "/" + endDateTime +
                "&details=" + URLEncoder.encode(details, StandardCharsets.UTF_8) +
                "&location=" + URLEncoder.encode(job.getLocationType().name(), StandardCharsets.UTF_8);

        return Map.of("calendarUrl", url, "title", title);
    }

    @Transactional(readOnly = true)
    public String generateIcsContent(Long userId, Long jobId) {
        JobApplication job = jobRepository.findByIdAndUserId(jobId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found"));

        LocalDate date = job.getFollowUpDate() != null ? job.getFollowUpDate() : LocalDate.now();
        String dateStr = date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        return "BEGIN:VCALENDAR\n" +
                "VERSION:2.0\n" +
                "PRODID:-//JobTracker//EN\n" +
                "BEGIN:VEVENT\n" +
                "UID:job-" + job.getId() + "@jobtracker.app\n" +
                "DTSTAMP:" + dateStr + "T090000Z\n" +
                "DTSTART:" + dateStr + "T100000Z\n" +
                "DTEND:" + dateStr + "T110000Z\n" +
                "SUMMARY:Interview with " + job.getCompanyName() + " (" + job.getRole() + ")\n" +
                "DESCRIPTION:Job application interview tracked via JobTracker\\nStatus: " + job.getStatus() + "\n" +
                "END:VEVENT\n" +
                "END:VCALENDAR";
    }
}
