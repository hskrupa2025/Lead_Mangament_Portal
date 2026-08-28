document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.requireAuth()) return;

    const urlParams = new URLSearchParams(window.location.search);
    const leadId = urlParams.get('id');
    const isEdit = !!leadId;
    const currentUser = Auth.getCurrentUser();

    if (!isEdit && (!currentUser || currentUser.role !== 'ADMIN')) {
        window.location.href = 'leads.html';
        return;
    }

    if (isEdit) {
        document.getElementById('formTitle').textContent = 'Edit Lead Record';
    }

    populateOptions();
    await loadAssignedUsers();

    if (!currentUser || currentUser.role !== 'ADMIN') {
        const assignedGroup = document.getElementById('assignedToGroup');
        const assignedSelect = document.getElementById('assignedTo');
        if (assignedGroup) assignedGroup.style.display = 'none';
        if (assignedSelect) {
            assignedSelect.removeAttribute('required');
            assignedSelect.value = currentUser ? currentUser._id : '';
        }
    }

    if (isEdit) {
        await fetchLeadDetails(leadId);
    }

    const form = document.getElementById('leadForm');
    const mobileInput = document.getElementById('mobile');
    mobileInput.addEventListener('input', () => {
        mobileInput.value = mobileInput.value.replace(/\D/g, '').slice(0, 10);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        UI.clearAlerts();

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const payload = {
            leadName: document.getElementById('leadName').value.trim(),
            companyName: document.getElementById('companyName').value.trim(),
            mobile: document.getElementById('mobile').value.trim(),
            email: document.getElementById('email').value.trim(),
            serviceRequired: document.getElementById('service').value,
            leadSource: document.getElementById('leadSource').value,
            estimatedValue: Number(document.getElementById('estimatedValue').value),
            status: document.getElementById('status').value,
            remarks: document.getElementById('remarks').value.trim()
        };

        if (currentUser && currentUser.role === 'ADMIN') {
            payload.assignedTo = document.getElementById('assignedTo').value;
        }

        const saveBtn = document.getElementById('saveBtn');
        const saveBtnText = document.getElementById('saveBtnText');
        const saveSpinner = document.getElementById('saveSpinner');

        saveBtn.disabled = true;
        saveBtnText.textContent = 'Saving...';
        saveSpinner.classList.remove('d-none');

        try {
            if (isEdit) {
                await API.put(`/leads/${leadId}`, payload);
                UI.showAlert('Lead updated successfully!', 'success');
            } else {
                await API.post('/leads', payload);
                UI.showAlert('New lead created successfully!', 'success');
            }
            setTimeout(() => { window.location.href = 'leads.html'; }, 800);
        } catch (err) {
            saveBtn.disabled = false;
            saveBtnText.textContent = 'Save Lead';
            saveSpinner.classList.add('d-none');
            const validationMessages = err.data?.errors
                ?.map(({ message }) => message)
                .join(' ');
            UI.showAlert(validationMessages || err.message || 'Failed to submit form payload.', 'danger');
        }
    });

    function populateOptions() {
        const serviceSel = document.getElementById('service');
        CONFIG.SERVICES.forEach(s => serviceSel.innerHTML += `<option value="${s}">${s}</option>`);

        const sourceSel = document.getElementById('leadSource');
        CONFIG.SOURCES.forEach(s => sourceSel.innerHTML += `<option value="${s}">${s}</option>`);

        const statusSel = document.getElementById('status');
        const availableStatuses = isEdit ? CONFIG.STATUSES : ['New'];
        availableStatuses.forEach(s => statusSel.innerHTML += `<option value="${s}">${s}</option>`);
        if (!isEdit) statusSel.value = 'New';
    }

    async function loadAssignedUsers() {
        try {
            const res = await API.get('/users');
            const users = res.data || res;
            const select = document.getElementById('assignedTo');
            users.forEach(u => {
                select.innerHTML += `<option value="${u._id}">${u.name} (${u.role})</option>`;
            });
        } catch (e) { console.error('Failed to retrieve user list', e); }
    }

    async function fetchLeadDetails(id) {
        try {
            const res = await API.get(`/leads/${id}`);
            const lead = res.data || res;

            document.getElementById('leadName').value = lead.leadName || '';
            document.getElementById('companyName').value = lead.companyName || '';
            document.getElementById('mobile').value = lead.mobile || '';
            document.getElementById('email').value = lead.email || '';
            document.getElementById('service').value = lead.serviceRequired || '';
            document.getElementById('leadSource').value = lead.leadSource || '';
            document.getElementById('estimatedValue').value = lead.estimatedValue || '';
            document.getElementById('status').value = lead.status || '';
            document.getElementById('remarks').value = lead.remarks || '';

            if (lead.assignedTo) {
                const assignedVal = typeof lead.assignedTo === 'object' ? lead.assignedTo._id : lead.assignedTo;
                document.getElementById('assignedTo').value = assignedVal;
            }
        } catch (err) {
            UI.showAlert('Failed to load existing lead data.', 'danger');
        }
    }
});
