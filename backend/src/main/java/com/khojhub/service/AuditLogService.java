package com.khojhub.service;

import com.khojhub.dto.response.AuditLogResponse;
import com.khojhub.model.entity.AuditLog;
import com.khojhub.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(String actorId, String actorEmail, String action, String entityType, String entityId, String details, Map<String, Object> metadata) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .actorId(actorId)
                    .actorEmail(actorEmail)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .metadata(metadata)
                    .timestamp(Instant.now())
                    .build();
            auditLogRepository.save(auditLog);
            log.info("AUDIT [{}] {} on {} id:{} by {}", action, details, entityType, entityId, actorEmail);
        } catch (Exception e) {
            log.error("Failed to persist audit log: {}", e.getMessage());
        }
    }

    public List<AuditLogResponse> getRecentLogs(int limit) {
        Page<AuditLog> page = auditLogRepository.findAllByOrderByTimestampDesc(PageRequest.of(0, limit));
        return page.getContent().stream()
                .map(AuditLogResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
