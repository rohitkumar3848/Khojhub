package com.khojhub.dto.request;

import com.khojhub.model.embedded.DropLocationInfo;
import com.khojhub.model.embedded.LocationInfo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoundMatchRequest {

    @NotBlank(message = "Found description is required")
    private String description;

    @NotNull(message = "Central drop location is required")
    private DropLocationInfo centralDropLocation;

    private LocationInfo location;

    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    @NotBlank(message = "Found date is required")
    private String eventDate;

    private String eventTime;

    @NotEmpty(message = "Verification questions are required")
    @Size(min = 5, max = 5, message = "Exactly 5 verification questions must be provided")
    @Valid
    private List<VerificationQuestionCreateDto> verificationQuestions;
}
