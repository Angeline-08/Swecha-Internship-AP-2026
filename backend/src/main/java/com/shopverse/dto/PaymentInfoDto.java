package com.shopverse.dto;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentInfoDto {
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String paymentStatus;
}
