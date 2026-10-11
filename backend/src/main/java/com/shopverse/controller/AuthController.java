package com.shopverse.controller;

import com.shopverse.dto.AuthDtos;
import com.shopverse.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthDtos.AuthResponse register(@RequestBody @Valid AuthDtos.RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(@RequestBody @Valid AuthDtos.LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@RequestBody @Valid AuthDtos.ForgotPasswordRequest request) {
        return authService.forgotPassword(request.getEmail());
    }
}
