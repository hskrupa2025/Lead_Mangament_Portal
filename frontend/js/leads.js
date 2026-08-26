document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.requireAuth()) return;
    Auth.setupCommonUI();

    const user = Auth.getCurrentUser();
    const isAdmin = user && user.role === 'ADMIN';

    if (!isAdmin) {
        const assignedContainer = document.getElementById('assignedToContainer');
        if (assignedContainer) assignedContainer.style.display = 'none';
    }

    let currentPage = 1;
    let leadToDeleteId = null;
    const limit = 10;

    populateDropdowns();
    if (isAdmin) await loadUsersFilter();

    await fetchLeads();

    document.getElementById('searchInput').addEventListener('input', debounce(() => { currentPage = 1; fetchLeads(); }, 400));
    document.getElementById('statusFilter').addEventListener('change', () => { currentPage = 1; fetchLeads(); });
    document.getElementById('serviceFilter').addEventListener('change', () => { currentPage = 1; fetchLeads(); });
    if (isAdmin) document.getElementById('assignedToFilter').addEventListener('change', () => { currentPage = 1; fetchLeads(); });
    document.getElementById('sortBy').addEventListener('change', () => fetchLeads());

    document.getElementById('resetFiltersBtn').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('serviceFilter').value = '';
        if (isAdmin) document.getElementById('assignedToFilter').value = '';
        document.getElementById('sortBy').value = 'createdAt';
        currentPage = 1;
        fetchLeads();
    });

    document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
        if (!leadToDeleteId) return;
        try {
            await API.delete(`/leads/${leadToDeleteId}`);
            UI.showAlert('Lead successfully deleted.', 'success');
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            fetchLeads();
        } catch (err) {
            UI.showAlert(err.message || 'Failed to delete lead.', 'danger');
        }
    });

    function populateDropdowns() {
        const statusSel = document.getElementById('statusFilter');
        CONFIG.STATUSES.forEach(s => statusSel.innerHTML += `<option value="${s}">${s}</option>`);

        const serviceSel = document.getElementById('serviceFilter');
        CONFIG.SERVICES.forEach(s => serviceSel.innerHTML += `<option value="${s}">${s}</option>`);
    }

    async function loadUsersFilter() {
        try {
            const res = await API.get('/users');
            const users = res.data || res;
            const userSel = document.getElementById('assignedToFilter');
            users.forEach(u => userSel.innerHTML += `<option value="${u._id}">${u.name}</option>`);
        } catch (e) { console.error('Users list load failed', e); }
    }

    async function fetchLeads() {
        const tbody = document.getElementById('leadsTableBody');
        tbody.innerHTML = `<tr><td colspan="10" class="text-center py-4"><span class="spinner-border spinner-border-sm text-primary"></span> Loading...</td></tr>`;

        const search = document.getElementById('searchInput').value.trim();
        const status = document.getElementById('statusFilter').value;
        const service = document.getElementById('serviceFilter').value;
        const assignedTo = isAdmin ? document.getElementById('assignedToFilter').value : '';
        const sortBy = document.getElementById('sortBy').value;

        const query = new URLSearchParams({
            page: currentPage,
            limit,
            search,
            status,
            service,
            assignedTo,
            sortBy,
            sortOrder: 'desc'
        });

        try {
            const res = await API.get(`/leads?${query.toString()}`);
            const leads = res.leads || res.data || (Array.isArray(res) ? res : []);
            const total = res.pagination?.total ?? res.totalLeads ?? res.total ?? leads.length;

            renderTable(leads);
            renderPagination(total);
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="10" class="text-center text-danger py-4">${err.message || 'Unable to load leads.'}</td></tr>`;
        }
    }

    function renderTable(leads) {
        const tbody = document.getElementById('leadsTableBody');
        if (!leads || leads.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted py-4">No leads found matching your criteria.</td></tr>`;
            return;
        }

        tbody.innerHTML = leads.map(l => {
            const assignedName = l.assignedTo ? (l.assignedTo.name || l.assignedTo.email || 'Assigned') : 'Unassigned';
            return `
        <tr>
          <td class="fw-bold">${escapeHtml(l.leadName)}</td>
          <td>${escapeHtml(l.companyName)}</td>
          <td><small>${escapeHtml(l.mobile)}<br>${escapeHtml(l.email)}</small></td>
          <td><span class="badge bg-light text-dark border">${escapeHtml(l.serviceRequired)}</span></td>
          <td>${escapeHtml(l.leadSource)}</td>
          <td class="fw-bold text-success">${Formatters.currency(l.estimatedValue)}</td>
          <td>${escapeHtml(assignedName)}</td>
          <td>${UI.getStatusBadge(l.status)}</td>
          <td><small>${Formatters.date(l.createdAt)}</small></td>
          <td class="text-end">
            <a href="lead-details.html?id=${l._id}" class="btn btn-sm btn-outline-info me-1" title="View Details"><i class="bi bi-eye"></i></a>
            <a href="lead-form.html?id=${l._id}" class="btn btn-sm btn-outline-primary me-1" title="Edit Lead"><i class="bi bi-pencil"></i></a>
            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${l._id}" data-name="${escapeHtml(l.leadName)}" title="Delete Lead"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `;
        }).join('');

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                leadToDeleteId = e.currentTarget.getAttribute('data-id');
                document.getElementById('deleteLeadName').textContent = e.currentTarget.getAttribute('data-name');
                new bootstrap.Modal(document.getElementById('deleteModal')).show();
            });
        });
    }

    function renderPagination(total) {
        const totalPages = Math.ceil(total / limit) || 1;
        document.getElementById('paginationInfo').textContent = `Showing Page ${currentPage} of ${totalPages} (${total} total records)`;

        const controls = document.getElementById('paginationControls');
        let html = '';

        html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage - 1}">Prev</a>
    </li>`;

        for (let i = 1; i <= totalPages; i++) {
            html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
        }

        html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
    </li>`;

        controls.innerHTML = html;

        controls.querySelectorAll('a.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.currentTarget.getAttribute('data-page'), 10);
                if (page > 0 && page <= totalPages && page !== currentPage) {
                    currentPage = page;
                    fetchLeads();
                }
            });
        });
    }

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
});
