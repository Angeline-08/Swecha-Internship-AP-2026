package com.shopverse.service;

import com.shopverse.dto.AuthDtos;
import com.shopverse.dto.UserDto;
import com.shopverse.entity.*;
import com.shopverse.exception.BadRequestException;
import com.shopverse.exception.UnauthorizedException;
import com.shopverse.repository.CartRepository;
import com.shopverse.repository.UserRepository;
import com.shopverse.repository.UserSettingsRepository;
import com.shopverse.repository.WishlistRepository;
import com.shopverse.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Map;
import java.util.UUID;

@Service @RequiredArgsConstructor @Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .role(Role.CUSTOMER)
            .provider(AuthProvider.LOCAL)
            .onboardingCompleted(false)
            .build();
        user = userRepository.save(user);
        initUserDependencies(user);
        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return AuthDtos.AuthResponse.builder().token(token).user(toUserDto(user)).build();
    }
    
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return AuthDtos.AuthResponse.builder().token(token).user(toUserDto(user)).build();
    }
    
    public Map<String, String> forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            String resetToken = UUID.randomUUID().toString();
            log.info("Password reset token for {}: {}", email, resetToken);
        });
        return Map.of("message", "If that email exists, a reset link has been sent.");
    }
    
    public AuthDtos.AuthResponse generateTokenForOAuthUser(User user) {
        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return AuthDtos.AuthResponse.builder().token(token).user(toUserDto(user)).build();
    }
    
    public void initUserDependencies(User user) {
        if (!cartRepository.findByUserId(user.getId()).isPresent()) {
            Cart cart = Cart.builder().user(user).items(new ArrayList<>()).build();
            cartRepository.save(cart);
        }
        if (!wishlistRepository.findByUserId(user.getId()).isPresent()) {
            Wishlist wishlist = Wishlist.builder().user(user).items(new ArrayList<>()).build();
            wishlistRepository.save(wishlist);
        }
        if (!userSettingsRepository.findByUserId(user.getId()).isPresent()) {
            UserSettings settings = UserSettings.builder().user(user).theme("dark").notificationsEnabled(true).language("en").build();
            userSettingsRepository.save(settings);
        }
    }
    
    public UserDto toUserDto(User user) {
        return UserDto.builder()
            .id(user.getId()).name(user.getName()).email(user.getEmail())
            .role(user.getRole().name()).phone(user.getPhone())
            .onboardingCompleted(user.isOnboardingCompleted())
            .createdAt(user.getCreatedAt()).build();
    }
}
