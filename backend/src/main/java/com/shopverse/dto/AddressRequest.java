package com.shopverse.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AddressRequest {
    @NotBlank private String fullName;
    @NotBlank private String phone;
    @NotBlank private String addressLine;
    @NotBlank private String city;
    @NotBlank private String state;
    @NotBlank private String postalCode;
    private String country;
    private boolean isDefault;
}
