package com.khojhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationQuestionCreateDto {

    private Integer id;

    @NotBlank(message = "Question text cannot be blank")
    private String question;

    @NotBlank(message = "Answer cannot be blank")
    private String answer;
}
