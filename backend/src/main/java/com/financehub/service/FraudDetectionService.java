package com.financehub.service;

import com.financehub.model.Transaction;
import com.financehub.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class FraudDetectionService {

    private final TransactionRepository transactionRepository;

    private static final BigDecimal HIGH_AMOUNT_THRESHOLD = new BigDecimal("10000.00");
    private static final int VELOCITY_THRESHOLD = 3; // Max 3 transfers per minute
    private static final int VELOCITY_WINDOW_MINUTES = 1;

    public boolean isSuspicious(Transaction transaction) {
        // Rule 1: High Amount Threshold
        if (transaction.getAmount().compareTo(HIGH_AMOUNT_THRESHOLD) > 0) {
            return true;
        }

        // Rule 2: Velocity Check (N transfers in last M minutes)
        if (transaction.getSenderAccount() != null && transaction.getSenderAccount().getUser() != null) {
            Long userId = transaction.getSenderAccount().getUser().getId();
            LocalDateTime since = LocalDateTime.now().minusMinutes(VELOCITY_WINDOW_MINUTES);
            long count = transactionRepository.countRecentTransactionsByUserId(userId, since);
            
            if (count >= VELOCITY_THRESHOLD) {
                return true;
            }
        }

        return false;
    }
}
