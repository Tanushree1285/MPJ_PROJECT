// =====================================================
// FinanceHub — reset-password.js
// =====================================================

(function () {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');

    const stateForm    = document.getElementById('state-form');
    const stateInvalid = document.getElementById('state-invalid');
    const stateSuccess = document.getElementById('state-success');

    if (!token) {
        stateForm.classList.add('hidden');
        stateInvalid.classList.remove('hidden');
        return;
    }

    const resetForm = document.getElementById('reset-form');
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn             = document.getElementById('reset-btn');
        const newPassword     = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match.', 'error');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Resetting…';

        try {
            await apiCall('/auth/reset-password', 'POST', { token, newPassword });
            stateForm.classList.add('hidden');
            stateSuccess.classList.remove('hidden');
        } catch (err) {
            if (err.message && (err.message.includes('expired') || err.message.includes('Invalid'))) {
                stateForm.classList.add('hidden');
                stateInvalid.classList.remove('hidden');
            } else {
                showToast(err.message || 'Password reset failed. Please try again.', 'error');
                btn.disabled = false;
                btn.textContent = 'Reset Password';
            }
        }
    });
})();

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') { input.type = 'text'; btn.textContent = '🙈'; }
    else                            { input.type = 'password'; btn.textContent = '👁'; }
}
