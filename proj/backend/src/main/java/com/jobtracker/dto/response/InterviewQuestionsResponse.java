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
public class InterviewQuestionsResponse {

    private String companyName;
    private String role;
    private List<QuestionItem> technicalQuestions;
    private List<QuestionItem> behavioralQuestions;
    private List<QuestionItem> systemDesignQuestions;
    private List<String> questionsToAskInterviewer;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionItem {
        private String question;
        private String whyAsked;
        private String modelAnswerKeyPoints;
        private String starMethodTip;
    }
}
