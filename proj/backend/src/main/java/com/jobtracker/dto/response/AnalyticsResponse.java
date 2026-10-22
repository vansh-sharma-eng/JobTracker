package com.jobtracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private Map<String, Long> statusBreakdown;
    private List<TimeSeriesPoint> applicationsOverTime;
    private List<WeeklyPoint> applicationsPerWeek;
    private double interviewRate;
    private double offerRate;
    private double responseRate;
    private double ghostRate;
    private List<FunnelStage> recruitmentFunnel;
    private List<String> actionableInsights;
    private Map<String, Long> applicationsBySource;
    private Map<String, Long> applicationsByLocationType;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSeriesPoint {
        private String date;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyPoint {
        private String week;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FunnelStage {
        private String stage;
        private long count;
        private double conversionRate; // % from previous stage
        private long dropOffCount;
    }
}
