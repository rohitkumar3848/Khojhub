package com.khojhub.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "audit_logs")
public class AuditLog {

    @Id
    private String id;

    private String actorId;
    private String actorEmail;

    @Indexed
    private String action; // USER_REGISTERED, USER_LOGIN, ITEM_CREATED, ITEM_APPROVED, ITEM_REJECTED,
                           // CLAIM_CREATED, QUIZ_PASSED, etc.

    @Indexed
    private String entityType; // USER, ITEM, CLAIM, CHAT, CUSTODY, REWARD

    private String entityId;

    private String details;

    private Map<String, Object> metadata;

    @CreatedDate
    @Indexed
    private Instant timestamp;
}
