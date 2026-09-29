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
public class RewardRequest {

    @NotBlank(message = "Claim ID is required")
    private String claimId;

    private Double amount;

    private boolean skipReward;

    private String thankYouMessage;
}
