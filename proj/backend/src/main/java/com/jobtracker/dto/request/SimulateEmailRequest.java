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
public class SimulateEmailRequest {

    @NotBlank(message = "Sender or company name is required")
    private String fromEmail;

    @NotBlank(message = "Subject line is required")
    private String subject;

    @NotBlank(message = "Email body text is required")
    private String body;
}
