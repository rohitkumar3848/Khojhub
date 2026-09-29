package com.khojhub.service;

import com.khojhub.dto.request.HandoverRequest;
import com.khojhub.dto.response.CustodyResponse;
import com.khojhub.exception.BadRequestException;
import com.khojhub.exception.ResourceNotFoundException;
import com.khojhub.model.entity.Claim;
import com.khojhub.model.entity.CustodyRecord;
import com.khojhub.model.entity.Item;
import com.khojhub.model.entity.User;
import com.khojhub.model.enums.ClaimStatus;
import com.khojhub.model.enums.CustodyStatus;
import com.khojhub.model.enums.ItemStatus;
import com.khojhub.repository.ClaimRepository;
import com.khojhub.repository.CustodyRecordRepository;
import com.khojhub.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustodyService {

    private final CustodyRecordRepository custodyRecordRepository;
    private final ClaimRepository claimRepository;
    private final ItemRepository itemRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public CustodyResponse completeHandover(HandoverRequest request, User adminUser) {
        String pickupCode = request.getPickupReferenceCode().trim().toUpperCase();

        Claim claim = claimRepository.findByPickupReferenceCode(pickupCode)
                .orElseThrow(() -> new ResourceNotFoundException("No active claim found with pickup reference code: " + pickupCode));

        Item item = itemRepository.findById(claim.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Associated item not found"));

        if (claim.getStatus() == ClaimStatus.COMPLETED) {
            throw new BadRequestException("This item has already been marked as returned and handed over.");
        }

        CustodyRecord custodyRecord = custodyRecordRepository.findByPickupReferenceCode(pickupCode)
                .or(() -> custodyRecordRepository.findByItemId(item.getId()))
                .orElse(CustodyRecord.builder()
                        .itemId(item.getId())
                        .locationName(item.getCentralDropLocation() != null ? item.getCentralDropLocation().getName() : "Central Desk")
                        .build());

        // Update physical custody record
        custodyRecord.setClaimId(claim.getId());
        custodyRecord.setPickupReferenceCode(pickupCode);
        custodyRecord.setStatus(CustodyStatus.HANDED_OVER);
        custodyRecord.setHandoverToUserId(claim.getClaimantUserId());
        custodyRecord.setHandoverToUserName(claim.getClaimantName());
        custodyRecord.setHandoverByAdminId(adminUser.getId());
        custodyRecord.setHandoverByAdminName(adminUser.getFullName());
        custodyRecord.setHandoverAt(Instant.now());
        custodyRecord.setVerificationNotes(request.getVerificationNotes());
        custodyRecord.setUpdatedAt(Instant.now());
        CustodyRecord savedRecord = custodyRecordRepository.save(custodyRecord);

        // Advance Claim status to COMPLETED (Rule 27)
        claim.setStatus(ClaimStatus.COMPLETED);
        claim.setUpdatedAt(Instant.now());
        claimRepository.save(claim);

        // Advance Item status to RETURNED (Rule 27: item is removed from active explore and moved to returned)
        item.setStatus(ItemStatus.RETURNED);
        item.setUpdatedAt(Instant.now());
        itemRepository.save(item);

        // If this found item was linked to an original lost report, mark that as RETURNED too
        if (item.getOriginalLostItemId() != null) {
            itemRepository.findById(item.getOriginalLostItemId()).ifPresent(lostPost -> {
                lostPost.setStatus(ItemStatus.RETURNED);
                lostPost.setUpdatedAt(Instant.now());
                itemRepository.save(lostPost);
            });
        }

        // Award +20 baseline Karma points to the honest Finder
        userService.addKarmaPoints(claim.getFinderUserId(), 20);

        // Notify Claimant and Finder
        notificationService.sendNotification(
                claim.getClaimantUserId(),
                "Handover Complete!",
                "Your item '" + item.getTitle() + "' was handed over. You can now thank the finder with an optional gratitude reward!",
                "ITEM_HANDED_OVER",
                "/my-claims"
        );

        notificationService.sendNotification(
                claim.getFinderUserId(),
                "Item Successfully Returned!",
                "'" + item.getTitle() + "' was collected by verified owner. You earned +20 Karma points for your honesty!",
                "ITEM_RETURNED",
                "/my-posts"
        );

        auditLogService.log(
                adminUser.getId(),
                adminUser.getEmail(),
                "ITEM_RETURNED",
                "CUSTODY",
                savedRecord.getId(),
                "Central desk handover completed for code: " + pickupCode + ". Item #" + item.getId() + " marked RETURNED.",
                null
        );

        return CustodyResponse.fromEntity(savedRecord, item.getTitle());
    }

    public List<CustodyResponse> getAllRecords() {
        return custodyRecordRepository.findAll().stream()
                .map(r -> {
                    String title = itemRepository.findById(r.getItemId()).map(Item::getTitle).orElse("Item #" + r.getItemId());
                    return CustodyResponse.fromEntity(r, title);
                })
                .collect(Collectors.toList());
    }

    public List<CustodyResponse> getStoredRecords() {
        return custodyRecordRepository.findByStatus(CustodyStatus.STORED).stream()
                .map(r -> {
                    String title = itemRepository.findById(r.getItemId()).map(Item::getTitle).orElse("Item #" + r.getItemId());
                    return CustodyResponse.fromEntity(r, title);
                })
                .collect(Collectors.toList());
    }
}
