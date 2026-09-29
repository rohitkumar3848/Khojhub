package com.khojhub.service;

import com.khojhub.dto.request.ProfileUpdateRequest;
import com.khojhub.dto.response.UserResponse;
import com.khojhub.exception.ResourceNotFoundException;
import com.khojhub.model.entity.User;
import com.khojhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserResponse.fromEntity(user);
    }

    public UserResponse updateProfile(String userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment().trim());
        }
        if (request.getOrganization() != null) {
            user.setOrganization(request.getOrganization().trim());
        }
        if (request.getOfficeLocation() != null) {
            user.setOfficeLocation(request.getOfficeLocation().trim());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }
        user.setUpdatedAt(Instant.now());

        User updated = userRepository.save(user);
        auditLogService.log(user.getId(), user.getEmail(), "PROFILE_UPDATED", "USER", user.getId(), "User profile updated", null);
        return UserResponse.fromEntity(updated);
    }

    public void addKarmaPoints(String userId, int points) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setKarmaPoints(user.getKarmaPoints() + points);
            user.setUpdatedAt(Instant.now());
            userRepository.save(user);
        });
    }

    public UserResponse toggleUserStatus(String userId, String status, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setStatus(status);
        user.setUpdatedAt(Instant.now());
        User updated = userRepository.save(user);
        auditLogService.log(null, adminEmail, "USER_STATUS_CHANGED", "USER", userId, "Status changed to " + status, null);
        return UserResponse.fromEntity(updated);
    }
}
