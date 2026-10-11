package com.shopverse.dto;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderDto {
    private Long id;
    private String orderNumber;
    private OrderAddressDto address;
    private List<OrderItemDto> items;
    private BigDecimal subtotal;
    private BigDecimal deliveryCharge;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String orderStatus;
    private PaymentInfoDto payment;
    private LocalDateTime createdAt;
}
