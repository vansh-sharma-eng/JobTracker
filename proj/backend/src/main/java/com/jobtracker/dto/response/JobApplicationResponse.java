package com.jobtracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationResponse {
    private Long id;
    private String companyName;
    private String role;
    private String locationType;
    private String salary;
    private LocalDate appliedDate;
    private String status;
    private String source;
    private String jobUrl;
    private String notes;
    private LocalDate followUpDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TagResponse> tags;
    private List<AttachmentResponse> attachments;
    private List<StatusHistoryResponse> statusHistory;
}
