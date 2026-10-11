package com.shopverse.dto;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String phone;
    private boolean onboardingCompleted;
    private LocalDateTime createdAt;
}
