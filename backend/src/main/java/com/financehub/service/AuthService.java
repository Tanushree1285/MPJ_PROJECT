package com.financehub.service;

import com.financehub.dto.*;
import com.financehub.exception.*;
import com.financehub.model.*;
import com.financehub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AccountRepository accountRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final LogService logService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.password-reset.expiry-minutes:30}")
    private int expiryMinutes;

    @Transactional
    public AuthResponse register(RegisterRequest request, String ipAddress) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateUserException("Email already registered: " + request.getEmail());
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateUserException("Username already taken: " + request.getUsername());
        }

        Role customerRole = roleRepository.findByRoleName("CUSTOMER")
                .orElseThrow(() -> new ResourceNotFoundException("Role CUSTOMER not found"));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(customerRole)
                .isActive(true)
                .build();
        user = userRepository.save(user);

        // Auto-create account
        String accountNumber = "FH-" + String.format("%06d", new Random().nextInt(999999))
                + "-" + LocalDateTime.now().getYear();
        Account account = Account.builder()
                .user(user)
                .accountNumber(accountNumber)
                .accountType(Account.AccountType.SAVINGS)
                .balance(new java.math.BigDecimal("1000.00"))
                .currency("USD")
                .isActive(true)
                .build();
        account = accountRepository.save(account);

        // Log registration
        logService.logAction(user, "REGISTER", "New user registered with email: " + user.getEmail(), ipAddress, "SUCCESS");

        return AuthResponse.builder()
                .token("phase1-token-" + user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().getRoleName())
                .userId(user.getId())
                .accountId(account.getId())
                .build();
    }

    public AuthResponse login(LoginRequest request, String ipAddress) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    // Log failure if user not found (be careful with sensitive details)
                    logService.logAction(null, "LOGIN_FAILURE", "Login failed: Email not found - " + request.getEmail(), ipAddress, "FAILED");
                    throw new ResourceNotFoundException("Invalid email or password");
                });

        if (!user.getIsActive()) {
            logService.logAction(user, "LOGIN_FAILURE", "Login failed: Account deactivated", ipAddress, "FAILED");
            throw new ResourceNotFoundException("Account is deactivated. Please contact support.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            logService.logAction(user, "LOGIN_FAILURE", "Login failed: Invalid password", ipAddress, "FAILED");
            throw new ResourceNotFoundException("Invalid email or password");
        }

        List<Account> accounts = accountRepository.findByUserId(user.getId());
        Account account = accounts.isEmpty() ? null : accounts.get(0);

        // Log success
        logService.logAction(user, "LOGIN_SUCCESS", "User logged in successfully", ipAddress, "SUCCESS");

        return AuthResponse.builder()
                .token("phase1-token-" + user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().getRoleName())
                .userId(user.getId())
                .accountId(account != null ? account.getId() : null)
                .build();
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request, String ipAddress) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email: " + request.getEmail()));

        // Invalidate existing tokens for this user
        passwordResetTokenRepository.deleteByUserId(user.getId());

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusMinutes(expiryMinutes))
                .used(false)
                .build();
        passwordResetTokenRepository.save(resetToken);

        // Send email
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        SimpleMailMessage mail = new SimpleMailMessage();
        // mail.setTo(user.getEmail());
        mail.setTo("pixel4621@gmail.com");
        mail.setSubject("FinanceHub — Password Reset Request");
        mail.setText("Hello " + user.getFullName() + ",\n\n"
                + "You requested a password reset for your FinanceHub account.\n\n"
                + "Click the link below to reset your password (expires in " + expiryMinutes + " minutes):\n\n"
                + resetLink + "\n\n"
                + "If you did not request this, please ignore this email.\n\n"
                + "— The FinanceHub Team");
        try {
            mailSender.send(mail);
            logService.logAction(user, "FORGOT_PASSWORD", "Password reset link sent to: " + user.getEmail(), ipAddress, "SUCCESS");
        } catch (Exception e) {
            logService.logAction(user, "FORGOT_PASSWORD", "Failed to send reset link to: " + user.getEmail(), ipAddress, "FAILED");
            e.printStackTrace();  // 🔥 THIS will show real error
            throw new RuntimeException("Email failed");
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request, String ipAddress) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired reset token"));

        if (resetToken.getUsed()) {
            throw new InvalidTokenException("This reset link has already been used");
        }
        if (resetToken.isExpired()) {
            throw new InvalidTokenException("This reset link has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        logService.logAction(user, "RESET_PASSWORD", "Password reset successfully completed", ipAddress, "SUCCESS");
    }
}
