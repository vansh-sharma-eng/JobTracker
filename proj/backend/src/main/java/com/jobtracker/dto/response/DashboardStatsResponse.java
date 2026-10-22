package com.jobtracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalApplied;
    private long interview;
    private long offer;
    private long rejected;
    private double successRate;
    private Map<String, Long> statusBreakdown;
}
