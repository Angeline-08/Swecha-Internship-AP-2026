package com.shopverse.dto;
import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class WishlistDto {
    private Long id;
    private List<WishlistItemDto> items;
}
