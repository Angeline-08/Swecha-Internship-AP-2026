package com.shopverse.entity;

import jakarta.persistence.*;
import lombok.*;
import static jakarta.persistence.GenerationType.IDENTITY;
import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name="user_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettings {
    @Id @GeneratedValue(strategy=IDENTITY)
    private Long id;

    @OneToOne(fetch=LAZY)
    @JoinColumn(name="user_id", nullable=false, unique=true)
    private User user;

    private String theme = "dark";
    private boolean notificationsEnabled = true;
    private String language = "en";
}
