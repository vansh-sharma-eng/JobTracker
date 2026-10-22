package com.jobtracker.controller;

import com.jobtracker.dto.request.SimulateEmailRequest;
import com.jobtracker.dto.response.GmailStatusResponse;
import com.jobtracker.dto.response.GmailSyncResultResponse;
import com.jobtracker.security.CurrentUser;
import com.jobtracker.service.GmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/integrations/gmail")
@RequiredArgsConstructor
@Tag(name = "Gmail Integration", description = "OAuth Gmail inbox scanning and auto-status detection")
public class GmailController {

    private final GmailService gmailService;

    @GetMapping("/status")
    @Operation(summary = "Get current user Gmail connection and sync statistics")
    public ResponseEntity<GmailStatusResponse> getStatus() {
        return ResponseEntity.ok(gmailService.getStatus(CurrentUser.id()));
    }

    @PostMapping("/connect")
    @Operation(summary = "Connect or update user Gmail account")
    public ResponseEntity<GmailStatusResponse> connect(@RequestParam(required = false) String email) {
        return ResponseEntity.ok(gmailService.connect(CurrentUser.id(), email));
    }

    @PostMapping("/scan")
    @Operation(summary = "Trigger on-demand inbox scan and auto-update application statuses")
    public ResponseEntity<GmailSyncResultResponse> scanInbox() {
        return ResponseEntity.ok(gmailService.scanInbox(CurrentUser.id()));
    }

    @PostMapping("/simulate")
    @Operation(summary = "Simulate an incoming email (interview invite, rejection, or offer) to test auto-detection")
    public ResponseEntity<GmailSyncResultResponse> simulateEmail(@Valid @RequestBody SimulateEmailRequest request) {
        return ResponseEntity.ok(gmailService.processSimulatedEmail(CurrentUser.id(), request));
    }
}
