package com.khojhub.websocket;

import com.khojhub.model.entity.User;
import com.khojhub.repository.UserRepository;
import com.khojhub.service.ChatService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WsChatMessageDto {
        private String conversationId;
        private String senderId;
        private String message;
    }

    @MessageMapping("/chat.send")
    public void processMessage(@Payload WsChatMessageDto payload, Principal principal) {
        try {
            User sender = null;
            if (principal != null) {
                sender = userRepository.findByEmailIgnoreCase(principal.getName()).orElse(null);
            }
            if (sender == null && payload.getSenderId() != null) {
                sender = userRepository.findById(payload.getSenderId()).orElse(null);
            }

            if (sender != null && payload.getConversationId() != null && payload.getMessage() != null) {
                chatService.sendMessage(payload.getConversationId(), payload.getMessage(), sender);
            }
        } catch (Exception e) {
            log.error("Error processing incoming WebSocket chat message: {}", e.getMessage());
        }
    }
}
