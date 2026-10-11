package com.shopverse.service;

import com.shopverse.dto.CategoryDto;
import com.shopverse.dto.ChangePasswordRequest;
import com.shopverse.dto.InterestsRequest;
import com.shopverse.dto.SettingsDto;
import com.shopverse.dto.UpdateProfileRequest;
import com.shopverse.dto.UserDto;
import com.shopverse.entity.Category;
import com.shopverse.entity.User;
import com.shopverse.entity.UserInterest;
import com.shopverse.entity.UserSettings;
import com.shopverse.exception.BadRequestException;
import com.shopverse.exception.ResourceNotFoundException;
import com.shopverse.repository.CategoryRepository;
import com.shopverse.repository.UserInterestRepository;
import com.shopverse.repository.UserRepository;
import com.shopverse.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final UserInterestRepository userInterestRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    public UserDto getProfile(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return authService.toUserDto(user);
    }

    public UserDto updateProfile(Long userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setName(req.getName());
        user.setPhone(req.getPhone());
        return authService.toUserDto(userRepository.save(user));
    }

    public Map<String, String> changePassword(Long userId, ChangePasswordRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        return Map.of("message", "Password updated successfully");
    }

    public SettingsDto getSettings(Long userId) {
        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Settings not found"));
        return SettingsDto.builder()
                .theme(settings.getTheme())
                .notificationsEnabled(settings.isNotificationsEnabled())
                .language(settings.getLanguage())
                .build();
    }

    public SettingsDto updateSettings(Long userId, SettingsDto dto) {
        UserSettings settings = userSettingsRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId).orElseThrow();
            return UserSettings.builder().user(user).build();
        });
        settings.setTheme(dto.getTheme());
        settings.setNotificationsEnabled(dto.isNotificationsEnabled());
        settings.setLanguage(dto.getLanguage());
        userSettingsRepository.save(settings);
        return dto;
    }

    public List<CategoryDto> getInterests(Long userId) {
        return userInterestRepository.findByUserId(userId).stream()
                .map(i -> CategoryDto.builder()
                        .id(i.getCategory().getId())
                        .name(i.getCategory().getName())
                        .description(i.getCategory().getDescription())
                        .imageUrl(i.getCategory().getImageUrl())
                        .build())
                .collect(Collectors.toList());
    }

    public List<CategoryDto> saveInterests(Long userId, InterestsRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        
        List<UserInterest> existing = userInterestRepository.findByUserId(userId);
        userInterestRepository.deleteAll(existing);
        
        List<Category> categories = categoryRepository.findAllById(req.getCategoryIds());
        List<UserInterest> newInterests = categories.stream()
                .map(cat -> UserInterest.builder().user(user).category(cat).build())
                .collect(Collectors.toList());
        
        userInterestRepository.saveAll(newInterests);
        
        if (!user.isOnboardingCompleted()) {
            user.setOnboardingCompleted(true);
            userRepository.save(user);
        }
        
        return categories.stream().map(cat -> CategoryDto.builder()
                .id(cat.getId()).name(cat.getName()).description(cat.getDescription()).imageUrl(cat.getImageUrl())
                .build()).collect(Collectors.toList());
    }
}
