package com.jobtracker.controller;

import com.jobtracker.dto.response.JobApplicationResponse;
import com.jobtracker.security.CurrentUser;
import com.jobtracker.service.ReminderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reminders")
@RequiredArgsConstructor
@Tag(name = "Reminders & Calendar", description = "Follow-up reminders, alert notifications, and Google Calendar sync")
public class ReminderController {

    private final ReminderService reminderService;

    @GetMapping
    @Operation(summary = "Get all active follow-up reminders due within 7 days or overdue")
    public ResponseEntity<List<JobApplicationResponse>> getReminders() {
        return ResponseEntity.ok(reminderService.getUserReminders(CurrentUser.id()));
    }

    @GetMapping("/jobs/{jobId}/calendar-link")
    @Operation(summary = "Generate 1-click Google Calendar event URL for an interview date")
    public ResponseEntity<Map<String, String>> getCalendarLink(@PathVariable Long jobId) {
        return ResponseEntity.ok(reminderService.getGoogleCalendarUrl(CurrentUser.id(), jobId));
    }

    @GetMapping(value = "/jobs/{jobId}/calendar.ics", produces = "text/calendar")
    @Operation(summary = "Download .ics calendar event file for iCal, Outlook, or Apple Calendar")
    public ResponseEntity<String> getIcsFile(@PathVariable Long jobId) {
        String ics = reminderService.generateIcsContent(CurrentUser.id(), jobId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"interview-" + jobId + ".ics\"")
                .contentType(MediaType.parseMediaType("text/calendar"))
                .body(ics);
    }
}
