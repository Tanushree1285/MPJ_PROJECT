// =====================================================
// FinanceHub — transfer.js
// =====================================================

const user = requireAuth();
let myAccount = null;

if (user) initTransfer();

async function initTransfer() {
    document.getElementById('sidebar-avatar').textContent = getInitials(user.fullName);
    document.getElementById('sidebar-name').textContent   = user.fullName;
    document.getElementById('sidebar-role').innerHTML     = roleBadge(user.role);

    if (['ADMIN', 'EMPLOYEE'].includes(user.role)) {
        document.getElementById('admin-nav-section').classList.remove('hidden');
    }

    try {
        myAccount = await apiCall('/accounts/' + user.userId);
        document.getElementById('sum-balance').textContent = formatCurrency(myAccount.balance, myAccount.currency);
        document.getElementById('sum-remaining').textContent = formatCurrency(myAccount.balance, myAccount.currency);
    } catch (err) {
        showToast('Failed to load account: ' + (err.message || 'Unknown error'), 'error');
    }

    // Live remaining balance on amount input
    const amtInput = document.getElementById('amount');
    amtInput.addEventListener('input', () => {
        const amt = parseFloat(amtInput.value) || 0;
        document.getElementById('sum-amount').textContent = formatCurrency(amt);
        if (myAccount) {
            const remaining = myAccount.balance - amt;
            const el = document.getElementById('sum-remaining');
            el.textContent = formatCurrency(remaining);
            el.className   = remaining >= 0 ? 'summary-value summary-total' : 'summary-value amount-negative';
        }
    });

    // Step 1 form
    document.getElementById('transfer-form').addEventListener('submit', (e) => {
        e.preventDefault();
        showStep2();
    });
}

function showStep2() {
    const receiverAccountNumber = document.getElementById('receiverAccountNumber').value.trim();
    const amount      = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value.trim() || 'Transfer';

    if (!myAccount) { showToast('Account not loaded yet. Please wait.', 'error'); return; }
    if (amount <= 0) { showToast('Please enter a valid amount.', 'error'); return; }
    if (myAccount.balance < amount) { showToast('Insufficient balance for this transfer.', 'error'); return; }

    document.getElementById('confirm-from').textContent    = myAccount.accountNumber;
    document.getElementById('confirm-to').textContent      = receiverAccountNumber;
    document.getElementById('confirm-amount').textContent  = formatCurrency(amount);
    document.getElementById('confirm-desc').textContent    = description;
    document.getElementById('confirm-remaining').textContent = formatCurrency(myAccount.balance - amount);

    setStep(2);
}

async function executeTransfer() {
    const btn = document.getElementById('confirm-btn');
    btn.disabled = true;
    btn.textContent = 'Processing…';

    const receiverAccountNumber = document.getElementById('receiverAccountNumber').value.trim();
    const amount      = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value.trim() || 'Transfer';

    try {
        const result = await apiCall('/transactions/transfer', 'POST', {
            senderUserId: user.userId,
            receiverAccountNumber,
            amount,
            description
        });
        document.getElementById('success-ref').textContent = result.referenceNumber || '—';
        showToast('Transfer completed! Ref: ' + result.referenceNumber, 'success');
        setStep(3);
    } catch (err) {
        showToast(err.message || 'Transfer failed. Please try again.', 'error');
        btn.disabled = false;
        btn.textContent = 'Confirm Transfer';
    }
}

function goToStep1() { setStep(1); }

function resetTransfer() {
    document.getElementById('transfer-form').reset();
    document.getElementById('sum-amount').textContent = '$0.00';
    if (myAccount) document.getElementById('sum-remaining').textContent = formatCurrency(myAccount.balance);
    // Reload account balance
    apiCall('/accounts/' + user.userId).then(acc => {
        myAccount = acc;
        document.getElementById('sum-balance').textContent   = formatCurrency(acc.balance);
        document.getElementById('sum-remaining').textContent = formatCurrency(acc.balance);
    }).catch(() => {});
    setStep(1);
}

function setStep(n) {
    // Panels
    document.getElementById('panel-step1').classList.toggle('hidden', n !== 1);
    document.getElementById('panel-step2').classList.toggle('hidden', n !== 2);
    document.getElementById('panel-step3').classList.toggle('hidden', n !== 3);

    // Step indicator
    for (let i = 1; i <= 3; i++) {
        const el = document.getElementById('step-' + i);
        el.classList.remove('active', 'done');
        if (i < n)  el.classList.add('done');
        if (i === n) el.classList.add('active');
    }

    if (n === 2) {
        const btn = document.getElementById('confirm-btn');
        btn.disabled = false;
        btn.textContent = 'Confirm Transfer';
    }
}
