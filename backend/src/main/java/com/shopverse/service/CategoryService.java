
package com.shopverse.service;

import com.shopverse.dto.AdminCategoryRequest;
import com.shopverse.dto.CategoryDto;
import com.shopverse.dto.PageResponse;
import com.shopverse.dto.ProductDto;
import com.shopverse.entity.Category;
import com.shopverse.exception.BadRequestException;
import com.shopverse.exception.ResourceNotFoundException;
import com.shopverse.repository.CategoryRepository;
import com.shopverse.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));
        return toDto(category);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductDto> getCategoryProducts(
            Long catId, int page, int size) {

        Page<com.shopverse.entity.Product> products =
                productRepository.findByCategoryIdAndActiveTrue(
                        catId, PageRequest.of(page, size));

        return PageResponse.<ProductDto>builder()
                .content(products.getContent()
                        .stream()
                        .map(productService::toDto)
                        .collect(Collectors.toList()))
                .page(products.getNumber())
                .size(products.getSize())
                .totalElements(products.getTotalElements())
                .totalPages(products.getTotalPages())
                .last(products.isLast())
                .build();
    }

    public CategoryDto createCategory(AdminCategoryRequest req) {
        Category category = Category.builder()
                .name(req.getName())
                .description(req.getDescription())
                .imageUrl(req.getImageUrl())
                .build();

        return toDto(categoryRepository.save(category));
    }

    public CategoryDto updateCategory(Long id, AdminCategoryRequest req) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));

        category.setName(req.getName());
        category.setDescription(req.getDescription());
        category.setImageUrl(req.getImageUrl());

        return toDto(categoryRepository.save(category));
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));

        if (productRepository.existsByCategoryIdAndActiveTrue(id)) {
            throw new BadRequestException(
                    "Cannot delete category with active products. "
                    + "Please reassign or delete products first.");
        }

        categoryRepository.delete(category);
    }

    private CategoryDto toDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .build();
    }
}
