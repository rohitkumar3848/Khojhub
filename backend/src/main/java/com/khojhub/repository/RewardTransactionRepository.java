package com.khojhub.repository;

import com.khojhub.model.entity.RewardTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RewardTransactionRepository extends MongoRepository<RewardTransaction, String> {

    List<RewardTransaction> findByClaimantId(String claimantId);

    List<RewardTransaction> findByFinderId(String finderId);

    Optional<RewardTransaction> findByClaimId(String claimId);
}
