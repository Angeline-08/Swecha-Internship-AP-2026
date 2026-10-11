package com.shopverse.entity;

import jakarta.persistence.*;
import lombok.*;
import static jakarta.persistence.GenerationType.IDENTITY;
import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name="addresses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Address {
    @Id @GeneratedValue(strategy=IDENTITY)
    private Long id;

    @ManyToOne(fetch=LAZY)
    @JoinColumn(name="user_id")
    private User user;

    @Column(nullable=false)
    private String fullName;

    @Column(nullable=false)
    private String phone;

    @Column(nullable=false)
    private String addressLine;

    @Column(nullable=false)
    private String city;

    @Column(nullable=false)
    private String state;

    @Column(nullable=false)
    private String postalCode;

    @Column(nullable=false)
    private String country = "India";

    private boolean isDefault = false;
}
