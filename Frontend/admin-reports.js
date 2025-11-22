// Load data from localStorage
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let drivers = JSON.parse(localStorage.getItem('drivers')) || [];
let routes = JSON.parse(localStorage.getItem('routes')) || [];
let settlements = JSON.parse(localStorage.getItem('settlements')) || [];

// Filter state
let filterStartDate = null;
let filterEndDate = null;
let filterDriverId = '';
let filterRouteId = '';

// Current active tab
let currentTab = 'overview';

// Chart instances
let charts = {
    ordersTime: null,
    orderStatus: null,
    paymentMethod: null,
    revenueTime: null,
    codStatus: null,
    routes: null
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Reports page initialized');
    
    // Reload data from localStorage to get latest
    orders = JSON.parse(localStorage.getItem('orders')) || [];
    drivers = JSON.parse(localStorage.getItem('drivers')) || [];
    routes = JSON.parse(localStorage.getItem('routes')) || [];
    settlements = JSON.parse(localStorage.getItem('settlements')) || [];
    
    console.log('Data loaded - Orders:', orders.length, 'Drivers:', drivers.length, 'Routes:', routes.length, 'Settlements:', settlements.length);
    
    // Set default date range (last 30 days)
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(today.getDate() - 30);
    
    document.getElementById('startDate').valueAsDate = monthAgo;
    document.getElementById('endDate').valueAsDate = today;
    
    // Populate filter dropdowns
    populateDriverFilter();
    populateRouteFilter();
    
    // Load initial report
    applyFilter();
});

// Populate driver filter
function populateDriverFilter() {
    const select = document.getElementById('driverFilter');
    select.innerHTML = '<option value="">Tất cả tài xế</option>';
    
    drivers.forEach(driver => {
        const option = document.createElement('option');
        option.value = driver.id;
        option.textContent = `${driver.name} - ${driver.phone}`;
        select.appendChild(option);
    });
}

// Populate route filter
function populateRouteFilter() {
    const select = document.getElementById('routeFilter');
    select.innerHTML = '<option value="">Tất cả tuyến</option>';
    
    routes.forEach(route => {
        const option = document.createElement('option');
        option.value = route.id;
        option.textContent = route.name;
        select.appendChild(option);
    });
}

// Apply filter
function applyFilter() {
    const startInput = document.getElementById('startDate').value;
    const endInput = document.getElementById('endDate').value;
    
    if (!startInput || !endInput) {
        showNotification('Vui lòng chọn khoảng thời gian', 'warning');
        return;
    }
    
    filterStartDate = new Date(startInput);
    filterStartDate.setHours(0, 0, 0, 0);
    
    filterEndDate = new Date(endInput);
    filterEndDate.setHours(23, 59, 59, 999);
    
    if (filterStartDate > filterEndDate) {
        showNotification('Ngày bắt đầu phải nhỏ hơn ngày kết thúc', 'error');
        return;
    }
    
    filterDriverId = document.getElementById('driverFilter').value;
    filterRouteId = document.getElementById('routeFilter').value;
    
    console.log('Filter applied:', {
        from: filterStartDate.toLocaleDateString('vi-VN'),
        to: filterEndDate.toLocaleDateString('vi-VN'),
        driver: filterDriverId || 'all',
        route: filterRouteId || 'all'
    });
    
    loadAllReports();
    showNotification('Đã tải báo cáo thành công', 'success');
}

// Reset filter
function resetFilter() {
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(today.getDate() - 30);
    
    document.getElementById('startDate').valueAsDate = monthAgo;
    document.getElementById('endDate').valueAsDate = today;
    document.getElementById('driverFilter').value = '';
    document.getElementById('routeFilter').value = '';
    
    applyFilter();
}

// Get filtered orders
function getFilteredOrders() {
    let filtered = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const dateMatch = orderDate >= filterStartDate && orderDate <= filterEndDate;
        const driverMatch = !filterDriverId || order.driverId === filterDriverId;
        const routeMatch = !filterRouteId || order.routeId === filterRouteId;
        
        return dateMatch && driverMatch && routeMatch;
    });
    
    console.log('Filtered orders:', filtered.length);
    return filtered;
}

// Load all reports
function loadAllReports() {
    const filteredOrders = getFilteredOrders();
    
    updateStatsCards(filteredOrders);
    loadOverviewTab(filteredOrders);
    loadOrdersTab(filteredOrders);
    loadDriversTab(filteredOrders);
    loadCODTab(filteredOrders);
    loadRoutesTab(filteredOrders);
}

// Update stats cards
function updateStatsCards(filteredOrders) {
    const total = filteredOrders.length;
    const delivered = filteredOrders.filter(o => o.status === 'delivered').length;
    const successRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : 0;
    
    // Revenue = shipping fee from delivered orders
    const revenue = filteredOrders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + (parseInt(o.shippingFee) || 0), 0);
    
    // COD collected = COD amount from orders with collected status
    const codCollected = filteredOrders
        .filter(o => o.paymentMethod === 'cod' && (o.codStatus === 'collected' || o.codStatus === 'settled'))
        .reduce((sum, o) => sum + (parseInt(o.codAmount) || 0), 0);
    
    const codOrders = filteredOrders.filter(o => o.paymentMethod === 'cod' && (o.codStatus === 'collected' || o.codStatus === 'settled')).length;
    
    document.getElementById('totalOrdersStat').textContent = total;
    document.getElementById('deliveredOrdersStat').textContent = delivered;
    document.getElementById('successRateStat').textContent = `${successRate}% thành công`;
    document.getElementById('totalRevenueStat').textContent = formatCurrency(revenue);
    document.getElementById('totalCODStat').textContent = formatCurrency(codCollected);
    document.getElementById('codCollectedStat').textContent = `${codOrders} đơn`;
    
    // Calculate change percentage (compared to previous period)
    const daysDiff = Math.ceil((filterEndDate - filterStartDate) / (1000 * 60 * 60 * 24));
    const prevStart = new Date(filterStartDate);
    prevStart.setDate(prevStart.getDate() - daysDiff);
    const prevEnd = new Date(filterEndDate);
    prevEnd.setDate(prevEnd.getDate() - daysDiff);
    
    const prevOrders = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= prevStart && d <= prevEnd;
    });
    
    const change = prevOrders.length > 0 ? 
        (((total - prevOrders.length) / prevOrders.length) * 100).toFixed(1) : 0;
    
    document.getElementById('totalOrdersChange').textContent = 
        change >= 0 ? `+${change}%` : `${change}%`;
    document.getElementById('totalOrdersChange').style.color = 
        change >= 0 ? '#27ae60' : '#e74c3c';
}

// Switch tabs
function switchTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate clicked button
    const clickedBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => 
        btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabName)
    );
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

// Load Overview Tab
function loadOverviewTab(filteredOrders) {
    loadOrdersTimeChart(filteredOrders);
    loadOrderStatusChart(filteredOrders);
    loadPaymentMethodChart(filteredOrders);
    loadRevenueTimeChart(filteredOrders);
}

// Orders Time Chart
function loadOrdersTimeChart(filteredOrders) {
    const ctx = document.getElementById('ordersTimeChart');
    if (!ctx) return;
    
    if (charts.ordersTime) charts.ordersTime.destroy();
    
    // Group by date
    const dateMap = {};
    filteredOrders.forEach(order => {
        const date = new Date(order.createdAt).toLocaleDateString('vi-VN');
        dateMap[date] = (dateMap[date] || 0) + 1;
    });
    
    const dates = Object.keys(dateMap).sort((a, b) => {
        const [da, ma, ya] = a.split('/');
        const [db, mb, yb] = b.split('/');
        return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
    });
    
    const counts = dates.map(d => dateMap[d]);
    
    charts.ordersTime = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Số đơn hàng',
                data: counts,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}

// Order Status Chart
function loadOrderStatusChart(filteredOrders) {
    const ctx = document.getElementById('orderStatusChart');
    if (!ctx) return;
    
    if (charts.orderStatus) charts.orderStatus.destroy();
    
    const statusMap = {
        'pending': { label: 'Chờ xử lý', color: '#f39c12' },
        'assigned': { label: 'Đã phân công', color: '#3498db' },
        'picking': { label: 'Đang lấy hàng', color: '#e67e22' },
        'delivering': { label: 'Đang giao', color: '#9b59b6' },
        'delivered': { label: 'Đã giao', color: '#27ae60' },
        'cancelled': { label: 'Đã hủy', color: '#95a5a6' },
        'failed': { label: 'Thất bại', color: '#e74c3c' }
    };
    
    const counts = {};
    filteredOrders.forEach(order => {
        counts[order.status] = (counts[order.status] || 0) + 1;
    });
    
    const labels = Object.keys(counts).map(k => statusMap[k]?.label || k);
    const data = Object.values(counts);
    const colors = Object.keys(counts).map(k => statusMap[k]?.color || '#95a5a6');
    
    charts.orderStatus = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: { 
                    position: 'right',
                    labels: {
                        padding: 10,
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

// Payment Method Chart
function loadPaymentMethodChart(filteredOrders) {
    const ctx = document.getElementById('paymentMethodChart');
    if (!ctx) return;
    
    if (charts.paymentMethod) charts.paymentMethod.destroy();
    
    const methodMap = {
        'cod': { label: 'COD', color: '#f39c12' },
        'bank_transfer': { label: 'Chuyển khoản', color: '#3498db' },
        'card': { label: 'Thẻ', color: '#27ae60' }
    };
    
    const counts = {};
    filteredOrders.forEach(order => {
        const method = order.paymentMethod || 'cod';
        counts[method] = (counts[method] || 0) + 1;
    });
    
    const labels = Object.keys(counts).map(k => methodMap[k]?.label || k);
    const data = Object.values(counts);
    const colors = Object.keys(counts).map(k => methodMap[k]?.color || '#95a5a6');
    
    charts.paymentMethod = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: { 
                    position: 'right',
                    labels: {
                        padding: 10,
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

// Revenue Time Chart
function loadRevenueTimeChart(filteredOrders) {
    const ctx = document.getElementById('revenueTimeChart');
    if (!ctx) return;
    
    if (charts.revenueTime) charts.revenueTime.destroy();
    
    const dateMap = {};
    filteredOrders.filter(o => o.status === 'delivered').forEach(order => {
        // Use createdAt or find delivered timestamp in timeline
        let deliveredDate = order.createdAt;
        if (order.timeline) {
            const deliveredEvent = order.timeline.find(t => t.status === 'delivered');
            if (deliveredEvent) {
                deliveredDate = deliveredEvent.time;
            }
        }
        const date = new Date(deliveredDate).toLocaleDateString('vi-VN');
        // Revenue is shipping fee
        dateMap[date] = (dateMap[date] || 0) + (parseInt(order.shippingFee) || 0);
    });
    
    const dates = Object.keys(dateMap).sort((a, b) => {
        const [da, ma, ya] = a.split('/');
        const [db, mb, yb] = b.split('/');
        return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
    });
    
    const revenues = dates.map(d => dateMap[d]);
    
    charts.revenueTime = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Doanh thu (₫)',
                data: revenues,
                backgroundColor: 'rgba(46, 204, 113, 0.7)',
                borderColor: '#27ae60',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Load Orders Tab
function loadOrdersTab(filteredOrders) {
    const tbody = document.getElementById('ordersReportTable');
    
    if (filteredOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #95a5a6;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 10px; display: block;"></i>
                    Không có đơn hàng nào trong khoảng thời gian đã chọn
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredOrders.map(order => {
        const driver = drivers.find(d => d.id === order.driverId);
        const route = routes.find(r => r.id === order.routeId);
        const statusInfo = getStatusInfo(order.status);
        const paymentInfo = getPaymentMethodInfo(order.paymentMethod);
        
        return `
            <tr>
                <td style="font-weight: 600; color: var(--primary);">${order.id}</td>
                <td>
                    <div style="font-weight: 500;">${order.customerName}</div>
                    <div style="font-size: 0.85rem; color: #7f8c8d;">${order.customerPhone}</div>
                </td>
                <td>${driver ? driver.name : '<span style="color: #95a5a6;">Chưa phân</span>'}</td>
                <td>${route ? route.name : '<span style="color: #95a5a6;">Chưa phân</span>'}</td>
                <td style="font-size: 0.9rem; color: #7f8c8d;">${formatDateTime(order.createdAt)}</td>
                <td><span class="badge ${statusInfo.class}">${statusInfo.text}</span></td>
                <td><span class="badge ${paymentInfo.class}">${paymentInfo.text}</span></td>
                <td style="font-weight: bold; color: #27ae60;">${formatCurrency((parseInt(order.shippingFee) || 0) + (order.paymentMethod === 'cod' ? (parseInt(order.codAmount) || 0) : 0))}</td>
            </tr>
        `;
    }).join('');
}

// Load Drivers Tab
function loadDriversTab(filteredOrders) {
    const tbody = document.getElementById('driversReportTable');
    
    const driverStats = drivers.map(driver => {
        const driverOrders = filteredOrders.filter(o => o.driverId === driver.id);
        const delivered = driverOrders.filter(o => o.status === 'delivered');
        const failed = driverOrders.filter(o => o.status === 'failed' || o.status === 'cancelled');
        // Revenue is shipping fee from delivered orders
        const revenue = delivered.reduce((sum, o) => sum + (parseInt(o.shippingFee) || 0), 0);
        // COD collected from orders with collected/settled status
        const codCollected = driverOrders
            .filter(o => o.paymentMethod === 'cod' && (o.codStatus === 'collected' || o.codStatus === 'settled'))
            .reduce((sum, o) => sum + (parseInt(o.codAmount) || 0), 0);
        
        const successRate = driverOrders.length > 0 ? 
            ((delivered.length / driverOrders.length) * 100).toFixed(1) : 0;
        
        return {
            driver: driver,
            total: driverOrders.length,
            delivered: delivered.length,
            failed: failed.length,
            successRate: parseFloat(successRate),
            revenue: revenue,
            codCollected: codCollected
        };
    });
    
    // Sort by delivered orders
    driverStats.sort((a, b) => b.delivered - a.delivered);
    
    if (driverStats.every(s => s.total === 0)) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 40px; color: #95a5a6;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 10px; display: block;"></i>
                    Không có dữ liệu tài xế trong khoảng thời gian đã chọn
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = driverStats.map((stat, index) => {
        if (stat.total === 0) return '';
        
        const rankIcon = index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1);
        
        return `
            <tr>
                <td style="text-align: center; font-size: 1.2rem; font-weight: bold;">${rankIcon}</td>
                <td>
                    <div style="font-weight: 600;">${stat.driver.name}</div>
                </td>
                <td>${stat.driver.phone}</td>
                <td>${stat.driver.vehicleNumber || '-'}</td>
                <td style="text-align: center; font-weight: 600; color: #3498db;">${stat.total}</td>
                <td style="text-align: center; font-weight: 600; color: #27ae60;">${stat.delivered}</td>
                <td style="text-align: center; font-weight: 600; color: #e74c3c;">${stat.failed}</td>
                <td style="text-align: center;">
                    <span class="badge ${stat.successRate >= 90 ? 'badge-success' : stat.successRate >= 70 ? 'badge-warning' : 'badge-danger'}">
                        ${stat.successRate}%
                    </span>
                </td>
                <td style="font-weight: bold; color: #27ae60;">${formatCurrency(stat.revenue)}</td>
                <td style="font-weight: bold; color: #f39c12;">${formatCurrency(stat.codCollected)}</td>
            </tr>
        `;
    }).join('');
}

// Load COD Tab
function loadCODTab(filteredOrders) {
    loadCODStatusChart(filteredOrders);
    loadCODTable(filteredOrders);
}

// COD Status Chart
function loadCODStatusChart(filteredOrders) {
    const ctx = document.getElementById('codStatusChart');
    if (!ctx) return;
    
    if (charts.codStatus) charts.codStatus.destroy();
    
    const codOrders = filteredOrders.filter(o => o.paymentMethod === 'cod');
    
    const counts = {
        pending: 0,
        pending_collection: 0,
        collected: 0,
        settled: 0
    };
    
    codOrders.forEach(order => {
        const status = order.codStatus || 'pending';
        if (counts.hasOwnProperty(status)) {
            counts[status]++;
        } else {
            counts.pending++;
        }
    });
    
    const labels = ['Chờ giao', 'Cần thu', 'Đã thu', 'Đã quyết toán'];
    const data = [counts.pending, counts.pending_collection, counts.collected, counts.settled];
    const colors = ['#f39c12', '#e67e22', '#27ae60', '#3498db'];
    
    charts.codStatus = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

// Load COD Table
function loadCODTable(filteredOrders) {
    const tbody = document.getElementById('codReportTable');
    
    const codOrders = filteredOrders.filter(o => o.paymentMethod === 'cod');
    
    if (codOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #95a5a6;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 10px; display: block;"></i>
                    Không có giao dịch COD nào trong khoảng thời gian đã chọn
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = codOrders.map(order => {
        const driver = drivers.find(d => d.id === order.driverId);
        const codStatus = getCODStatus(order);
        
        // Find dates from timeline
        let deliveredDate = '-';
        let collectedDate = '-';
        let settlementDate = '-';
        
        if (order.timeline) {
            const deliveredEvent = order.timeline.find(t => t.status === 'delivered');
            if (deliveredEvent) deliveredDate = formatDateTime(deliveredEvent.time);
            
            const collectedEvent = order.timeline.find(t => t.status === 'cod_collected' || t.description?.includes('Thu COD'));
            if (collectedEvent) collectedDate = formatDateTime(collectedEvent.time);
            
            const settlementEvent = order.timeline.find(t => t.status === 'cod_settled' || t.description?.includes('quyết toán'));
            if (settlementEvent) settlementDate = formatDateTime(settlementEvent.time);
        }
        
        return `
            <tr>
                <td style="font-weight: 600; color: var(--primary);">${order.id}</td>
                <td>${order.customerName}</td>
                <td>${driver ? driver.name : '<span style="color: #95a5a6;">Chưa phân</span>'}</td>
                <td style="font-weight: bold; color: #f39c12;">${formatCurrency(order.codAmount || 0)}</td>
                <td style="font-size: 0.9rem;">${deliveredDate}</td>
                <td style="font-size: 0.9rem;">${collectedDate}</td>
                <td style="font-size: 0.9rem;">${settlementDate}</td>
                <td><span class="badge ${codStatus.class}">${codStatus.text}</span></td>
            </tr>
        `;
    }).join('');
}

// Load Routes Tab
function loadRoutesTab(filteredOrders) {
    loadRoutesChart(filteredOrders);
    loadRoutesTable(filteredOrders);
}

// Routes Chart
function loadRoutesChart(filteredOrders) {
    const ctx = document.getElementById('routesChart');
    if (!ctx) return;
    
    if (charts.routes) charts.routes.destroy();
    
    const routeStats = {};
    
    routes.forEach(route => {
        const routeOrders = filteredOrders.filter(o => o.routeId === route.id);
        const delivered = routeOrders.filter(o => o.status === 'delivered').length;
        routeStats[route.name] = {
            total: routeOrders.length,
            delivered: delivered
        };
    });
    
    const routeNames = Object.keys(routeStats);
    const totalData = routeNames.map(name => routeStats[name].total);
    const deliveredData = routeNames.map(name => routeStats[name].delivered);
    
    charts.routes = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: routeNames,
            datasets: [
                {
                    label: 'Tổng đơn',
                    data: totalData,
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: '#3498db',
                    borderWidth: 1
                },
                {
                    label: 'Hoàn thành',
                    data: deliveredData,
                    backgroundColor: 'rgba(39, 174, 96, 0.7)',
                    borderColor: '#27ae60',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: { 
                    position: 'top',
                    labels: {
                        padding: 10,
                        font: { size: 11 }
                    }
                }
            },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}

// Load Routes Table
function loadRoutesTable(filteredOrders) {
    const tbody = document.getElementById('routesReportTable');
    
    const routeStats = routes.map(route => {
        const routeOrders = filteredOrders.filter(o => o.routeId === route.id);
        const delivered = routeOrders.filter(o => o.status === 'delivered');
        const delivering = routeOrders.filter(o => o.status === 'delivering' || o.status === 'picking');
        const failed = routeOrders.filter(o => o.status === 'failed' || o.status === 'cancelled');
        // Revenue is shipping fee from delivered orders
        const revenue = delivered.reduce((sum, o) => sum + (parseInt(o.shippingFee) || 0), 0);
        
        const successRate = routeOrders.length > 0 ? 
            ((delivered.length / routeOrders.length) * 100).toFixed(1) : 0;
        
        return {
            route: route,
            total: routeOrders.length,
            delivered: delivered.length,
            delivering: delivering.length,
            failed: failed.length,
            successRate: parseFloat(successRate),
            revenue: revenue
        };
    });
    
    // Sort by total orders
    routeStats.sort((a, b) => b.total - a.total);
    
    if (routeStats.every(s => s.total === 0)) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #95a5a6;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 10px; display: block;"></i>
                    Không có dữ liệu tuyến đường trong khoảng thời gian đã chọn
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = routeStats.map(stat => {
        if (stat.total === 0) return '';
        
        return `
            <tr>
                <td style="font-weight: 600; color: var(--primary);">${stat.route.name}</td>
                <td style="font-size: 0.9rem; color: #7f8c8d;">${stat.route.description || '-'}</td>
                <td style="text-align: center; font-weight: 600; color: #3498db;">${stat.total}</td>
                <td style="text-align: center; font-weight: 600; color: #27ae60;">${stat.delivered}</td>
                <td style="text-align: center; font-weight: 600; color: #f39c12;">${stat.delivering}</td>
                <td style="text-align: center; font-weight: 600; color: #e74c3c;">${stat.failed}</td>
                <td style="text-align: center;">
                    <span class="badge ${stat.successRate >= 90 ? 'badge-success' : stat.successRate >= 70 ? 'badge-warning' : 'badge-danger'}">
                        ${stat.successRate}%
                    </span>
                </td>
                <td style="font-weight: bold; color: #27ae60;">${formatCurrency(stat.revenue)}</td>
            </tr>
        `;
    }).join('');
}

// Export Excel
function exportExcel() {
    showNotification('Đang xuất báo cáo Excel...', 'info');
    
    // Prepare data
    const filteredOrders = getFilteredOrders();
    
    let csv = 'Mã đơn,Khách hàng,SĐT,Tài xế,Tuyến đường,Ngày tạo,Trạng thái,Thanh toán,Tổng tiền\n';
    
    filteredOrders.forEach(order => {
        const driver = drivers.find(d => d.id === order.driverId);
        const route = routes.find(r => r.id === order.routeId);
        const statusInfo = getStatusInfo(order.status);
        const paymentInfo = getPaymentMethodInfo(order.paymentMethod);
        const totalAmount = (parseInt(order.shippingFee) || 0) + (order.paymentMethod === 'cod' ? (parseInt(order.codAmount) || 0) : 0);
        
        csv += `${order.id},${order.customerName},${order.customerPhone},`;
        csv += `${driver ? driver.name : 'Chưa phân'},`;
        csv += `${route ? route.name : 'Chưa phân'},`;
        csv += `${formatDateTime(order.createdAt)},`;
        csv += `${statusInfo.text},${paymentInfo.text},${totalAmount}\n`;
    });
    
    // Download
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bao-cao-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showNotification('Đã xuất báo cáo thành công', 'success');
}

// Print Report
function printReport() {
    window.print();
}

// Helper functions
function getStatusInfo(status) {
    const statusMap = {
        'pending': { text: 'Chờ xử lý', class: 'badge-warning' },
        'assigned': { text: 'Đã phân công', class: 'badge-info' },
        'picking': { text: 'Đang lấy hàng', class: 'badge-primary' },
        'delivering': { text: 'Đang giao', class: 'badge-primary' },
        'delivered': { text: 'Đã giao', class: 'badge-success' },
        'cancelled': { text: 'Đã hủy', class: 'badge-secondary' },
        'failed': { text: 'Thất bại', class: 'badge-danger' }
    };
    return statusMap[status] || { text: status, class: 'badge-secondary' };
}

function getPaymentMethodInfo(method) {
    const methodMap = {
        'cod': { text: 'COD', class: 'badge-warning' },
        'bank_transfer': { text: 'Chuyển khoản', class: 'badge-info' },
        'card': { text: 'Thẻ', class: 'badge-success' }
    };
    return methodMap[method] || { text: method, class: 'badge-secondary' };
}

function getCODStatus(order) {
    const codStatus = order.codStatus || 'pending';
    const statusMap = {
        'pending': { text: 'Chờ giao', class: 'badge-secondary' },
        'pending_collection': { text: 'Cần thu', class: 'badge-warning' },
        'collected': { text: 'Đã thu', class: 'badge-success' },
        'settled': { text: 'Đã quyết toán', class: 'badge-info' },
        'cancelled': { text: 'Đã hủy', class: 'badge-danger' }
    };
    return statusMap[codStatus] || { text: codStatus, class: 'badge-secondary' };
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showNotification(message, type = 'info') {
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-left: 4px solid ${colors[type]};
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <span style="font-size: 1.2rem; color: ${colors[type]};">${icons[type]}</span>
        <span style="flex: 1;">${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #95a5a6;">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @media print {
        .sidebar, .header-right, .btn, .tabs { display: none !important; }
        .main-content { margin-left: 0 !important; }
        .card { page-break-inside: avoid; }
    }
`;
document.head.appendChild(style);

// Logout function
function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        // Xóa tất cả thông tin đăng nhập
        localStorage.removeItem('currentUser');
        localStorage.removeItem('loggedInUser');
        sessionStorage.removeItem('loggedInUser');
        localStorage.removeItem('rememberMe');
        
        // Chuyển về trang đăng nhập
        window.location.replace('login.html');
    }
}
