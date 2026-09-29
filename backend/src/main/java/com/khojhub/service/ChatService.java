package com.khojhub.service;

import com.khojhub.dto.response.ChatConversationResponse;
import com.khojhub.dto.response.ChatMessageResponse;
import com.khojhub.exception.ForbiddenException;
import com.khojhub.exception.ResourceNotFoundException;
import com.khojhub.model.entity.ChatConversation;
import com.khojhub.model.entity.ChatMessage;
import com.khojhub.model.entity.Item;
import com.khojhub.model.entity.User;
import com.khojhub.repository.ChatConversationRepository;
import com.khojhub.repository.ChatMessageRepository;
import com.khojhub.repository.ItemRepository;
import com.khojhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    public ChatConversation getOrCreateConversation(String itemId, String claimId, String finderId, String claimantId) {
        Optional<ChatConversation> existing = conversationRepository.findByItemIdAndClaimId(itemId, claimId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Item item = itemRepository.findById(itemId).orElse(null);
        String title = item != null ? item.getTitle() : "Item #" + itemId;
        String imageUrl = (item != null && item.getImageUrls() != null && !item.getImageUrls().isEmpty())
                ? item.getImageUrls().get(0) : null;

        List<String> participants = new ArrayList<>();
        if (finderId != null) participants.add(finderId);
        if (claimantId != null && !participants.contains(claimantId)) participants.add(claimantId);

        ChatConversation conversation = ChatConversation.builder()
                .itemId(itemId)
                .claimId(claimId)
                .participantIds(participants)
                .itemTitle(title)
                .itemImageUrl(imageUrl)
                .status("ACTIVE")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return conversationRepository.save(conversation);
    }

    public List<ChatConversationResponse> getUserConversations(String userId) {
        List<ChatConversation> list = conversationRepository.findByParticipantIdsContaining(userId);

        return list.stream()
                .sorted((a, b) -> {
                    Instant tA = a.getLastMessageTimestamp() != null ? a.getLastMessageTimestamp() : a.getCreatedAt();
                    Instant tB = b.getLastMessageTimestamp() != null ? b.getLastMessageTimestamp() : b.getCreatedAt();
                    return tB.compareTo(tA);
                })
                .map(conv -> {
                    String otherUserId = conv.getParticipantIds().stream()
                            .filter(id -> !id.equals(userId))
                            .findFirst().orElse("Unknown");

                    String otherUserName = userRepository.findById(otherUserId)
                            .map(User::getFullName).orElse("KhojHub User");

                    long unreadCount = messageRepository.countByConversationIdAndSenderIdNotAndIsReadFalse(conv.getId(), userId);

                    return ChatConversationResponse.builder()
                            .id(conv.getId())
                            .itemId(conv.getItemId())
                            .claimId(conv.getClaimId())
                            .itemTitle(conv.getItemTitle())
                            .itemImageUrl(conv.getItemImageUrl())
                            .participantIds(conv.getParticipantIds())
                            .otherParticipantId(otherUserId)
                            .otherParticipantName(otherUserName)
                            .status(conv.getStatus())
                            .lastMessage(conv.getLastMessage())
                            .lastMessageTimestamp(conv.getLastMessageTimestamp())
                            .unreadCount(unreadCount)
                            .createdAt(conv.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    public List<ChatMessageResponse> getMessages(String conversationId, User currentUser, boolean isAdmin) {
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!isAdmin && !conversation.getParticipantIds().contains(currentUser.getId())) {
            throw new ForbiddenException("You are not authorized to view messages in this conversation.");
        }

        List<ChatMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);

        // Mark messages from other user as read
        for (ChatMessage m : messages) {
            if (!m.getSenderId().equals(currentUser.getId()) && !m.isRead()) {
                m.setRead(true);
                messageRepository.save(m);
            }
        }

        return messages.stream()
                .map(ChatMessageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ChatMessageResponse sendMessage(String conversationId, String messageText, User sender) {
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.getParticipantIds().contains(sender.getId())) {
            throw new ForbiddenException("You are not a participant in this conversation.");
        }

        ChatMessage message = ChatMessage.builder()
                .conversationId(conversationId)
                .senderId(sender.getId())
                .senderName(sender.getFullName())
                .message(messageText.trim())
                .isRead(false)
                .createdAt(Instant.now())
                .build();

        ChatMessage savedMessage = messageRepository.save(message);

        // Update conversation summary
        conversation.setLastMessage(savedMessage.getMessage());
        conversation.setLastMessageTimestamp(savedMessage.getCreatedAt());
        conversation.setUpdatedAt(Instant.now());
        conversationRepository.save(conversation);

        ChatMessageResponse response = ChatMessageResponse.fromEntity(savedMessage);

        // Broadcast over WebSocket STOMP
        try {
            messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, response);
        } catch (Exception e) {
            log.warn("Failed to broadcast message over WebSocket: {}", e.getMessage());
        }

        // Notify other participants
        for (String participantId : conversation.getParticipantIds()) {
            if (!participantId.equals(sender.getId())) {
                notificationService.sendNotification(
                        participantId,
                        "New Message from " + sender.getFullName(),
                        savedMessage.getMessage().length() > 50 ? savedMessage.getMessage().substring(0, 47) + "..." : savedMessage.getMessage(),
                        "CHAT_MESSAGE",
                        "/chats/" + conversationId
                );
            }
        }

        return response;
    }
}
