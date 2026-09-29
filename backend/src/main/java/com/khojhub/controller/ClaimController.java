package com.khojhub.controller;

import com.khojhub.dto.request.ClaimSubmitRequest;
import com.khojhub.dto.response.ApiResponse;
import com.khojhub.dto.response.ClaimResponse;
import com.khojhub.model.entity.User;
import com.khojhub.security.SecurityUtils;
import com.khojhub.service.ClaimService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Claims", description = "Endpoints for claiming items, 5-question ownership verification, and finder confirmation")
public class ClaimController {

    private final ClaimService claimService;
    private final SecurityUtils securityUtils;

    @PostMapping("/api/v1/items/{itemId}/claims")
    @Operation(summary = "Submit 5-question ownership challenge answers to claim an item")
    public ResponseEntity<ApiResponse<ClaimResponse>> submitClaim(
            @PathVariable String itemId,
            @Valid @RequestBody ClaimSubmitRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        ClaimResponse response = claimService.submitClaim(itemId, request, currentUser);
        String msg = response.getScore() >= 3
                ? "Ownership verification successful (" + response.getScore() + "/5)! Private chat is now active."
                : "Ownership verification failed (" + response.getScore() + "/5). Please review your answers.";
        return ResponseEntity.ok(ApiResponse.ok(response, msg));
    }

    @GetMapping("/api/v1/claims/my")
    @Operation(summary = "Get all ownership claims submitted by current user")
    public ResponseEntity<ApiResponse<List<ClaimResponse>>> getMyClaims() {
        User currentUser = securityUtils.getCurrentUser();
        List<ClaimResponse> list = claimService.getMyClaims(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(list, "My claims retrieved"));
    }

    @GetMapping("/api/v1/claims/{id}")
    @Operation(summary = "Get specific claim details")
    public ResponseEntity<ApiResponse<ClaimResponse>> getClaimById(@PathVariable String id) {
        User currentUser = securityUtils.getCurrentUser();
        boolean isAdmin = securityUtils.isAdmin();
        ClaimResponse claim = claimService.getClaimById(id, currentUser, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(claim, "Claim details"));
    }

    @GetMapping("/api/v1/items/{itemId}/claims")
    @Operation(summary = "Get all claims submitted for a found item (Finder or Admin only)")
    public ResponseEntity<ApiResponse<List<ClaimResponse>>> getClaimsByItemId(@PathVariable String itemId) {
        User currentUser = securityUtils.getCurrentUser();
        boolean isAdmin = securityUtils.isAdmin();
        List<ClaimResponse> list = claimService.getClaimsByItemId(itemId, currentUser, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(list, "Item claims retrieved"));
    }

    @PostMapping("/api/v1/claims/{id}/confirm")
    @Operation(summary = "Finder confirms claimant as the genuine owner and generates pickup reference code")
    public ResponseEntity<ApiResponse<ClaimResponse>> confirmGenuineOwner(@PathVariable String id) {
        User currentUser = securityUtils.getCurrentUser();
        ClaimResponse response = claimService.confirmGenuineOwner(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(response, "Genuine owner confirmed. Pickup code generated!"));
    }

    @PostMapping("/api/v1/claims/{id}/reject")
    @Operation(summary = "Finder rejects claimant after chat review")
    public ResponseEntity<ApiResponse<ClaimResponse>> rejectClaim(
            @PathVariable String id,
            @RequestParam(required = false) String reason) {
        User currentUser = securityUtils.getCurrentUser();
        ClaimResponse response = claimService.rejectClaim(id, reason, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(response, "Claim rejected by finder"));
    }
}
