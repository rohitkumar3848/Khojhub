package com.khojhub.dto.response;

import com.khojhub.model.entity.ChatConversation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatConversationResponse {

    private String id;
    private String itemId;
    private String claimId;
    private String itemTitle;
    private String itemImageUrl;
    private List<String> participantIds;
    private String otherParticipantName;
    private String otherParticipantId;
    private String status;
    private String lastMessage;
    private Instant lastMessageTimestamp;
    private long unreadCount;
    private Instant createdAt;
}
