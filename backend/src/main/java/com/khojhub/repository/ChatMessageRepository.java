package com.khojhub.repository;

import com.khojhub.model.entity.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(String conversationId);

    long countByConversationIdAndSenderIdNotAndIsReadFalse(String conversationId, String userId);
}
