
package com.shopverse.service;

import com.shopverse.dto.CartDto;
import com.shopverse.dto.CartItemDto;
import com.shopverse.dto.ProductDto;
import com.shopverse.entity.Cart;
import com.shopverse.entity.CartItem;
import com.shopverse.entity.Product;
import com.shopverse.entity.User;
import com.shopverse.exception.BadRequestException;
import com.shopverse.exception.ResourceNotFoundException;
import com.shopverse.exception.UnauthorizedException;
import com.shopverse.repository.CartItemRepository;
import com.shopverse.repository.CartRepository;
import com.shopverse.repository.ProductRepository;
import com.shopverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    @Value("${app.delivery.charge:49.0}")
    private BigDecimal deliveryCharge;

    @Value("${app.delivery.free-above:999.0}")
    private BigDecimal freeAbove;

    private Cart getOrCreateCartEntity(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            Cart cart = Cart.builder()
                .user(user)
                .items(new ArrayList<>())
                .build();

            return cartRepository.save(cart);
        });
    }

    @Transactional(readOnly = true)
    public CartDto getCart(Long userId) {
        return toDto(getOrCreateCartEntity(userId));
    }

    public CartDto addItem(Long userId, Long productId, Integer quantity) {
        if (productId == null) {
            throw new BadRequestException("Product ID is required");
        }

        if (quantity == null || quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than zero");
        }

        Cart cart = getOrCreateCartEntity(userId);

        Product product = productRepository.findProductWithCategoryById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.isActive()) {
            throw new ResourceNotFoundException("Product not found");
        }

        if (product.getStock() < quantity) {
            throw new BadRequestException("Not enough stock available");
        }

        CartItem existingItem = cart.getItems().stream()
            .filter(item -> item.getProduct().getId().equals(productId))
            .findFirst()
            .orElse(null);

        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + quantity;

            if (product.getStock() < newQuantity) {
                throw new BadRequestException("Not enough stock available");
            }

            existingItem.setQuantity(newQuantity);
        } else {
            CartItem newItem = CartItem.builder()
                .cart(cart)
                .product(product)
                .quantity(quantity)
                .build();

            cart.getItems().add(newItem);
        }

        Cart savedCart = cartRepository.save(cart);
        return toDto(savedCart);
    }

    public CartDto updateItem(Long userId, Long itemId, Integer quantity) {
        if (quantity == null || quantity < 0) {
            throw new BadRequestException("Quantity cannot be negative");
        }

        CartItem item = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!item.getCart().getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to modify this cart");
        }

        Cart cart = item.getCart();

        if (quantity == 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
            return toDto(cartRepository.save(cart));
        }

        if (item.getProduct().getStock() < quantity) {
            throw new BadRequestException("Not enough stock available");
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);

        return toDto(cartRepository.findById(cart.getId()).orElseThrow(
            () -> new ResourceNotFoundException("Cart not found")
        ));
    }

    public CartDto removeItem(Long userId, Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!item.getCart().getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to modify this cart");
        }

        Cart cart = item.getCart();
        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return toDto(cartRepository.save(cart));
    }

    private CartDto toDto(Cart cart) {
        BigDecimal subtotal = BigDecimal.ZERO;
        List<CartItemDto> itemDtos = new ArrayList<>();

        if (cart.getItems() != null) {
            for (CartItem item : cart.getItems()) {
                ProductDto productDto = productService.toDto(item.getProduct());

                BigDecimal itemSubtotal = productDto.getDiscountedPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));

                subtotal = subtotal.add(itemSubtotal);

                itemDtos.add(CartItemDto.builder()
                    .id(item.getId())
                    .product(productDto)
                    .quantity(item.getQuantity())
                    .subtotal(itemSubtotal)
                    .build());
            }
        }

        BigDecimal appliedDeliveryCharge =
            subtotal.compareTo(freeAbove) >= 0
                ? BigDecimal.ZERO
                : deliveryCharge;

        if (subtotal.compareTo(BigDecimal.ZERO) == 0) {
            appliedDeliveryCharge = BigDecimal.ZERO;
        }

        BigDecimal total = subtotal.add(appliedDeliveryCharge);

        return CartDto.builder()
            .id(cart.getId())
            .items(itemDtos)
            .subtotal(subtotal)
            .deliveryCharge(appliedDeliveryCharge)
            .total(total)
            .build();
    }
}
