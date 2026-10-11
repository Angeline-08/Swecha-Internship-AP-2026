package com.shopverse.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateOrderRequest {
    @NotNull private Long addressId;
    @NotEmpty private List<OrderItemRequest> items;
    @NotBlank private String paymentMethod;
}
