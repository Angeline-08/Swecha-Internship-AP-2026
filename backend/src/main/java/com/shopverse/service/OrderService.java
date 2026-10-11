package com.shopverse.service;

import com.shopverse.dto.*;
import com.shopverse.entity.*;
import com.shopverse.exception.BadRequestException;
import com.shopverse.exception.ResourceNotFoundException;
import com.shopverse.exception.UnauthorizedException;
import com.shopverse.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    
    @Value("${app.delivery.charge:49.0}")
    private BigDecimal deliveryChargeAmount;

    @Value("${app.delivery.free-above:999.0}")
    private BigDecimal freeAbove;

    public OrderDto createOrder(Long userId, CreateOrderRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        Address address = addressRepository.findByIdAndUserId(req.getAddressId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        
        for (OrderItemRequest itemReq : req.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            if (!product.isActive() || product.getStock() < itemReq.getQuantity()) {
                throw new BadRequestException("Product unavailable or not enough stock: " + product.getName());
            }
            
            BigDecimal discountedPrice = product.getPrice().multiply(
                    BigDecimal.valueOf(1.0 - product.getDiscountPercent() / 100.0)
            ).setScale(2, java.math.RoundingMode.HALF_UP);
            
            subtotal = subtotal.add(discountedPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity())));
            
            OrderItem orderItem = OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .productImageUrl(product.getImageUrl())
                    .productBrand(product.getBrand())
                    .unitPrice(discountedPrice)
                    .quantity(itemReq.getQuantity())
                    .build();
            orderItems.add(orderItem);
        }

        BigDecimal appliedDeliveryCharge = subtotal.compareTo(freeAbove) >= 0 ? BigDecimal.ZERO : deliveryChargeAmount;
        BigDecimal total = subtotal.add(appliedDeliveryCharge);

        PaymentMethod pm = PaymentMethod.valueOf(req.getPaymentMethod().toUpperCase());
        
        Order order = Order.builder()
                .orderNumber("SV" + System.currentTimeMillis())
                .user(user)
                .addressFullName(address.getFullName())
                .addressPhone(address.getPhone())
                .addressLine(address.getAddressLine())
                .addressCity(address.getCity())
                .addressState(address.getState())
                .addressPostalCode(address.getPostalCode())
                .addressCountry(address.getCountry())
                .paymentMethod(pm)
                .paymentStatus(PaymentStatus.PENDING)
                .orderStatus(OrderStatus.PROCESSING)
                .subtotal(subtotal)
                .deliveryCharge(appliedDeliveryCharge)
                .totalAmount(total)
                .items(new ArrayList<>())
                .build();
        
        for (OrderItem oi : orderItems) {
            oi.setOrder(order);
            order.getItems().add(oi);
            
            Product p = productRepository.findById(oi.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            p.setStock(p.getStock() - oi.getQuantity());
            productRepository.save(p);
        }
        
        order = orderRepository.save(order);
        
        Payment payment = Payment.builder()
                .order(order)
                .amount(total)
                .paymentMethod(pm)
                .paymentStatus(PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);
        order.setPayment(payment);
        
        return toDto(order);
    }

    public List<OrderDto> getOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public OrderDto getOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Access denied");
        }
        return toDto(order);
    }

    public PageResponse<OrderDto> adminGetOrders(int page, int size, String status) {
        Page<Order> p;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (status == null || status.isBlank()) {
            p = orderRepository.findAll(pageRequest);
        } else {
            p = orderRepository.findByOrderStatusOrderByCreatedAtDesc(OrderStatus.valueOf(status.toUpperCase()), pageRequest);
        }
        List<OrderDto> orderList = p.getContent().stream().map(this::toDto).collect(Collectors.<OrderDto>toList());
        PageResponse<OrderDto> response = new PageResponse<>();
        response.setContent(orderList);
        response.setPage(p.getNumber());
        response.setSize(p.getSize());
        response.setTotalElements(p.getTotalElements());
        response.setTotalPages(p.getTotalPages());
        response.setLast(p.isLast());
        return response;
    }

    public OrderDto adminGetOrder(Long orderId) {
        return toDto(orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found")));
    }

    public OrderDto updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        OrderStatus status = OrderStatus.valueOf(newStatus.toUpperCase());
        order.setOrderStatus(status);
        if (status == OrderStatus.DELIVERED && order.getPaymentMethod() == PaymentMethod.COD) {
            order.setPaymentStatus(PaymentStatus.PAID);
            Payment payment = order.getPayment();
            if (payment != null) {
                payment.setPaymentStatus(PaymentStatus.PAID);
                paymentRepository.save(payment);
            }
        }
        return toDto(orderRepository.save(order));
    }

    public OrderDto toDto(Order order) {
        OrderAddressDto addressDto = OrderAddressDto.builder()
                .fullName(order.getAddressFullName())
                .phone(order.getAddressPhone())
                .addressLine(order.getAddressLine())
                .city(order.getAddressCity())
                .state(order.getAddressState())
                .postalCode(order.getAddressPostalCode())
                .country(order.getAddressCountry())
                .build();
        
        List<OrderItemDto> itemDtos = order.getItems().stream().map(i -> OrderItemDto.builder()
                .id(i.getId())
                .productId(i.getProductId())
                .productName(i.getProductName())
                .productBrand(i.getProductBrand())
                .productImageUrl(i.getProductImageUrl())
                .quantity(i.getQuantity())
                .unitPrice(i.getUnitPrice())
                .subtotal(i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .build()).collect(Collectors.<OrderItemDto>toList());
                
        PaymentInfoDto paymentInfo = null;
        if (order.getPayment() != null) {
            paymentInfo = PaymentInfoDto.builder()
                    .razorpayOrderId(order.getPayment().getRazorpayOrderId())
                    .razorpayPaymentId(order.getPayment().getRazorpayPaymentId())
                    .paymentStatus(order.getPayment().getPaymentStatus().name())
                    .build();
        }

        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .address(addressDto)
                .items(itemDtos)
                .subtotal(order.getSubtotal())
                .deliveryCharge(order.getDeliveryCharge())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod().name())
                .paymentStatus(order.getPaymentStatus().name())
                .orderStatus(order.getOrderStatus().name())
                .payment(paymentInfo)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
