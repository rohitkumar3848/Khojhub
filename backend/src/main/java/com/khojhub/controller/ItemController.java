package com.khojhub.controller;

import com.khojhub.dto.request.FoundItemCreateRequest;
import com.khojhub.dto.request.FoundMatchRequest;
import com.khojhub.dto.request.LostItemCreateRequest;
import com.khojhub.dto.response.ApiResponse;
import com.khojhub.dto.response.ItemResponse;
import com.khojhub.model.entity.User;
import com.khojhub.model.enums.ItemCategory;
import com.khojhub.model.enums.ItemType;
import com.khojhub.security.SecurityUtils;
import com.khojhub.service.ItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/items")
@RequiredArgsConstructor
@Tag(name = "Items", description = "Endpoints for discovering, reporting, and managing lost and found belongings")
public class ItemController {

    private final ItemService itemService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Explore and search public lost & found items")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getPublicItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ItemType type,
            @RequestParam(required = false) ItemCategory category,
            @RequestParam(required = false) String building) {
        String currentUserId = securityUtils.getCurrentUserOptional().map(User::getId).orElse(null);
        List<ItemResponse> items = itemService.getPublicItems(search, type, category, building, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(items, "Items retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get item details with sanitized public verification questions")
    public ResponseEntity<ApiResponse<ItemResponse>> getItemById(@PathVariable String id) {
        String currentUserId = securityUtils.getCurrentUserOptional().map(User::getId).orElse(null);
        ItemResponse item = itemService.getItemById(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(item, "Item retrieved successfully"));
    }

    @PostMapping("/found")
    @Operation(summary = "Report a found item with 5 verification questions and central drop location")
    public ResponseEntity<ApiResponse<ItemResponse>> reportFoundItem(
            @Valid @RequestBody FoundItemCreateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        ItemResponse response = itemService.createFoundItem(request, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(response, "Found item submitted for admin approval"));
    }

    @PostMapping("/lost")
    @Operation(summary = "Report a lost item")
    public ResponseEntity<ApiResponse<ItemResponse>> reportLostItem(@Valid @RequestBody LostItemCreateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        ItemResponse response = itemService.createLostItem(request, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(response, "Lost item posted successfully"));
    }

    @PostMapping("/{id}/found-response")
    @Operation(summary = "Submit a found match response for an existing lost post")
    public ResponseEntity<ApiResponse<ItemResponse>> reportFoundMatch(
            @PathVariable String id,
            @Valid @RequestBody FoundMatchRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        ItemResponse response = itemService.reportFoundMatch(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(response, "Found report for lost item submitted for admin approval"));
    }

    @GetMapping("/my-posts")
    @Operation(summary = "Get items reported by the logged in user")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getMyPosts() {
        User currentUser = securityUtils.getCurrentUser();
        List<ItemResponse> posts = itemService.getMyPosts(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(posts, "My posts retrieved"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an item post")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable String id) {
        User currentUser = securityUtils.getCurrentUser();
        boolean isAdmin = securityUtils.isAdmin();
        itemService.deleteItem(id, currentUser, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(null, "Item deleted successfully"));
    }
}
