package com.shopverse.dto;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class WishlistItemDto {
    private Long id;
    private ProductDto product;
    private LocalDateTime addedAt;
}
