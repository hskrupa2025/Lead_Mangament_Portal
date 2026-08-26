const Auth = {
    setSession(token, user) {
        if (token) localStorage.setItem('jwt_token', token);
        if (user) localStorage.setItem('user_info', JSON.stringify(user));
    },

    getToken() {
        return localStorage.getItem('jwt_token');
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user_info');
        try {
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            return null;
        }
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    getRole() {
        const user = this.getCurrentUser();
        return user ? user.role : null;
    },

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    requireRole(requiredRole) {
        if (!this.requireAuth()) return false;
        const userRole = this.getRole();
        if (userRole !== requiredRole) {
            this.redirectByRole();
            return false;
        }
        return true;
    },

    redirectByRole() {
        const role = this.getRole();
        if (role === 'ADMIN') {
            window.location.href = 'admin-dashboard.html';
        } else if (role === 'USER') {
            window.location.href = 'leads.html';
        } else {
            window.location.href = 'login.html';
        }
    },

    logout() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_info');
        window.location.href = 'login.html';
    },

    setupCommonUI() {
        const currentUser = this.getCurrentUser();
        const userLabel = document.getElementById('currentUserLabel');
        if (userLabel && currentUser) {
            userLabel.textContent = `${currentUser.name || currentUser.email} (${currentUser.role})`;
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        const dynamicNav = document.getElementById('dynamicNav');
        if (dynamicNav && currentUser) {
            if (currentUser.role === 'ADMIN') {
                dynamicNav.innerHTML = `
          <li class="nav-item"><a href="admin-dashboard.html" class="nav-link text-white"><i class="bi bi-house-door me-2"></i> Dashboard</a></li>
          <li class="nav-item"><a href="leads.html" class="nav-link text-white-50"><i class="bi bi-card-list me-2"></i> All Leads</a></li>
          <li class="nav-item"><a href="users.html" class="nav-link text-white-50"><i class="bi bi-people me-2"></i> User Management</a></li>
        `;
            } else {
                dynamicNav.innerHTML = `
                    <li class="nav-item"><a href="leads.html" class="nav-link text-white"><i class="bi bi-card-list me-2"></i> My Assigned Leads</a></li>
        `;
            }
        }
    }
};