package com.example.ticketbooking.controller;

import com.example.ticketbooking.model.AppUser;
import com.example.ticketbooking.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProfileController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> me(@AuthenticationPrincipal User principal) {
        AppUser user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        return ResponseEntity.ok(Map.of(
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
        ));
    }

    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> update(@AuthenticationPrincipal User principal, @Valid @RequestBody UpdateProfile req) {
        AppUser user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        user.setName(req.getName());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal User principal, @Valid @RequestBody ChangePassword req) {
        AppUser user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        if (!passwordEncoder.matches(req.getOldPassword(), user.getPasswordHash())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Old password incorrect"));
        }
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @Getter
    @Setter
    public static class UpdateProfile {
        @NotBlank
        private String name;
    }

    @Getter
    @Setter
    public static class ChangePassword {
        @NotBlank
        private String oldPassword;
        @NotBlank
        private String newPassword;
    }
}

