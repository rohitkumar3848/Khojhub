package com.khojhub.dto.response;

import com.khojhub.model.entity.CustodyRecord;
import com.khojhub.model.enums.CustodyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustodyResponse {

    private String id;
    private String itemId;
    private String itemTitle;
    private String claimId;
    private String pickupReferenceCode;
    private String locationName;
    private String receivedByAdminId;
    private String receivedByAdminName;
    private Instant receivedAt;
    private String handoverToUserId;
    private String handoverToUserName;
    private String handoverByAdminId;
    private String handoverByAdminName;
    private Instant handoverAt;
    private CustodyStatus status;
    private String verificationNotes;
    private Instant createdAt;

    public static CustodyResponse fromEntity(CustodyRecord record, String itemTitle) {
        if (record == null) return null;
        return CustodyResponse.builder()
                .id(record.getId())
                .itemId(record.getItemId())
                .itemTitle(itemTitle)
                .claimId(record.getClaimId())
                .pickupReferenceCode(record.getPickupReferenceCode())
                .locationName(record.getLocationName())
                .receivedByAdminId(record.getReceivedByAdminId())
                .receivedByAdminName(record.getReceivedByAdminName())
                .receivedAt(record.getReceivedAt())
                .handoverToUserId(record.getHandoverToUserId())
                .handoverToUserName(record.getHandoverToUserName())
                .handoverByAdminId(record.getHandoverByAdminId())
                .handoverByAdminName(record.getHandoverByAdminName())
                .handoverAt(record.getHandoverAt())
                .status(record.getStatus())
                .verificationNotes(record.getVerificationNotes())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
