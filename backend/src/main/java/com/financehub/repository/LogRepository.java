package com.financehub.repository;

import com.financehub.model.Log;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface LogRepository extends JpaRepository<Log, Long> {

    @Query("SELECT l FROM Log l WHERE l.user.id = :userId ORDER BY l.createdAt DESC")
    List<Log> findByUserId(@Param("userId") Long userId);

    List<Log> findAllByOrderByCreatedAtDesc();
}
