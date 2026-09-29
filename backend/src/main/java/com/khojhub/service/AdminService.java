package com.khojhub.service;

import com.khojhub.dto.response.DashboardStatsResponse;
import com.khojhub.dto.response.ItemResponse;
import com.khojhub.exception.BadRequestException;
import com.khojhub.exception.ResourceNotFoundException;
import com.khojhub.model.entity.CustodyRecord;
import com.khojhub.model.entity.Item;
import com.khojhub.model.entity.RewardTransaction;
import com.khojhub.model.entity.User;
import com.khojhub.model.enums.ClaimStatus;
import com.khojhub.model.enums.CustodyStatus;
import com.khojhub.model.enums.ItemStatus;
import com.khojhub.model.enums.ItemType;
import com.khojhub.model.enums.RewardStatus;
import com.khojhub.repository.ClaimRepository;
import com.khojhub.repository.CustodyRecordRepository;
import com.khojhub.repository.ItemRepository;
import com.khojhub.repository.RewardTransactionRepository;
import com.khojhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

        private final UserRepository userRepository;
        private final ItemRepository itemRepository;
        private final ClaimRepository claimRepository;
        private final CustodyRecordRepository custodyRecordRepository;
        private final RewardTransactionRepository rewardRepository;
        private final NotificationService notificationService;
        private final AuditLogService auditLogService;

        public DashboardStatsResponse getDashboardStats() {
                long totalUsers = userRepository.count();
                long totalLost = itemRepository.countByType(ItemType.LOST);
                long totalFound = itemRepository.countByType(ItemType.FOUND);
                long pendingApprovals = itemRepository.countByStatus(ItemStatus.PENDING_ADMIN_APPROVAL);

                long activeClaims = claimRepository.countByStatusIn(List.of(
                                ClaimStatus.CHAT_ACTIVE,
                                ClaimStatus.QUIZ_PASSED,
                                ClaimStatus.CONFIRMED_BY_FINDER));

                long itemsReturned = itemRepository.countByStatus(ItemStatus.RETURNED);
                long pendingPickup = claimRepository.countByStatus(ClaimStatus.CONFIRMED_BY_FINDER);

                double totalRewards = rewardRepository.findAll().stream()
                                .filter(r -> r.getPaymentStatus() == RewardStatus.SUCCESS)
                                .mapToDouble(RewardTransaction::getTotalAmount)
                                .sum();

                long totalKarma = userRepository.findAll().stream()
                                .mapToLong(User::getKarmaPoints)
                                .sum();

                return DashboardStatsResponse.builder()
                                .totalUsers(totalUsers)
                                .totalLostItems(totalLost)
                                .totalFoundItems(totalFound)
                                .pendingApprovals(pendingApprovals)
                                .activeClaims(activeClaims)
                                .itemsReturned(itemsReturned)
                                .pendingPickup(pendingPickup)
                                .totalRewardAmount(totalRewards)
                                .totalKarmaPoints(totalKarma)
                                .build();
        }

        public List<ItemResponse> getPendingItems() {
                List<Item> pending = itemRepository.findByStatus(ItemStatus.PENDING_ADMIN_APPROVAL);
                return pending.stream()
                                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                                .map(item -> ItemResponse.fromEntity(item, null))
                                .collect(Collectors.toList());
        }

        public ItemResponse approveItem(String itemId, User adminUser) {
                Item item = itemRepository.findById(itemId)
                                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));

                if (item.getStatus() != ItemStatus.PENDING_ADMIN_APPROVAL) {
                        throw new BadRequestException(
                                        "Item is not in pending approval state. Current status: " + item.getStatus());
                }

                item.setStatus(ItemStatus.APPROVED);
                item.setUpdatedAt(Instant.now());
                Item saved = itemRepository.save(item);

                // Update custody record
                custodyRecordRepository.findByItemId(saved.getId()).ifPresent(record -> {
                        record.setReceivedByAdminId(adminUser.getId());
                        record.setReceivedByAdminName(adminUser.getFullName());
                        record.setStatus(CustodyStatus.STORED);
                        record.setUpdatedAt(Instant.now());
                        custodyRecordRepository.save(record);
                });

                // Notify submitter
                String targetUserId = saved.getFinderUserId() != null ? saved.getFinderUserId()
                                : saved.getLostOwnerUserId();
                if (targetUserId != null) {
                        notificationService.sendNotification(
                                        targetUserId,
                                        "Item Approved!",
                                        "Your submission '" + saved.getTitle()
                                                        + "' has been approved and is now live on KhojHub.",
                                        "ITEM_APPROVED",
                                        "/items/" + saved.getId());
                }

                auditLogService.log(
                                adminUser.getId(),
                                adminUser.getEmail(),
                                "ITEM_APPROVED",
                                "ITEM",
                                saved.getId(),
                                "Admin approved item: " + saved.getTitle(),
                                null);

                return ItemResponse.fromEntity(saved, null);
        }

        public ItemResponse rejectItem(String itemId, String reason, User adminUser) {
                Item item = itemRepository.findById(itemId)
                                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));

                if (item.getStatus() != ItemStatus.PENDING_ADMIN_APPROVAL) {
                        throw new BadRequestException("Only pending items can be rejected.");
                }

                item.setStatus(ItemStatus.REJECTED);
                item.setRejectionReason(reason != null ? reason : "Submission did not meet community guidelines.");
                item.setUpdatedAt(Instant.now());
                Item saved = itemRepository.save(item);

                // Notify submitter
                String targetUserId = saved.getFinderUserId() != null ? saved.getFinderUserId()
                                : saved.getLostOwnerUserId();
                if (targetUserId != null) {
                        notificationService.sendNotification(
                                        targetUserId,
                                        "Item Submission Rejected",
                                        "Your item submission '" + saved.getTitle() + "' was rejected. Reason: "
                                                        + saved.getRejectionReason(),
                                        "ITEM_REJECTED",
                                        "/my-posts");
                }

                auditLogService.log(
                                adminUser.getId(),
                                adminUser.getEmail(),
                                "ITEM_REJECTED",
                                "ITEM",
                                saved.getId(),
                                "Admin rejected item: " + saved.getTitle() + ". Reason: " + saved.getRejectionReason(),
                                null);

                return ItemResponse.fromEntity(saved, null);
        }

        public List<ItemResponse> getAllItems() {
                return itemRepository.findAll().stream()
                                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                                .map(item -> ItemResponse.fromEntity(item, null))
                                .collect(Collectors.toList());
        }

        public List<ItemResponse> getReturnedItems() {
                return itemRepository.findByStatus(ItemStatus.RETURNED).stream()
                                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                                .map(item -> ItemResponse.fromEntity(item, null))
                                .collect(Collectors.toList());
        }
}
