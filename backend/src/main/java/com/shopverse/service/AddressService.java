package com.shopverse.service;

import com.shopverse.dto.AddressDto;
import com.shopverse.dto.AddressRequest;
import com.shopverse.entity.Address;
import com.shopverse.entity.User;
import com.shopverse.exception.ResourceNotFoundException;
import com.shopverse.repository.AddressRepository;
import com.shopverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class AddressService {
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public List<AddressDto> getAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public AddressDto addAddress(Long userId, AddressRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        if (req.isDefault()) {
            List<Address> existing = addressRepository.findByUserId(userId);
            for (Address a : existing) {
                if (a.isDefault()) {
                    a.setDefault(false);
                    addressRepository.save(a);
                }
            }
        }
        Address address = Address.builder()
                .user(user)
                .fullName(req.getFullName())
                .phone(req.getPhone())
                .addressLine(req.getAddressLine())
                .city(req.getCity())
                .state(req.getState())
                .postalCode(req.getPostalCode())
                .country(req.getCountry())
                .isDefault(req.isDefault())
                .build();
        return toDto(addressRepository.save(address));
    }

    public AddressDto updateAddress(Long userId, Long addressId, AddressRequest req) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        
        if (req.isDefault() && !address.isDefault()) {
            List<Address> existing = addressRepository.findByUserId(userId);
            for (Address a : existing) {
                if (a.isDefault() && !a.getId().equals(addressId)) {
                    a.setDefault(false);
                    addressRepository.save(a);
                }
            }
        }
        
        address.setFullName(req.getFullName());
        address.setPhone(req.getPhone());
        address.setAddressLine(req.getAddressLine());
        address.setCity(req.getCity());
        address.setState(req.getState());
        address.setPostalCode(req.getPostalCode());
        address.setCountry(req.getCountry());
        address.setDefault(req.isDefault());
        
        return toDto(addressRepository.save(address));
    }

    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        addressRepository.delete(address);
    }

    public AddressDto toDto(Address address) {
        return AddressDto.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .addressLine(address.getAddressLine())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .isDefault(address.isDefault())
                .build();
    }
}
