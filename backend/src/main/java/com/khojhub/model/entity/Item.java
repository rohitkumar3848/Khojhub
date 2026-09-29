package com.khojhub.model.entity;

import com.khojhub.model.embedded.DropLocationInfo;
import com.khojhub.model.embedded.LocationInfo;
import com.khojhub.model.embedded.VerificationQuestion;
import com.khojhub.model.enums.ItemCategory;
import com.khojhub.model.enums.ItemStatus;
import com.khojhub.model.enums.ItemType;
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
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "items")
public class Item {

    @Id
    private String id;

    private String title;

    private String description;

    @Indexed
    private ItemType type; // LOST, FOUND

    @Indexed
    private ItemCategory category;

    private LocationInfo location;

    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    @Indexed
    private String finderUserId;
    private String finderName;

    @Indexed
    private String lostOwnerUserId;
    private String lostOwnerName;

    @Indexed
    private String originalLostItemId; // Linked when found response to a lost post

    private String matchedFoundItemId;

    private DropLocationInfo centralDropLocation;

    @Indexed
    private ItemStatus status;

    @Builder.Default
    private List<VerificationQuestion> verificationQuestions = new ArrayList<>();

    private String rejectionReason;

    private String eventDate; // e.g. "2026-09-24"

    private String eventTime;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
