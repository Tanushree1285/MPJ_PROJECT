package com.financehub.service;

import com.financehub.dto.FinancialHealthResponse;
import com.financehub.model.Transaction;
import com.financehub.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TransactionRepository transactionRepository;

    public FinancialHealthResponse getFinancialHealth(Long accountId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime firstDayThisMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime firstDayLastMonth = firstDayThisMonth.minusMonths(1);

        List<Transaction> allTransactions = transactionRepository.findByAccountId(accountId);
        
        List<Transaction> thisMonthTx = allTransactions.stream()
                .filter(t -> t.getCreatedAt().isAfter(firstDayThisMonth))
                .collect(Collectors.toList());

        List<Transaction> lastMonthTx = allTransactions.stream()
                .filter(t -> t.getCreatedAt().isAfter(firstDayLastMonth) && t.getCreatedAt().isBefore(firstDayThisMonth))
                .collect(Collectors.toList());

        // Category Breakdown
        Map<String, BigDecimal> categories = new HashMap<>();
        BigDecimal totalSpentThisMonth = BigDecimal.ZERO;
        double carbonFootprint = 0.0;

        for (Transaction t : thisMonthTx) {
            if (t.getSenderAccount() != null && t.getSenderAccount().getId().equals(accountId) && 
                "COMPLETED".equals(t.getStatus().name())) {
                String category = categorize(t);
                BigDecimal amount = t.getAmount();
                categories.put(category, categories.getOrDefault(category, BigDecimal.ZERO).add(amount));
                totalSpentThisMonth = totalSpentThisMonth.add(amount);
                
                // Calculate estimated CO2 footprint
                double amt = amount.doubleValue();
                switch (category) {
                    case "Groceries": carbonFootprint += amt * 0.15; break;
                    case "Utilities": carbonFootprint += amt * 0.40; break;
                    case "Shopping": carbonFootprint += amt * 0.25; break;
                    case "Entertainment": carbonFootprint += amt * 0.20; break;
                    case "Rent": 
                    case "Education": carbonFootprint += amt * 0.05; break;
                    case "Transfer": break; // Transfers have negligible footprint
                    default: carbonFootprint += amt * 0.10; break;
                }
            }
        }

        BigDecimal totalSpentLastMonth = BigDecimal.ZERO;
        for (Transaction t : lastMonthTx) {
            if (t.getSenderAccount() != null && t.getSenderAccount().getId().equals(accountId) && 
                "COMPLETED".equals(t.getStatus().name())) {
                totalSpentLastMonth = totalSpentLastMonth.add(t.getAmount());
            }
        }

        // Calculate Growth Rate (with reliability check)
        Double growthRate = 0.0;
        boolean isReliableTrend = totalSpentLastMonth.compareTo(new BigDecimal("200.00")) > 0;
        
        if (isReliableTrend) {
            growthRate = totalSpentThisMonth.subtract(totalSpentLastMonth)
                    .divide(totalSpentLastMonth, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")).doubleValue();
        }

        // Scoring Logic
        int score = calculateScore(totalSpentThisMonth, totalSpentLastMonth, thisMonthTx);
        String level = "GOOD";
        if (score > 80) level = "EXCELLENT";
        else if (score < 50) level = "POOR";

        String insight = generateInsight(growthRate, categories, !isReliableTrend);
        String alert = null;
        if (isReliableTrend && growthRate > 200) {
            alert = "Significant Spending Spike: Your activity is much higher than your usual patterns.";
        } else if (isReliableTrend && growthRate > 50) {
            alert = "Unusual Spending: Your spending this month is " + String.format("%.1f", growthRate) + "% higher than last month.";
        } else if (!isReliableTrend && totalSpentThisMonth.compareTo(new BigDecimal("1000.00")) > 0) {
            alert = "High Initial Activity: You're spending more than $1,000.00 in your first analyzed month.";
        }

        return FinancialHealthResponse.builder()
                .score(score)
                .healthLevel(level)
                .spendingByCategory(categories)
                .totalSpentThisMonth(totalSpentThisMonth)
                .totalSpentLastMonth(totalSpentLastMonth)
                .spendingGrowthRate(isReliableTrend ? growthRate : 0.0)
                .insight(insight)
                .alert(alert)
                .estimatedCarbonFootprintKg(carbonFootprint)
                .build();
    }

    private String categorize(Transaction t) {
        if (t.getCategory() != null && !t.getCategory().isEmpty()) return t.getCategory();
        
        String desc = t.getDescription() != null ? t.getDescription().toLowerCase() : "";
        if (desc.contains("rent") || desc.contains("housing") || desc.contains("apartment")) return "Rent";
        if (desc.contains("grocery") || desc.contains("food") || desc.contains("market") || desc.contains("supermarket") || desc.contains("mart")) return "Groceries";
        if (desc.contains("salary") || desc.contains("pay") || desc.contains("credit")) return "Income";
        if (desc.contains("utility") || desc.contains("electric") || desc.contains("water") || desc.contains("bill") || desc.contains("recharge")) return "Utilities";
        if (desc.contains("shopping") || desc.contains("store") || desc.contains("mall") || desc.contains("amazon") || desc.contains("flipkart")) return "Shopping";
        if (desc.contains("education") || desc.contains("tuition") || desc.contains("course") || desc.contains("university") || desc.contains("school")) return "Education";
        if (desc.contains("dinner") || desc.contains("brunch") || desc.contains("restaurant") || desc.contains("movie") || desc.contains("bar")) return "Entertainment";
        if (desc.contains("transfer")) return "Transfer";
        
        return "General";
    }

    private int calculateScore(BigDecimal thisMonth, BigDecimal lastMonth, List<Transaction> txs) {
        int baseScore = 85;
        
        // Penalty for high growth (only if we have reliable historical data)
        if (lastMonth.compareTo(new BigDecimal("200.00")) > 0) {
            BigDecimal ratio = thisMonth.divide(lastMonth, 2, RoundingMode.HALF_UP);
            if (ratio.compareTo(new BigDecimal("3.0")) > 0) baseScore -= 20; // Severe spike
            else if (ratio.compareTo(new BigDecimal("1.5")) > 0) baseScore -= 10;
            else if (ratio.compareTo(new BigDecimal("1.2")) > 0) baseScore -= 5;
        } else {
            // New account logic
            baseScore += 5;
        }

        // Penalty for suspicious activity
        long suspiciousCount = txs.stream().filter(t -> "SUSPICIOUS".equals(t.getStatus().name())).count();
        baseScore -= (suspiciousCount * 10);

        return Math.max(0, Math.min(100, baseScore));
    }

    private String generateInsight(Double growth, Map<String, BigDecimal> categories, boolean isNewAccount) {
        if (isNewAccount) {
            return "Welcome! We're starting to analyze your spending. Keep using your account to see detailed trends.";
        }
        
        if (growth < 0) return "Great job! You've spent less than last month.";
        if (growth > 20) return "You're spending quite a bit more this month. Consider reviewing your top categories.";
        
        String topCategory = categories.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");
                
        return "Your top spending category this month is " + topCategory + ".";
    }
}
