package com.shopverse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import static jakarta.persistence.GenerationType.IDENTITY;
import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name="order_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    @Id @GeneratedValue(strategy=IDENTITY)
    private Long id;

    @ManyToOne(fetch=LAZY)
    @JoinColumn(name="order_id")
    private Order order;

    @Column(nullable=false)
    private Long productId;

    @Column(nullable=false)
    private String productName;

    private String productImageUrl;
    private String productBrand;

    @Column(nullable=false)
    private Integer quantity;

    @Column(nullable=false)
    private BigDecimal unitPrice;
}
