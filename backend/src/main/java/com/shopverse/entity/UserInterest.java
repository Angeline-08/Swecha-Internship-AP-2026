package com.shopverse.entity;

import jakarta.persistence.*;
import lombok.*;
import static jakarta.persistence.GenerationType.IDENTITY;
import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name="user_interests", uniqueConstraints={@UniqueConstraint(columnNames={"user_id","category_id"})})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInterest {
    @Id @GeneratedValue(strategy=IDENTITY)
    private Long id;

    @ManyToOne(fetch=LAZY)
    @JoinColumn(name="user_id")
    private User user;

    @ManyToOne(fetch=LAZY)
    @JoinColumn(name="category_id")
    private Category category;
}
