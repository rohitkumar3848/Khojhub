package com.khojhub.dto.response;

import com.khojhub.model.entity.RewardTransaction;
import com.khojhub.model.enums.RewardStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RewardResponse {

    private String id;
    private String claimId;
    private String itemId;
    private String claimantId;
    private String claimantName;
    private String finderId;
    private String finderName;
    private double totalAmount;
    private double finderAmount;
    private double platformAmount;
    private RewardStatus paymentStatus;
    private boolean isGoodwillOnly;
    private int karmaPointsAwarded;
    private String thankYouMessage;
    private Instant createdAt;

    public static RewardResponse fromEntity(RewardTransaction r, String claimantName, String finderName) {
        if (r == null) return null;
        return RewardResponse.builder()
                .id(r.getId())
                .claimId(r.getClaimId())
                .itemId(r.getItemId())
                .claimantId(r.getClaimantId())
                .claimantName(claimantName)
                .finderId(r.getFinderId())
                .finderName(finderName)
                .totalAmount(r.getTotalAmount())
                .finderAmount(r.getFinderAmount())
                .platformAmount(r.getPlatformAmount())
                .paymentStatus(r.getPaymentStatus())
                .isGoodwillOnly(r.isGoodwillOnly())
                .karmaPointsAwarded(r.getKarmaPointsAwarded())
                .thankYouMessage(r.getThankYouMessage())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
