package com.shopverse.dto;
import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InterestsRequest {
    private List<Long> categoryIds;
}
