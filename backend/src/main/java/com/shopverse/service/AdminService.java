package com.shopverse.service;

import com.shopverse.dto.AdminDashboardDto;
import com.shopverse.dto.CustomerDto;
import com.shopverse.dto.PaymentDto;
import com.shopverse.dto.PageResponse;
import com.shopverse.entity.Order;
import com.shopverse.entity.OrderStatus;
import com.shopverse.entity.Payment;
import com.shopverse.entity.PaymentStatus;
import com.shopverse.entity.Role;
import com.shopverse.entity.User;
import com.shopverse.repository.CategoryRepository;
import com.shopverse.repository.OrderRepository;
import com.shopverse.repository.PaymentRepository;
import com.shopverse.repository.ProductRepository;
import com.shopverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class AdminService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final CategoryRepository categoryRepository;
    private final OrderService orderService;

    public AdminDashboardDto getDashboard() {
        long totalOrders = orderRepository.count();
        // Assuming sumRevenue logic is manually calculated if not available in repo
        List<Order> allOrders = orderRepository.findAll();
        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        long totalProducts = productRepository.countByActiveTrue();
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        
        List<Order> recentOrders = orderRepository.findAll(PageRequest.of(0, 10, Sort.by("createdAt").descending())).getContent();
        
        Map<String, Long> orderStatusCounts = new HashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            orderStatusCounts.put(status.name(), allOrders.stream().filter(o -> o.getOrderStatus() == status).count());
        }
        
        Map<String, Long> paymentStatusCounts = new HashMap<>();
        for (PaymentStatus status : PaymentStatus.values()) {
            paymentStatusCounts.put(status.name(), allOrders.stream().filter(o -> o.getPaymentStatus() == status).count());
        }

        return AdminDashboardDto.builder()
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .totalProducts(totalProducts)
                .totalCustomers(totalCustomers)
                .recentOrders(recentOrders.stream().map(orderService::toDto).collect(Collectors.toList()))
                .orderStatusCounts(orderStatusCounts)
                .paymentStatusCounts(paymentStatusCounts)
                .build();
    }

    public PageResponse<CustomerDto> getCustomers(int page, int size) {
        Page<User> users = userRepository.findByRole(Role.CUSTOMER, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        List<CustomerDto> content = users.getContent().stream().map(u -> CustomerDto.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .createdAt(u.getCreatedAt())
                .totalOrders(orderRepository.findByUserIdOrderByCreatedAtDesc(u.getId()).size())
                .build()).collect(Collectors.toList());
                
        return PageResponse.<CustomerDto>builder()
                .content(content)
                .page(users.getNumber())
                .size(users.getSize())
                .totalElements(users.getTotalElements())
                .totalPages(users.getTotalPages())
                .last(users.isLast())
                .build();
    }

    public PageResponse<PaymentDto> getPayments(int page, int size) {
        Page<Payment> payments = paymentRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()));
        List<PaymentDto> content = payments.getContent().stream().map(p -> PaymentDto.builder()
                .id(p.getId())
                .orderId(p.getOrder() != null ? p.getOrder().getId() : null)
                .orderNumber(p.getOrder() != null ? p.getOrder().getOrderNumber() : null)
                .razorpayOrderId(p.getRazorpayOrderId())
                .razorpayPaymentId(p.getRazorpayPaymentId())
                .paymentMethod(p.getPaymentMethod() != null ? p.getPaymentMethod().name() : (p.getOrder() != null && p.getOrder().getPaymentMethod() != null ? p.getOrder().getPaymentMethod().name() : "UNKNOWN"))
                .paymentStatus(p.getPaymentStatus() != null ? p.getPaymentStatus().name() : "PENDING")
                .amount(p.getAmount())
                .createdAt(p.getCreatedAt())
                .build()).collect(Collectors.<PaymentDto>toList());
                
        PageResponse<PaymentDto> response = new PageResponse<>();
        response.setContent(content);
        response.setPage(payments.getNumber());
        response.setSize(payments.getSize());
        response.setTotalElements(payments.getTotalElements());
        response.setTotalPages(payments.getTotalPages());
        response.setLast(payments.isLast());
        return response;
    }
}
