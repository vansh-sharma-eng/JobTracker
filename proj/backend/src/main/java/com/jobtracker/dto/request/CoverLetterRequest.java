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
public class CoverLetterRequest {

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Job role/title is required")
    private String role;

    private String jobDescription;
    private String userBackground;
    private String tone; // e.g. "Professional", "Enthusiastic", "Confident", "Modern"
}
