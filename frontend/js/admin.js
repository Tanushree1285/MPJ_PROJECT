// =====================================================
// FinanceHub — admin.js
// =====================================================

const user = requireAdmin();  // Redirects if not ADMIN/EMPLOYEE
if (user) initAdmin();

async function initAdmin() {
    document.getElementById('sidebar-avatar').textContent = getInitials(user.fullName);
    document.getElementById('sidebar-name').textContent   = user.fullName;
    document.getElementById('sidebar-role').innerHTML     = roleBadge(user.role);

    // Load all tabs on init
    loadUsers();
    loadAccounts();
    loadTransactions();
    loadLogs();
}

// ── Tab switching ────────────────────────────────
function switchTab(tabName, btn) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.remove('hidden');
    btn.classList.add('active');
}

// ── Users ────────────────────────────────────────
async function loadUsers() {
    try {
        const users = await apiCall('/users/all');
        document.getElementById('users-count').textContent = users.length + ' users';
        document.getElementById('users-body').innerHTML = users.map(u => {
            const statusBadgeHtml = u.isActive
                ? '<span class="badge badge-green">Active</span>'
                : '<span class="badge badge-red">Inactive</span>';
            return `<tr>
                <td class="mono" style="font-size:0.8rem;">${u.id}</td>
                <td>${u.fullName}</td>
                <td style="font-size:0.82rem;">${u.email}</td>
                <td>${roleBadge(u.role)}</td>
                <td>${statusBadgeHtml}</td>
                <td style="font-size:0.8rem;">${formatDate(u.createdAt)}</td>
                <td>
                  <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                    <select class="role-select" id="role-sel-${u.id}" onchange="changeRole(${u.id})">
                      <option value="">Change role…</option>
                      <option value="CUSTOMER" ${u.role==='CUSTOMER'?'selected':''}>CUSTOMER</option>
                      <option value="EMPLOYEE" ${u.role==='EMPLOYEE'?'selected':''}>EMPLOYEE</option>
                      <option value="ADMIN"    ${u.role==='ADMIN'?'selected':''}>ADMIN</option>
                      <option value="AUDITOR"  ${u.role==='AUDITOR'?'selected':''}>AUDITOR</option>
                    </select>
                    ${u.isActive
                        ? `<button class="btn btn-danger btn-xs" onclick="deactivateUser(${u.id})">Deactivate</button>`
                        : '<span class="text-muted" style="font-size:0.78rem;">Deactivated</span>'}
                  </div>
                </td>
            </tr>`;
        }).join('');
    } catch (err) {
        document.getElementById('users-body').innerHTML =
            `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">Failed to load users.</td></tr>`;
        showToast(err.message || 'Failed to load users.', 'error');
    }
}

async function changeRole(userId) {
    const sel      = document.getElementById('role-sel-' + userId);
    const roleName = sel.value;
    if (!roleName) return;
    try {
        await apiCall('/users/' + userId + '/role?roleName=' + roleName, 'PATCH');
        showToast('Role updated to ' + roleName, 'success');
        loadUsers();
    } catch (err) {
        showToast(err.message || 'Failed to update role.', 'error');
        loadUsers();
    }
}

async function deactivateUser(userId) {
    if (!confirm('Deactivate this user? They will no longer be able to log in.')) return;
    try {
        await apiCall('/users/' + userId, 'DELETE');
        showToast('User deactivated.', 'success');
        loadUsers();
    } catch (err) {
        showToast(err.message || 'Failed to deactivate user.', 'error');
    }
}

// ── Accounts ─────────────────────────────────────
async function loadAccounts() {
    try {
        const accounts = await apiCall('/accounts/all');
        document.getElementById('accounts-count').textContent = accounts.length + ' accounts';
        document.getElementById('accounts-body').innerHTML = accounts.map(a => {
            const statusBadgeHtml = a.isActive
                ? '<span class="badge badge-green">Active</span>'
                : '<span class="badge badge-red">Inactive</span>';
            return `<tr>
                <td class="mono" style="font-size:0.8rem;">${a.accountNumber}</td>
                <td>${a.userFullName || '—'}</td>
                <td><span class="badge badge-blue">${a.accountType}</span></td>
                <td class="amount-positive mono">${formatCurrency(a.balance, a.currency)}</td>
                <td>${a.currency}</td>
                <td>${statusBadgeHtml}</td>
                <td style="font-size:0.8rem;">${formatDate(a.createdAt)}</td>
            </tr>`;
        }).join('');
    } catch (err) {
        document.getElementById('accounts-body').innerHTML =
            `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">Failed to load accounts.</td></tr>`;
    }
}

// ── Transactions ─────────────────────────────────
async function loadTransactions() {
    try {
        const txList = await apiCall('/transactions/all');
        document.getElementById('transactions-count').textContent = txList.length + ' transactions';
        document.getElementById('transactions-body').innerHTML = txList.map(tx => {
            const approveBtn = tx.status === 'PENDING'
                ? `<button class="btn btn-sm" style="background:var(--accent-green);color:#0a0e1a;font-weight:700;" onclick="approveTransaction(${tx.id})">Approve</button>`
                : '';
            return `<tr>
                <td class="mono" style="font-size:0.78rem;">${tx.referenceNumber || '—'}</td>
                <td class="mono" style="font-size:0.78rem;">${tx.senderAccountNumber || '—'}</td>
                <td class="mono" style="font-size:0.78rem;">${tx.receiverAccountNumber || '—'}</td>
                <td class="amount-negative mono">${formatCurrency(tx.amount)}</td>
                <td>${typeBadge(tx.type)}</td>
                <td>${statusBadge(tx.status)}</td>
                <td style="font-size:0.78rem;">${formatDate(tx.createdAt)}</td>
                <td>${approveBtn}</td>
            </tr>`;
        }).join('');
    } catch (err) {
        document.getElementById('transactions-body').innerHTML =
            `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-muted);">Failed to load transactions.</td></tr>`;
    }
}

async function approveTransaction(id) {
    try {
        await apiCall('/transactions/' + id + '/approve', 'PATCH');
        showToast('Transaction approved!', 'success');
        loadTransactions();
    } catch (err) {
        showToast(err.message || 'Approval failed.', 'error');
    }
}

// ── Logs ─────────────────────────────────────────
async function loadLogs() {
    try {
        const logs = await apiCall('/logs/all');
        document.getElementById('logs-count').textContent = logs.length + ' entries';
        document.getElementById('logs-body').innerHTML = logs.map(l => {
            const statusBadgeHtml = l.status === 'SUCCESS'
                ? `<span class="badge badge-green">${l.status}</span>`
                : `<span class="badge badge-red">${l.status || '—'}</span>`;
            const userName = l.user ? l.user.fullName : '—';
            return `<tr>
                <td class="mono" style="font-size:0.8rem;">${l.id}</td>
                <td>${userName}</td>
                <td><span class="badge badge-blue">${l.action}</span></td>
                <td style="font-size:0.8rem;max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${l.details || '—'}</td>
                <td class="mono" style="font-size:0.78rem;">${l.ipAddress || '—'}</td>
                <td>${statusBadgeHtml}</td>
                <td style="font-size:0.78rem;">${formatDate(l.createdAt)}</td>
            </tr>`;
        }).join('');
    } catch (err) {
        document.getElementById('logs-body').innerHTML =
            `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">Failed to load logs.</td></tr>`;
    }
}
