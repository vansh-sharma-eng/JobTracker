package com.jobtracker.dto.request;

import com.jobtracker.entity.JobApplication;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    @NotNull(message = "Status is required")
    private JobApplication.JobStatus status;
}
