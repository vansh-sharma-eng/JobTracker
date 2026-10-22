package com.jobtracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GmailSyncResultResponse {

    private int emailsScanned;
    private int statusUpdatesApplied;
    private List<UpdateItem> updates;
    private String message;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateItem {
        private Long jobId;
        private String companyName;
        private String previousStatus;
        private String newStatus;
        private String emailSubject;
        private String confidence;
    }
}
