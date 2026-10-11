package com.shopverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import static jakarta.persistence.GenerationType.IDENTITY;
import static jakarta.persistence.FetchType.LAZY;
import static jakarta.persistence.FetchType.EAGER;

@Entity
@Table(name="wishlist_items", uniqueConstraints={@UniqueConstraint(columnNames={"wishlist_id","product_id"})})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItem {
    @Id @GeneratedValue(strategy=IDENTITY)
    private Long id;

    @ManyToOne(fetch=LAZY)
    @JoinColumn(name="wishlist_id")
    private Wishlist wishlist;

    @ManyToOne(fetch=EAGER)
    @JoinColumn(name="product_id")
    private Product product;

    @CreationTimestamp
    private LocalDateTime addedAt;
}
