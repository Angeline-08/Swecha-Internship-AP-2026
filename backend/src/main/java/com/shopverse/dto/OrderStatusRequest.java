package com.shopverse.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderStatusRequest {
    @NotBlank private String status;
}
