package com.jobtracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.dto.request.CoverLetterRequest;
import com.jobtracker.dto.request.InterviewQuestionsRequest;
import com.jobtracker.dto.request.JobExtractionRequest;
import com.jobtracker.dto.request.ResumeMatchRequest;
import com.jobtracker.dto.request.RegisterRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String jwtToken;

    @BeforeEach
    void setUp() throws Exception {
        String email = "ai_test_" + System.currentTimeMillis() + "@example.com";
        RegisterRequest register = new RegisterRequest();
        register.setName("AI Tester");
        register.setEmail(email);
        register.setPassword("SecurePass123");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        jwtToken = objectMapper.readTree(responseBody).get("accessToken").asText();
    }

    @Test
    void matchResume_returnsMatchScoreAndKeywords() throws Exception {
        ResumeMatchRequest req = ResumeMatchRequest.builder()
                .jobDescription("Seeking Senior Java and Spring Boot Engineer with React, Docker, and MySQL experience.")
                .resumeText("Experienced developer with 4 years building Java, Spring Boot microservices, React, and MySQL.")
                .build();

        mockMvc.perform(post("/api/v1/ai/match-resume")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matchScore").isNumber())
                .andExpect(jsonPath("$.matchedKeywords").isArray())
                .andExpect(jsonPath("$.atsScore").isNumber());
    }

    @Test
    void generateCoverLetter_returnsFormattedLetter() throws Exception {
        CoverLetterRequest req = CoverLetterRequest.builder()
                .companyName("Acme Corp")
                .role("Full Stack Engineer")
                .jobDescription("Develop high throughput microservices.")
                .tone("Professional")
                .build();

        mockMvc.perform(post("/api/v1/ai/generate-cover-letter")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.coverLetter").isString())
                .andExpect(jsonPath("$.wordCount").isNumber());
    }

    @Test
    void interviewQuestions_returnsTechnicalAndBehavioral() throws Exception {
        InterviewQuestionsRequest req = InterviewQuestionsRequest.builder()
                .companyName("TechCorp")
                .role("Backend Engineer")
                .jobDescription("Java Spring Boot REST API")
                .build();

        mockMvc.perform(post("/api/v1/ai/interview-questions")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.technicalQuestions").isArray())
                .andExpect(jsonPath("$.behavioralQuestions").isArray());
    }

    @Test
    void extractJob_parsesJobDetailsFromText() throws Exception {
        JobExtractionRequest req = JobExtractionRequest.builder()
                .content("Hiring at Stripe for a Full Stack Developer! Remote position. Salary 25 LPA. Requirements: Java, React, SQL.")
                .sourceUrl("https://linkedin.com/jobs/view/12345")
                .build();

        mockMvc.perform(post("/api/v1/ai/extract-job")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").exists())
                .andExpect(jsonPath("$.role").value("Full Stack Developer"))
                .andExpect(jsonPath("$.locationType").value("REMOTE"));
    }
}
