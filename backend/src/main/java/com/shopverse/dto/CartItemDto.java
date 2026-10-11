package com.shopverse.dto;
import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CartItemDto {
    private Long id;
    private ProductDto product;
    private Integer quantity;
    private BigDecimal subtotal;
}
