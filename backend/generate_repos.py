import os

base_dir = r"C:\Users\dodom\.gemini\antigravity\scratch\shopverse\backend\src\main\java\com\shopverse\repository"
os.makedirs(base_dir, exist_ok=True)

repos = {
    "UserRepository.java": """package com.shopverse.repository;

import com.shopverse.entity.Role;
import com.shopverse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    long countByRole(Role role);
}""",

    "ProductRepository.java": """package com.shopverse.repository;

import com.shopverse.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findTop8ByActiveTrueOrderByCreatedAtDesc();
    List<Product> findTop8ByActiveTrueOrderByRatingDesc();
    List<Product> findTop8ByActiveTrueOrderByReviewCountDesc();
    Page<Product> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);
    Page<Product> findByActiveTrue(Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(:q IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(p.brand) LIKE LOWER(CONCAT('%',:q,'%'))) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:minRating IS NULL OR p.rating >= :minRating)")
    Page<Product> searchProducts(@Param("q") String q, @Param("categoryId") Long categoryId, @Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice, @Param("minRating") BigDecimal minRating, Pageable pageable);
    
    List<Product> findByCategoryIdInAndActiveTrue(List<Long> categoryIds);
    long countByActiveTrue();
}""",

    "CategoryRepository.java": """package com.shopverse.repository;

import com.shopverse.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}""",

    "CartRepository.java": """package com.shopverse.repository;

import com.shopverse.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUserId(Long userId);
}""",

    "CartItemRepository.java": """package com.shopverse.repository;

import com.shopverse.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);
}""",

    "WishlistRepository.java": """package com.shopverse.repository;

import com.shopverse.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    Optional<Wishlist> findByUserId(Long userId);
}""",

    "WishlistItemRepository.java": """package com.shopverse.repository;

import com.shopverse.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    Optional<WishlistItem> findByWishlistIdAndProductId(Long wishlistId, Long productId);
    void deleteByWishlistIdAndProductId(Long wishlistId, Long productId);
}""",

    "AddressRepository.java": """package com.shopverse.repository;

import com.shopverse.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserId(Long userId);
    Optional<Address> findByIdAndUserId(Long id, Long userId);
}""",

    "OrderRepository.java": """package com.shopverse.repository;

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
}""",

    "PaymentRepository.java": """package com.shopverse.repository;

import com.shopverse.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    Page<Payment> findAllByOrderByCreatedAtDesc(Pageable pageable);
}""",

    "UserInterestRepository.java": """package com.shopverse.repository;

import com.shopverse.entity.UserInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserInterestRepository extends JpaRepository<UserInterest, Long> {
    List<UserInterest> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}""",

    "UserSettingsRepository.java": """package com.shopverse.repository;

import com.shopverse.entity.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {
    Optional<UserSettings> findByUserId(Long userId);
}"""
}

for filename, content in repos.items():
    with open(os.path.join(base_dir, filename), "w", encoding="utf-8") as f:
        f.write(content)

print("Repositories generated.")
