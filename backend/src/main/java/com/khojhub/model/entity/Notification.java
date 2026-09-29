package com.khojhub.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String title;

    private String message;

    private String type; // ITEM_APPROVED, CLAIM_RECEIVED, QUIZ_PASSED, CHAT_MESSAGE, PICKUP_READY, ITEM_RETURNED, REWARD_RECEIVED

    private String linkUrl;

    @Builder.Default
    private boolean read = false;

    @CreatedDate
    private Instant createdAt;
}
