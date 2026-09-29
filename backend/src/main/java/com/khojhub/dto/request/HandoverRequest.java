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
public class HandoverRequest {

    @NotBlank(message = "Pickup reference code (e.g. KH-XXXX-XXXXXX) is required")
    private String pickupReferenceCode;

    private String verificationNotes;
}
