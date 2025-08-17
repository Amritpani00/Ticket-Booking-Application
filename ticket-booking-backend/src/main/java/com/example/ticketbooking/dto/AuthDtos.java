package com.example.ticketbooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.Builder;

public class AuthDtos {

    @Getter
    @Setter
    public static class RegisterRequest {
        @NotBlank
        private String name;
        @Email
        @NotBlank
        private String email;
        @Size(min = 6)
        private String password;
    }

    @Getter
    @Setter
    public static class LoginRequest {
        @Email
        @NotBlank
        private String email;
        @NotBlank
        private String password;
    }

    @Getter
    @Setter
    @Builder
    public static class AuthResponse {
        private String token;
        private String name;
        private String email;
    }
}