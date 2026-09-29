package com.khojhub.service;

import com.khojhub.dto.request.LoginRequest;
import com.khojhub.dto.request.RegisterRequest;
import com.khojhub.dto.response.AuthResponse;
import com.khojhub.dto.response.UserResponse;
import com.khojhub.exception.ConflictException;
import com.khojhub.exception.UnauthorizedException;
import com.khojhub.model.entity.User;
import com.khojhub.model.enums.Role;
import com.khojhub.repository.UserRepository;
import com.khojhub.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final AuditLogService auditLogService;

    @Value("${khojhub.admin.secret:KhojHubAdmin2026}")
    private String adminSecret;

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ConflictException("An account with email " + normalizedEmail + " already exists.");
        }

        Set<Role> roles = new HashSet<>();
        roles.add(Role.ROLE_USER);

        // If admin secret matches or this is the very first registered user, grant admin role
        if ((request.getAdminSecretKey() != null && request.getAdminSecretKey().equals(adminSecret))
                || userRepository.count() == 0) {
            roles.add(Role.ROLE_ADMIN);
            log.info("Assigning ROLE_ADMIN to user: {}", normalizedEmail);
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .roles(roles)
                .department(request.getDepartment())
                .organization(request.getOrganization())
                .officeLocation(request.getOfficeLocation())
                .phoneNumber(request.getPhoneNumber())
                .karmaPoints(0)
                .status("ACTIVE")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        User savedUser = userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        String token = jwtService.generateToken(userDetails, Map.of(
                "userId", savedUser.getId(),
                "fullName", savedUser.getFullName(),
                "roles", savedUser.getRoles()
        ));

        auditLogService.log(
                savedUser.getId(),
                savedUser.getEmail(),
                "USER_REGISTERED",
                "USER",
                savedUser.getId(),
                "User registered with roles: " + savedUser.getRoles(),
                null
        );

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(UserResponse.fromEntity(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if ("SUSPENDED".equalsIgnoreCase(user.getStatus())) {
            throw new UnauthorizedException("Your account has been suspended. Please contact administrator.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails, Map.of(
                "userId", user.getId(),
                "fullName", user.getFullName(),
                "roles", user.getRoles()
        ));

        auditLogService.log(
                user.getId(),
                user.getEmail(),
                "USER_LOGIN",
                "USER",
                user.getId(),
                "User logged in successfully",
                null
        );

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(UserResponse.fromEntity(user))
                .build();
    }
}
