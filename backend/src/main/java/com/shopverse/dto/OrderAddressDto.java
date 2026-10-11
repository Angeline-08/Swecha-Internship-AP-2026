package com.shopverse.dto;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderAddressDto {
    private String fullName;
    private String phone;
    private String addressLine;
    private String city;
    private String state;
    private String postalCode;
    private String country;
}
