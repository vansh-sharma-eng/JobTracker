package com.jobtracker.controller;

import com.jobtracker.dto.response.AnalyticsResponse;
import com.jobtracker.security.CurrentUser;
import com.jobtracker.service.AnalyticsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Aggregate stats over job applications")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @RequestParam(defaultValue = "90") int daysBack) {
        return ResponseEntity.ok(analyticsService.getAnalytics(CurrentUser.id(), daysBack));
    }
}
