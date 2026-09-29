package com.khojhub.repository;

import com.khojhub.model.entity.ChatConversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatConversationRepository extends MongoRepository<ChatConversation, String> {

    Optional<ChatConversation> findByItemIdAndClaimId(String itemId, String claimId);

    List<ChatConversation> findByParticipantIdsContaining(String userId);

    Optional<ChatConversation> findByClaimId(String claimId);
}
