package com.khojhub.controller;

import com.khojhub.dto.request.HandoverRequest;
import com.khojhub.dto.response.ApiResponse;
import com.khojhub.dto.response.CustodyResponse;
import com.khojhub.model.entity.User;
import com.khojhub.security.SecurityUtils;
import com.khojhub.service.CustodyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/custody")
@RequiredArgsConstructor
@Tag(name = "Custody & Handover", description = "Endpoints for central desk physical item custody and handover management")
public class CustodyController {

    private final CustodyService custodyService;
    private final SecurityUtils securityUtils;

    @GetMapping("/stored")
    @Operation(summary = "Get list of all items currently stored in physical central custody")
    public ResponseEntity<ApiResponse<List<CustodyResponse>>> getStoredItems() {
        List<CustodyResponse> list = custodyService.getStoredRecords();
        return ResponseEntity.ok(ApiResponse.ok(list, "Stored custody records retrieved"));
    }

    @PostMapping("/handover")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Admin verifies pickup reference code and completes physical handover")
    public ResponseEntity<ApiResponse<CustodyResponse>> completeHandover(@Valid @RequestBody HandoverRequest request) {
        User adminUser = securityUtils.getCurrentUser();
        CustodyResponse response = custodyService.completeHandover(request, adminUser);
        return ResponseEntity
                .ok(ApiResponse.ok(response, "Item handover completed successfully! Item status marked RETURNED."));
    }
}
