package com.khojhub.model.embedded;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmittedAnswer {
    private Integer questionId;
    private String question;
    private String userAnswer;
    private boolean isCorrect;
}
