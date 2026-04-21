package com.financehub.controller;

import com.financehub.dto.*;
import com.financehub.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        return ResponseEntity.status(201).body(authService.register(request, getClientIp(httpRequest)));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.login(request, getClientIp(httpRequest)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        authService.forgotPassword(request, getClientIp(httpRequest));
        return ResponseEntity.ok(Map.of("message",
                "Password reset email sent. Please check your inbox."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        authService.resetPassword(request, getClientIp(httpRequest));
        return ResponseEntity.ok(Map.of("message", "Password reset successful. You can now log in."));
    }

    private String getClientIp(jakarta.servlet.http.HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isEmpty()) return xf.split(",")[0].trim();
        return request.getRemoteAddr();
    }
}
