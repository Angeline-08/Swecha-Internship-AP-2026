package com.shopverse.init;

import com.shopverse.entity.*;
import com.shopverse.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (categoryRepository.count() > 0) {
            log.info("ShopVerse: Data already initialized, skipping.");
            return;
        }

        // Categories
        Category cat1 = categoryRepository.save(Category.builder().name("Electronics & Appliances").description("Gadgets, devices, and home appliances").imageUrl("https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400").build());
        Category cat2 = categoryRepository.save(Category.builder().name("Men's Fashion").description("Clothing, footwear, and accessories for men").imageUrl("https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400").build());
        Category cat3 = categoryRepository.save(Category.builder().name("Women's Fashion").description("Trendy clothing and accessories for women").imageUrl("https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400").build());
        Category cat4 = categoryRepository.save(Category.builder().name("Home & Kitchen").description("Everything for your home").imageUrl("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400").build());
        Category cat5 = categoryRepository.save(Category.builder().name("Beauty & Personal Care").description("Skincare, makeup, and grooming").imageUrl("https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400").build());
        Category cat6 = categoryRepository.save(Category.builder().name("Health & Fitness").description("Supplements, equipment, and wellness").imageUrl("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400").build());
        Category cat7 = categoryRepository.save(Category.builder().name("Sports & Outdoor").description("Gear for every sport and adventure").imageUrl("https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400").build());
        Category cat8 = categoryRepository.save(Category.builder().name("Books").description("Bestsellers, educational, and more").imageUrl("https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400").build());

        // Products
        productRepository.save(Product.builder().category(cat1).name("Sony WH-1000XM5 Headphones").brand("Sony").price(new BigDecimal("29990")).discountPercent(20).stock(50).rating(new BigDecimal("4.8")).reviewCount(1250).imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400").description("Industry-leading noise cancellation with exceptional audio quality for music lovers.").active(true).build());
        productRepository.save(Product.builder().category(cat1).name("Apple Watch Series 9").brand("Apple").price(new BigDecimal("41990")).discountPercent(10).stock(30).rating(new BigDecimal("4.9")).reviewCount(2100).imageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400").description("Advanced health monitoring, crash detection, and seamless iPhone integration.").active(true).build());
        productRepository.save(Product.builder().category(cat1).name("JBL Flip 6 Bluetooth Speaker").brand("JBL").price(new BigDecimal("9999")).discountPercent(15).stock(100).rating(new BigDecimal("4.6")).reviewCount(890).imageUrl("https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400").description("Powerful sound, IP67 waterproof, 12-hour battery life for outdoor adventures.").active(true).build());
        productRepository.save(Product.builder().category(cat1).name("Samsung 65\" 4K Smart TV").brand("Samsung").price(new BigDecimal("89990")).discountPercent(25).stock(15).rating(new BigDecimal("4.7")).reviewCount(450).imageUrl("https://images.unsplash.com/photo-1593359677879-a4bb92f4e400?w=400").description("Crystal clear 4K display with HDR10+ and built-in smart home controls.").active(true).build());
        productRepository.save(Product.builder().category(cat1).name("Dell XPS 15 Laptop").brand("Dell").price(new BigDecimal("129990")).discountPercent(8).stock(20).rating(new BigDecimal("4.8")).reviewCount(320).imageUrl("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400").description("Professional-grade laptop with OLED display, 12th Gen Intel Core i7, 16GB RAM.").active(true).build());

        productRepository.save(Product.builder().category(cat2).name("Nike Air Max 270").brand("Nike").price(new BigDecimal("12995")).discountPercent(20).stock(75).rating(new BigDecimal("4.5")).reviewCount(560).imageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400").description("Iconic Air Max cushioning with a breathable mesh upper for all-day comfort.").active(true).build());
        productRepository.save(Product.builder().category(cat2).name("Levi's 511 Slim Fit Jeans").brand("Levi's").price(new BigDecimal("3499")).discountPercent(30).stock(150).rating(new BigDecimal("4.4")).reviewCount(720).imageUrl("https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400").description("Classic slim fit jeans with stretch denim for a perfect, comfortable fit.").active(true).build());
        productRepository.save(Product.builder().category(cat2).name("Adidas Originals Trefoil Hoodie").brand("Adidas").price(new BigDecimal("4999")).discountPercent(25).stock(80).rating(new BigDecimal("4.6")).reviewCount(410).imageUrl("https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=400").description("Cozy fleece hoodie with the iconic Trefoil logo for casual streetwear style.").active(true).build());

        productRepository.save(Product.builder().category(cat3).name("Zara Floral Midi Dress").brand("Zara").price(new BigDecimal("4990")).discountPercent(20).stock(60).rating(new BigDecimal("4.3")).reviewCount(280).imageUrl("https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400").description("Elegant floral print midi dress, perfect for summer outings and brunches.").active(true).build());
        productRepository.save(Product.builder().category(cat3).name("Michael Kors Jet Set Tote").brand("Michael Kors").price(new BigDecimal("12999")).discountPercent(15).stock(40).rating(new BigDecimal("4.7")).reviewCount(190).imageUrl("https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400").description("Premium leather tote with gold hardware, spacious and stylish for everyday use.").active(true).build());

        productRepository.save(Product.builder().category(cat4).name("Philips Digital Air Fryer").brand("Philips").price(new BigDecimal("8995")).discountPercent(20).stock(45).rating(new BigDecimal("4.5")).reviewCount(630).imageUrl("https://images.unsplash.com/photo-1585515656263-7a70e4e73a2a?w=400").description("Rapid Air Technology for crispy results with up to 90% less fat.").active(true).build());
        productRepository.save(Product.builder().category(cat4).name("IKEA Ranarp Work Lamp").brand("IKEA").price(new BigDecimal("1999")).discountPercent(10).stock(200).rating(new BigDecimal("4.2")).reviewCount(340).imageUrl("https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400").description("Adjustable industrial-style desk lamp with a focused beam for work or reading.").active(true).build());
        productRepository.save(Product.builder().category(cat4).name("Instant Pot Duo 7-in-1").brand("Instant Pot").price(new BigDecimal("11999")).discountPercent(30).stock(35).rating(new BigDecimal("4.8")).reviewCount(890).imageUrl("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400").description("Pressure cook, slow cook, steam, sauté, and more in one versatile appliance.").active(true).build());

        productRepository.save(Product.builder().category(cat5).name("Lakme 9-to-5 Foundation").brand("Lakme").price(new BigDecimal("799")).discountPercent(10).stock(500).rating(new BigDecimal("4.1")).reviewCount(1100).imageUrl("https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400").description("Long-lasting, full-coverage foundation for a flawless 9-to-5 look.").active(true).build());
        productRepository.save(Product.builder().category(cat5).name("Forest Essentials Moisturizing Face Wash").brand("Forest Essentials").price(new BigDecimal("1995")).discountPercent(5).stock(120).rating(new BigDecimal("4.6")).reviewCount(280).imageUrl("https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400").description("Luxurious Ayurvedic face wash with natural herbs for a radiant, clean complexion.").active(true).build());

        productRepository.save(Product.builder().category(cat6).name("Fitbit Charge 6 Fitness Tracker").brand("Fitbit").price(new BigDecimal("16999")).discountPercent(15).stock(55).rating(new BigDecimal("4.4")).reviewCount(420).imageUrl("https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400").description("Advanced health metrics, 40+ exercise modes, and 7-day battery life.").active(true).build());
        productRepository.save(Product.builder().category(cat6).name("Boldfit Premium Yoga Mat").brand("Boldfit").price(new BigDecimal("1299")).discountPercent(20).stock(300).rating(new BigDecimal("4.3")).reviewCount(560).imageUrl("https://images.unsplash.com/photo-1601925228006-6625c37cd4c2?w=400").description("Non-slip surface, extra thick 6mm cushioning for joints, ideal for yoga and pilates.").active(true).build());

        productRepository.save(Product.builder().category(cat7).name("Nike Air Zoom Pegasus 41").brand("Nike").price(new BigDecimal("9995")).discountPercent(25).stock(90).rating(new BigDecimal("4.6")).reviewCount(380).imageUrl("https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400").description("Responsive cushioning and breathable mesh for your best running performance.").active(true).build());
        productRepository.save(Product.builder().category(cat7).name("Decathlon 40L Trekking Backpack").brand("Decathlon").price(new BigDecimal("3499")).discountPercent(20).stock(65).rating(new BigDecimal("4.5")).reviewCount(240).imageUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400").description("Ergonomic 40L backpack with ventilated back and rain cover for trekking adventures.").active(true).build());

        productRepository.save(Product.builder().category(cat8).name("Atomic Habits").brand("James Clear").price(new BigDecimal("399")).discountPercent(30).stock(400).rating(new BigDecimal("4.9")).reviewCount(5600).imageUrl("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400").description("An easy and proven way to build good habits and break bad ones. A life-changing read.").active(true).build());
        productRepository.save(Product.builder().category(cat8).name("The Psychology of Money").brand("Morgan Housel").price(new BigDecimal("349")).discountPercent(25).stock(350).rating(new BigDecimal("4.8")).reviewCount(3200).imageUrl("https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400").description("Timeless lessons on wealth, greed, and happiness through 19 short stories.").active(true).build());

        // Users
        if (!userRepository.existsByEmail("admin@shopverse.com")) {
            User admin = User.builder().name("Admin").email("admin@shopverse.com").passwordHash(passwordEncoder.encode("Admin@123")).role(Role.ADMIN).provider(AuthProvider.LOCAL).onboardingCompleted(true).build();
            userRepository.save(admin);
            initUserDeps(admin);
        }
        if (!userRepository.existsByEmail("customer@shopverse.com")) {
            User customer = User.builder().name("Demo Customer").email("customer@shopverse.com").passwordHash(passwordEncoder.encode("Customer@123")).role(Role.CUSTOMER).provider(AuthProvider.LOCAL).onboardingCompleted(false).build();
            userRepository.save(customer);
            initUserDeps(customer);
        }

        log.info("ShopVerse: Initialization complete! Admin: admin@shopverse.com / Admin@123 | Customer: customer@shopverse.com / Customer@123");
    }

    private void initUserDeps(User user) {
        if (!cartRepository.findByUserId(user.getId()).isPresent()) {
            cartRepository.save(Cart.builder().user(user).items(new ArrayList<>()).build());
        }
        if (!wishlistRepository.findByUserId(user.getId()).isPresent()) {
            wishlistRepository.save(Wishlist.builder().user(user).items(new ArrayList<>()).build());
        }
        if (!userSettingsRepository.findByUserId(user.getId()).isPresent()) {
            userSettingsRepository.save(UserSettings.builder().user(user).theme("dark").notificationsEnabled(true).language("en").build());
        }
    }
}
