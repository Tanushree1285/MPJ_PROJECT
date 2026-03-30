package com.financehub.controller;

import com.financehub.dto.TransactionResponse;
import com.financehub.dto.TransferRequest;
import com.financehub.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/transfer")
    public ResponseEntity<TransactionResponse> transfer(@Valid @RequestBody TransferRequest request) {
        return ResponseEntity.status(201).body(transactionService.transfer(request));
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<TransactionResponse>> getByAccount(@PathVariable("accountId") Long accountId) {
        return ResponseEntity.ok(transactionService.getByAccountId(accountId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<TransactionResponse>> getAll() {
        return ResponseEntity.ok(transactionService.getAll());
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<TransactionResponse> approve(@PathVariable("id") Long id) {
        return ResponseEntity.ok(transactionService.approve(id));
    }
}
