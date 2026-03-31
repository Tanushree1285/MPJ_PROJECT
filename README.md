# FinanceHub — Full-Stack Banking Application

A premium digital banking experience with a Spring Boot backend, MySQL database, and luxury dark UI frontend.

## 🚀 Features
- **Phase 1 Complete**: Full functional flow from registration to transfers.
- **Email-Based Auth**: Login with email/password.
- **Secure Transfers**: Atomic transactions with balance validation and audit logging.
- **Forgot Password**: Token-based rest flow via email.
- **Admin Panel**: Role-aware management of users, accounts, and transactions.
- **Luxury UI**: Deep navy/gold aesthetic with animated gradients and real-time balance updates.

---

## 🛠 Setup Instructions

### 1. Database Setup (MySQL)
1. Open your MySQL client (Workbench, CLI, etc.).
2. Execute the script in `database/schema.sql`.
   - This creates the `financehub` database.
   - It sets up tables: `roles`, `users`, `accounts`, `transactions`, `logs`, `password_reset_tokens`.
   - It inserts sample data (Admin, Employee, Customers).

### 2. Backend Setup (Java Spring Boot)
1. Open `backend/src/main/resources/application.properties`.
2. **Update Database Credentials**:
   - `spring.datasource.username=YOUR_MYSQL_USERNAME`
   - `spring.datasource.password=YOUR_MYSQL_PASSWORD`
3. **Update SMTP Credentials** (for Forgot Password emails):
   - `spring.mail.username=YOUR_EMAIL@gmail.com`
   - `spring.mail.password=YOUR_APP_PASSWORD` (use a Gmail App Password if using Gmail).
4. Run the application:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   The backend will start on `http://localhost:8080`.

### 3. Frontend Setup
1. Use a local web server (like VS Code "Live Server" extension) to serve the `frontend/` directory.
2. The default frontend URL is configured as `http://localhost:5500`. 
   - *If your server uses a different port, update `app.frontend.url` in `application.properties`.*
3. Open `login.html` in your browser.

---

## 📡 API Endpoints (Prefix: `/api`)

### Auth
- `POST /auth/register` - Create account (auto-credits $1,000)
- `POST /auth/login` - Email-based sign in
- `POST /auth/forgot-password` - Request reset link
- `POST /auth/reset-password` - Set new password with token

### Accounts
- `GET /accounts/{userId}` - Get user account details
- `GET /accounts/all` - List all accounts (Admin)

### Transactions
- `POST /transactions/transfer` - Atomic funds transfer
- `GET /transactions/account/{accountId}` - History for account
- `PATCH /transactions/{id}/approve` - Approve PENDING transfer (Admin/Employee)

### Users
- `GET /users/all` - List all users (Admin)
- `PATCH /users/{id}/role` - Update user role (Admin)
- `DELETE /users/{id}` - Deactivate account
