package com.shopverse.dto;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ProductDto {
    private Long id;
    private String name;
    private String description;
    private String brand;
    private BigDecimal price;
    private Integer discountPercent;
    private BigDecimal discountedPrice;
    private Integer stock;
    private String imageUrl;
    private BigDecimal rating;
    private Integer reviewCount;
    private boolean active;
    private CategoryDto category;
    private LocalDateTime createdAt;
}
