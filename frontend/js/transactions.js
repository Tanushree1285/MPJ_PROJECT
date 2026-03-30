// =====================================================
// FinanceHub — transactions.js
// =====================================================

const user = requireAuth();
let allTransactions = [];
let activeTab = 'all';
let myAccountNumber = '';

if (user) initTransactions();

async function initTransactions() {
    document.getElementById('sidebar-avatar').textContent = getInitials(user.fullName);
    document.getElementById('sidebar-name').textContent   = user.fullName;
    document.getElementById('sidebar-role').innerHTML     = roleBadge(user.role);

    if (['ADMIN', 'EMPLOYEE'].includes(user.role)) {
        document.getElementById('admin-nav-section').classList.remove('hidden');
    }

    try {
        const account = await apiCall('/accounts/' + user.userId);
        myAccountNumber = account.accountNumber;

        const txList = await apiCall('/transactions/account/' + account.id);
        allTransactions = txList;
        renderTable();
    } catch (err) {
        showToast(err.message || 'Failed to load transactions.', 'error');
        document.getElementById('tx-body').innerHTML =
            '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">Failed to load transactions.</td></tr>';
    }

    // Search
    document.getElementById('search-input').addEventListener('input', renderTable);
}

function setTab(tab, btn) {
    activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTable();
}

function renderTable() {
    const query = (document.getElementById('search-input').value || '').toLowerCase();

    let list = allTransactions.filter(tx => {
        // Tab filter
        if (activeTab === 'sent' && tx.senderAccountNumber !== myAccountNumber) return false;
        if (activeTab === 'received' && tx.receiverAccountNumber !== myAccountNumber) return false;
        if (activeTab === 'pending' && tx.status !== 'PENDING') return false;
        // Search filter
        if (query && !(tx.description || '').toLowerCase().includes(query)) return false;
        return true;
    });

    document.getElementById('tx-count').textContent = list.length + ' transaction' + (list.length !== 1 ? 's' : '');

    if (!list.length) {
        document.getElementById('tx-body').innerHTML =
            '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">No transactions found.</td></tr>';
        return;
    }

    document.getElementById('tx-body').innerHTML = list.map(tx => {
        const isSent = tx.senderAccountNumber === myAccountNumber;
        const amtHtml = isSent
            ? `<span class="amount-negative">−${formatCurrency(tx.amount)}</span>`
            : `<span class="amount-positive">+${formatCurrency(tx.amount)}</span>`;
        const counterparty = isSent
            ? (tx.receiverAccountNumber || '—')
            : (tx.senderAccountNumber || '—');

        return `<tr>
            <td style="font-size:0.82rem;">${formatDate(tx.createdAt)}</td>
            <td>${tx.description || '—'}</td>
            <td class="mono" style="font-size:0.8rem;">${counterparty}</td>
            <td>${typeBadge(tx.type)}</td>
            <td style="text-align:right">${amtHtml}</td>
            <td>${statusBadge(tx.status)}</td>
        </tr>`;
    }).join('');
}
