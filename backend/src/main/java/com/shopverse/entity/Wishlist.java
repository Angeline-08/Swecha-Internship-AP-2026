package com.shopverse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;
import static jakarta.persistence.GenerationType.IDENTITY;
import static jakarta.persistence.FetchType.LAZY;
import static jakarta.persistence.FetchType.EAGER;
import static jakarta.persistence.CascadeType.ALL;

@Entity
@Table(name="wishlists")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Wishlist {
    @Id @GeneratedValue(strategy=IDENTITY)
    private Long id;

    @OneToOne(fetch=LAZY)
    @JoinColumn(name="user_id", nullable=false, unique=true)
    private User user;

    @OneToMany(mappedBy="wishlist", cascade=ALL, orphanRemoval=true, fetch=EAGER)
    private List<WishlistItem> items = new ArrayList<>();
}
