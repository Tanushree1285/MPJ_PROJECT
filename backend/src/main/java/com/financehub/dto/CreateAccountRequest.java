package com.financehub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAccountRequest {
    private Long userId;
    private String accountType; // SAVINGS, CHECKING, PREMIUM
}
