package com.shopverse.controller;

import com.shopverse.dto.WishlistAddRequest;
import com.shopverse.dto.WishlistDto;
import com.shopverse.exception.UnauthorizedException;
import com.shopverse.repository.UserRepository;
import com.shopverse.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {
    private final WishlistService wishlistService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UnauthorizedException("Not authenticated")).getId();
    }

    @GetMapping
    public WishlistDto getWishlist() {
        return wishlistService.getWishlist(getCurrentUserId());
    }

    @PostMapping("/items")
    public WishlistDto addItem(@RequestBody @Valid WishlistAddRequest request) {
        return wishlistService.addItem(getCurrentUserId(), request.getProductId());
    }

    @DeleteMapping("/items/{productId}")
    public WishlistDto removeItem(@PathVariable Long productId) {
        return wishlistService.removeItem(getCurrentUserId(), productId);
    }

    @PostMapping("/items/{productId}/move-to-cart")
    public Map<String, Object> moveToCart(@PathVariable Long productId) {
        return wishlistService.moveToCart(getCurrentUserId(), productId);
    }
}
