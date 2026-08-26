const API_BASE_URL = "http://localhost:5001/api";

const CONFIG = {
    SERVICES: [
        "Website Development",
        "Web Application Development",
        "Mobile Application Development",
        "E-commerce",
        "SEO",
        "Digital Marketing",
        "Cloud Services",
        "IT Consulting",
        "Other"
    ],
    SOURCES: [
        "Website",
        "Google",
        "LinkedIn",
        "Referral",
        "Email",
        "Phone",
        "Walk-in",
        "Social Media",
        "Other"
    ],
    STATUSES: [
        "New",
        "Contacted",
        "Follow-up",
        "Proposal Sent",
        "Negotiation",
        "Won",
        "Lost"
    ]
};

const Formatters = {
    currency(amount) {
        const num = Number(amount) || 0;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num);
    },
    date(dateString) {
        if (!dateString) return '-';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    },
    datetime(dateString) {
        if (!dateString) return '-';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
};

const UI = {
    showAlert(message, type = 'danger', containerId = 'alertContainer') {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
    },
    clearAlerts(containerId = 'alertContainer') {
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = '';
    },
    getStatusBadge(status) {
        const statusMap = {
            'New': 'badge-status-new',
            'Contacted': 'badge-status-contacted',
            'Proposal Sent': 'badge-status-proposal-sent',
            'Negotiation': 'badge-status-negotiation',
            'Won': 'badge-status-won',
            'Lost': 'badge-status-lost'
        };
        const cssClass = statusMap[status] || 'bg-secondary text-white';
        return `<span class="badge ${cssClass}">${status || 'Unknown'}</span>`;
    }
};

const API = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = localStorage.getItem('jwt_token');

        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const fetchOptions = {
            ...options,
            headers,
            credentials: 'include'
        };

        try {
            const response = await fetch(url, fetchOptions);

            if (response.status === 401) {
                if (!window.location.pathname.includes('login.html')) {
                    localStorage.removeItem('jwt_token');
                    localStorage.removeItem('user_info');
                    window.location.href = 'login.html';
                }
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const errorMsg = data.message || `Error ${response.status}: ${response.statusText}`;
                const err = new Error(errorMsg);
                err.status = response.status;
                err.data = data;
                throw err;
            }

            return data;
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    },

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },
    post(endpoint, body) {
        return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
    },
    put(endpoint, body) {
        return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
    },
    patch(endpoint, body) {
        return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
    },
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};
