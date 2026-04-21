package com.financehub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SummaryResponse {
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpense;
    private String currency;
    private String monthAndYear;
}
