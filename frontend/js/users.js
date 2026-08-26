document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.requireRole('ADMIN')) return;
    Auth.setupCommonUI();

    const userModal = new bootstrap.Modal(document.getElementById('userModal'));
    await loadUsers();

    document.getElementById('createUserModalBtn').addEventListener('click', () => {
        document.getElementById('userForm').reset();
        document.getElementById('userId').value = '';
        document.getElementById('userModalTitle').textContent = 'Add System User';
        document.getElementById('passwordGroup').style.display = 'block';
        document.getElementById('uPassword').setAttribute('required', 'true');
        document.getElementById('uPasswordLabel').innerHTML = 'Password <span class="text-danger">*</span>';
        document.getElementById('uPasswordHelp').textContent = 'Use at least 6 characters.';
        userModal.show();
    });

    document.getElementById('userForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const id = document.getElementById('userId').value;
        const isEdit = !!id;

        const payload = {
            name: document.getElementById('uName').value.trim(),
            email: document.getElementById('uEmail').value.trim(),
            role: document.getElementById('uRole').value
        };

        const password = document.getElementById('uPassword').value;
        if (password) {
            payload.password = password;
        }

        try {
            if (isEdit) {
                await API.put(`/users/${id}`, payload);
                UI.showAlert('User updated successfully.', 'success');
            } else {
                await API.post('/users', payload);
                UI.showAlert('User created successfully.', 'success');
            }
            userModal.hide();
            await loadUsers();
        } catch (err) {
            UI.showAlert(err.message || 'Error saving user details.', 'danger');
        }
    });

    async function loadUsers() {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4"><span class="spinner-border spinner-border-sm text-primary"></span> Loading...</td></tr>`;

        try {
            const res = await API.get('/users');
            const users = res.data || (Array.isArray(res) ? res : []);

            if (users.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No system users found.</td></tr>`;
                return;
            }

            tbody.innerHTML = users.map(u => `
        <tr>
          <td class="fw-bold">${escapeHtml(u.name)}</td>
          <td>${escapeHtml(u.email)}</td>
          <td><span class="badge ${u.role === 'ADMIN' ? 'bg-danger' : 'bg-secondary'}">${u.role}</span></td>
          <td>
            <span class="badge ${u.isActive !== false ? 'bg-success' : 'bg-warning'}">
              ${u.isActive !== false ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td><small>${Formatters.date(u.createdAt)}</small></td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary edit-user-btn me-1" data-id="${u._id}" data-name="${escapeHtml(u.name)}" data-email="${escapeHtml(u.email)}" data-role="${u.role}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm ${u.isActive !== false ? 'btn-outline-warning' : 'btn-outline-success'} toggle-status-btn me-1" data-id="${u._id}" data-is-active="${u.isActive !== false}">
              ${u.isActive !== false ? 'Deactivate' : 'Activate'}
            </button>
          </td>
        </tr>
      `).join('');

            document.querySelectorAll('.edit-user-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const target = e.currentTarget;
                    document.getElementById('userId').value = target.getAttribute('data-id');
                    document.getElementById('uName').value = target.getAttribute('data-name');
                    document.getElementById('uEmail').value = target.getAttribute('data-email');
                    document.getElementById('uRole').value = target.getAttribute('data-role');
                    document.getElementById('userModalTitle').textContent = 'Edit User Details';
                    document.getElementById('passwordGroup').style.display = 'block';
                    document.getElementById('uPassword').value = '';
                    document.getElementById('uPassword').removeAttribute('required');
                    document.getElementById('uPasswordLabel').textContent = 'New Password (optional)';
                    document.getElementById('uPasswordHelp').textContent = 'Leave blank to keep the current password.';
                    userModal.show();
                });
            });

            document.querySelectorAll('.toggle-status-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    const isActive = e.currentTarget.getAttribute('data-is-active') === 'true';
                    try {
                        await API.patch(`/users/${id}/status`, { isActive: !isActive });
                        UI.showAlert(`User ${isActive ? 'deactivated' : 'activated'} successfully.`, 'success');
                        loadUsers();
                    } catch (err) {
                        UI.showAlert(err.message || 'Status toggle failed.', 'danger');
                    }
                });
            });
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">${err.message || 'Failed to load users.'}</td></tr>`;
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
});
