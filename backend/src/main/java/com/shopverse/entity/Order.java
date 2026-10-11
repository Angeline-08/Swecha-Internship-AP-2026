package com.shopverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import static jakarta.persistence.GenerationType.IDENTITY;
import static jakarta.persistence.FetchType.LAZY;
import static jakarta.persistence.FetchType.EAGER;
import static jakarta.persistence.CascadeType.ALL;
import static jakarta.persistence.EnumType.STRING;

@Entity
@Table(name="orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id @GeneratedValue(strategy=IDENTITY)
    private Long id;

    @Column(nullable=false, unique=true)
    private String orderNumber;

    @ManyToOne(fetch=LAZY)
    @JoinColumn(name="user_id")
    private User user;

    @Column(nullable=false)
    private String addressFullName;
    private String addressPhone;

    @Column(nullable=false)
    private String addressLine;

    @Column(nullable=false)
    private String addressCity;

    @Column(nullable=false)
    private String addressState;

    @Column(nullable=false)
    private String addressPostalCode;

    @Column(nullable=false)
    private String addressCountry;

    @OneToMany(mappedBy="order", cascade=ALL, fetch=EAGER)
    private List<OrderItem> items = new ArrayList<>();

    @Column(nullable=false)
    private BigDecimal subtotal;

    @Column(nullable=false)
    private BigDecimal deliveryCharge;

    @Column(nullable=false)
    private BigDecimal totalAmount;

    @Enumerated(STRING)
    @Column(nullable=false)
    private PaymentMethod paymentMethod;

    @Enumerated(STRING)
    @Column(nullable=false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Enumerated(STRING)
    @Column(nullable=false)
    private OrderStatus orderStatus = OrderStatus.PROCESSING;

    @OneToOne(mappedBy="order", cascade=ALL, fetch=LAZY)
    private Payment payment;

    @Column(nullable=false, updatable=false)
    @CreationTimestamp
    private LocalDateTime createdAt;
}
