package com.khojhub.dto.response;

import com.khojhub.model.entity.AuditLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private String id;
    private String actorId;
    private String actorEmail;
    private String action;
    private String entityType;
    private String entityId;
    private String details;
    private Map<String, Object> metadata;
    private Instant timestamp;

    public static AuditLogResponse fromEntity(AuditLog log) {
        if (log == null) return null;
        return AuditLogResponse.builder()
                .id(log.getId())
                .actorId(log.getActorId())
                .actorEmail(log.getActorEmail())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .details(log.getDetails())
                .metadata(log.getMetadata())
                .timestamp(log.getTimestamp())
                .build();
    }
}
