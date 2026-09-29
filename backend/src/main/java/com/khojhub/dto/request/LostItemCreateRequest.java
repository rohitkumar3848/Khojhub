package com.khojhub.dto.request;

import com.khojhub.model.embedded.LocationInfo;
import com.khojhub.model.enums.ItemCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class LostItemCreateRequest {

    @NotBlank(message = "Item title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Item category is required")
    private ItemCategory category;

    @NotNull(message = "Lost location is required")
    private LocationInfo location;

    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    @NotBlank(message = "Lost date is required")
    private String eventDate;

    private String eventTime;
}
