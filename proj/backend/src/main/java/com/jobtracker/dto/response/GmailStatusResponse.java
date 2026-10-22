package com.jobtracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GmailStatusResponse {

    private boolean connected;
    private String email;
    private LocalDateTime lastSyncAt;
    private int totalEmailsParsed;
    private int totalStatusUpdatesMade;
}
