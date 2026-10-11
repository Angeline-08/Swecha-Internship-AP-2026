package com.shopverse.dto;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CategoryDto {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
}
