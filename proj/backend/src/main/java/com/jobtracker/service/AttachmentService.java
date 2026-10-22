package com.jobtracker.service;

import com.jobtracker.dto.response.AttachmentResponse;
import com.jobtracker.entity.Attachment;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.repository.AttachmentRepository;
import com.jobtracker.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public AttachmentResponse upload(Long userId, Long jobId, Attachment.FileType type, MultipartFile file) {
        JobApplication job = jobApplicationRepository.findByIdAndUserId(jobId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found"));

        String relativePath = fileStorageService.store(jobId, file);

        Attachment attachment = Attachment.builder()
                .jobApplication(job)
                .fileName(file.getOriginalFilename())
                .fileType(type)
                .filePath(relativePath)
                .fileSizeBytes(file.getSize())
                .build();

        attachment = attachmentRepository.save(attachment);
        return toResponse(attachment);
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> list(Long userId, Long jobId) {
        jobApplicationRepository.findByIdAndUserId(jobId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found"));
        return attachmentRepository.findByJobApplicationId(jobId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(Long userId, Long jobId, Long attachmentId) {
        jobApplicationRepository.findByIdAndUserId(jobId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found"));

        Attachment attachment = attachmentRepository.findByIdAndJobApplicationId(attachmentId, jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

        fileStorageService.delete(attachment.getFilePath());
        attachmentRepository.delete(attachment);
    }

    /**
     * Loads an attachment for download after verifying the requesting user owns the parent job.
     * Returns the DB record (for filename/content-type) plus the file's bytes as a Resource.
     */
    @Transactional(readOnly = true)
    public DownloadPayload loadForDownload(Long userId, Long jobId, Long attachmentId) {
        jobApplicationRepository.findByIdAndUserId(jobId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found"));

        Attachment attachment = attachmentRepository.findByIdAndJobApplicationId(attachmentId, jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

        Resource resource = fileStorageService.loadAsResource(attachment.getFilePath());
        return new DownloadPayload(attachment, resource);
    }

    public record DownloadPayload(Attachment attachment, Resource resource) {}

    private AttachmentResponse toResponse(Attachment a) {
        return AttachmentResponse.builder()
                .id(a.getId())
                .fileName(a.getFileName())
                .fileType(a.getFileType().name())
                .downloadUrl("/api/v1/jobs/" + a.getJobApplication().getId() + "/attachments/" + a.getId() + "/download")
                .fileSizeBytes(a.getFileSizeBytes())
                .uploadedAt(a.getUploadedAt())
                .build();
    }
}
