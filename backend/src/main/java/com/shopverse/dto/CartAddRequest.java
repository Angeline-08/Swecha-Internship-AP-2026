package com.shopverse.dto;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CartAddRequest {
    @NotNull private Long productId;
    @NotNull @Min(1) private Integer quantity;
}
