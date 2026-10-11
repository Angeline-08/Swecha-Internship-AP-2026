package com.shopverse.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminCategoryRequest {
    @NotBlank private String name;
    private String description;
    private String imageUrl;
}
