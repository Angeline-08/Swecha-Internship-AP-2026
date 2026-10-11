package com.shopverse.dto;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class WishlistAddRequest {
    @NotNull private Long productId;
}
