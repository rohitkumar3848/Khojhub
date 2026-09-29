package com.khojhub.security;

import com.khojhub.exception.UnauthorizedException;
import com.khojhub.model.entity.User;
import com.khojhub.model.enums.Role;
import com.khojhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public Optional<String> getCurrentUserEmailOptional() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return Optional.empty();
        }
        return Optional.of(auth.getName());
    }

    public String getCurrentUserEmail() {
        return getCurrentUserEmailOptional()
                .orElseThrow(() -> new UnauthorizedException("User is not authenticated"));
    }

    public User getCurrentUser() {
        String email = getCurrentUserEmail();
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UnauthorizedException("User record not found"));
    }

    public Optional<User> getCurrentUserOptional() {
        return getCurrentUserEmailOptional()
                .flatMap(userRepository::findByEmailIgnoreCase);
    }

    public boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null)
            return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(Role.ROLE_ADMIN.name()));
    }
}
