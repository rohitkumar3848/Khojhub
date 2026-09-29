package com.khojhub.dto.response;

import com.khojhub.model.entity.Claim;
import com.khojhub.model.entity.Item;
import com.khojhub.model.enums.ClaimStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimResponse {

    private String id;
    private String itemId;
    private String itemTitle;
    private String itemImageUrl;
    private String itemDropLocation;
    private String claimantUserId;
    private String claimantName;
    private String finderUserId;
    private int score;
    private ClaimStatus status;
    private String pickupReferenceCode;
    private String conversationId;
    private String finderNotes;
    private Instant createdAt;
    private Instant updatedAt;

    public static ClaimResponse fromEntity(Claim claim, Item item, String conversationId) {
        if (claim == null) return null;

        String title = item != null ? item.getTitle() : "Item #" + claim.getItemId();
        String imageUrl = (item != null && item.getImageUrls() != null && !item.getImageUrls().isEmpty())
                ? item.getImageUrls().get(0) : null;
        String dropLocation = (item != null && item.getCentralDropLocation() != null)
                ? item.getCentralDropLocation().getName() : null;

        return ClaimResponse.builder()
                .id(claim.getId())
                .itemId(claim.getItemId())
                .itemTitle(title)
                .itemImageUrl(imageUrl)
                .itemDropLocation(dropLocation)
                .claimantUserId(claim.getClaimantUserId())
                .claimantName(claim.getClaimantName())
                .finderUserId(claim.getFinderUserId())
                .score(claim.getScore())
                .status(claim.getStatus())
                .pickupReferenceCode(claim.getPickupReferenceCode())
                .conversationId(conversationId)
                .finderNotes(claim.getFinderNotes())
                .createdAt(claim.getCreatedAt())
                .updatedAt(claim.getUpdatedAt())
                .build();
    }
}
