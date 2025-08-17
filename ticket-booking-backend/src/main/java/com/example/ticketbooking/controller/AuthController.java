package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.AuthDtos;
import com.example.ticketbooking.model.AppUser;
import com.example.ticketbooking.repository.UserRepository;
import com.example.ticketbooking.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }
        AppUser user = AppUser.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .createdAt(OffsetDateTime.now())
                .build();
        userRepository.save(user);
        String token = jwtService.generateToken(user.getEmail(), Map.of("name", user.getName()));
        return ResponseEntity.ok(AuthDtos.AuthResponse.builder().token(token).name(user.getName()).email(user.getEmail()).build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        String token = jwtService.generateToken(request.getEmail(), Map.of());
        return ResponseEntity.ok(AuthDtos.AuthResponse.builder().token(token).name(request.getEmail()).email(request.getEmail()).build());
    }
}