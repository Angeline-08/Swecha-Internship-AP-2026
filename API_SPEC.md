# ShopVerse Internal API Contract

## Base URL
Development: http://localhost:8080
Frontend served: file:// or http://localhost:3000

## Auth
All protected endpoints require: `Authorization: Bearer <jwt_token>`
JWT stored in localStorage key: `shopverse_token`
User object stored in localStorage key: `shopverse_user`

---

## ENDPOINTS

### AUTH
POST   /api/auth/register         body: {name,email,password}          → {token, user:{id,name,email,role,onboardingCompleted}}
POST   /api/auth/login            body: {email,password}               → {token, user:{id,name,email,role,onboardingCompleted}}
POST   /api/auth/forgot-password  body: {email}                        → {message}
GET    /api/auth/google           (redirect to Google OAuth)
GET    /api/auth/google/callback  (OAuth callback, returns JWT)

### CATEGORIES
GET    /api/categories            → [{id,name,description,imageUrl}]
GET    /api/categories/{id}       → {id,name,description,imageUrl}
GET    /api/categories/{id}/products → paginated products

### PRODUCTS
GET    /api/products                                             → Page<ProductDto>
GET    /api/products/{id}                                        → ProductDto
GET    /api/products/search?q=&categoryId=&minPrice=&maxPrice=&minRating=&sort=  → Page<ProductDto>
GET    /api/products/featured                                    → List<ProductDto>
GET    /api/products/trending                                    → List<ProductDto>
GET    /api/products/new-arrivals                                → List<ProductDto>
GET    /api/products/recommended  (auth, uses interests)         → List<ProductDto>

ProductDto: {id, name, description, brand, price, discountPercent, discountedPrice, stock, imageUrl, rating, reviewCount, isActive, category:{id,name}, createdAt}

### CART (auth required)
GET    /api/cart                  → {id, items:[{id,product:ProductDto,quantity,subtotal}], subtotal, deliveryCharge, total}
POST   /api/cart/items            body: {productId, quantity}    → CartDto
PUT    /api/cart/items/{itemId}   body: {quantity}               → CartDto
DELETE /api/cart/items/{itemId}   → CartDto

### WISHLIST (auth required)
GET    /api/wishlist              → {id, items:[{id,product:ProductDto,addedAt}]}
POST   /api/wishlist/items        body: {productId}              → WishlistDto
DELETE /api/wishlist/items/{productId}  → WishlistDto
POST   /api/wishlist/items/{productId}/move-to-cart  → {wishlist:WishlistDto, cart:CartDto}

### ADDRESSES (auth required)
GET    /api/addresses             → [AddressDto]
POST   /api/addresses             body: {fullName,phone,addressLine,city,state,postalCode,country,isDefault}  → AddressDto
PUT    /api/addresses/{id}        body: same                     → AddressDto
DELETE /api/addresses/{id}        → {message}

AddressDto: {id,fullName,phone,addressLine,city,state,postalCode,country,isDefault}

### ORDERS (auth required)
POST   /api/orders                body: {addressId, items:[{productId,quantity}], paymentMethod:"RAZORPAY"|"COD"}  → OrderDto
GET    /api/orders                → [OrderDto]
GET    /api/orders/{id}           → OrderDto

OrderDto: {id,orderNumber,user:{id,name,email},address:AddressDto,items:[{id,productId,productName,productImageUrl,quantity,unitPrice,subtotal}],subtotal,deliveryCharge,totalAmount,paymentMethod,paymentStatus,orderStatus,payment:{razorpayOrderId,razorpayPaymentId,paymentStatus},createdAt}

### PAYMENTS
POST   /api/payments/create-order  body: {orderId}              → {razorpayOrderId, amount, currency:"INR", keyId}
POST   /api/payments/verify        body: {orderId,razorpayOrderId,razorpayPaymentId,razorpaySignature}  → {success,order:OrderDto}
POST   /api/payments/webhook       body: Razorpay webhook payload

### USER (auth required)
GET    /api/users/me              → {id,name,email,role,phone,onboardingCompleted,createdAt}
PUT    /api/users/me              body: {name,phone}             → same
PUT    /api/users/me/password     body: {currentPassword,newPassword}  → {message}
GET    /api/users/me/settings     → {theme,notificationsEnabled,language}
PUT    /api/users/me/settings     body: same                    → same
GET    /api/users/me/interests    → [{id,name}] (categories)
POST   /api/users/me/interests    body: {categoryIds:[...]}     → [{id,name}]

### ADMIN (ADMIN role required)
GET    /api/admin/dashboard       → {totalOrders,totalRevenue,totalProducts,totalCustomers,recentOrders:[...],orderStatusCounts:{...},paymentStatusCounts:{...}}
GET    /api/admin/products        ?page=0&size=20               → Page<ProductDto>
POST   /api/admin/products        body: {name,brand,description,categoryId,price,discountPercent,stock,imageUrl}  → ProductDto
PUT    /api/admin/products/{id}   body: same                    → ProductDto
DELETE /api/admin/products/{id}   → {message}
GET    /api/admin/categories      → [CategoryDto]
POST   /api/admin/categories      body: {name,description,imageUrl}  → CategoryDto
PUT    /api/admin/categories/{id} body: same                    → CategoryDto
DELETE /api/admin/categories/{id} → {message}
GET    /api/admin/orders          ?page=0&size=20&status=       → Page<OrderDto>
GET    /api/admin/orders/{id}     → OrderDto
PUT    /api/admin/orders/{id}/status  body: {status}            → OrderDto
GET    /api/admin/customers       ?page=0&size=20               → Page<CustomerDto>
GET    /api/admin/payments        ?page=0&size=20               → Page<PaymentDto>

---

## HTTP Status Codes
200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Internal Server Error

Error response: {timestamp, status, error, message, path}

---

## Package Structure
com.shopverse
  .config         (SecurityConfig, CorsConfig, RazorpayConfig)
  .controller     (all @RestController classes)
  .dto            (request + response DTOs)
  .entity         (JPA @Entity classes)
  .exception      (GlobalExceptionHandler, custom exceptions)
  .init           (DataInitializer)
  .repository     (JpaRepository interfaces)
  .security       (JwtUtil, JwtAuthFilter, UserDetailsServiceImpl, OAuth2UserServiceImpl)
  .service        (all @Service classes)

---

## Entity Enums
Role: CUSTOMER, ADMIN
PaymentMethod: RAZORPAY, COD
PaymentStatus: PENDING, PAID, FAILED, REFUNDED
OrderStatus: PROCESSING, PAID, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
AuthProvider: LOCAL, GOOGLE
