package com.shopverse.controller;

import com.shopverse.dto.CartAddRequest;
import com.shopverse.dto.CartDto;
import com.shopverse.dto.CartUpdateRequest;
import com.shopverse.exception.UnauthorizedException;
import com.shopverse.repository.UserRepository;
import com.shopverse.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UnauthorizedException("Not authenticated")).getId();
    }

    @GetMapping
    public CartDto getCart() {
        return cartService.getCart(getCurrentUserId());
    }

    @PostMapping("/items")
    public CartDto addItem(@RequestBody @Valid CartAddRequest request) {
        return cartService.addItem(getCurrentUserId(), request.getProductId(), request.getQuantity());
    }

    @PutMapping("/items/{itemId}")
    public CartDto updateItem(@PathVariable Long itemId, @RequestBody @Valid CartUpdateRequest request) {
        return cartService.updateItem(getCurrentUserId(), itemId, request.getQuantity());
    }

    @DeleteMapping("/items/{itemId}")
    public CartDto removeItem(@PathVariable Long itemId) {
        return cartService.removeItem(getCurrentUserId(), itemId);
    }
}
