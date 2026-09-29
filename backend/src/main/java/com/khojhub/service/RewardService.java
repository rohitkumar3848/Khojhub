package com.khojhub.service;

import com.khojhub.dto.request.RewardRequest;
import com.khojhub.dto.response.RewardResponse;
import com.khojhub.exception.BadRequestException;
import com.khojhub.exception.ResourceNotFoundException;
import com.khojhub.model.entity.Claim;
import com.khojhub.model.entity.Item;
import com.khojhub.model.entity.RewardTransaction;
import com.khojhub.model.entity.User;
import com.khojhub.model.enums.ClaimStatus;
import com.khojhub.model.enums.RewardStatus;
import com.khojhub.repository.ClaimRepository;
import com.khojhub.repository.ItemRepository;
import com.khojhub.repository.RewardTransactionRepository;
import com.khojhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RewardService {

    private final RewardTransactionRepository rewardRepository;
    private final ClaimRepository claimRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Value("${khojhub.reward.finder-share-percentage:50}")
    private double finderSharePercentage;

    @Value("${khojhub.reward.karma-points-goodwill:10}")
    private int karmaPointsGoodwill;

    public RewardResponse processReward(RewardRequest request, User claimantUser) {
        Claim claim = claimRepository.findById(request.getClaimId())
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + request.getClaimId()));

        Item item = itemRepository.findById(claim.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        if (!claimantUser.getId().equals(claim.getClaimantUserId())) {
            throw new BadRequestException("Only the verified claimant/owner can send a gratitude reward.");
        }

        if (claim.getStatus() != ClaimStatus.COMPLETED) {
            throw new BadRequestException("Reward can only be submitted after the item handover has been completed.");
        }

        // Check if reward was already processed for this claim
        if (rewardRepository.findByClaimId(claim.getId()).isPresent()) {
            throw new BadRequestException("A reward or goodwill response has already been submitted for this item claim.");
        }

        boolean isSkipped = request.isSkipReward() || request.getAmount() == null || request.getAmount() <= 0;

        RewardTransaction.RewardTransactionBuilder builder = RewardTransaction.builder()
                .claimId(claim.getId())
                .itemId(item.getId())
                .claimantId(claimantUser.getId())
                .finderId(claim.getFinderUserId())
                .thankYouMessage(request.getThankYouMessage())
                .createdAt(Instant.now());

        if (isSkipped) {
            // Owner skipped monetary reward -> Award goodwill Karma points to finder (Rule 31)
            builder.totalAmount(0.0)
                    .finderAmount(0.0)
                    .platformAmount(0.0)
                    .paymentStatus(RewardStatus.SKIPPED)
                    .isGoodwillOnly(true)
                    .karmaPointsAwarded(karmaPointsGoodwill);

            userService.addKarmaPoints(claim.getFinderUserId(), karmaPointsGoodwill);

            notificationService.sendNotification(
                    claim.getFinderUserId(),
                    "Gratitude Received!",
                    claimantUser.getFullName() + " thanked you for returning '" + item.getTitle() + "'! You received +" + karmaPointsGoodwill + " Karma points.",
                    "GOODWILL_KARMA",
                    "/my-posts"
            );
        } else {
            // Monetary gratitude payment with configurable split (Rule 29, 30)
            double total = request.getAmount();
            double finderShare = (total * (finderSharePercentage / 100.0));
            double platformShare = total - finderShare;

            int bonusKarma = 15;
            builder.totalAmount(total)
                    .finderAmount(finderShare)
                    .platformAmount(platformShare)
                    .paymentStatus(RewardStatus.SUCCESS)
                    .paymentProviderRef("SIM_PAY_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .isGoodwillOnly(false)
                    .karmaPointsAwarded(bonusKarma);

            userService.addKarmaPoints(claim.getFinderUserId(), bonusKarma);

            notificationService.sendNotification(
                    claim.getFinderUserId(),
                    "Reward Received!",
                    "You received a reward of ₹" + String.format("%.0f", finderShare) + " from " + claimantUser.getFullName() + " for returning '" + item.getTitle() + "'!",
                    "REWARD_RECEIVED",
                    "/my-posts"
            );
        }

        RewardTransaction saved = rewardRepository.save(builder.build());

        auditLogService.log(
                claimantUser.getId(),
                claimantUser.getEmail(),
                "REWARD_PROCESSED",
                "REWARD",
                saved.getId(),
                isSkipped ? "Gratitude skipped: awarded " + karmaPointsGoodwill + " karma" : "Gratitude payment processed: ₹" + saved.getTotalAmount(),
                null
        );

        String finderName = userRepository.findById(claim.getFinderUserId()).map(User::getFullName).orElse("Finder");
        return RewardResponse.fromEntity(saved, claimantUser.getFullName(), finderName);
    }

    public List<RewardResponse> getMyRewards(String userId) {
        List<RewardTransaction> transactions = rewardRepository.findByFinderId(userId);
        transactions.addAll(rewardRepository.findByClaimantId(userId));

        return transactions.stream()
                .distinct()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(r -> {
                    String claimantName = userRepository.findById(r.getClaimantId()).map(User::getFullName).orElse("Owner");
                    String finderName = userRepository.findById(r.getFinderId()).map(User::getFullName).orElse("Finder");
                    return RewardResponse.fromEntity(r, claimantName, finderName);
                })
                .collect(Collectors.toList());
    }

    public List<RewardResponse> getAllRewards() {
        return rewardRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(r -> {
                    String claimantName = userRepository.findById(r.getClaimantId()).map(User::getFullName).orElse("Owner");
                    String finderName = userRepository.findById(r.getFinderId()).map(User::getFullName).orElse("Finder");
                    return RewardResponse.fromEntity(r, claimantName, finderName);
                })
                .collect(Collectors.toList());
    }
}
