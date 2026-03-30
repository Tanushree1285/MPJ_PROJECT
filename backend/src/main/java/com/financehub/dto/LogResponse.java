package com.financehub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogResponse {
    private Long id;
    private Long userId;
    private String action;
    private String details;
    private String ipAddress;
    private String status;
    private LocalDateTime createdAt;
}
