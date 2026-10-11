package com.shopverse.dto;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CartUpdateRequest {
    @NotNull @Min(0) private Integer quantity;
}
