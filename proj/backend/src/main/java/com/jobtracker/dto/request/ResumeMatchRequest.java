package com.jobtracker.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeMatchRequest {

    @NotBlank(message = "Job description is required")
    private String jobDescription;

    @NotBlank(message = "Resume content is required")
    private String resumeText;

    private Long jobId;
}
