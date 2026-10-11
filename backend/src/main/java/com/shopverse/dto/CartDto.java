package com.shopverse.dto;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CartDto {
    private Long id;
    private List<CartItemDto> items;
    private BigDecimal subtotal;
    private BigDecimal deliveryCharge;
    private BigDecimal total;
}
