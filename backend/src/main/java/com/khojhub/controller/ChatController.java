package com.khojhub.controller;

import com.khojhub.dto.request.ChatMessageRequest;
import com.khojhub.dto.response.ApiResponse;
import com.khojhub.dto.response.ChatConversationResponse;
import com.khojhub.dto.response.ChatMessageResponse;
import com.khojhub.model.entity.User;
import com.khojhub.security.SecurityUtils;
import com.khojhub.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Endpoints for private claim-based conversations and message histories")
public class ChatController {

    private final ChatService chatService;
    private final SecurityUtils securityUtils;

    @GetMapping("/my")
    @Operation(summary = "Get list of active chat conversations for current user")
    public ResponseEntity<ApiResponse<List<ChatConversationResponse>>> getMyConversations() {
        User currentUser = securityUtils.getCurrentUser();
        List<ChatConversationResponse> list = chatService.getUserConversations(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(list, "Conversations retrieved"));
    }

    @GetMapping("/{conversationId}/messages")
    @Operation(summary = "Get message history for a conversation")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMessages(@PathVariable String conversationId) {
        User currentUser = securityUtils.getCurrentUser();
        boolean isAdmin = securityUtils.isAdmin();
        List<ChatMessageResponse> messages = chatService.getMessages(conversationId, currentUser, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(messages, "Messages retrieved"));
    }

    @PostMapping("/{conversationId}/send")
    @Operation(summary = "Send message in conversation (REST fallback)")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @PathVariable String conversationId,
            @Valid @RequestBody ChatMessageRequest request
    ) {
        User currentUser = securityUtils.getCurrentUser();
        ChatMessageResponse response = chatService.sendMessage(conversationId, request.getMessage(), currentUser);
        return ResponseEntity.ok(ApiResponse.ok(response, "Message sent"));
    }
}
