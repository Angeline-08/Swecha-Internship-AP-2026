package com.shopverse.dto;
import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private String productBrand;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
