package com.financehub.repository;

import com.financehub.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM Transaction t WHERE t.senderAccount.id = :accountId OR t.receiverAccount.id = :accountId ORDER BY t.createdAt DESC")
    List<Transaction> findByAccountId(@Param("accountId") Long accountId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.receiverAccount.id = :accountId AND t.status = 'COMPLETED' AND MONTH(t.createdAt) = :month AND YEAR(t.createdAt) = :year")
    BigDecimal sumIncomeByAccountId(@Param("accountId") Long accountId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.senderAccount.id = :accountId AND t.status = 'COMPLETED' AND MONTH(t.createdAt) = :month AND YEAR(t.createdAt) = :year")
    BigDecimal sumExpenseByAccountId(@Param("accountId") Long accountId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.senderAccount.user.id = :userId AND t.createdAt >= :since")
    long countRecentTransactionsByUserId(@Param("userId") Long userId, @Param("since") java.time.LocalDateTime since);

    List<Transaction> findAllByOrderByCreatedAtDesc();
}
