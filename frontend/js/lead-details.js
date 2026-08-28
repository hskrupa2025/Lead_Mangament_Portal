document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.requireAuth()) return;

    const urlParams = new URLSearchParams(window.location.search);
    const leadId = urlParams.get('id');

    if (!leadId) {
        UI.showAlert('No Lead ID provided in parameter.', 'danger');
        return;
    }

    await loadLeadDetails();
    await loadFollowUps();

    const followUpForm = document.getElementById('followUpForm');
    followUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!followUpForm.checkValidity()) {
            followUpForm.classList.add('was-validated');
            return;
        }

        const saveBtn = document.getElementById('saveFollowUpBtn');
        saveBtn.disabled = true;

        const payload = {
            type: document.getElementById('fType').value,
            followUpDate: document.getElementById('fDate').value,
            nextFollowUpDate: document.getElementById('fNextDate').value || null,
            remarks: document.getElementById('fRemarks').value.trim()
        };

        try {
            await API.post(`/followups/lead/${leadId}`, payload);
            UI.showAlert('Follow-up logged successfully.', 'success');
            bootstrap.Modal.getInstance(document.getElementById('followUpModal')).hide();
            followUpForm.reset();
            followUpForm.classList.remove('was-validated');
            await loadFollowUps();
        } catch (err) {
            UI.showAlert(err.message || 'Failed to record follow-up.', 'danger');
        } finally {
            saveBtn.disabled = false;
        }
    });

    async function loadLeadDetails() {
        try {
            const res = await API.get(`/leads/${leadId}`);
            const lead = res.data || res;

            document.getElementById('leadNameTitle').textContent = lead.leadName;
            document.getElementById('statusBadge').innerHTML = UI.getStatusBadge(lead.status);
            document.getElementById('dCompany').textContent = lead.companyName;
            document.getElementById('dValue').textContent = Formatters.currency(lead.estimatedValue);
            document.getElementById('dMobile').textContent = lead.mobile;
            document.getElementById('dEmail').textContent = lead.email;
            document.getElementById('dService').textContent = lead.serviceRequired;
            document.getElementById('dSource').textContent = lead.leadSource;
            document.getElementById('dAssignedTo').textContent = lead.assignedTo ? (lead.assignedTo.name || lead.assignedTo.email) : 'Unassigned';
            document.getElementById('dCreated').textContent = Formatters.datetime(lead.createdAt);
            document.getElementById('dRemarks').textContent = lead.remarks || 'No remarks provided.';
            renderStatusHistory(lead);

            document.getElementById('actionButtons').innerHTML = `
        <a href="lead-form.html?id=${lead._id}" class="btn btn-outline-primary btn-sm"><i class="bi bi-pencil me-1"></i> Edit Lead</a>
      `;

            document.getElementById('loadingState').classList.add('d-none');
            document.getElementById('detailsContent').classList.remove('d-none');
        } catch (err) {
            document.getElementById('loadingState').classList.add('d-none');
            UI.showAlert('Failed to load lead details.', 'danger');
        }
    }

    async function loadFollowUps() {
        const timeline = document.getElementById('followUpTimeline');
        try {
            const res = await API.get(`/followups/lead/${leadId}`);
            const followups = res.data || (Array.isArray(res) ? res : []);

            if (followups.length === 0) {
                timeline.innerHTML = '<p class="text-muted small">No follow-ups logged yet.</p>';
                return;
            }

            timeline.innerHTML = `
        <div class="timeline">
          ${followups.map(f => `
            <div class="timeline-item">
              <div class="fw-bold">${f.followUpType}</div>
              <div class="text-muted small">${Formatters.datetime(f.date || f.createdAt)}</div>
              <p class="mb-1 text-secondary mt-1">${f.remarks}</p>
              ${f.nextFollowUpDate ? `<small class="text-primary"><i class="bi bi-calendar-event me-1"></i>Next: ${Formatters.date(f.nextFollowUpDate)}</small>` : ''}
            </div>
          `).join('')}
        </div>
      `;
        } catch (err) {
            timeline.innerHTML = '<p class="text-danger small">Failed to load follow-up timeline.</p>';
        }
    }

    function renderStatusHistory(lead) {
        const timeline = document.getElementById('statusTimeline');
        const history = lead.statusHistory?.length
            ? [...lead.statusHistory].sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt))
            : [{ toStatus: lead.status, changedAt: lead.createdAt, changedBy: lead.createdBy }];

        timeline.innerHTML = `
            <div class="timeline">
                ${history.map(entry => `
                    <div class="timeline-item">
                        <div class="fw-bold">${entry.fromStatus ? `${entry.fromStatus} &rarr; ` : ''}${entry.toStatus}</div>
                        <div class="text-muted small">${Formatters.datetime(entry.changedAt)}</div>
                        <div class="text-secondary small">Changed by: ${entry.changedBy?.name || entry.changedBy?.email || 'System'}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
});
