package com.shopverse.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UpdateProfileRequest {
    @NotBlank private String name;
    private String phone;
}
