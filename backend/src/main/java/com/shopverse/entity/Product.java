package com.shopverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import static jakarta.persistence.GenerationType.IDENTITY;
import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name="products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id @GeneratedValue(strategy=IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String name;

    @Column(columnDefinition="TEXT")
    private String description;

    private String brand;

    @Column(nullable=false)
    private BigDecimal price;

    @Column(nullable=false, columnDefinition="INT DEFAULT 0")
    private Integer discountPercent = 0;

    @Column(nullable=false)
    private Integer stock;

    private String imageUrl;

    @Column(nullable=false, columnDefinition="DECIMAL(3,2) DEFAULT 0.0")
    private BigDecimal rating = BigDecimal.ZERO;

    @Column(nullable=false, columnDefinition="INT DEFAULT 0")
    private Integer reviewCount = 0;

    @Column(nullable=false, columnDefinition="BOOLEAN DEFAULT TRUE")
    private boolean active = true;

    @ManyToOne(fetch=LAZY)
    @JoinColumn(name="category_id")
    private Category category;

    @Column(nullable=false, updatable=false)
    @CreationTimestamp
    private LocalDateTime createdAt;
}
