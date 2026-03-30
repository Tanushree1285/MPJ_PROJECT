// =====================================================
// FinanceHub — dashboard.js
// =====================================================

const user = requireAuth();
if (user) initDashboard();

async function initDashboard() {
    // Sidebar setup
    document.getElementById('sidebar-avatar').textContent = getInitials(user.fullName);
    document.getElementById('sidebar-name').textContent   = user.fullName;
    document.getElementById('sidebar-role').innerHTML     = roleBadge(user.role);
    document.getElementById('greeting-name').textContent  = user.fullName.split(' ')[0];
    document.getElementById('greeting-text').textContent  = getGreeting();

    // Admin nav
    if (['ADMIN', 'EMPLOYEE'].includes(user.role)) {
        document.getElementById('admin-nav-section').classList.remove('hidden');
    }

    // Live clock
    function updateClock() {
        document.getElementById('live-clock').textContent =
            new Date().toLocaleString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
    }
    updateClock();
    setInterval(updateClock, 1000);

    // Load account
    try {
        const account = await apiCall('/accounts/' + user.userId);

        // Count-up animation for balance
        animateValue('stat-balance', 0, account.balance, 1200,
            (v) => formatCurrency(v, account.currency));

        document.getElementById('stat-account-num').textContent   = maskAccountNumber(account.accountNumber);
        document.getElementById('stat-account-type').textContent  = account.accountType;
        document.getElementById('stat-account-type-val').textContent = account.accountType;
        document.getElementById('stat-currency').textContent      = account.currency;

        // Save accountId if missing
        if (!user.accountId) {
            user.accountId = account.id;
            saveUser(user);
        }

        // Load transactions
        const txList = await apiCall('/transactions/account/' + account.id);
        document.getElementById('stat-tx-count').textContent = txList.length;
        renderRecentTx(txList.slice(0, 5), account.accountNumber);

    } catch (err) {
        showToast(err.message || 'Failed to load account data.', 'error');
        document.getElementById('stat-balance').textContent     = '—';
        document.getElementById('stat-account-num').textContent = '—';
        document.getElementById('stat-tx-count').textContent    = '—';
    }
}

function renderRecentTx(txList, myAccountNumber) {
    const tbody = document.getElementById('recent-tx-body');
    if (!txList.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">No transactions yet</td></tr>';
        return;
    }
    tbody.innerHTML = txList.map(tx => {
        const isSent  = tx.senderAccountNumber === myAccountNumber;
        const amtHtml = isSent
            ? `<span class="amount-negative">−${formatCurrency(tx.amount)}</span>`
            : `<span class="amount-positive">+${formatCurrency(tx.amount)}</span>`;
        const counterparty = isSent
            ? (tx.receiverAccountNumber || '—')
            : (tx.senderAccountNumber || '—');
        return `<tr>
            <td>${formatDate(tx.createdAt)}</td>
            <td>${tx.description || '—'}</td>
            <td>${typeBadge(tx.type)}</td>
            <td class="mono" style="font-size:0.8rem;">${counterparty}</td>
            <td style="text-align:right">${amtHtml}</td>
            <td>${statusBadge(tx.status)}</td>
        </tr>`;
    }).join('');
}

function animateValue(elementId, start, end, duration, formatter) {
    const el = document.getElementById(elementId);
    const range = end - start;
    const startTime = performance.now();
    function step(now) {
        const elapsed  = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease     = 1 - Math.pow(1 - progress, 3);
        el.textContent = formatter(start + range * ease);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}
