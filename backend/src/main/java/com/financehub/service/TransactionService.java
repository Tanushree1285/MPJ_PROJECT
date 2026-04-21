package com.financehub.service;

import com.financehub.dto.SummaryResponse;
import com.financehub.dto.TransactionResponse;
import com.financehub.dto.TransferRequest;
import com.financehub.exception.InsufficientBalanceException;
import com.financehub.exception.ResourceNotFoundException;
import com.financehub.model.Account;
import com.financehub.model.Transaction;
import com.financehub.model.Transaction.TransactionStatus;
import com.financehub.model.Transaction.TransactionType;
import com.financehub.repository.AccountRepository;
import com.financehub.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import java.time.format.TextStyle;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final LogService logService;
    private final FraudDetectionService fraudDetectionService;

    @Transactional
    public TransactionResponse transfer(TransferRequest request, String ipAddress) {
        // Load sender account (pick first one for now, or implement account selection in UI)
        List<Account> senderAccounts = accountRepository.findByUserId(request.getSenderUserId());
        if (senderAccounts.isEmpty()) {
            throw new ResourceNotFoundException("Sender account not found for user ID: " + request.getSenderUserId());
        }
        Account senderAccount = senderAccounts.get(0);

        // Load receiver account
        Account receiverAccount = accountRepository.findByAccountNumber(request.getReceiverAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver account not found: " + request.getReceiverAccountNumber()));

        if (senderAccount.getId().equals(receiverAccount.getId())) {
            throw new IllegalArgumentException("Cannot transfer to the same account");
        }

        if (senderAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException(
                    "Insufficient balance. Available: " + senderAccount.getBalance()
                            + ", Requested: " + request.getAmount());
        }

        String refNumber = "TXN-" + LocalDateTime.now().getYear()
                + "-" + String.format("%05d", new Random().nextInt(99999));

        Transaction transaction = Transaction.builder()
                .senderAccount(senderAccount)
                .receiverAccount(receiverAccount)
                .amount(request.getAmount())
                .transactionType(TransactionType.TRANSFER)
                .status(TransactionStatus.PENDING) // Default to pending
                .description(request.getDescription())
                .referenceNumber(refNumber)
                .build();

        // Fraud Check
        if (fraudDetectionService.isSuspicious(transaction)) {
            transaction.setStatus(TransactionStatus.SUSPICIOUS);
            transaction = transactionRepository.save(transaction);

            logService.logAction(
                    senderAccount.getUser(),
                    "SUSPICIOUS_ACTIVITY",
                    "Transaction flagged as suspicious (Risk Heuristics) | Ref: " + refNumber,
                    ipAddress,
                    "WARNING"
            );
            return toResponse(transaction);
        }

        // Standard processing if NOT suspicious
        senderAccount.setBalance(senderAccount.getBalance().subtract(request.getAmount()));
        receiverAccount.setBalance(receiverAccount.getBalance().add(request.getAmount()));
        accountRepository.save(senderAccount);
        accountRepository.save(receiverAccount);

        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction = transactionRepository.save(transaction);

        // Log the successful transfer
        logService.logAction(
                senderAccount.getUser(),
                "TRANSFER",
                "Transferred $" + request.getAmount() + " from "
                        + senderAccount.getAccountNumber() + " to "
                        + receiverAccount.getAccountNumber() + " | Ref: " + refNumber,
                ipAddress,
                "SUCCESS"
        );

        return toResponse(transaction);
    }

    public List<TransactionResponse> getByAccountId(Long accountId) {
        return transactionRepository.findByAccountId(accountId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getAll() {
        return transactionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransactionResponse approve(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));
        
        if (transaction.getStatus() != TransactionStatus.PENDING && transaction.getStatus() != TransactionStatus.SUSPICIOUS) {
            throw new IllegalStateException("Only PENDING or SUSPICIOUS transactions can be approved");
        }

        // If it was suspicious, we now deduct the balances upon manual approval
        if (transaction.getStatus() == TransactionStatus.SUSPICIOUS) {
            Account sender = transaction.getSenderAccount();
            Account receiver = transaction.getReceiverAccount();
            
            if (sender.getBalance().compareTo(transaction.getAmount()) < 0) {
                transaction.setStatus(TransactionStatus.FAILED);
                transactionRepository.save(transaction);
                throw new InsufficientBalanceException("Approval failed: Sender no longer has sufficient balance");
            }

            sender.setBalance(sender.getBalance().subtract(transaction.getAmount()));
            receiver.setBalance(receiver.getBalance().add(transaction.getAmount()));
            
            accountRepository.save(sender);
            accountRepository.save(receiver);
        }

        transaction.setStatus(TransactionStatus.COMPLETED);
        return toResponse(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionResponse decline(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));
        
        if (transaction.getStatus() != TransactionStatus.PENDING && transaction.getStatus() != TransactionStatus.SUSPICIOUS) {
            throw new IllegalStateException("Only PENDING or SUSPICIOUS transactions can be declined");
        }

        transaction.setStatus(TransactionStatus.FAILED);
        return toResponse(transactionRepository.save(transaction));
    }

    public SummaryResponse getAccountSummary(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountId));

        LocalDateTime now = LocalDateTime.now();
        int month = now.getMonthValue();
        int year = now.getYear();

        BigDecimal income = transactionRepository.sumIncomeByAccountId(accountId, month, year);
        BigDecimal expense = transactionRepository.sumExpenseByAccountId(accountId, month, year);

        return SummaryResponse.builder()
                .monthlyIncome(income != null ? income : BigDecimal.ZERO)
                .monthlyExpense(expense != null ? expense : BigDecimal.ZERO)
                .currency(account.getCurrency())
                .monthAndYear(now.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + year)
                .build();
    }

    private TransactionResponse toResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .type(t.getTransactionType().name())
                .amount(t.getAmount())
                .status(t.getStatus().name())
                .description(t.getDescription())
                .referenceNumber(t.getReferenceNumber())
                .createdAt(t.getCreatedAt())
                .senderAccountNumber(t.getSenderAccount() != null ? t.getSenderAccount().getAccountNumber() : null)
                .receiverAccountNumber(t.getReceiverAccount() != null ? t.getReceiverAccount().getAccountNumber() : null)
                .build();
    }
}
