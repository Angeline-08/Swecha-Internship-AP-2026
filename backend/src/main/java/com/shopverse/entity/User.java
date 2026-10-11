package com.shopverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.List;
import static jakarta.persistence.GenerationType.IDENTITY;
import static jakarta.persistence.EnumType.STRING;
import static jakarta.persistence.CascadeType.ALL;
import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name="users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id @GeneratedValue(strategy=IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String name;

    @Column(nullable=false, unique=true)
    private String email;

    private String passwordHash;

    @Enumerated(STRING)
    @Column(nullable=false)
    private Role role = Role.CUSTOMER;

    @Enumerated(STRING)
    private AuthProvider provider = AuthProvider.LOCAL;

    private String googleId;
    private String phone;
    private boolean onboardingCompleted = false;

    @Column(nullable=false, updatable=false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @OneToOne(mappedBy="user", cascade=ALL, fetch=LAZY)
    private UserSettings settings;

    @OneToOne(mappedBy="user", cascade=ALL, fetch=LAZY)
    private Cart cart;

    @OneToOne(mappedBy="user", cascade=ALL, fetch=LAZY)
    private Wishlist wishlist;

    @OneToMany(mappedBy="user", cascade=ALL)
    private List<UserInterest> interests;

    @OneToMany(mappedBy="user")
    private List<Address> addresses;

    @OneToMany(mappedBy="user")
    private List<Order> orders;
}
