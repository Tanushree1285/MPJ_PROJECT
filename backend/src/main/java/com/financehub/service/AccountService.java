package com.financehub.service;

import com.financehub.dto.AccountResponse;
import com.financehub.exception.ResourceNotFoundException;
import com.financehub.model.Account;
import com.financehub.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final com.financehub.repository.UserRepository userRepository;

    @org.springframework.transaction.annotation.Transactional
    public AccountResponse createAccount(com.financehub.dto.CreateAccountRequest request) {
        com.financehub.model.User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUserId()));

        String accountNumber = "FH-" + String.format("%06d", new java.util.Random().nextInt(999999))
                + "-" + java.time.LocalDateTime.now().getYear();

        boolean isFirstAccount = accountRepository.findByUserId(user.getId()).isEmpty();

        Account account = Account.builder()
                .user(user)
                .accountNumber(accountNumber)
                .accountType(Account.AccountType.valueOf(request.getAccountType().toUpperCase()))
                .balance(java.math.BigDecimal.ZERO)
                .currency("USD")
                .isActive(true)
                .isPrimary(isFirstAccount)
                .build();
        
        account = accountRepository.save(account);
        return toResponse(account);
    }

    public List<AccountResponse> getByUserId(Long userId) {
        return accountRepository.findByUserId(userId).stream()
                .map(AccountService::toResponse)
                .collect(Collectors.toList());
    }

    public AccountResponse getPrimaryByUserId(Long userId) {
        return accountRepository.findByUserIdAndIsPrimary(userId, true)
                .map(AccountService::toResponse)
                .orElseGet(() -> {
                    List<Account> accounts = accountRepository.findByUserId(userId);
                    if (accounts.isEmpty()) {
                        throw new ResourceNotFoundException("No accounts found for user: " + userId);
                    }
                    return toResponse(accounts.get(0));
                });
    }

    public AccountResponse getByAccountNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));
        return toResponse(account);
    }

    public List<AccountResponse> getAll() {
    return accountRepository.findAll().stream()
            .map(AccountService::toResponse)
            .collect(Collectors.toList());
    }

    public static AccountResponse toResponse(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .accountType(account.getAccountType().name())
                .balance(account.getBalance())
                .currency(account.getCurrency())
                .isActive(account.getIsActive())
                .createdAt(account.getCreatedAt())
                .userId(account.getUser() != null ? account.getUser().getId() : null)
                .userFullName(account.getUser() != null ? account.getUser().getFullName() : null)
                .userEmail(account.getUser() != null ? account.getUser().getEmail() : null)
                .isPrimary(account.getIsPrimary())
                .build();
    }
}
