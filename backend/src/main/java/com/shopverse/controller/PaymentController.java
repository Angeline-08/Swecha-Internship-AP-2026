package com.shopverse.controller;

import com.shopverse.dto.PaymentCreateRequest;
import com.shopverse.dto.PaymentVerifyRequest;
import com.shopverse.exception.UnauthorizedException;
import com.shopverse.repository.UserRepository;
import com.shopverse.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null; // webhook might not be authenticated
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UnauthorizedException("Not authenticated")).getId();
    }

    @PostMapping("/create-order")
    public Map<String, Object> createOrder(@RequestBody @Valid PaymentCreateRequest request) {
        return paymentService.createRazorpayOrder(getCurrentUserId(), request.getOrderId());
    }

    @PostMapping("/verify")
    public Map<String, Object> verifyPayment(@RequestBody @Valid PaymentVerifyRequest request) {
        return paymentService.verifyPayment(getCurrentUserId(), request);
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestBody String payload, @RequestHeader("X-Razorpay-Signature") String signature) {
        paymentService.handleWebhook(payload, signature);
        return ResponseEntity.ok().build();
    }
}
