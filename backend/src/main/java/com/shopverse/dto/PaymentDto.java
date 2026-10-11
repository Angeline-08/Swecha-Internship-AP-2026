package com.shopverse.dto;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentDto {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String paymentMethod;
    private String paymentStatus;
    private BigDecimal amount;
    private LocalDateTime createdAt;
}
