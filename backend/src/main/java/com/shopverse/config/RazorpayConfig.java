package com.shopverse.config;

import com.razorpay.RazorpayClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RazorpayConfig {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Bean
    public RazorpayClient razorpayClient() {
        try {
            return new RazorpayClient(keyId, keySecret);
        } catch (Exception e) {
            throw new RuntimeException("Could not create Razorpay client", e);
        }
    }

    @Bean
    public String razorpayKeyId() {
        return keyId;
    }
}
