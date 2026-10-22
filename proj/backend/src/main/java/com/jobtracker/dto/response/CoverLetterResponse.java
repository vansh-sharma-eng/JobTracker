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
public class CoverLetterResponse {

    private String coverLetter;
    private String subjectLine;
    private int wordCount;
    private String toneUsed;
    private List<String> keyStrengthsEmphasized;
}
