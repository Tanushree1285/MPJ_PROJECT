package com.financehub.service;

import com.financehub.dto.TransactionResponse;
import com.financehub.dto.TransferRequest;
import com.financehub.exception.InsufficientBalanceException;
import com.financehub.exception.ResourceNotFoundException;
import com.financehub.model.Account;
import com.financehub.model.Log;
import com.financehub.model.Transaction;
import com.financehub.model.Transaction.TransactionStatus;
import com.financehub.model.Transaction.TransactionType;
import com.financehub.model.User;
import com.financehub.repository.AccountRepository;
import com.financehub.repository.LogRepository;
import com.financehub.repository.TransactionRepository;
import com.financehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final LogRepository logRepository;

    @Transactional
    public TransactionResponse transfer(TransferRequest request) {
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

        // Atomic balance updates
        senderAccount.setBalance(senderAccount.getBalance().subtract(request.getAmount()));
        receiverAccount.setBalance(receiverAccount.getBalance().add(request.getAmount()));
        accountRepository.save(senderAccount);
        accountRepository.save(receiverAccount);

        String refNumber = "TXN-" + LocalDateTime.now().getYear()
                + "-" + String.format("%05d", new Random().nextInt(99999));

        Transaction transaction = Transaction.builder()
                .senderAccount(senderAccount)
                .receiverAccount(receiverAccount)
                .amount(request.getAmount())
                .transactionType(TransactionType.TRANSFER)
                .status(TransactionStatus.COMPLETED)
                .description(request.getDescription())
                .referenceNumber(refNumber)
                .build();
        transaction = transactionRepository.save(transaction);

        // Log the transfer
        User senderUser = senderAccount.getUser();
        Log log = Log.builder()
                .user(senderUser)
                .action("TRANSFER")
                .details("Transferred $" + request.getAmount() + " from "
                        + senderAccount.getAccountNumber() + " to "
                        + receiverAccount.getAccountNumber() + " | Ref: " + refNumber)
                .ipAddress("system")
                .status("SUCCESS")
                .build();
        logRepository.save(log);

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
        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new IllegalStateException("Only PENDING transactions can be approved");
        }
        transaction.setStatus(TransactionStatus.COMPLETED);
        return toResponse(transactionRepository.save(transaction));
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
