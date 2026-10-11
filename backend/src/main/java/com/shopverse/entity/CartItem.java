package com.shopverse.entity;

import jakarta.persistence.*;
import lombok.*;
import static jakarta.persistence.GenerationType.IDENTITY;
import static jakarta.persistence.FetchType.LAZY;
import static jakarta.persistence.FetchType.EAGER;

@Entity
@Table(name="cart_items", uniqueConstraints={@UniqueConstraint(columnNames={"cart_id","product_id"})})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    @Id @GeneratedValue(strategy=IDENTITY)
    private Long id;

    @ManyToOne(fetch=LAZY)
    @JoinColumn(name="cart_id")
    private Cart cart;

    @ManyToOne(fetch=EAGER)
    @JoinColumn(name="product_id")
    private Product product;

    @Column(nullable=false)
    private Integer quantity;
}
