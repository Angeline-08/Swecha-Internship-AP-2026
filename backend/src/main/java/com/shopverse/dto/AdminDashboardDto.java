package com.shopverse.dto;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminDashboardDto {
    private long totalOrders;
    private BigDecimal totalRevenue;
    private long totalProducts;
    private long totalCustomers;
    private List<OrderDto> recentOrders;
    private Map<String,Long> orderStatusCounts;
    private Map<String,Long> paymentStatusCounts;
}
