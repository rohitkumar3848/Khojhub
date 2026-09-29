package com.khojhub.model.entity;

import com.khojhub.model.enums.CustodyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "custody_records")
public class CustodyRecord {

    @Id
    private String id;

    @Indexed
    private String itemId;

    private String claimId;

    private String pickupReferenceCode;

    private String locationName; // e.g., Tower B Ground Floor Reception

    private String receivedByAdminId;
    private String receivedByAdminName;

    private Instant receivedAt;

    private String handoverToUserId;
    private String handoverToUserName;

    private String handoverByAdminId;
    private String handoverByAdminName;

    private Instant handoverAt;

    @Indexed
    private CustodyStatus status; // STORED, HANDED_OVER, DISPOSED

    private String verificationNotes;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
