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
public class JobExtractionRequest {

    @NotBlank(message = "Job posting text or URL is required")
    private String content;

    private String sourceUrl;
}
