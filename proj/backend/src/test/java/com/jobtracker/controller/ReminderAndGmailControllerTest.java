package com.jobtracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.dto.request.RegisterRequest;
import com.jobtracker.dto.request.SimulateEmailRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ReminderAndGmailControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String jwtToken;

    @BeforeEach
    void setUp() throws Exception {
        String email = "integrations_" + System.currentTimeMillis() + "@example.com";
        RegisterRequest register = new RegisterRequest();
        register.setName("Integration Tester");
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
    void getReminders_returnsUserRemindersList() throws Exception {
        mockMvc.perform(get("/api/v1/reminders")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getGmailStatus_returnsConnectionStatus() throws Exception {
        mockMvc.perform(get("/api/v1/integrations/gmail/status")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.connected").isBoolean());
    }

    @Test
    void simulateIncomingEmail_processesAndClassifiesEmail() throws Exception {
        SimulateEmailRequest req = SimulateEmailRequest.builder()
                .fromEmail("recruiting@google.com")
                .subject("Invitation to interview: Software Engineer")
                .body("Hi candidate, we would love to schedule a technical round next week!")
                .build();

        mockMvc.perform(post("/api/v1/integrations/gmail/simulate")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.emailsScanned").value(1));
    }
}
