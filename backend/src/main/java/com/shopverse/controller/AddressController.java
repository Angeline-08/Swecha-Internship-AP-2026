package com.shopverse.controller;

import com.shopverse.dto.AddressDto;
import com.shopverse.dto.AddressRequest;
import com.shopverse.exception.UnauthorizedException;
import com.shopverse.repository.UserRepository;
import com.shopverse.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {
    private final AddressService addressService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UnauthorizedException("Not authenticated")).getId();
    }

    @GetMapping
    public List<AddressDto> getAddresses() {
        return addressService.getAddresses(getCurrentUserId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AddressDto addAddress(@RequestBody @Valid AddressRequest request) {
        return addressService.addAddress(getCurrentUserId(), request);
    }

    @PutMapping("/{id}")
    public AddressDto updateAddress(@PathVariable Long id, @RequestBody @Valid AddressRequest request) {
        return addressService.updateAddress(getCurrentUserId(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(getCurrentUserId(), id);
        return ResponseEntity.ok(Map.of("message", "Address deleted"));
    }
}
