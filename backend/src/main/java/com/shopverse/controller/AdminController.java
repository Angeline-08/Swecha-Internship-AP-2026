package com.shopverse.controller;

import com.shopverse.dto.*;
import com.shopverse.service.AdminService;
import com.shopverse.service.CategoryService;
import com.shopverse.service.OrderService;
import com.shopverse.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;
    private final ProductService productService;
    private final CategoryService categoryService;
    private final OrderService orderService;

    @GetMapping("/dashboard")
    public AdminDashboardDto getDashboard() {
        return adminService.getDashboard();
    }

    @GetMapping("/products")
    public PageResponse<ProductDto> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return productService.adminGetAllProducts(page, size);
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDto createProduct(@RequestBody @Valid AdminProductRequest request) {
        return productService.createProduct(request);
    }

    @PutMapping("/products/{id}")
    public ProductDto updateProduct(@PathVariable Long id, @RequestBody @Valid AdminProductRequest request) {
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("/products/{id}")
    public Map<String, String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return Map.of("message", "Product deleted");
    }

    @GetMapping("/categories")
    public List<CategoryDto> getCategories() {
        return categoryService.getAllCategories();
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryDto createCategory(@RequestBody @Valid AdminCategoryRequest request) {
        return categoryService.createCategory(request);
    }

    @PutMapping("/categories/{id}")
    public CategoryDto updateCategory(@PathVariable Long id, @RequestBody @Valid AdminCategoryRequest request) {
        return categoryService.updateCategory(id, request);
    }

    @DeleteMapping("/categories/{id}")
    public Map<String, String> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return Map.of("message", "Category deleted");
    }

    @GetMapping("/orders")
    public PageResponse<OrderDto> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        return orderService.adminGetOrders(page, size, status);
    }

    @GetMapping("/orders/{id}")
    public OrderDto getOrder(@PathVariable Long id) {
        return orderService.adminGetOrder(id);
    }

    @PutMapping("/orders/{id}/status")
    public OrderDto updateOrderStatus(@PathVariable Long id, @RequestBody @Valid OrderStatusRequest request) {
        return orderService.updateOrderStatus(id, request.getStatus());
    }

    @GetMapping("/customers")
    public PageResponse<CustomerDto> getCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return adminService.getCustomers(page, size);
    }

    @GetMapping("/payments")
    public PageResponse<PaymentDto> getPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return adminService.getPayments(page, size);
    }
}
