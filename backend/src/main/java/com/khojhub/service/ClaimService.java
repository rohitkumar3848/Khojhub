package com.khojhub.service;

import com.khojhub.dto.request.AnswerSubmissionDto;
import com.khojhub.dto.request.ClaimSubmitRequest;
import com.khojhub.dto.response.ClaimResponse;
import com.khojhub.exception.BadRequestException;
import com.khojhub.exception.ForbiddenException;
import com.khojhub.exception.ResourceNotFoundException;
import com.khojhub.model.embedded.SubmittedAnswer;
import com.khojhub.model.embedded.VerificationQuestion;
import com.khojhub.model.entity.ChatConversation;
import com.khojhub.model.entity.Claim;
import com.khojhub.model.entity.CustodyRecord;
import com.khojhub.model.entity.Item;
import com.khojhub.model.entity.User;
import com.khojhub.model.enums.ClaimStatus;
import com.khojhub.model.enums.ItemStatus;
import com.khojhub.repository.ClaimRepository;
import com.khojhub.repository.CustodyRecordRepository;
import com.khojhub.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ItemRepository itemRepository;
    private final CustodyRecordRepository custodyRecordRepository;
    private final ChatService chatService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public ClaimResponse submitClaim(String itemId, ClaimSubmitRequest request, User currentUser) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));

        // Business Rule 1: Item must be approved and available
        if (item.getStatus() != ItemStatus.APPROVED && item.getStatus() != ItemStatus.ACTIVE) {
            throw new BadRequestException("This item is not currently eligible for claims. Current status: " + item.getStatus());
        }

        // Business Rule 2: Finder cannot claim their own found item
        if (currentUser.getId().equals(item.getFinderUserId())) {
            throw new ForbiddenException("You cannot claim an item you submitted as found.");
        }

        // Business Rule 3: If this found item is matched to an original lost post, ONLY the original lost owner can claim!
        if (item.getOriginalLostItemId() != null && item.getLostOwnerUserId() != null) {
            if (!currentUser.getId().equals(item.getLostOwnerUserId())) {
                throw new ForbiddenException("This found item is exclusively linked to the original lost reporter's claim.");
            }
        }

        // Business Rule 4: Check if another claim has already been confirmed by the finder
        List<Claim> existingClaims = claimRepository.findByItemId(itemId);
        boolean hasConfirmedClaim = existingClaims.stream().anyMatch(c ->
                c.getStatus() == ClaimStatus.CONFIRMED_BY_FINDER ||
                        c.getStatus() == ClaimStatus.READY_FOR_PICKUP ||
                        c.getStatus() == ClaimStatus.COMPLETED
        );
        if (hasConfirmedClaim) {
            throw new BadRequestException("This item is currently locked in an active handover process with another verified owner.");
        }

        // Validate 5 questions exist on the item
        List<VerificationQuestion> verificationQuestions = item.getVerificationQuestions();
        if (verificationQuestions == null || verificationQuestions.size() != 5) {
            throw new BadRequestException("Verification questions are missing or incomplete on this item.");
        }

        // Map submitted answers
        Map<Integer, String> userAnswersMap = request.getAnswers().stream()
                .collect(Collectors.toMap(AnswerSubmissionDto::getQuestionId, AnswerSubmissionDto::getAnswer, (a, b) -> b));

        int correctCount = 0;
        List<SubmittedAnswer> submittedList = new ArrayList<>();

        for (VerificationQuestion vq : verificationQuestions) {
            String claimantAns = userAnswersMap.get(vq.getId());
            boolean isMatch = vq.checkAnswer(claimantAns);
            if (isMatch) {
                correctCount++;
            }
            submittedList.add(SubmittedAnswer.builder()
                    .questionId(vq.getId())
                    .question(vq.getQuestion())
                    .userAnswer(claimantAns)
                    .isCorrect(isMatch)
                    .build());
        }

        // Evaluate passing score: threshold is 3 / 5 (Rule 17)
        boolean passed = correctCount >= 3;
        ClaimStatus finalStatus = passed ? ClaimStatus.QUIZ_PASSED : ClaimStatus.QUIZ_FAILED;

        // Check if claimant has an existing claim to update attempt, or create new
        Optional<Claim> previousClaimOpt = claimRepository.findByItemIdAndClaimantUserId(itemId, currentUser.getId());
        Claim claim;
        if (previousClaimOpt.isPresent()) {
            claim = previousClaimOpt.get();
            claim.setScore(correctCount);
            claim.setSubmittedAnswers(submittedList);
            claim.setStatus(finalStatus);
            claim.setUpdatedAt(Instant.now());
        } else {
            claim = Claim.builder()
                    .itemId(itemId)
                    .claimantUserId(currentUser.getId())
                    .claimantName(currentUser.getFullName())
                    .claimantEmail(currentUser.getEmail())
                    .finderUserId(item.getFinderUserId())
                    .score(correctCount)
                    .submittedAnswers(submittedList)
                    .status(finalStatus)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();
        }

        Claim savedClaim = claimRepository.save(claim);

        String conversationId = null;
        if (passed) {
            // Automatically establish isolated ChatConversation for this Item + Claim (Rule 20)
            ChatConversation conversation = chatService.getOrCreateConversation(
                    item.getId(),
                    savedClaim.getId(),
                    item.getFinderUserId(),
                    currentUser.getId()
            );
            conversationId = conversation.getId();

            savedClaim.setStatus(ClaimStatus.CHAT_ACTIVE);
            savedClaim = claimRepository.save(savedClaim);

            // Notify Finder
            notificationService.sendNotification(
                    item.getFinderUserId(),
                    "Claim Quiz Passed!",
                    currentUser.getFullName() + " scored " + correctCount + "/5 on ownership verification for '" + item.getTitle() + "'. Open chat to verify.",
                    "CLAIM_QUIZ_PASSED",
                    "/chats/" + conversationId
            );

            auditLogService.log(
                    currentUser.getId(),
                    currentUser.getEmail(),
                    "QUIZ_PASSED",
                    "CLAIM",
                    savedClaim.getId(),
                    "Claimant passed quiz with score: " + correctCount + "/5 on item #" + itemId,
                    null
            );
        } else {
            auditLogService.log(
                    currentUser.getId(),
                    currentUser.getEmail(),
                    "QUIZ_FAILED",
                    "CLAIM",
                    savedClaim.getId(),
                    "Claimant failed quiz with score: " + correctCount + "/5 on item #" + itemId,
                    null
            );
        }

        return ClaimResponse.fromEntity(savedClaim, item, conversationId);
    }

    public ClaimResponse confirmGenuineOwner(String claimId, User currentUser) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        Item item = itemRepository.findById(claim.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        if (!currentUser.getId().equals(claim.getFinderUserId())) {
            throw new ForbiddenException("Only the finder can confirm the genuine owner.");
        }

        if (claim.getStatus() != ClaimStatus.QUIZ_PASSED && claim.getStatus() != ClaimStatus.CHAT_ACTIVE) {
            throw new BadRequestException("Claim cannot be confirmed in status: " + claim.getStatus());
        }

        // Generate secure pickup reference code: KH-YYYY-XXXXXX (Rule 26)
        int currentYear = Year.now().getValue();
        int randomCode = 100000 + new Random().nextInt(900000);
        String pickupCode = String.format("KH-%d-%06d", currentYear, randomCode);

        claim.setStatus(ClaimStatus.CONFIRMED_BY_FINDER);
        claim.setPickupReferenceCode(pickupCode);
        claim.setUpdatedAt(Instant.now());
        Claim savedClaim = claimRepository.save(claim);

        // Lock item from competing claims & update item status
        item.setStatus(ItemStatus.FINDER_CONFIRMED);
        item.setUpdatedAt(Instant.now());
        itemRepository.save(item);

        // Update Custody record with pickup reference
        CustodyRecord custodyRecord = custodyRecordRepository.findByItemId(item.getId())
                .orElse(CustodyRecord.builder()
                        .itemId(item.getId())
                        .locationName(item.getCentralDropLocation() != null ? item.getCentralDropLocation().getName() : "Central Desk")
                        .build());
        custodyRecord.setClaimId(savedClaim.getId());
        custodyRecord.setPickupReferenceCode(pickupCode);
        custodyRecord.setUpdatedAt(Instant.now());
        custodyRecordRepository.save(custodyRecord);

        // Notify Claimant
        String dropDesk = item.getCentralDropLocation() != null ? item.getCentralDropLocation().getName() : "Central Reception";
        notificationService.sendNotification(
                claim.getClaimantUserId(),
                "Ownership Confirmed!",
                "Finder confirmed your ownership for '" + item.getTitle() + "'. Your Pickup Reference Code is: " + pickupCode + ". Show this at " + dropDesk + ".",
                "CLAIM_CONFIRMED",
                "/my-claims"
        );

        auditLogService.log(
                currentUser.getId(),
                currentUser.getEmail(),
                "FINDER_CONFIRMED",
                "CLAIM",
                savedClaim.getId(),
                "Finder confirmed genuine owner. Pickup code generated: " + pickupCode,
                null
        );

        String convId = chatService.getOrCreateConversation(item.getId(), claim.getId(), item.getFinderUserId(), claim.getClaimantUserId()).getId();
        return ClaimResponse.fromEntity(savedClaim, item, convId);
    }

    public ClaimResponse rejectClaim(String claimId, String reason, User currentUser) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        Item item = itemRepository.findById(claim.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        if (!currentUser.getId().equals(claim.getFinderUserId())) {
            throw new ForbiddenException("Only the finder can reject a claim.");
        }

        claim.setStatus(ClaimStatus.REJECTED_BY_FINDER);
        claim.setFinderNotes(reason);
        claim.setUpdatedAt(Instant.now());
        Claim savedClaim = claimRepository.save(claim);

        // Restore item status to APPROVED so another eligible claimant can proceed (Rule 22, 23)
        if (item.getStatus() == ItemStatus.FINDER_CONFIRMED || item.getStatus() == ItemStatus.CLAIM_IN_PROGRESS) {
            item.setStatus(ItemStatus.APPROVED);
            item.setUpdatedAt(Instant.now());
            itemRepository.save(item);
        }

        notificationService.sendNotification(
                claim.getClaimantUserId(),
                "Claim Status Update",
                "The finder could not verify ownership for '" + item.getTitle() + "'. Reason: " + (reason != null ? reason : "Insufficient proof"),
                "CLAIM_REJECTED",
                "/my-claims"
        );

        auditLogService.log(
                currentUser.getId(),
                currentUser.getEmail(),
                "CLAIM_REJECTED",
                "CLAIM",
                savedClaim.getId(),
                "Claim rejected by finder for item #" + item.getId(),
                null
        );

        String convId = chatService.getOrCreateConversation(item.getId(), claim.getId(), item.getFinderUserId(), claim.getClaimantUserId()).getId();
        return ClaimResponse.fromEntity(savedClaim, item, convId);
    }

    public List<ClaimResponse> getMyClaims(String currentUserId) {
        List<Claim> claims = claimRepository.findByClaimantUserId(currentUserId);
        return claims.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(c -> {
                    Item item = itemRepository.findById(c.getItemId()).orElse(null);
                    String convId = null;
                    if (c.getStatus() == ClaimStatus.QUIZ_PASSED || c.getStatus() == ClaimStatus.CHAT_ACTIVE || c.getStatus() == ClaimStatus.CONFIRMED_BY_FINDER || c.getStatus() == ClaimStatus.READY_FOR_PICKUP) {
                        convId = chatService.getOrCreateConversation(c.getItemId(), c.getId(), c.getFinderUserId(), c.getClaimantUserId()).getId();
                    }
                    return ClaimResponse.fromEntity(c, item, convId);
                })
                .collect(Collectors.toList());
    }

    public ClaimResponse getClaimById(String claimId, User currentUser, boolean isAdmin) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        if (!isAdmin && !currentUser.getId().equals(claim.getClaimantUserId()) && !currentUser.getId().equals(claim.getFinderUserId())) {
            throw new ForbiddenException("You are not authorized to access this claim.");
        }

        Item item = itemRepository.findById(claim.getItemId()).orElse(null);
        String convId = chatService.getOrCreateConversation(claim.getItemId(), claim.getId(), claim.getFinderUserId(), claim.getClaimantUserId()).getId();
        return ClaimResponse.fromEntity(claim, item, convId);
    }

    public List<ClaimResponse> getClaimsByItemId(String itemId, User currentUser, boolean isAdmin) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        if (!isAdmin && !currentUser.getId().equals(item.getFinderUserId())) {
            throw new ForbiddenException("Only the finder or admin can view all claims for this item.");
        }

        return claimRepository.findByItemId(itemId).stream()
                .map(c -> {
                    String convId = chatService.getOrCreateConversation(c.getItemId(), c.getId(), c.getFinderUserId(), c.getClaimantUserId()).getId();
                    return ClaimResponse.fromEntity(c, item, convId);
                })
                .collect(Collectors.toList());
    }
}
