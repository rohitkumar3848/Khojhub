package com.khojhub.controller;

import com.khojhub.dto.request.ProfileUpdateRequest;
import com.khojhub.dto.response.ApiResponse;
import com.khojhub.dto.response.UserResponse;
import com.khojhub.model.entity.User;
import com.khojhub.security.SecurityUtils;
import com.khojhub.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Endpoints for user profile management")
public class UserController {

    private final UserService userService;
    private final SecurityUtils securityUtils;

    @GetMapping("/profile")
    @Operation(summary = "Get logged in user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile() {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(UserResponse.fromEntity(user), "User profile"));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update logged in user profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@RequestBody ProfileUpdateRequest request) {
        User user = securityUtils.getCurrentUser();
        UserResponse response = userService.updateProfile(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Profile updated successfully"));
    }
}
