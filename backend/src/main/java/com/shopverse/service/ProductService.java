
package com.shopverse.service;

import com.shopverse.dto.*;
import com.shopverse.entity.*;
import com.shopverse.exception.ResourceNotFoundException;
import com.shopverse.repository.CategoryRepository;
import com.shopverse.repository.ProductRepository;
import com.shopverse.repository.UserInterestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserInterestRepository userInterestRepository;

    @Transactional(readOnly = true)
    public PageResponse<ProductDto> getAllProducts(int page, int size) {
        Page<Product> products = productRepository.findByActiveTrue(
            PageRequest.of(page, size, Sort.by("createdAt").descending())
        );
        return toPageResponse(products);
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findProductWithCategoryById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.isActive()) {
            throw new ResourceNotFoundException("Product not found");
        }

        return toDto(product);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductDto> searchProducts(
        String q,
        Long categoryId,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        BigDecimal minRating,
        String sort,
        int page,
        int size
    ) {
        Sort sortObj = switch (sort != null ? sort : "") {
            case "price_asc" -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "rating" -> Sort.by("rating").descending();
            case "newest" -> Sort.by("createdAt").descending();
            default -> Sort.by("rating").descending();
        };

        Page<Product> result = productRepository.searchProducts(
            (q != null && !q.isBlank()) ? q.trim() : null,
            categoryId,
            minPrice,
            maxPrice,
            minRating,
            PageRequest.of(page, size, sortObj)
        );

        return toPageResponse(result);
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getFeaturedProducts() {
        return productRepository.findTop8ByActiveTrueOrderByRatingDesc()
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getTrendingProducts() {
        return productRepository.findTop8ByActiveTrueOrderByReviewCountDesc()
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getNewArrivals() {
        return productRepository.findTop8ByActiveTrueOrderByCreatedAtDesc()
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getRecommendedProducts(Long userId) {
        List<UserInterest> interests = userInterestRepository.findByUserId(userId);

        if (interests.isEmpty()) {
            return getFeaturedProducts();
        }

        List<Long> categoryIds = interests.stream()
            .map(interest -> interest.getCategory().getId())
            .collect(Collectors.toList());

        List<Product> products =
            productRepository.findByCategoryIdInAndActiveTrue(categoryIds);

        if (products.isEmpty()) {
            return getFeaturedProducts();
        }

        Collections.shuffle(products);

        return products.stream()
            .limit(12)
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductDto> adminGetAllProducts(int page, int size) {
        Page<Product> products = productRepository.findAll(
            PageRequest.of(page, size, Sort.by("createdAt").descending())
        );
        return toPageResponse(products);
    }

    @Transactional
    public ProductDto createProduct(AdminProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Product product = Product.builder()
            .name(request.getName())
            .brand(request.getBrand())
            .description(request.getDescription())
            .price(request.getPrice())
            .discountPercent(
                request.getDiscountPercent() != null
                    ? request.getDiscountPercent() : 0
            )
            .stock(request.getStock())
            .imageUrl(request.getImageUrl())
            .rating(BigDecimal.ZERO)
            .reviewCount(0)
            .active(true)
            .category(category)
            .build();

        return toDto(productRepository.save(product));
    }

    @Transactional
    public ProductDto updateProduct(Long id, AdminProductRequest request) {
        Product product = productRepository.findProductWithCategoryById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        product.setName(request.getName());
        product.setBrand(request.getBrand());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setDiscountPercent(
            request.getDiscountPercent() != null
                ? request.getDiscountPercent() : 0
        );
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);

        return toDto(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setActive(false);
        productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public ProductDto toDto(Product product) {
        BigDecimal discountedPrice = product.getPrice()
            .multiply(
                BigDecimal.valueOf(
                    1.0 - product.getDiscountPercent() / 100.0
                )
            )
            .setScale(2, RoundingMode.HALF_UP);

        CategoryDto categoryDto = null;

        if (product.getCategory() != null) {
            Long categoryId = product.getCategory().getId();

            Category category = categoryRepository.findById(categoryId)
                .orElseThrow(
                    () -> new ResourceNotFoundException("Category not found")
                );

            categoryDto = CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .build();
        }

        return ProductDto.builder()
            .id(product.getId())
            .name(product.getName())
            .description(product.getDescription())
            .brand(product.getBrand())
            .price(product.getPrice())
            .discountPercent(product.getDiscountPercent())
            .discountedPrice(discountedPrice)
            .stock(product.getStock())
            .imageUrl(product.getImageUrl())
            .rating(product.getRating())
            .reviewCount(product.getReviewCount())
            .active(product.isActive())
            .category(categoryDto)
            .createdAt(product.getCreatedAt())
            .build();
    }

    private PageResponse<ProductDto> toPageResponse(Page<Product> page) {
        return PageResponse.<ProductDto>builder()
            .content(
                page.getContent().stream()
                    .map(this::toDto)
                    .collect(Collectors.toList())
            )
            .page(page.getNumber())
            .size(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .last(page.isLast())
            .build();
    }
}