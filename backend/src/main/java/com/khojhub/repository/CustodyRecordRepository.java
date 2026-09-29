package com.khojhub.repository;

import com.khojhub.model.entity.CustodyRecord;
import com.khojhub.model.enums.CustodyStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustodyRecordRepository extends MongoRepository<CustodyRecord, String> {

    Optional<CustodyRecord> findByItemId(String itemId);

    Optional<CustodyRecord> findByPickupReferenceCode(String pickupReferenceCode);

    List<CustodyRecord> findByStatus(CustodyStatus status);

    long countByStatus(CustodyStatus status);
}
