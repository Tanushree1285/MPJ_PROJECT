// =====================================================
// FinanceHub — auth.js (Login + Register logic)
// =====================================================

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁';
    }
}

// ── Login ─────────────────────────────────────────
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('login-btn');
        btn.disabled = true;
        btn.textContent = 'Signing in…';

        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            const data = await apiCall('/auth/login', 'POST', { email, password });
            // Fetch account info to get accountId (already in AuthResponse)
            saveUser({
                userId:    data.userId,
                email:     data.email,
                fullName:  data.fullName,
                role:      data.role,
                accountId: data.accountId,
                token:     data.token
            });
            showToast('Welcome back, ' + data.fullName + '! 👋', 'success');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
        } catch (err) {
            showToast(err.message || 'Login failed. Check your credentials.', 'error');
            btn.disabled = false;
            btn.textContent = 'Sign In';
        }
    });
}

// ── Register ─────────────────────────────────────
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('register-btn');
        btn.disabled = true;
        btn.textContent = 'Creating account…';

        const fullName = document.getElementById('fullName').value.trim();
        const username = document.getElementById('username').value.trim();
        const email    = document.getElementById('email').value.trim();
        const phone    = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value;

        try {
            const data = await apiCall('/auth/register', 'POST', { username, email, password, fullName, phone });
            saveUser({
                userId:    data.userId,
                email:     data.email,
                fullName:  data.fullName,
                role:      data.role,
                accountId: data.accountId,
                token:     data.token
            });
            showToast('Account created! Welcome to FinanceHub 🎉', 'success');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
        } catch (err) {
            showToast(err.message || 'Registration failed. Please try again.', 'error');
            btn.disabled = false;
            btn.textContent = 'Create Account';
        }
    });
}
