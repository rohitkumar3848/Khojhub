package com.khojhub.service;

import com.khojhub.dto.request.FoundItemCreateRequest;
import com.khojhub.dto.request.FoundMatchRequest;
import com.khojhub.dto.request.LostItemCreateRequest;
import com.khojhub.dto.request.VerificationQuestionCreateDto;
import com.khojhub.dto.response.ItemResponse;
import com.khojhub.exception.BadRequestException;
import com.khojhub.exception.ForbiddenException;
import com.khojhub.exception.ResourceNotFoundException;
import com.khojhub.model.embedded.VerificationQuestion;
import com.khojhub.model.entity.CustodyRecord;
import com.khojhub.model.entity.Item;
import com.khojhub.model.entity.User;
import com.khojhub.model.enums.CustodyStatus;
import com.khojhub.model.enums.ItemCategory;
import com.khojhub.model.enums.ItemStatus;
import com.khojhub.model.enums.ItemType;
import com.khojhub.repository.CustodyRecordRepository;
import com.khojhub.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItemService {

    private final ItemRepository itemRepository;
    private final CustodyRecordRepository custodyRecordRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public ItemResponse createFoundItem(FoundItemCreateRequest request, User currentUser) {
        if (request.getVerificationQuestions() == null || request.getVerificationQuestions().size() != 5) {
            throw new BadRequestException("Exactly 5 verification questions with correct answers are required.");
        }

        List<VerificationQuestion> questions = new ArrayList<>();
        int qId = 1;
        for (VerificationQuestionCreateDto dto : request.getVerificationQuestions()) {
            if (dto.getQuestion() == null || dto.getQuestion().isBlank() || dto.getAnswer() == null || dto.getAnswer().isBlank()) {
                throw new BadRequestException("All 5 verification questions and their answers must be non-empty.");
            }
            questions.add(VerificationQuestion.builder()
                    .id(qId++)
                    .question(dto.getQuestion().trim())
                    .answerHash(VerificationQuestion.hashAnswer(dto.getAnswer()))
                    .build());
        }

        Item item = Item.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .type(ItemType.FOUND)
                .category(request.getCategory())
                .location(request.getLocation())
                .imageUrls(request.getImageUrls() != null ? request.getImageUrls() : new ArrayList<>())
                .finderUserId(currentUser.getId())
                .finderName(currentUser.getFullName())
                .centralDropLocation(request.getCentralDropLocation())
                .status(ItemStatus.PENDING_ADMIN_APPROVAL)
                .verificationQuestions(questions)
                .eventDate(request.getEventDate())
                .eventTime(request.getEventTime())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Item savedItem = itemRepository.save(item);

        // Record initial custody tracker (physical item submitted to central drop location)
        CustodyRecord custodyRecord = CustodyRecord.builder()
                .itemId(savedItem.getId())
                .locationName(request.getCentralDropLocation().getName())
                .status(CustodyStatus.STORED)
                .receivedAt(Instant.now())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        custodyRecordRepository.save(custodyRecord);

        auditLogService.log(
                currentUser.getId(),
                currentUser.getEmail(),
                "ITEM_CREATED",
                "ITEM",
                savedItem.getId(),
                "Found item reported: " + savedItem.getTitle() + " (Pending Admin Approval)",
                null
        );

        return ItemResponse.fromEntity(savedItem, currentUser.getId());
    }

    public ItemResponse createLostItem(LostItemCreateRequest request, User currentUser) {
        Item item = Item.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .type(ItemType.LOST)
                .category(request.getCategory())
                .location(request.getLocation())
                .imageUrls(request.getImageUrls() != null ? request.getImageUrls() : new ArrayList<>())
                .lostOwnerUserId(currentUser.getId())
                .lostOwnerName(currentUser.getFullName())
                .status(ItemStatus.ACTIVE)
                .eventDate(request.getEventDate())
                .eventTime(request.getEventTime())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Item savedItem = itemRepository.save(item);

        auditLogService.log(
                currentUser.getId(),
                currentUser.getEmail(),
                "ITEM_CREATED",
                "ITEM",
                savedItem.getId(),
                "Lost item reported: " + savedItem.getTitle(),
                null
        );

        return ItemResponse.fromEntity(savedItem, currentUser.getId());
    }

    public ItemResponse reportFoundMatch(String lostItemId, FoundMatchRequest request, User currentUser) {
        Item lostItem = itemRepository.findById(lostItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item not found with id: " + lostItemId));

        if (lostItem.getType() != ItemType.LOST) {
            throw new BadRequestException("Can only report a found match on a LOST item.");
        }

        if (currentUser.getId().equals(lostItem.getLostOwnerUserId())) {
            throw new ForbiddenException("You cannot report finding your own lost item.");
        }

        if (lostItem.getStatus() != ItemStatus.ACTIVE && lostItem.getStatus() != ItemStatus.APPROVED) {
            throw new BadRequestException("This lost item is not active for found reports.");
        }

        if (request.getVerificationQuestions() == null || request.getVerificationQuestions().size() != 5) {
            throw new BadRequestException("Exactly 5 verification questions with correct answers are required.");
        }

        List<VerificationQuestion> questions = new ArrayList<>();
        int qId = 1;
        for (VerificationQuestionCreateDto dto : request.getVerificationQuestions()) {
            questions.add(VerificationQuestion.builder()
                    .id(qId++)
                    .question(dto.getQuestion().trim())
                    .answerHash(VerificationQuestion.hashAnswer(dto.getAnswer()))
                    .build());
        }

        // Create the found response item linked to this lost item
        Item foundItem = Item.builder()
                .title("Found Match: " + lostItem.getTitle())
                .description(request.getDescription().trim())
                .type(ItemType.FOUND)
                .category(lostItem.getCategory())
                .location(request.getLocation() != null ? request.getLocation() : lostItem.getLocation())
                .imageUrls(request.getImageUrls() != null ? request.getImageUrls() : new ArrayList<>())
                .finderUserId(currentUser.getId())
                .finderName(currentUser.getFullName())
                .lostOwnerUserId(lostItem.getLostOwnerUserId())
                .lostOwnerName(lostItem.getLostOwnerName())
                .originalLostItemId(lostItem.getId())
                .centralDropLocation(request.getCentralDropLocation())
                .status(ItemStatus.PENDING_ADMIN_APPROVAL)
                .verificationQuestions(questions)
                .eventDate(request.getEventDate())
                .eventTime(request.getEventTime())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Item savedFoundItem = itemRepository.save(foundItem);

        // Update lostItem's link
        lostItem.setMatchedFoundItemId(savedFoundItem.getId());
        lostItem.setUpdatedAt(Instant.now());
        itemRepository.save(lostItem);

        // Notify the lost item owner
        notificationService.sendNotification(
                lostItem.getLostOwnerUserId(),
                "Potential Match Found!",
                "Someone reported finding an item matching your lost post '" + lostItem.getTitle() + "'. Awaiting admin approval.",
                "MATCH_FOUND",
                "/items/" + savedFoundItem.getId()
        );

        auditLogService.log(
                currentUser.getId(),
                currentUser.getEmail(),
                "FOUND_MATCH_REPORTED",
                "ITEM",
                savedFoundItem.getId(),
                "Found response submitted for lost item #" + lostItemId,
                null
        );

        return ItemResponse.fromEntity(savedFoundItem, currentUser.getId());
    }

    public List<ItemResponse> getPublicItems(String search, ItemType type, ItemCategory category, String building, String currentUserId) {
        List<ItemStatus> publicStatuses = List.of(ItemStatus.APPROVED, ItemStatus.ACTIVE);
        List<Item> items = itemRepository.findByStatusIn(publicStatuses);

        return items.stream()
                .filter(item -> type == null || item.getType() == type)
                .filter(item -> category == null || item.getCategory() == category)
                .filter(item -> building == null || building.isBlank() || (item.getLocation() != null && building.equalsIgnoreCase(item.getLocation().getBuilding())))
                .filter(item -> {
                    if (search == null || search.isBlank()) return true;
                    String q = search.toLowerCase();
                    boolean titleMatch = item.getTitle() != null && item.getTitle().toLowerCase().contains(q);
                    boolean descMatch = item.getDescription() != null && item.getDescription().toLowerCase().contains(q);
                    boolean locMatch = item.getLocation() != null && (
                            (item.getLocation().getBuilding() != null && item.getLocation().getBuilding().toLowerCase().contains(q)) ||
                                    (item.getLocation().getAreaDetails() != null && item.getLocation().getAreaDetails().toLowerCase().contains(q))
                    );
                    return titleMatch || descMatch || locMatch;
                })
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(item -> ItemResponse.fromEntity(item, currentUserId))
                .collect(Collectors.toList());
    }

    public ItemResponse getItemById(String id, String currentUserId) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        return ItemResponse.fromEntity(item, currentUserId);
    }

    public List<ItemResponse> getMyPosts(String currentUserId) {
        List<Item> myPosts = itemRepository.findMyPosts(currentUserId);
        return myPosts.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(item -> ItemResponse.fromEntity(item, currentUserId))
                .collect(Collectors.toList());
    }

    public void deleteItem(String id, User currentUser, boolean isAdmin) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        boolean isCreator = currentUser.getId().equals(item.getFinderUserId()) || currentUser.getId().equals(item.getLostOwnerUserId());
        if (!isAdmin && !isCreator) {
            throw new ForbiddenException("You are not authorized to delete this item.");
        }

        if (!isAdmin && (item.getStatus() == ItemStatus.RETURNED || item.getStatus() == ItemStatus.PICKED_UP)) {
            throw new BadRequestException("Completed or returned items cannot be deleted.");
        }

        itemRepository.delete(item);
        auditLogService.log(currentUser.getId(), currentUser.getEmail(), "ITEM_DELETED", "ITEM", id, "Item deleted: " + item.getTitle(), null);
    }
}
