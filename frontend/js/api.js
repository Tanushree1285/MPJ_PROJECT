// =====================================================
// FinanceHub — Shared API Utility (api.js)
// =====================================================

const API_BASE = 'http://localhost:8080/api';

/**
 * Generic API call wrapper
 * @param {string} endpoint - e.g. '/auth/login'
 * @param {string} method   - GET, POST, PUT, PATCH, DELETE
 * @param {object|null} body - JSON body (optional)
 */
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const contentType = res.headers.get('content-type');

    if (!res.ok) {
        // Try to parse JSON error payload, fall back to text
        if (contentType && contentType.includes('application/json')) {
            const err = await res.json();
            throw err;
        }
        throw { status: res.status, message: res.statusText };
    }

    if (contentType && contentType.includes('application/json')) {
        return res.json();
    }
    return {};
}

// =====================================================
// Auth Helpers
// =====================================================

/** Get logged-in user from localStorage */
function getUser() {
    const raw = localStorage.getItem('zbUser');
    return raw ? JSON.parse(raw) : null;
}

/** Save user session */
function saveUser(user) {
    localStorage.setItem('zbUser', JSON.stringify(user));
}

/** Clear session and redirect to login */
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

/** Auth guard — redirect if not logged in */
function requireAuth() {
    const user = getUser();
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

/** Admin/Employee guard */
function requireAdmin() {
    const user = requireAuth();
    if (user && !['ADMIN', 'EMPLOYEE'].includes(user.role)) {
        window.location.href = 'dashboard.html';
        return null;
    }
    return user;
}

// =====================================================
// Toast Notifications
// =====================================================

function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || '💬'}</span>
                       <span class="toast-msg">${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// =====================================================
// Formatting Helpers
// =====================================================

function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function getInitials(name) {
    return (name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function maskAccountNumber(num) {
    if (!num) return '—';
    const parts = num.split('-');
    if (parts.length >= 2) parts[1] = '••••••';
    return parts.join('-');
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
}

function statusBadge(status) {
    const map = {
        COMPLETED: 'badge-green',
        PENDING:   'badge-yellow',
        FAILED:    'badge-red'
    };
    return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
}

function typeBadge(type) {
    const map = {
        TRANSFER:   'badge-blue',
        DEPOSIT:    'badge-green',
        WITHDRAWAL: 'badge-red'
    };
    return `<span class="badge ${map[type] || 'badge-gray'}">${type}</span>`;
}

function roleBadge(role) {
    return `<span class="badge user-role-badge role-${role}">${role}</span>`;
}
