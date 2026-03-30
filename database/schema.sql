-- ============================================================
-- FinanceHub Database Schema
-- Database: financehub
-- ============================================================

CREATE DATABASE IF NOT EXISTS financehub;
USE financehub;

-- Drop in reverse dependency order
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- roles
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- ============================================================
-- users  (login identifier = email)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(100) NOT NULL UNIQUE,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(200) NOT NULL,
    phone       VARCHAR(20),
    role_id     BIGINT NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ============================================================
-- accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT NOT NULL UNIQUE,
    account_number VARCHAR(30) NOT NULL UNIQUE,
    account_type   ENUM('SAVINGS','CHECKING','PREMIUM') NOT NULL DEFAULT 'SAVINGS',
    balance        DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    currency       VARCHAR(10) NOT NULL DEFAULT 'USD',
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================================
-- transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_account_id    BIGINT,
    receiver_account_id  BIGINT,
    amount               DECIMAL(15,2) NOT NULL,
    transaction_type     ENUM('TRANSFER','DEPOSIT','WITHDRAWAL') NOT NULL,
    status               ENUM('PENDING','COMPLETED','FAILED') NOT NULL DEFAULT 'PENDING',
    description          VARCHAR(500),
    reference_number     VARCHAR(50),
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_txn_sender   FOREIGN KEY (sender_account_id)   REFERENCES accounts(id),
    CONSTRAINT fk_txn_receiver FOREIGN KEY (receiver_account_id) REFERENCES accounts(id)
);

-- ============================================================
-- logs
-- ============================================================
CREATE TABLE IF NOT EXISTS logs (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT,
    action     VARCHAR(200) NOT NULL,
    details    TEXT,
    ip_address VARCHAR(50),
    status     VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================================
-- password_reset_tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    token      VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- 4 roles
INSERT INTO roles (role_name) VALUES
    ('CUSTOMER'),
    ('EMPLOYEE'),
    ('ADMIN'),
    ('AUDITOR');

-- 5 users  — password = BCrypt hash of "Password123!"
-- BCrypt hash generated with strength 10
INSERT INTO users (username, email, password, full_name, phone, role_id, is_active) VALUES
    ('john.doe',    'john.doe@financehub.com',    '$2a$10$4gtex7kpFnRaHVv8fPftUeW2HxeZx818i3gkkEaatGgXa1Cirva3a', 'John Doe',       '+1-555-0101', 1, TRUE),
    ('jane.smith',  'jane.smith@financehub.com',  '$2a$10$JKl7MW22HPgvc0EvkOKMzOpeRf0iJ0XmjH2K5FjE7kBK1ngWDCbne', 'Jane Smith',     '+1-555-0102', 1, TRUE),
    ('emp.user',    'emp.user@financehub.com',    '$2a$10$krc3/iWvcpR3Jw4IAteLCuC6noO66fEOH0RIh3WCkdLX4phxbIjwe', 'Emily Carter',   '+1-555-0103', 2, TRUE),
    ('admin.user',  'admin.user@financehub.com',  '$2a$10$JajhJDYZ6LhbJEEvLysTXOKsjfnpEd1wpYX6M9eG6JZAAnoJcItRy', 'Admin User',     '+1-555-0104', 3, TRUE),
    ('audit.user',  'audit.user@financehub.com',  '$2a$10$6Z89jghH2gh49fcHgwS49OvHuRV/L/rMbb3f4OAQqABedj4pwO2Zi', 'Auditor Morgan', '+1-555-0105', 4, TRUE),
    ('roshni.gupta','roshni.gupta@financehub.com','$2a$10$eV2JNC6PVBSHiLSDUG2Y0eb5a3sF6.gcESALnS5tIQ7otPtQ2AOvS', 'Roshni Gupta',   '+1-555-0106', 1, TRUE);
-- 3 accounts  (one per CUSTOMER user)
INSERT INTO accounts (user_id, account_number, account_type, balance, currency) VALUES
    (1, 'FH-100001-2025', 'SAVINGS',  15420.50, 'USD'),
    (2, 'FH-100002-2025', 'CHECKING',  8750.00, 'USD'),
    (3, 'FH-100003-2025', 'PREMIUM',  50000.00, 'USD');

-- 5 transactions
INSERT INTO transactions (sender_account_id, receiver_account_id, amount, transaction_type, status, description, reference_number, created_at) VALUES
    (1, 2, 500.00,  'TRANSFER',    'COMPLETED', 'Rent payment',       'TXN-2025-00001', '2025-03-01 09:00:00'),
    (2, 1, 200.00,  'TRANSFER',    'COMPLETED', 'Refund',             'TXN-2025-00002', '2025-03-05 14:30:00'),
    (1, 3, 1000.00, 'TRANSFER',    'COMPLETED', 'Investment deposit', 'TXN-2025-00003', '2025-03-10 11:00:00'),
    (3, 1, 250.00,  'TRANSFER',    'PENDING',   'Dividend payout',    'TXN-2025-00004', '2025-03-15 16:45:00'),
    (2, 3, 100.00,  'TRANSFER',    'PENDING',   'Savings transfer',   'TXN-2025-00005', '2025-03-20 08:20:00');

-- 3 log entries
INSERT INTO logs (user_id, action, details, ip_address, status, created_at) VALUES
    (4, 'USER_LOGIN',    'Admin logged in',                         '127.0.0.1', 'SUCCESS', '2025-03-01 08:00:00'),
    (1, 'TRANSFER',      'Transferred $500 to FH-100002-2025',      '127.0.0.1', 'SUCCESS', '2025-03-01 09:00:00'),
    (2, 'USER_REGISTER', 'New user jane.smith registered',          '127.0.0.1', 'SUCCESS', '2025-02-28 10:00:00');
