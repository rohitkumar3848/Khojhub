package com.khojhub.dto.response;

import com.khojhub.model.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private String id;
    private String userId;
    private String title;
    private String message;
    private String type;
    private String linkUrl;
    private boolean read;
    private Instant createdAt;

    public static NotificationResponse fromEntity(Notification n) {
        if (n == null) return null;
        return NotificationResponse.builder()
                .id(n.getId())
                .userId(n.getUserId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .linkUrl(n.getLinkUrl())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
