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
public class ResumeMatchResponse {

    private int matchScore; // 0 - 100
    private String matchGrade; // Excellent, Strong, Moderate, Low
    private String summary;
    private List<String> matchedKeywords;
    private List<String> missingKeywords;
    private List<String> hardSkillsFound;
    private List<String> hardSkillsMissing;
    private List<String> softSkillsFound;
    private List<String> softSkillsMissing;
    private List<String> improvementRecommendations;
    private int atsScore;
}
