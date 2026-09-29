package com.khojhub.dto.response;

import com.khojhub.model.embedded.DropLocationInfo;
import com.khojhub.model.embedded.LocationInfo;
import com.khojhub.model.entity.Item;
import com.khojhub.model.enums.ItemCategory;
import com.khojhub.model.enums.ItemStatus;
import com.khojhub.model.enums.ItemType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemResponse {

    private String id;
    private String title;
    private String description;
    private ItemType type;
    private ItemCategory category;
    private LocationInfo location;

    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    private String finderUserId;
    private String finderName;

    private String lostOwnerUserId;
    private String lostOwnerName;

    private String originalLostItemId;
    private String matchedFoundItemId;

    private DropLocationInfo centralDropLocation;
    private ItemStatus status;
    private String rejectionReason;

    private String eventDate;
    private String eventTime;

    @Builder.Default
    private List<PublicQuestionDto> verificationQuestions = new ArrayList<>();

    private boolean canClaim;
    private boolean isOwnerOrFinder;

    private Instant createdAt;
    private Instant updatedAt;

    public static ItemResponse fromEntity(Item item, String currentUserId) {
        if (item == null) return null;

        List<PublicQuestionDto> publicQuestions = new ArrayList<>();
        if (item.getVerificationQuestions() != null) {
            for (var q : item.getVerificationQuestions()) {
                publicQuestions.add(new PublicQuestionDto(q.getId(), q.getQuestion()));
            }
        }

        boolean isFinder = currentUserId != null && currentUserId.equals(item.getFinderUserId());
        boolean isLostOwner = currentUserId != null && currentUserId.equals(item.getLostOwnerUserId());

        // Can claim logic:
        // For standard approved FOUND items: non-finder can claim if status is APPROVED or ACTIVE
        // For matched lost items: only original lost owner can claim!
        boolean eligibleToClaim = false;
        if (currentUserId != null) {
            if (item.getType() == ItemType.FOUND && (item.getStatus() == ItemStatus.APPROVED || item.getStatus() == ItemStatus.ACTIVE)) {
                if (!isFinder) {
                    if (item.getOriginalLostItemId() != null) {
                        // Linked to a lost post -> only original lost owner can claim!
                        eligibleToClaim = isLostOwner;
                    } else {
                        // Regular public found item -> any other user can claim
                        eligibleToClaim = true;
                    }
                }
            }
        }

        return ItemResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .type(item.getType())
                .category(item.getCategory())
                .location(item.getLocation())
                .imageUrls(item.getImageUrls())
                .finderUserId(item.getFinderUserId())
                .finderName(item.getFinderName())
                .lostOwnerUserId(item.getLostOwnerUserId())
                .lostOwnerName(item.getLostOwnerName())
                .originalLostItemId(item.getOriginalLostItemId())
                .matchedFoundItemId(item.getMatchedFoundItemId())
                .centralDropLocation(item.getCentralDropLocation())
                .status(item.getStatus())
                .rejectionReason(item.getRejectionReason())
                .eventDate(item.getEventDate())
                .eventTime(item.getEventTime())
                .verificationQuestions(publicQuestions)
                .canClaim(eligibleToClaim)
                .isOwnerOrFinder(isFinder || isLostOwner)
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
