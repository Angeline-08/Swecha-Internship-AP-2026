package com.shopverse.controller;

import com.shopverse.dto.CreateOrderRequest;
import com.shopverse.dto.OrderDto;
import com.shopverse.exception.UnauthorizedException;
import com.shopverse.repository.UserRepository;
import com.shopverse.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UnauthorizedException("Not authenticated")).getId();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderDto createOrder(@RequestBody @Valid CreateOrderRequest request) {
        return orderService.createOrder(getCurrentUserId(), request);
    }

    @GetMapping
    public List<OrderDto> getOrders() {
        return orderService.getOrders(getCurrentUserId());
    }

    @GetMapping("/{id}")
    public OrderDto getOrder(@PathVariable Long id) {
        return orderService.getOrder(getCurrentUserId(), id);
    }
}
