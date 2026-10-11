package com.shopverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import static jakarta.persistence.GenerationType.IDENTITY;
import static jakarta.persistence.FetchType.LAZY;
import static jakarta.persistence.EnumType.STRING;

@Entity
@Table(name="payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id @GeneratedValue(strategy=IDENTITY)
    private Long id;

    @OneToOne(fetch=LAZY)
    @JoinColumn(name="order_id", nullable=false, unique=true)
    private Order order;

    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;

    @Enumerated(STRING)
    @Column(nullable=false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Enumerated(STRING)
    private PaymentMethod paymentMethod;

    @Column(nullable=false)
    private BigDecimal amount;

    @Column(nullable=false, updatable=false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
