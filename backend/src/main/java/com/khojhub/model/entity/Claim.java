package com.khojhub.model.entity;

import com.khojhub.model.embedded.SubmittedAnswer;
import com.khojhub.model.enums.ClaimStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "claims")
public class Claim {

    @Id
    private String id;

    @Indexed
    private String itemId;

    @Indexed
    private String claimantUserId;
    private String claimantName;
    private String claimantEmail;

    @Indexed
    private String finderUserId;

    private int score; // 0 to 5

    @Builder.Default
    private List<SubmittedAnswer> submittedAnswers = new ArrayList<>();

    @Indexed
    private ClaimStatus status;

    @Indexed(unique = true, sparse = true)
    private String pickupReferenceCode; // e.g. KH-2026-000921

    private String finderNotes;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
