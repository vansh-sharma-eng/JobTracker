package com.jobtracker.controller;

import com.jobtracker.dto.response.AttachmentResponse;
import com.jobtracker.entity.Attachment;
import com.jobtracker.security.CurrentUser;
import com.jobtracker.service.AttachmentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/jobs/{jobId}/attachments")
@RequiredArgsConstructor
@Tag(name = "Attachments", description = "Resume/cover letter uploads per job application")
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<AttachmentResponse> upload(@PathVariable Long jobId,
                                                       @RequestParam("file") MultipartFile file,
                                                       @RequestParam(defaultValue = "OTHER") Attachment.FileType type) {
        AttachmentResponse response = attachmentService.upload(CurrentUser.id(), jobId, type, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AttachmentResponse>> list(@PathVariable Long jobId) {
        return ResponseEntity.ok(attachmentService.list(CurrentUser.id(), jobId));
    }

    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<org.springframework.core.io.Resource> download(@PathVariable Long jobId,
                                                                          @PathVariable Long attachmentId) {
        var payload = attachmentService.loadForDownload(CurrentUser.id(), jobId, attachmentId);

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(payload.attachment().getFileName())
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(payload.resource());
    }

    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> delete(@PathVariable Long jobId, @PathVariable Long attachmentId) {
        attachmentService.delete(CurrentUser.id(), jobId, attachmentId);
        return ResponseEntity.noContent().build();
    }
}
