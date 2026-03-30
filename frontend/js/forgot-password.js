// =====================================================
// FinanceHub — forgot-password.js
// =====================================================

const forgotForm = document.getElementById('forgot-form');
const stepEmail   = document.getElementById('step-email');
const stepSuccess = document.getElementById('step-success');

if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn   = document.getElementById('forgot-btn');
        const email = document.getElementById('email').value.trim();

        btn.disabled = true;
        btn.textContent = 'Sending…';

        try {
            await apiCall('/auth/forgot-password', 'POST', { email });
            document.getElementById('success-msg').textContent =
                `We sent a password reset link to ${email}. The link expires in 30 minutes.`;
            stepEmail.classList.add('hidden');
            stepSuccess.classList.remove('hidden');
        } catch (err) {
            showToast(err.message || 'Failed to send reset email. Please try again.', 'error');
            btn.disabled = false;
            btn.textContent = 'Send Reset Link';
        }
    });
}
