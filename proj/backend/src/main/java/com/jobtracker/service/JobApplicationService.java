package com.jobtracker.service;

import com.jobtracker.dto.request.JobApplicationRequest;
import com.jobtracker.dto.request.StatusUpdateRequest;
import com.jobtracker.dto.response.*;
import com.jobtracker.entity.*;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.StatusHistoryRepository;
import com.jobtracker.repository.TagRepository;
import com.jobtracker.util.JobSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository jobRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final TagRepository tagRepository;

    @Transactional
    public JobApplicationResponse create(Long userId, User userRef, JobApplicationRequest request) {
        JobApplication job = JobApplication.builder()
                .user(userRef)
                .companyName(request.getCompanyName().trim())
                .role(request.getRole().trim())
                .locationType(request.getLocationType())
                .salary(request.getSalary())
                .appliedDate(request.getAppliedDate())
                .status(request.getStatus() != null ? request.getStatus() : JobApplication.JobStatus.APPLIED)
                .source(request.getSource())
                .jobUrl(request.getJobUrl())
                .notes(request.getNotes())
                .followUpDate(request.getFollowUpDate())
                .build();

        job.setTags(resolveTags(userId, userRef, request.getTags()));
        job = jobRepository.save(job);

        StatusHistory initialHistory = StatusHistory.builder()
                .jobApplication(job)
                .oldStatus(null)
                .newStatus(job.getStatus())
                .build();
        statusHistoryRepository.save(initialHistory);

        return toResponse(job);
    }

    @Transactional(readOnly = true)
    public PageResponse<JobApplicationResponse> list(Long userId,
                                                       String search,
                                                       JobApplication.JobStatus status,
                                                       JobApplication.LocationType locationType,
                                                       String tag,
                                                       LocalDate from,
                                                       LocalDate to,
                                                       Pageable pageable) {
        Specification<JobApplication> spec = Specification.where(JobSpecifications.forUser(userId))
                .and(JobSpecifications.withSearch(search))
                .and(JobSpecifications.withStatus(status))
                .and(JobSpecifications.withLocationType(locationType))
                .and(JobSpecifications.withTag(tag))
                .and(JobSpecifications.appliedBetween(from, to));

        Page<JobApplication> page = jobRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public JobApplicationResponse getOne(Long userId, Long jobId) {
        JobApplication job = findOwned(userId, jobId);
        return toResponse(job);
    }

    @Transactional
    public JobApplicationResponse update(Long userId, Long jobId, JobApplicationRequest request) {
        JobApplication job = findOwned(userId, jobId);

        job.setCompanyName(request.getCompanyName().trim());
        job.setRole(request.getRole().trim());
        job.setLocationType(request.getLocationType());
        job.setSalary(request.getSalary());
        job.setAppliedDate(request.getAppliedDate());
        job.setSource(request.getSource());
        job.setJobUrl(request.getJobUrl());
        job.setNotes(request.getNotes());
        job.setFollowUpDate(request.getFollowUpDate());

        if (request.getStatus() != null && request.getStatus() != job.getStatus()) {
            recordStatusChange(job, request.getStatus());
        }

        job.setTags(resolveTags(userId, job.getUser(), request.getTags()));

        job = jobRepository.save(job);
        return toResponse(job);
    }

    @Transactional
    public JobApplicationResponse updateStatus(Long userId, Long jobId, StatusUpdateRequest request) {
        JobApplication job = findOwned(userId, jobId);
        recordStatusChange(job, request.getStatus());
        job = jobRepository.save(job);
        return toResponse(job);
    }

    @Transactional
    public void delete(Long userId, Long jobId) {
        JobApplication job = findOwned(userId, jobId);
        jobRepository.delete(job);
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse dashboardStats(Long userId) {
        long total = jobRepository.countByUserId(userId);
        long interview = jobRepository.countByUserIdAndStatus(userId, JobApplication.JobStatus.INTERVIEW);
        long offer = jobRepository.countByUserIdAndStatus(userId, JobApplication.JobStatus.OFFER);
        long rejected = jobRepository.countByUserIdAndStatus(userId, JobApplication.JobStatus.REJECTED);
        double successRate = total == 0 ? 0.0 : Math.round((interview * 1000.0) / total) / 10.0;

        var breakdown = jobRepository.countGroupedByStatus(userId).stream()
                .collect(Collectors.toMap(r -> r.getStatus().name(), JobApplicationRepository.StatusCount::getCount));

        return DashboardStatsResponse.builder()
                .totalApplied(total)
                .interview(interview)
                .offer(offer)
                .rejected(rejected)
                .successRate(successRate)
                .statusBreakdown(breakdown)
                .build();
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> upcomingFollowUps(Long userId) {
        LocalDate today = LocalDate.now().plusDays(7);
        return jobRepository.findByUserIdAndFollowUpDateLessThanEqualAndStatusNot(
                        userId, today, JobApplication.JobStatus.REJECTED)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---------- helpers ----------

    private JobApplication findOwned(Long userId, Long jobId) {
        return jobRepository.findByIdAndUserId(jobId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found"));
    }

    private void recordStatusChange(JobApplication job, JobApplication.JobStatus newStatus) {
        if (job.getStatus() == newStatus) return;
        StatusHistory history = StatusHistory.builder()
                .jobApplication(job)
                .oldStatus(job.getStatus())
                .newStatus(newStatus)
                .build();
        statusHistoryRepository.save(history);
        job.setStatus(newStatus);
    }

    private Set<Tag> resolveTags(Long userId, User userRef, List<String> tagNames) {
        Set<Tag> tags = new HashSet<>();
        if (tagNames == null) return tags;
        for (String rawName : tagNames) {
            if (rawName == null || rawName.isBlank()) continue;
            String name = rawName.trim();
            Tag tag = tagRepository.findByUserIdAndNameIgnoreCase(userId, name)
                    .orElseGet(() -> tagRepository.save(Tag.builder().user(userRef).name(name).build()));
            tags.add(tag);
        }
        return tags;
    }

    JobApplicationResponse toResponse(JobApplication job) {
        return JobApplicationResponse.builder()
                .id(job.getId())
                .companyName(job.getCompanyName())
                .role(job.getRole())
                .locationType(job.getLocationType().name())
                .salary(job.getSalary())
                .appliedDate(job.getAppliedDate())
                .status(job.getStatus().name())
                .source(job.getSource())
                .jobUrl(job.getJobUrl())
                .notes(job.getNotes())
                .followUpDate(job.getFollowUpDate())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .tags(job.getTags().stream()
                        .map(t -> TagResponse.builder().id(t.getId()).name(t.getName()).color(t.getColor()).build())
                        .collect(Collectors.toList()))
                .attachments(job.getAttachments().stream()
                        .map(a -> AttachmentResponse.builder()
                                .id(a.getId())
                                .fileName(a.getFileName())
                                .fileType(a.getFileType().name())
                                .downloadUrl("/api/v1/jobs/" + job.getId() + "/attachments/" + a.getId() + "/download")
                                .fileSizeBytes(a.getFileSizeBytes())
                                .uploadedAt(a.getUploadedAt())
                                .build())
                        .collect(Collectors.toList()))
                .statusHistory(job.getStatusHistory().stream()
                        .sorted((a, b) -> a.getChangedAt().compareTo(b.getChangedAt()))
                        .map(h -> StatusHistoryResponse.builder()
                                .oldStatus(h.getOldStatus() != null ? h.getOldStatus().name() : null)
                                .newStatus(h.getNewStatus().name())
                                .changedAt(h.getChangedAt())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

}
