import os

base_dir = r"C:\Users\dodom\.gemini\antigravity\scratch\shopverse\backend\src\main\java\com\shopverse\dto"
os.makedirs(base_dir, exist_ok=True)

dtos = {
    "AuthDto.java": """package com.shopverse.dto;
import jakarta.validation.constraints.*;

public class AuthDto {
    public record RegisterRequest(
        @NotBlank @Size(min=2, max=50) String name,
        @NotBlank @Email String email,
        @NotBlank @Size(min=6, max=40) String password
    ) {}

    public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
    ) {}

    public record ForgotPasswordRequest(
        @NotBlank @Email String email
    ) {}

    public record AuthResponse(
        String token,
        UserDto user
    ) {}
}""",

    "UserDto.java": """package com.shopverse.dto;
import java.time.LocalDateTime;
import com.shopverse.entity.Role;

public record UserDto(
    Long id,
    String name,
    String email,
    Role role,
    String phone,
    boolean onboardingCompleted,
    LocalDateTime createdAt
) {}""",

    "CategoryDto.java": """package com.shopverse.dto;

public record CategoryDto(
    Long id,
    String name,
    String description,
    String imageUrl
) {}""",

    "ProductDto.java": """package com.shopverse.dto;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductDto(
    Long id,
    String name,
    String description,
    String brand,
    BigDecimal price,
    Integer discountPercent,
    BigDecimal discountedPrice,
    Integer stock,
    String imageUrl,
    BigDecimal rating,
    Integer reviewCount,
    boolean active,
    CategoryDto category,
    LocalDateTime createdAt
) {}""",

    "CartDto.java": """package com.shopverse.dto;
import java.math.BigDecimal;
import java.util.List;

public record CartItemDto(
    Long id,
    ProductDto product,
    Integer quantity,
    BigDecimal subtotal
) {}

public record CartDto(
    Long id,
    List<CartItemDto> items,
    BigDecimal subtotal,
    BigDecimal deliveryCharge,
    BigDecimal total
) {}""",

    "WishlistDto.java": """package com.shopverse.dto;
import java.time.LocalDateTime;
import java.util.List;

public record WishlistItemDto(
    Long id,
    ProductDto product,
    LocalDateTime addedAt
) {}

public record WishlistDto(
    Long id,
    List<WishlistItemDto> items
) {}""",

    "AddressDto.java": """package com.shopverse.dto;

public record AddressDto(
    Long id,
    String fullName,
    String phone,
    String addressLine,
    String city,
    String state,
    String postalCode,
    String country,
    boolean isDefault
) {}

public record AddressRequest(
    String fullName,
    String phone,
    String addressLine,
    String city,
    String state,
    String postalCode,
    String country,
    boolean isDefault
) {}""",

    "OrderDto.java": """package com.shopverse.dto;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.shopverse.entity.PaymentMethod;
import com.shopverse.entity.PaymentStatus;
import com.shopverse.entity.OrderStatus;

public record OrderItemDto(
    Long id,
    Long productId,
    String productName,
    String productImageUrl,
    String productBrand,
    Integer quantity,
    BigDecimal unitPrice,
    BigDecimal subtotal
) {}

public record OrderDto(
    Long id,
    String orderNumber,
    AddressDto address,
    List<OrderItemDto> items,
    BigDecimal subtotal,
    BigDecimal deliveryCharge,
    BigDecimal totalAmount,
    PaymentMethod paymentMethod,
    PaymentStatus paymentStatus,
    OrderStatus orderStatus,
    PaymentDto payment,
    LocalDateTime createdAt
) {}

public record CreateOrderRequest(
    Long addressId,
    List<OrderItemRequest> items,
    String paymentMethod
) {}

public record OrderItemRequest(
    Long productId,
    Integer quantity
) {}""",

    "PaymentDto.java": """package com.shopverse.dto;
import com.shopverse.entity.PaymentStatus;

public record PaymentDto(
    String razorpayOrderId,
    String razorpayPaymentId,
    PaymentStatus paymentStatus
) {}

public record PaymentCreateRequest(
    Long orderId
) {}

public record PaymentVerifyRequest(
    Long orderId,
    String razorpayOrderId,
    String razorpayPaymentId,
    String razorpaySignature
) {}""",

    "AdminDto.java": """package com.shopverse.dto;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record AdminProductRequest(
    String name,
    String brand,
    String description,
    Long categoryId,
    BigDecimal price,
    Integer discountPercent,
    Integer stock,
    String imageUrl
) {}

public record AdminCategoryRequest(
    String name,
    String description,
    String imageUrl
) {}

public record AdminDashboardDto(
    long totalOrders,
    BigDecimal totalRevenue,
    long totalProducts,
    long totalCustomers,
    List<OrderDto> recentOrders,
    Map<String, Long> orderStatusCounts,
    Map<String, Long> paymentStatusCounts
) {}

public record CustomerDto(
    Long id,
    String name,
    String email,
    String phone,
    LocalDateTime createdAt,
    long totalOrders
) {}""",

    "SettingsDto.java": """package com.shopverse.dto;

public record SettingsDto(
    String theme,
    boolean notificationsEnabled,
    String language
) {}""",

    "UserRequests.java": """package com.shopverse.dto;
import java.util.List;

public record InterestsRequest(
    List<Long> categoryIds
) {}

public record UpdateProfileRequest(
    String name,
    String phone
) {}

public record ChangePasswordRequest(
    String currentPassword,
    String newPassword
) {}""",

    "PageResponse.java": """package com.shopverse.dto;
import java.util.List;

public record PageResponse<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean last
) {}"""
}

for filename, content in dtos.items():
    with open(os.path.join(base_dir, filename), "w", encoding="utf-8") as f:
        f.write(content)

print("DTOs generated.")
