
package com.shopverse.repository;

import com.shopverse.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query(
        value = "SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.active = true",
        countQuery = "SELECT COUNT(p) FROM Product p WHERE p.active = true"
    )
    Page<Product> findByActiveTrue(Pageable pageable);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.id = :id")
    java.util.Optional<Product> findProductWithCategoryById(@Param("id") Long id);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.active = true ORDER BY p.createdAt DESC")
    List<Product> findTop8ByActiveTrueOrderByCreatedAtDesc();

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.active = true ORDER BY p.rating DESC")
    List<Product> findTop8ByActiveTrueOrderByRatingDesc();

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.active = true ORDER BY p.reviewCount DESC")
    List<Product> findTop8ByActiveTrueOrderByReviewCountDesc();

    Page<Product> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);

    @Query(
        value = "SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.active = true AND " +
                "(:q IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
                "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
                "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
                "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
                "(:minRating IS NULL OR p.rating >= :minRating)",
        countQuery = "SELECT COUNT(p) FROM Product p WHERE p.active = true AND " +
                "(:q IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
                "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
                "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
                "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
                "(:minRating IS NULL OR p.rating >= :minRating)"
    )
    Page<Product> searchProducts(
        @Param("q") String q,
        @Param("categoryId") Long categoryId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("minRating") BigDecimal minRating,
        Pageable pageable
    );

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.category.id IN :categoryIds AND p.active = true")
    List<Product> findByCategoryIdInAndActiveTrue(@Param("categoryIds") List<Long> categoryIds);

    boolean existsByCategoryIdAndActiveTrue(Long categoryId);

    long countByActiveTrue();
}
