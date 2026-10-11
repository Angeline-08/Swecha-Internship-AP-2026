package com.shopverse.controller;

import com.shopverse.dto.PageResponse;
import com.shopverse.dto.ProductDto;
import com.shopverse.exception.UnauthorizedException;
import com.shopverse.repository.UserRepository;
import com.shopverse.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new UnauthorizedException("Not authenticated");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UnauthorizedException("Not authenticated")).getId();
    }

    @GetMapping
    public PageResponse<ProductDto> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return productService.getAllProducts(page, size);
    }

    @GetMapping("/search")
    public PageResponse<ProductDto> searchProducts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return productService.searchProducts(q, categoryId, minPrice, maxPrice, minRating, sort, page, size);
    }

    @GetMapping("/featured")
    public List<ProductDto> getFeaturedProducts() {
        return productService.getFeaturedProducts();
    }

    @GetMapping("/trending")
    public List<ProductDto> getTrendingProducts() {
        return productService.getTrendingProducts();
    }

    @GetMapping("/new-arrivals")
    public List<ProductDto> getNewArrivals() {
        return productService.getNewArrivals();
    }

    @GetMapping("/recommended")
    public List<ProductDto> getRecommendedProducts() {
        return productService.getRecommendedProducts(getCurrentUserId());
    }

    @GetMapping("/{id}")
    public ProductDto getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }
}
