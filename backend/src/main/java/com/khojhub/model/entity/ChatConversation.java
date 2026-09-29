package com.khojhub.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chat_conversations")
@CompoundIndex(name = "item_claim_idx", def = "{'itemId': 1, 'claimId': 1}", unique = true)
public class ChatConversation {

    @Id
    private String id;

    @Indexed
    private String itemId;

    @Indexed
    private String claimId;

    @Builder.Default
    private List<String> participantIds = new ArrayList<>();

    private String itemTitle;
    private String itemImageUrl;

    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, CLOSED

    private String lastMessage;
    private Instant lastMessageTimestamp;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
