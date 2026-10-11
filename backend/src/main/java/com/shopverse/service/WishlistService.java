
package com.shopverse.service;

import com.shopverse.dto.WishlistDto;
import com.shopverse.dto.WishlistItemDto;
import com.shopverse.entity.Product;
import com.shopverse.entity.User;
import com.shopverse.entity.Wishlist;
import com.shopverse.entity.WishlistItem;
import com.shopverse.exception.BadRequestException;
import com.shopverse.exception.ResourceNotFoundException;
import com.shopverse.repository.ProductRepository;
import com.shopverse.repository.UserRepository;
import com.shopverse.repository.WishlistItemRepository;
import com.shopverse.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final CartService cartService;

    private Wishlist getOrCreateWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            Wishlist wishlist = Wishlist.builder()
                .user(user)
                .items(new ArrayList<>())
                .build();

            return wishlistRepository.save(wishlist);
        });
    }

    @Transactional(readOnly = true)
    public WishlistDto getWishlist(Long userId) {
        return toDto(getOrCreateWishlist(userId));
    }

    public WishlistDto addItem(Long userId, Long productId) {
        if (productId == null) {
            throw new BadRequestException("Product ID is required");
        }

        Wishlist wishlist = getOrCreateWishlist(userId);

        Product product = productRepository.findProductWithCategoryById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.isActive()) {
            throw new ResourceNotFoundException("Product not found");
        }

        boolean alreadyExists = wishlist.getItems().stream()
            .anyMatch(item -> item.getProduct().getId().equals(productId));

        if (!alreadyExists) {
            WishlistItem item = WishlistItem.builder()
                .wishlist(wishlist)
                .product(product)
                .build();

            wishlist.getItems().add(item);
            wishlist = wishlistRepository.save(wishlist);
        }

        return toDto(wishlist);
    }

    public WishlistDto removeItem(Long userId, Long productId) {
        if (productId == null) {
            throw new BadRequestException("Product ID is required");
        }

        Wishlist wishlist = getOrCreateWishlist(userId);

        WishlistItem itemToRemove = wishlist.getItems().stream()
            .filter(item -> item.getProduct().getId().equals(productId))
            .findFirst()
            .orElse(null);

        if (itemToRemove != null) {
            wishlist.getItems().remove(itemToRemove);
            wishlistItemRepository.delete(itemToRemove);
            wishlist = wishlistRepository.save(wishlist);
        }

        return toDto(wishlist);
    }

    public Map<String, Object> moveToCart(Long userId, Long productId) {
        if (productId == null) {
            throw new BadRequestException("Product ID is required");
        }

        Wishlist wishlist = getOrCreateWishlist(userId);

        boolean containsProduct = wishlist.getItems().stream()
            .anyMatch(item -> item.getProduct().getId().equals(productId));

        if (!containsProduct) {
            throw new ResourceNotFoundException("Product not found in wishlist");
        }

        var updatedCart = cartService.addItem(userId, productId, 1);
        WishlistDto updatedWishlist = removeItem(userId, productId);

        return Map.of(
            "wishlist", updatedWishlist,
            "cart", updatedCart
        );
    }

    private WishlistDto toDto(Wishlist wishlist) {
        List<WishlistItemDto> itemDtos = wishlist.getItems() != null
            ? wishlist.getItems().stream()
                .map(this::toItemDto)
                .collect(Collectors.toList())
            : new ArrayList<>();

        return WishlistDto.builder()
            .id(wishlist.getId())
            .items(itemDtos)
            .build();
    }

    private WishlistItemDto toItemDto(WishlistItem item) {
        return WishlistItemDto.builder()
            .id(item.getId())
            .product(productService.toDto(item.getProduct()))
            .addedAt(item.getAddedAt())
            .build();
    }
}
