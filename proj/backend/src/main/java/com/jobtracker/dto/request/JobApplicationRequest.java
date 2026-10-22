package com.jobtracker.dto.request;

import com.jobtracker.entity.JobApplication;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class JobApplicationRequest {

    @NotBlank(message = "Company name is required")
    @Size(max = 150)
    private String companyName;

    @NotBlank(message = "Role is required")
    @Size(max = 150)
    private String role;

    @NotNull(message = "Location type is required")
    private JobApplication.LocationType locationType;

    @Size(max = 50)
    private String salary;

    @NotNull(message = "Applied date is required")
    private LocalDate appliedDate;

    private JobApplication.JobStatus status;

    @Size(max = 100)
    private String source;

    @Size(max = 500)
    private String jobUrl;

    private String notes;

    private LocalDate followUpDate;

    private List<String> tags;
}
