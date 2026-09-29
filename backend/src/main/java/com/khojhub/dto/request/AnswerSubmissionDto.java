package com.khojhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerSubmissionDto {

    @NotNull(message = "Question ID is required")
    private Integer questionId;

    @NotBlank(message = "Answer cannot be blank")
    private String answer;
}
