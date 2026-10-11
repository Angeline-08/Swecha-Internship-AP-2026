package com.shopverse.dto;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminProductRequest {
    @NotBlank private String name;
    private String brand;
    private String description;
    @NotNull private Long categoryId;
    @NotNull @DecimalMin("0.01") private BigDecimal price;
    @Min(0) @Max(100) private Integer discountPercent;
    @NotNull @Min(0) private Integer stock;
    private String imageUrl;
}
