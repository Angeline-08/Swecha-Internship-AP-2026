package com.shopverse.controller;

import com.shopverse.dto.CategoryDto;
import com.shopverse.dto.ChangePasswordRequest;
import com.shopverse.dto.InterestsRequest;
import com.shopverse.dto.SettingsDto;
import com.shopverse.dto.UpdateProfileRequest;
import com.shopverse.dto.UserDto;
import com.shopverse.exception.UnauthorizedException;
import com.shopverse.repository.UserRepository;
import com.shopverse.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UnauthorizedException("Not authenticated")).getId();
    }

    @GetMapping("/me")
    public UserDto getProfile() {
        return userService.getProfile(getCurrentUserId());
    }

    @PutMapping("/me")
    public UserDto updateProfile(@RequestBody @Valid UpdateProfileRequest request) {
        return userService.updateProfile(getCurrentUserId(), request);
    }

    @PutMapping("/me/password")
    public Map<String, String> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        return userService.changePassword(getCurrentUserId(), request);
    }

    @GetMapping("/me/settings")
    public SettingsDto getSettings() {
        return userService.getSettings(getCurrentUserId());
    }

    @PutMapping("/me/settings")
    public SettingsDto updateSettings(@RequestBody SettingsDto request) {
        return userService.updateSettings(getCurrentUserId(), request);
    }

    @GetMapping("/me/interests")
    public List<CategoryDto> getInterests() {
        return userService.getInterests(getCurrentUserId());
    }

    @PostMapping("/me/interests")
    public List<CategoryDto> saveInterests(@RequestBody @Valid InterestsRequest request) {
        return userService.saveInterests(getCurrentUserId(), request);
    }
}
