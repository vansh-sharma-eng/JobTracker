package com.jobtracker.controller;

import com.jobtracker.dto.request.JobApplicationRequest;
import com.jobtracker.dto.request.StatusUpdateRequest;
import com.jobtracker.dto.response.DashboardStatsResponse;
import com.jobtracker.dto.response.JobApplicationResponse;
import com.jobtracker.dto.response.PageResponse;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.entity.User;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.repository.UserRepository;
import com.jobtracker.security.CurrentUser;
import com.jobtracker.service.JobApplicationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
@Tag(name = "Job Applications", description = "CRUD and workflow for job applications")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;
    private final UserRepository userRepository;

    private User currentUserRef() {
        return userRepository.findById(CurrentUser.id())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @PostMapping
    public ResponseEntity<JobApplicationResponse> create(@Valid @RequestBody JobApplicationRequest request) {
        Long userId = CurrentUser.id();
        JobApplicationResponse response = jobApplicationService.create(userId, currentUserRef(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<PageResponse<JobApplicationResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) JobApplication.JobStatus status,
            @RequestParam(required = false) JobApplication.LocationType locationType,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(jobApplicationService.list(
                CurrentUser.id(), search, status, locationType, tag, from, to, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(jobApplicationService.getOne(CurrentUser.id(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> update(@PathVariable Long id,
                                                          @Valid @RequestBody JobApplicationRequest request) {
        return ResponseEntity.ok(jobApplicationService.update(CurrentUser.id(), id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobApplicationResponse> updateStatus(@PathVariable Long id,
                                                                @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(jobApplicationService.updateStatus(CurrentUser.id(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        jobApplicationService.delete(CurrentUser.id(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> stats() {
        return ResponseEntity.ok(jobApplicationService.dashboardStats(CurrentUser.id()));
    }

    @GetMapping("/follow-ups")
    public ResponseEntity<List<JobApplicationResponse>> followUps() {
        return ResponseEntity.ok(jobApplicationService.upcomingFollowUps(CurrentUser.id()));
    }
}
