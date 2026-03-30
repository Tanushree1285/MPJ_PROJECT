package com.financehub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private String type;
    private BigDecimal amount;
    private String status;
    private String description;
    private String referenceNumber;
    private LocalDateTime createdAt;
    private String senderAccountNumber;
    private String receiverAccountNumber;
}
