package com.khojhub.dto.request;

import com.khojhub.model.embedded.DropLocationInfo;
import com.khojhub.model.embedded.LocationInfo;
import com.khojhub.model.enums.ItemCategory;
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
public class FoundItemCreateRequest {

    @NotBlank(message = "Item title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Item category is required")
    private ItemCategory category;

    @NotNull(message = "Found location is required")
    private LocationInfo location;

    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    @NotNull(message = "Central drop location must be specified")
    private DropLocationInfo centralDropLocation;

    @NotBlank(message = "Found date is required")
    private String eventDate; // e.g. "2026-09-24"

    private String eventTime;

    @NotEmpty(message = "Verification questions are required")
    @Size(min = 5, max = 5, message = "Exactly 5 verification questions must be provided")
    @Valid
    private List<VerificationQuestionCreateDto> verificationQuestions;
}
