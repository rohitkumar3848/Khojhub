package com.khojhub.controller;

import com.khojhub.dto.request.ItemRejectionRequest;
import com.khojhub.dto.response.ApiResponse;
import com.khojhub.dto.response.AuditLogResponse;
import com.khojhub.dto.response.CustodyResponse;
import com.khojhub.dto.response.DashboardStatsResponse;
import com.khojhub.dto.response.ItemResponse;
import com.khojhub.dto.response.RewardResponse;
import com.khojhub.dto.response.UserResponse;
import com.khojhub.model.entity.User;
import com.khojhub.security.SecurityUtils;
import com.khojhub.service.AdminService;
import com.khojhub.service.AuditLogService;
import com.khojhub.service.CustodyService;
import com.khojhub.service.RewardService;
import com.khojhub.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin Operations", description = "Endpoints for administrators to moderate items, manage users, and inspect operations")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;
    private final CustodyService custodyService;
    private final RewardService rewardService;
    private final AuditLogService auditLogService;
    private final SecurityUtils securityUtils;

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get platform overview metrics and KPI numbers")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats() {
        DashboardStatsResponse stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok(stats, "Dashboard statistics retrieved"));
    }

    @GetMapping("/items/pending")
    @Operation(summary = "Get all items currently awaiting admin approval")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getPendingItems() {
        List<ItemResponse> pending = adminService.getPendingItems();
        return ResponseEntity.ok(ApiResponse.ok(pending, "Pending approval items"));
    }

    @PostMapping("/items/{id}/approve")
    @Operation(summary = "Approve a pending found item submission")
    public ResponseEntity<ApiResponse<ItemResponse>> approveItem(@PathVariable String id) {
        User adminUser = securityUtils.getCurrentUser();
        ItemResponse response = adminService.approveItem(id, adminUser);
        return ResponseEntity.ok(ApiResponse.ok(response, "Item approved and published to Explore"));
    }

    @PostMapping("/items/{id}/reject")
    @Operation(summary = "Reject an inappropriate or duplicate item submission")
    public ResponseEntity<ApiResponse<ItemResponse>> rejectItem(
            @PathVariable String id,
            @RequestBody(required = false) ItemRejectionRequest request) {
        User adminUser = securityUtils.getCurrentUser();
        String reason = request != null ? request.getReason() : null;
        ItemResponse response = adminService.rejectItem(id, reason, adminUser);
        return ResponseEntity.ok(ApiResponse.ok(response, "Item rejected"));
    }

    @GetMapping("/items")
    @Operation(summary = "List all items across all statuses")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getAllItems() {
        List<ItemResponse> items = adminService.getAllItems();
        return ResponseEntity.ok(ApiResponse.ok(items, "All items retrieved"));
    }

    @GetMapping("/items/returned")
    @Operation(summary = "List all successfully returned and handed-over items")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getReturnedItems() {
        List<ItemResponse> items = adminService.getReturnedItems();
        return ResponseEntity.ok(ApiResponse.ok(items, "Returned items retrieved"));
    }

    @GetMapping("/users")
    @Operation(summary = "List all registered campus/office users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok(users, "Users retrieved"));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Toggle user status (ACTIVE, SUSPENDED)")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(
            @PathVariable String id,
            @RequestParam String status) {
        User adminUser = securityUtils.getCurrentUser();
        UserResponse response = userService.toggleUserStatus(id, status, adminUser.getEmail());
        return ResponseEntity.ok(ApiResponse.ok(response, "User status updated to " + status));
    }

    @GetMapping("/custody")
    @Operation(summary = "Get all custody and physical storage records")
    public ResponseEntity<ApiResponse<List<CustodyResponse>>> getCustodyRecords() {
        List<CustodyResponse> records = custodyService.getAllRecords();
        return ResponseEntity.ok(ApiResponse.ok(records, "Custody records retrieved"));
    }

    @GetMapping("/rewards")
    @Operation(summary = "Get all gratitude reward transactions and karma awards")
    public ResponseEntity<ApiResponse<List<RewardResponse>>> getAllRewards() {
        List<RewardResponse> rewards = rewardService.getAllRewards();
        return ResponseEntity.ok(ApiResponse.ok(rewards, "Reward transactions retrieved"));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get recent system security and moderation audit logs")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogs(
            @RequestParam(defaultValue = "50") int limit) {
        List<AuditLogResponse> logs = auditLogService.getRecentLogs(limit);
        return ResponseEntity.ok(ApiResponse.ok(logs, "Audit logs retrieved"));
    }
}
