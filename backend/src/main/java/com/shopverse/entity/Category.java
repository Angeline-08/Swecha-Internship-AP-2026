package com.shopverse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(name="categories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    @Id @GeneratedValue(strategy=IDENTITY)
    private Long id;

    @Column(nullable=false, unique=true)
    private String name;

    private String description;
    private String imageUrl;

    @OneToMany(mappedBy="category")
    private List<Product> products;
}
