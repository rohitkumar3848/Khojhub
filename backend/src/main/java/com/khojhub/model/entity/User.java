package com.khojhub.model.entity;

import com.khojhub.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String fullName;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    private String department;

    private String organization;

    private String officeLocation;

    private String phoneNumber;

    private String avatarUrl;

    @Builder.Default
    private int karmaPoints = 0;

    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, SUSPENDED, DELETED

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
