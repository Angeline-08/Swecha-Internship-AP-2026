package com.shopverse.dto;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SettingsDto {
    private String theme;
    private boolean notificationsEnabled;
    private String language;
}
