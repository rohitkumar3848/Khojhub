package com.khojhub.dto.response;

import com.khojhub.model.entity.User;
import com.khojhub.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private String id;
    private String fullName;
    private String email;
    private Set<Role> roles;
    private String department;
    private String organization;
    private String officeLocation;
    private String phoneNumber;
    private String avatarUrl;
    private int karmaPoints;
    private String status;
    private Instant createdAt;

    public static UserResponse fromEntity(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .roles(user.getRoles())
                .department(user.getDepartment())
                .organization(user.getOrganization())
                .officeLocation(user.getOfficeLocation())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .karmaPoints(user.getKarmaPoints())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
