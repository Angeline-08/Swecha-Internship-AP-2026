package com.shopverse.repository;

import com.shopverse.entity.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {
    Optional<UserSettings> findByUserId(Long userId);
}
