package com.jobtracker.controller;

import com.jobtracker.dto.request.CoverLetterRequest;
import com.jobtracker.dto.request.InterviewQuestionsRequest;
import com.jobtracker.dto.request.JobExtractionRequest;
import com.jobtracker.dto.request.ResumeMatchRequest;
import com.jobtracker.dto.response.CoverLetterResponse;
import com.jobtracker.dto.response.InterviewQuestionsResponse;
import com.jobtracker.dto.response.JobExtractionResponse;
import com.jobtracker.dto.response.ResumeMatchResponse;
import com.jobtracker.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Suite", description = "AI Resume Matcher, Cover Letter Generator, Interview Prep, and Job Parser")
public class AiController {

    private final AiService aiService;

    @PostMapping("/match-resume")
    @Operation(summary = "Calculate resume match score and keyword gap analysis against job description")
    public ResponseEntity<ResumeMatchResponse> matchResume(@Valid @RequestBody ResumeMatchRequest request) {
        return ResponseEntity.ok(aiService.matchResume(request));
    }

    @PostMapping("/generate-cover-letter")
    @Operation(summary = "Generate customized professional cover letter for a job application")
    public ResponseEntity<CoverLetterResponse> generateCoverLetter(@Valid @RequestBody CoverLetterRequest request) {
        return ResponseEntity.ok(aiService.generateCoverLetter(request));
    }

    @PostMapping("/interview-questions")
    @Operation(summary = "Generate technical and behavioral interview questions tailored to the position")
    public ResponseEntity<InterviewQuestionsResponse> getInterviewQuestions(@Valid @RequestBody InterviewQuestionsRequest request) {
        return ResponseEntity.ok(aiService.generateInterviewQuestions(request));
    }

    @PostMapping("/extract-job")
    @Operation(summary = "Extract title, company, salary, location, and requirements from pasted text or URL")
    public ResponseEntity<JobExtractionResponse> extractJob(@Valid @RequestBody JobExtractionRequest request) {
        return ResponseEntity.ok(aiService.extractJob(request));
    }
}
