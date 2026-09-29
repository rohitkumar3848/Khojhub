package com.khojhub.dto.response;

import com.khojhub.model.entity.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {

    private String id;
    private String conversationId;
    private String senderId;
    private String senderName;
    private String message;
    private boolean isRead;
    private Instant createdAt;

    public static ChatMessageResponse fromEntity(ChatMessage msg) {
        if (msg == null) return null;
        return ChatMessageResponse.builder()
                .id(msg.getId())
                .conversationId(msg.getConversationId())
                .senderId(msg.getSenderId())
                .senderName(msg.getSenderName())
                .message(msg.getMessage())
                .isRead(msg.isRead())
                .createdAt(msg.getCreatedAt())
                .build();
    }
}
