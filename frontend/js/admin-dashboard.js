document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.requireRole('ADMIN')) return;
    Auth.setupCommonUI();

    let statusChartInstance = null;
    let serviceChartInstance = null;
    let userChartInstance = null;

    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', loadDashboardData);

    await loadDashboardData();

    async function loadDashboardData() {
        const loadingState = document.getElementById('loadingState');
        const dashboardContent = document.getElementById('dashboardContent');

        loadingState.classList.remove('d-none');
        dashboardContent.classList.add('d-none');
        UI.clearAlerts();

        try {
            const response = await API.get('/dashboard/admin');
            const data = response.data || response;

            const metrics = data.metrics || {};
            document.getElementById('totalLeads').textContent = metrics.totalLeads || 0;
            document.getElementById('newLeads').textContent = metrics.newLeads || 0;
            document.getElementById('proposalSent').textContent = metrics.proposalSent || 0;
            document.getElementById('wonLeads').textContent = metrics.won || 0;
            document.getElementById('lostLeads').textContent = metrics.lost || 0;
            document.getElementById('potentialValue').textContent = Formatters.currency(metrics.potentialBusinessValue || 0);

            renderCharts(data);

            loadingState.classList.add('d-none');
            dashboardContent.classList.remove('d-none');
        } catch (err) {
            loadingState.classList.add('d-none');
            UI.showAlert(err.message || 'Failed to retrieve dashboard analytics.', 'danger');
        }
    }

    function renderCharts(data) {
        const charts = data.charts || {};
        const statusData = charts.leadsByStatus || [];
        const statusLabels = statusData.map(item => item._id || 'Unassigned');
        const statusCounts = statusData.map(item => item.count);

        if (statusChartInstance) statusChartInstance.destroy();
        const ctxStatus = document.getElementById('statusChart').getContext('2d');
        statusChartInstance = new Chart(ctxStatus, {
            type: 'doughnut',
            data: {
                labels: statusLabels,
                datasets: [{
                    data: statusCounts,
                    backgroundColor: ['#0dcaf0', '#6c757d', '#ffc107', '#fd7e14', '#198754', '#dc3545']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        const serviceData = charts.leadsByService || [];
        const serviceLabels = serviceData.map(item => item._id || 'Other');
        const serviceCounts = serviceData.map(item => item.count);

        if (serviceChartInstance) serviceChartInstance.destroy();
        const ctxService = document.getElementById('serviceChart').getContext('2d');
        serviceChartInstance = new Chart(ctxService, {
            type: 'bar',
            data: {
                labels: serviceLabels,
                datasets: [{
                    label: 'Leads Count',
                    data: serviceCounts,
                    backgroundColor: '#0d6efd'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });

        const userData = charts.leadsByUser || [];
        const userLabels = userData.map(item => item.userName || item.userEmail || 'Unassigned');
        const userCounts = userData.map(item => item.count);

        if (userChartInstance) userChartInstance.destroy();
        const ctxUser = document.getElementById('userChart').getContext('2d');
        userChartInstance = new Chart(ctxUser, {
            type: 'pie',
            data: {
                labels: userLabels,
                datasets: [{
                    data: userCounts,
                    backgroundColor: ['#0d6efd', '#6f42c1', '#d63384', '#fd7e14', '#20c997']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
});