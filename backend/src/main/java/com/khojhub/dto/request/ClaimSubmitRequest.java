package com.khojhub.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimSubmitRequest {

    @NotEmpty(message = "Answers to verification questions must be provided")
    @Valid
    private List<AnswerSubmissionDto> answers;
}
