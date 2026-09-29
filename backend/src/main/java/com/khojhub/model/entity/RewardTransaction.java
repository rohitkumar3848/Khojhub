package com.khojhub.model.entity;

import com.khojhub.model.enums.RewardStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "rewards")
public class RewardTransaction {

    @Id
    private String id;

    @Indexed
    private String claimId;

    @Indexed
    private String itemId;

    @Indexed
    private String claimantId;

    @Indexed
    private String finderId;

    private double totalAmount;
    private double finderAmount;
    private double platformAmount;

    @Indexed
    private RewardStatus paymentStatus;

    private String paymentProviderRef;

    private boolean isGoodwillOnly;

    private int karmaPointsAwarded;

    private String thankYouMessage;

    @CreatedDate
    private Instant createdAt;
}
