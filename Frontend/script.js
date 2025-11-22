// Kiểm tra authentication và phân quyền
function checkAuth() {
    const user = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
    
    if (!user) {
        // Chưa đăng nhập, chuyển về trang login
        window.location.href = 'login.html';
        return null;
    }
    
    const userData = JSON.parse(user);
    
    // Kiểm tra quyền truy cập trang index.html (chỉ dành cho admin)
    if (userData.role !== 'admin') {
        alert('Trang này chỉ dành cho quản trị viên!');
        // Chuyển về trang tương ứng với role
        switch(userData.role) {
            case 'driver':
                window.location.href = 'index-driver.html';
                break;
            case 'customer':
                window.location.href = 'index-customer.html';
                break;
            default:
                window.location.href = 'login.html';
        }
        return null;
    }
    
    return userData;
}

// Hiển thị thông tin user
function displayUserInfo() {
    const user = checkAuth();
    if (user) {
        const userNameElement = document.querySelector('.user-name');
        const userRoleElement = document.querySelector('.user-role');
        const userAvatarElement = document.querySelector('.user-avatar');
        
        if (userNameElement) {
            userNameElement.textContent = user.fullName || user.username;
        }
        
        if (userRoleElement) {
            userRoleElement.textContent = user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên';
        }
        
        if (userAvatarElement) {
            const name = user.fullName || user.username || 'AD';
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            userAvatarElement.textContent = initials;
        }
    }
}

// Xử lý đăng xuất
function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        // Xóa tất cả thông tin đăng nhập
        localStorage.removeItem('currentUser');
        localStorage.removeItem('loggedInUser');
        sessionStorage.removeItem('loggedInUser');
        localStorage.removeItem('rememberMe');
        
        // Chuyển về trang đăng nhập
        window.location.replace('login.html');
    }
}

// ==================== LOAD DATA ====================
let allOrders = [];
let allDrivers = [];
let allUsers = [];

function loadAllData() {
    if (typeof DataSync !== 'undefined') {
        allOrders = DataSync.get('orders') || [];
        allDrivers = DataSync.get('drivers') || [];
        allUsers = DataSync.get('users') || [];
    } else {
        allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        allDrivers = JSON.parse(localStorage.getItem('drivers') || '[]');
        allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    }
    
    console.log('[Dashboard] Loaded:', allOrders.length, 'orders,', allDrivers.length, 'drivers');
}

// ==================== DASHBOARD STATISTICS ====================
function updateDashboardStats() {
    loadAllData();
    
    // Tổng đơn hàng
    const totalOrders = allOrders.length;
    document.getElementById('total-orders').textContent = totalOrders;
    
    // Đơn đang giao
    const inTransitOrders = allOrders.filter(o => 
        o.status === 'in_transit' || o.status === 'picked_up'
    ).length;
    document.getElementById('in-transit-orders').textContent = inTransitOrders;
    
    const inTransitPercent = totalOrders > 0 ? ((inTransitOrders / totalOrders) * 100).toFixed(1) : 0;
    document.getElementById('in-transit-desc').textContent = `${inTransitPercent}% tổng đơn hàng`;
    
    // Đơn giao thành công
    const deliveredOrders = allOrders.filter(o => o.status === 'delivered').length;
    document.getElementById('delivered-orders').textContent = deliveredOrders;
    
    const successRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : 0;
    document.getElementById('success-rate').textContent = `Tỉ lệ: ${successRate}%`;
    
    // COD đã thu
    const totalCOD = allOrders
        .filter(o => o.status === 'delivered' && o.codAmount)
        .reduce((sum, o) => sum + (parseFloat(o.codAmount) || 0), 0);
    
    const pendingCOD = allOrders
        .filter(o => o.status === 'delivered' && o.codAmount && o.codStatus !== 'submitted' && o.codStatus !== 'settled')
        .reduce((sum, o) => sum + (parseFloat(o.codAmount) || 0), 0);
    
    document.getElementById('total-cod').textContent = formatCurrency(totalCOD);
    document.getElementById('cod-pending').textContent = 'Chờ xác nhận: ' + formatCurrency(pendingCOD);
}

// ==================== TIME-BASED STATISTICS ====================
function updateTimeBasedStats() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Start of week (Monday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    const weekStart = startOfWeek.toISOString().split('T')[0];
    
    // Start of month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    
    // Today stats
    const todayOrders = allOrders.filter(o => o.createdDate && o.createdDate.startsWith(today));
    document.getElementById('today-new').textContent = todayOrders.length + ' đơn';
    
    const todayTransit = todayOrders.filter(o => o.status === 'in_transit' || o.status === 'picked_up').length;
    document.getElementById('today-transit').textContent = todayTransit + ' đơn';
    
    const todayDelivered = allOrders.filter(o => 
        o.status === 'delivered' && o.deliveredDate && o.deliveredDate.startsWith(today)
    ).length;
    document.getElementById('today-delivered').textContent = todayDelivered + ' đơn';
    
    const todayCOD = allOrders
        .filter(o => o.status === 'delivered' && o.deliveredDate && o.deliveredDate.startsWith(today) && o.codAmount)
        .reduce((sum, o) => sum + (parseFloat(o.codAmount) || 0), 0);
    document.getElementById('today-cod').textContent = formatCurrency(todayCOD);
    
    // Week stats
    const weekOrders = allOrders.filter(o => o.createdDate && o.createdDate >= weekStart);
    document.getElementById('week-total').textContent = weekOrders.length + ' đơn';
    
    const weekDelivered = weekOrders.filter(o => o.status === 'delivered').length;
    const weekSuccessRate = weekOrders.length > 0 ? ((weekDelivered / weekOrders.length) * 100).toFixed(0) : 0;
    document.getElementById('week-success').textContent = `${weekDelivered} đơn (${weekSuccessRate}%)`;
    
    const weekFailed = weekOrders.filter(o => o.status === 'failed').length;
    document.getElementById('week-failed').textContent = weekFailed + ' đơn';
    
    const weekCOD = allOrders
        .filter(o => o.status === 'delivered' && o.deliveredDate && o.deliveredDate >= weekStart && o.codAmount)
        .reduce((sum, o) => sum + (parseFloat(o.codAmount) || 0), 0);
    document.getElementById('week-cod').textContent = formatCurrency(weekCOD);
    
    // Month stats
    const monthOrders = allOrders.filter(o => o.createdDate && o.createdDate >= monthStart);
    document.getElementById('month-total').textContent = monthOrders.length + ' đơn';
    
    const monthDelivered = monthOrders.filter(o => o.status === 'delivered').length;
    const monthSuccessRate = monthOrders.length > 0 ? ((monthDelivered / monthOrders.length) * 100).toFixed(0) : 0;
    document.getElementById('month-success').textContent = `${monthDelivered} đơn (${monthSuccessRate}%)`;
    
    const monthFailed = monthOrders.filter(o => o.status === 'failed').length;
    document.getElementById('month-failed').textContent = monthFailed + ' đơn';
    
    const monthCOD = allOrders
        .filter(o => o.status === 'delivered' && o.deliveredDate && o.deliveredDate >= monthStart && o.codAmount)
        .reduce((sum, o) => sum + (parseFloat(o.codAmount) || 0), 0);
    document.getElementById('month-cod').textContent = formatCurrency(monthCOD);
}

// ==================== RECENT ACTIVITIES ====================
function updateRecentActivities() {
    const container = document.getElementById('recent-activities');
    if (!container) return;
    
    // Sort orders by update time
    const recentOrders = [...allOrders]
        .sort((a, b) => {
            const dateA = a.updatedDate || a.createdDate || '';
            const dateB = b.updatedDate || b.createdDate || '';
            return dateB.localeCompare(dateA);
        })
        .slice(0, 10);
    
    if (recentOrders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                <i class="fas fa-inbox" style="font-size: 3rem; opacity: 0.3;"></i>
                <p>Chưa có hoạt động nào</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentOrders.map(order => {
        const icon = getActivityIcon(order.status);
        const color = getActivityColor(order.status);
        const message = getActivityMessage(order);
        const time = getRelativeTime(order.updatedDate || order.createdDate);
        
        return `
            <div class="activity-item" style="cursor: pointer;" onclick="window.location.href='admin-orders.html'">
                <div class="activity-icon ${color}">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="activity-content">
                    <strong>${message}</strong>
                    <p>${order.driver || 'Chưa phân công'} • ${time}</p>
                </div>
            </div>
        `;
    }).join('');
}

function getActivityIcon(status) {
    const icons = {
        'pending': 'clock',
        'picked_up': 'box',
        'in_transit': 'truck',
        'delivered': 'check',
        'failed': 'times',
        'cancelled': 'ban'
    };
    return icons[status] || 'info';
}

function getActivityColor(status) {
    const colors = {
        'pending': 'secondary',
        'picked_up': 'primary',
        'in_transit': 'warning',
        'delivered': 'success',
        'failed': 'danger',
        'cancelled': 'dark'
    };
    return colors[status] || 'secondary';
}

function getActivityMessage(order) {
    const orderId = order.id || order.trackingNumber;
    const messages = {
        'pending': `Đơn hàng ${orderId} chờ xử lý`,
        'picked_up': `Đơn hàng ${orderId} đã được lấy`,
        'in_transit': `Đơn hàng ${orderId} đang giao`,
        'delivered': `Đơn hàng ${orderId} đã giao thành công`,
        'failed': `Đơn hàng ${orderId} giao thất bại`,
        'cancelled': `Đơn hàng ${orderId} đã hủy`
    };
    return messages[order.status] || `Đơn hàng ${orderId}`;
}

function getRelativeTime(dateStr) {
    if (!dateStr) return 'Không rõ';
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return formatDate(dateStr);
}

// ==================== ACTIVE DRIVERS ====================
function updateActiveDrivers() {
    const container = document.getElementById('active-drivers');
    const countBadge = document.getElementById('active-drivers-count');
    
    if (!container) return;
    
    // Get active drivers (those with status = active)
    const activeDrivers = allDrivers.filter(d => d.status === 'active');
    
    if (countBadge) {
        countBadge.textContent = activeDrivers.length;
    }
    
    if (activeDrivers.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #7f8c8d; grid-column: 1/-1;">
                <i class="fas fa-user-slash" style="font-size: 3rem; opacity: 0.3;"></i>
                <p>Chưa có tài xế hoạt động</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = activeDrivers.slice(0, 6).map(driver => {
        // Count orders for this driver
        const driverOrders = allOrders.filter(o => 
            o.driver === driver.name || 
            o.driverEmail === driver.email ||
            o.assignedDriver === driver.name
        );
        
        const activeOrders = driverOrders.filter(o => 
            o.status === 'in_transit' || o.status === 'picked_up'
        ).length;
        
        const totalOrders = driverOrders.length;
        
        const initials = driver.name ? driver.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'TX';
        const statusBadge = activeOrders > 0 ? 
            '<span class="badge badge-warning">Đang bận</span>' : 
            '<span class="badge badge-success">Sẵn sàng</span>';
        
        return `
            <div class="driver-mini-card" style="cursor: pointer;" onclick="window.location.href='admin-drivers.html'">
                <div class="driver-avatar">${initials}</div>
                <div class="driver-info">
                    <strong>${driver.name}</strong>
                    <p><i class="fas fa-truck"></i> ${driver.vehicleNumber || 'N/A'}</p>
                    <p><i class="fas fa-box"></i> ${activeOrders}/${totalOrders} đơn</p>
                    ${statusBadge}
                </div>
            </div>
        `;
    }).join('');
}

// ==================== PENDING ORDERS ====================
function updatePendingOrders() {
    const container = document.getElementById('pending-orders-list');
    const countBadge = document.getElementById('pending-orders-count');
    
    if (!container) return;
    
    // Get orders that need attention
    const pendingOrders = allOrders.filter(o => 
        o.status === 'pending' || o.status === 'failed'
    );
    
    if (countBadge) {
        countBadge.textContent = pendingOrders.length;
    }
    
    if (pendingOrders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                <i class="fas fa-check-circle" style="font-size: 3rem; opacity: 0.3; color: #27ae60;"></i>
                <p>Tất cả đơn hàng đã được xử lý</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Mã đơn</th>
                    <th>Người nhận</th>
                    <th>Địa chỉ</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                ${pendingOrders.slice(0, 5).map(order => `
                    <tr>
                        <td><strong>${order.id || order.trackingNumber}</strong></td>
                        <td>${order.receiverName || 'N/A'}</td>
                        <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${order.receiverAddress || 'N/A'}
                        </td>
                        <td>${getStatusBadge(order.status)}</td>
                        <td>${formatDateTime(order.createdDate)}</td>
                        <td>
                            <a href="admin-orders.html" class="btn btn-primary btn-sm">
                                <i class="fas fa-edit"></i> Xử lý
                            </a>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge badge-secondary"><i class="fas fa-clock"></i> Chờ xử lý</span>',
        'picked_up': '<span class="badge badge-primary"><i class="fas fa-box"></i> Đã lấy hàng</span>',
        'in_transit': '<span class="badge badge-warning"><i class="fas fa-truck"></i> Đang giao</span>',
        'delivered': '<span class="badge badge-success"><i class="fas fa-check"></i> Đã giao</span>',
        'failed': '<span class="badge badge-danger"><i class="fas fa-times"></i> Thất bại</span>',
        'cancelled': '<span class="badge badge-dark"><i class="fas fa-ban"></i> Đã hủy</span>'
    };
    return badges[status] || '<span class="badge badge-secondary">N/A</span>';
}

// ==================== UTILITY FUNCTIONS ====================
function formatCurrency(amount) {
    if (!amount || amount === 0) return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
}

function refreshDashboard() {
    updateDashboardStats();
    updateTimeBasedStats();
    updateRecentActivities();
    updateActiveDrivers();
    updatePendingOrders();
    
    showNotification('Đã làm mới dữ liệu dashboard', 'success');
}

function filterOrdersByPeriod(period) {
    localStorage.setItem('orderFilterPeriod', period);
    window.location.href = 'admin-orders.html';
}

function showNotification(message, type = 'info') {
    const colors = { success: '#27ae60', error: '#e74c3c', warning: '#f39c12', info: '#3498db' };
    const icons = { success: 'check-circle', error: 'times-circle', warning: 'exclamation-triangle', info: 'info-circle' };
    
    const notification = document.createElement('div');
    notification.style.cssText = `position:fixed;top:20px;right:20px;background:${colors[type]};color:white;padding:15px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:10000;font-weight:500;display:flex;align-items:center;gap:10px;`;
    notification.innerHTML = `<i class="fas fa-${icons[type]}"></i><span>${message}</span>`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra authentication
    checkAuth();
    displayUserInfo();
    
    // Load và hiển thị dữ liệu dashboard
    loadAllData();
    updateDashboardStats();
    updateTimeBasedStats();
    updateRecentActivities();
    updateActiveDrivers();
    updatePendingOrders();
    
    console.log('[Dashboard] Initialized successfully');
});

// Auto-refresh every 30 seconds
setInterval(() => {
    console.log('[Dashboard] Auto-refreshing...');
    refreshDashboard();
}, 30000);

// Listen to DataSync events
if (typeof DataSync !== 'undefined') {
    window.addEventListener('dataSync', function(event) {
        console.log('[Dashboard] DataSync event:', event.detail.key);
        if (event.detail.key === 'orders' || event.detail.key === 'drivers') {
            refreshDashboard();
        }
    });
}

console.log('[Dashboard] Script loaded successfully');