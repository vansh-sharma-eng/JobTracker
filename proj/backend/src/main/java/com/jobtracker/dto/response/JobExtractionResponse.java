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
public class JobExtractionResponse {

    private String companyName;
    private String role;
    private String locationType; // REMOTE, HYBRID, ONSITE
    private String location;
    private String salary;
    private String source;
    private String jobUrl;
    private List<String> extractedSkills;
    private String summary;
}
