package com.shopverse.dto;
import jakarta.validation.constraints.*;
import lombok.*;

public class AuthDtos {
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank String name;
        @NotBlank @Email String email;
        @NotBlank @Size(min=8, message="Password must be at least 8 characters") String password;
    }
    
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank String email;
        @NotBlank String password;
    }
    
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ForgotPasswordRequest {
        @NotBlank @Email String email;
    }
    
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthResponse {
        String token;
        UserDto user;
    }
}
