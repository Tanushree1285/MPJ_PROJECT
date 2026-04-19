package com.financehub.repository;

import com.financehub.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserId(Long userId);
    Optional<Account> findByAccountNumber(String accountNumber);
    Optional<Account> findByUserIdAndIsPrimary(Long userId, Boolean isPrimary);
}
