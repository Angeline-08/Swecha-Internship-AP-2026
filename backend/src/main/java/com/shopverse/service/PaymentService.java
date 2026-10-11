package com.shopverse.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.shopverse.dto.PaymentVerifyRequest;
import com.shopverse.entity.Order;
import com.shopverse.entity.Payment;
import com.shopverse.entity.PaymentMethod;
import com.shopverse.entity.PaymentStatus;
import com.shopverse.entity.OrderStatus;
import com.shopverse.exception.BadRequestException;
import com.shopverse.exception.ResourceNotFoundException;
import com.shopverse.exception.UnauthorizedException;
import com.shopverse.repository.OrderRepository;
import com.shopverse.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service @RequiredArgsConstructor @Slf4j
public class PaymentService {
    // Note: Assuming RazorpayClient is optionally available or handled via mock for compilation 
    // if keys are not present. In a real scenario, RazorpayClient bean should be defined.
    // For simplicity in compilation, we won't strictly enforce RazorpayClient bean existence in this class if it fails,
    // but the prompt specifies using com.razorpay.RazorpayClient.
    
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final OrderService orderService;

    @Value("${razorpay.key.id:dummy_id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:dummy_secret}")
    private String razorpayKeySecret;

    public Map<String, Object> createRazorpayOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Access denied");
        }
        if (order.getPaymentMethod() != PaymentMethod.RAZORPAY) {
            throw new BadRequestException("Order is not set to use Razorpay");
        }
        if (order.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new BadRequestException("Payment is not pending");
        }

        Payment payment = order.getPayment();
        if (payment == null) {
            payment = Payment.builder()
                .order(order)
                .amount(order.getTotalAmount())
                .paymentMethod(PaymentMethod.RAZORPAY)
                .paymentStatus(PaymentStatus.PENDING)
                .build();
        }

        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject options = new JSONObject();
            options.put("amount", order.getTotalAmount().multiply(BigDecimal.valueOf(100)).intValue());
            options.put("currency", "INR");
            options.put("receipt", order.getOrderNumber());
            com.razorpay.Order rzpOrder = razorpayClient.orders.create(options);
            String razorpayOrderId = rzpOrder.get("id");
            
            payment.setRazorpayOrderId(razorpayOrderId);
            paymentRepository.save(payment);
            
            return Map.of(
                "razorpayOrderId", razorpayOrderId,
                "amount", options.get("amount"),
                "currency", "INR",
                "keyId", razorpayKeyId
            );
        } catch (RazorpayException e) {
            log.error("Error creating Razorpay order", e);
            throw new BadRequestException("Could not create Razorpay order");
        }
    }

    public Map<String, Object> verifyPayment(Long userId, PaymentVerifyRequest req) {
        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Access denied");
        }
        
        Payment payment = order.getPayment();
        if (payment == null) throw new ResourceNotFoundException("Payment info not found");

        try {
            String data = req.getRazorpayOrderId() + "|" + req.getRazorpayPaymentId();
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : rawHmac) sb.append(String.format("%02x", b));
            String expectedSignature = sb.toString();

            if (expectedSignature.equals(req.getRazorpaySignature())) {
                payment.setRazorpayPaymentId(req.getRazorpayPaymentId());
                payment.setRazorpaySignature(req.getRazorpaySignature());
                payment.setPaymentStatus(PaymentStatus.PAID);
                order.setPaymentStatus(PaymentStatus.PAID);
                order.setOrderStatus(OrderStatus.PAID);
                paymentRepository.save(payment);
                orderRepository.save(order);
                return Map.of("success", true, "order", orderService.toDto(order));
            } else {
                throw new BadRequestException("Payment verification failed");
            }
        } catch (Exception e) {
            log.error("Payment verification error", e);
            throw new BadRequestException("Payment verification failed");
        }
    }

    public void handleWebhook(String payload, String webhookSignature) {
        log.info("Received Razorpay webhook");
        try {
            boolean isValid = Utils.verifyWebhookSignature(payload, webhookSignature, razorpayKeySecret);
            if (!isValid) {
                log.warn("Invalid webhook signature");
                return;
            }
            
            JSONObject json = new JSONObject(payload);
            String event = json.getString("event");
            
            if ("payment.captured".equals(event)) {
                log.info("Payment captured webhook received");
            } else if ("payment.failed".equals(event)) {
                log.info("Payment failed webhook received");
            }
        } catch (Exception e) {
            log.error("Webhook processing failed", e);
        }
    }
}
