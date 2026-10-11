package com.shopverse.dto;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentCreateRequest {
    @NotNull private Long orderId;
}
