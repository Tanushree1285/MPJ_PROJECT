package com.financehub.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FinancialHealthResponse {
    private int score; // 0-100
    private String healthLevel; // e.g., EXCELLENT, GOOD, POOR
    private Map<String, BigDecimal> spendingByCategory;
    private BigDecimal totalSpentThisMonth;
    private BigDecimal totalSpentLastMonth;
    private Double spendingGrowthRate; // percentage change
    private String insight; // AI-like text description
    private String alert; // Warning about unusual spending
    private Double estimatedCarbonFootprintKg;
}
