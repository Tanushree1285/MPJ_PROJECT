package com.financehub.controller;

import com.financehub.dto.AccountResponse;
import com.financehub.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<AccountResponse>> getByUserId(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(accountService.getByUserId(userId));
    }

    @GetMapping("/primary/{userId}")
    public ResponseEntity<AccountResponse> getPrimaryByUserId(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(accountService.getPrimaryByUserId(userId));
    }

    @GetMapping("/number/{accountNumber}")
    public ResponseEntity<AccountResponse> getByAccountNumber(@PathVariable("accountNumber") String accountNumber) {
        return ResponseEntity.ok(accountService.getByAccountNumber(accountNumber));
    }

    @GetMapping("/all")
    public ResponseEntity<List<AccountResponse>> getAll() {
        return ResponseEntity.ok(accountService.getAll());
    }

    @PostMapping("/create")
    public ResponseEntity<AccountResponse> createAccount(@RequestBody com.financehub.dto.CreateAccountRequest request) {
        return ResponseEntity.ok(accountService.createAccount(request));
    }
}
