package com.khojhub.repository;

import com.khojhub.model.entity.Claim;
import com.khojhub.model.enums.ClaimStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimRepository extends MongoRepository<Claim, String> {

    List<Claim> findByItemId(String itemId);

    List<Claim> findByClaimantUserId(String claimantUserId);

    List<Claim> findByFinderUserId(String finderUserId);

    Optional<Claim> findByItemIdAndClaimantUserId(String itemId, String claimantUserId);

    Optional<Claim> findByPickupReferenceCode(String pickupReferenceCode);

    long countByStatus(ClaimStatus status);

    long countByStatusIn(Collection<ClaimStatus> statuses);

    List<Claim> findByStatus(ClaimStatus status);
}
