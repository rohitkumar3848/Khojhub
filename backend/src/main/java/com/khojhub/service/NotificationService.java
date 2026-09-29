package com.khojhub.service;

import com.khojhub.dto.response.NotificationResponse;
import com.khojhub.model.entity.Notification;
import com.khojhub.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void sendNotification(String userId, String title, String message, String type, String linkUrl) {
        if (userId == null)
            return;
        try {
            Notification notification = Notification.builder()
                    .userId(userId)
                    .title(title)
                    .message(message)
                    .type(type)
                    .linkUrl(linkUrl)
                    .read(false)
                    .createdAt(Instant.now())
                    .build();

            Notification saved = notificationRepository.save(notification);

            // Push notification to user's real-time STOMP topic
            try {
                messagingTemplate.convertAndSend("/topic/notifications/" + userId,
                        NotificationResponse.fromEntity(saved));
            } catch (Exception wsEx) {
                log.debug("STOMP notification push skipped or failed: {}", wsEx.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to send notification to user {}: {}", userId, e.getMessage());
        }
    }

    public List<NotificationResponse> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markAsRead(String notificationId, String userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUserId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    public void markAllAsRead(String userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : list) {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        }
    }
}
