package com.shopverse.repository;

import com.shopverse.entity.Order;
import com.shopverse.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Order> findByOrderNumber(String orderNumber);
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Order> findByOrderStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);
    long countByOrderStatus(OrderStatus status);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.paymentStatus = 'PAID'")
    BigDecimal sumRevenue();
}
