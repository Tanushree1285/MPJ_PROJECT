package com.financehub.controller;

import com.financehub.dto.FinancialHealthResponse;
import com.financehub.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/health/{accountId}")
    public ResponseEntity<FinancialHealthResponse> getFinancialHealth(@PathVariable Long accountId) {
        return ResponseEntity.ok(analyticsService.getFinancialHealth(accountId));
    }
}
