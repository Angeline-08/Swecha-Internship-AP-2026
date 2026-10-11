package com.shopverse.repository;

import com.shopverse.entity.Role;
import com.shopverse.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    long countByRole(Role role);
    Page<User> findByRole(Role role, Pageable pageable);
}
