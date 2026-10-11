package com.shopverse.controller;

import com.shopverse.dto.CategoryDto;
import com.shopverse.dto.PageResponse;
import com.shopverse.dto.ProductDto;
import com.shopverse.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public List<CategoryDto> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/{id}")
    public CategoryDto getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id);
    }

    @GetMapping("/{id}/products")
    public PageResponse<ProductDto> getCategoryProducts(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return categoryService.getCategoryProducts(id, page, size);
    }
}
