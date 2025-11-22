// ==================== GLOBAL VARIABLES ====================
let currentDriver = null;
let allOrders = [];
let codOrders = [];
let filteredCODOrders = [];
let currentPage = 1;
const itemsPerPage = 10;
let codSubmissions = []; // Track COD submissions

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    loadCurrentDriver();
    loadAllData();
});

// ==================== AUTHENTICATION ====================
function loadCurrentDriver() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        alert('Vui lòng đăng nhập!');
        window.location.href = 'login.html';
        return;
    }
    
    currentDriver = JSON.parse(userStr);
    
    // Check role - support Vietnamese and English
    const userRole = String(currentDriver.role || currentDriver.vaiTro || currentDriver.VaiTro || '').toLowerCase().trim();
    const isDriver = (userRole === 'driver' || userRole === 'taixe' || userRole === 'tai xe' || userRole === 'tài xế');
    const isAdmin = (userRole === 'admin' || userRole === 'quantri' || userRole === 'quản trị' || userRole === 'quan tri');
    
    if (!isDriver && !isAdmin) {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = 'login.html';
        return;
    }
    
    const initials = currentDriver.username ? currentDriver.username.substring(0, 2).toUpperCase() : 'TX';
    document.getElementById('driver-avatar').textContent = initials;
    document.getElementById('driver-name').textContent = currentDriver.fullname || currentDriver.username || 'Tài xế';
    
    console.log('[Driver COD] Logged in as:', currentDriver);
}

// ==================== DATA LOADING ====================
function loadAllData() {
    if (typeof DataSync !== 'undefined') {
        allOrders = DataSync.get('orders') || [];
        codSubmissions = DataSync.get('codSubmissions') || [];
    } else {
        allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        codSubmissions = JSON.parse(localStorage.getItem('codSubmissions') || '[]');
    }
    
    console.log('[Driver COD] Data loaded:', allOrders.length, 'orders');
    
    // Filter orders with COD for current driver
    codOrders = allOrders.filter(order => {
        const isMyOrder = order.driver === currentDriver.username || 
                         order.driver === currentDriver.fullname ||
                         order.driverEmail === currentDriver.email ||
                         order.assignedDriver === currentDriver.username;
        
        const hasCOD = order.codAmount && parseFloat(order.codAmount) > 0;
        const isDelivered = order.status === 'delivered';
        
        return isMyOrder && hasCOD && isDelivered;
    });
    
    console.log('[Driver COD] COD orders:', codOrders.length);
    
    renderStats();
    applyFilters();
}

// ==================== STATISTICS ====================
function renderStats() {
    // Calculate totals
    let totalCOD = 0;
    let pendingCOD = 0;
    let submittedCOD = 0;
    let totalTransactions = 0;
    
    codOrders.forEach(order => {
        const amount = parseFloat(order.codAmount) || 0;
        totalCOD += amount;
        totalTransactions++;
        
        if (order.codStatus === 'submitted' || order.codSubmitted) {
            submittedCOD += amount;
        } else {
            pendingCOD += amount;
        }
    });
    
    document.getElementById('total-cod').textContent = formatCurrency(totalCOD);
    document.getElementById('pending-cod').textContent = formatCurrency(pendingCOD);
    document.getElementById('submitted-cod').textContent = formatCurrency(submittedCOD);
    document.getElementById('total-transactions').textContent = totalTransactions;
    
    // Update submit button state
    const submitBtn = document.getElementById('submit-cod-btn');
    if (pendingCOD > 0) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fas fa-paper-plane"></i> Nộp COD (${formatCurrency(pendingCOD)})`;
    } else {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Không có COD để nộp';
    }
}

// ==================== FILTERS ====================
function applyFilters() {
    const status = document.getElementById('filter-status').value;
    const fromDate = document.getElementById('filter-from-date').value;
    const toDate = document.getElementById('filter-to-date').value;
    
    filteredCODOrders = codOrders.filter(order => {
        // Status filter
        if (status === 'collected' && (order.codStatus === 'submitted' || order.codSubmitted)) return false;
        if (status === 'submitted' && !(order.codStatus === 'submitted' || order.codSubmitted)) return false;
        
        // Date filter
        if (fromDate) {
            const orderDate = new Date(order.deliveredDate || order.createdDate).toISOString().split('T')[0];
            if (orderDate < fromDate) return false;
        }
        if (toDate) {
            const orderDate = new Date(order.deliveredDate || order.createdDate).toISOString().split('T')[0];
            if (orderDate > toDate) return false;
        }
        
        return true;
    });
    
    // Sort by date (newest first)
    filteredCODOrders.sort((a, b) => {
        const dateA = new Date(a.deliveredDate || a.createdDate);
        const dateB = new Date(b.deliveredDate || b.createdDate);
        return dateB - dateA;
    });
    
    currentPage = 1;
    renderCODList();
}

// ==================== COD LIST RENDERING ====================
function renderCODList() {
    const container = document.getElementById('cod-list');
    
    if (filteredCODOrders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                <i class="fas fa-money-bill-wave" style="font-size: 3rem; opacity: 0.3; margin-bottom: 15px;"></i>
                <p>Không có giao dịch COD nào</p>
            </div>
        `;
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    // Pagination
    const totalPages = Math.ceil(filteredCODOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filteredCODOrders.slice(startIndex, endIndex);
    
    container.innerHTML = pageItems.map(order => {
        const isSubmitted = order.codStatus === 'submitted' || order.codSubmitted;
        const itemClass = isSubmitted ? 'submitted' : 'collected';
        const statusBadge = isSubmitted ? 
            '<span class="badge badge-info"><i class="fas fa-check"></i> Đã nộp</span>' :
            '<span class="badge badge-warning"><i class="fas fa-clock"></i> Chưa nộp</span>';
        
        const deliveredDate = order.deliveredDate ? new Date(order.deliveredDate) : new Date(order.createdDate);
        const dateStr = deliveredDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = deliveredDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="cod-item ${itemClass}">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                        <div>
                            <strong style="font-size: 1.1rem;">#${order.id || order.trackingNumber}</strong>
                            ${statusBadge}
                        </div>
                    </div>
                    <div style="color: #7f8c8d; margin-bottom: 5px;">
                        <i class="fas fa-user"></i> ${order.receiverName || 'N/A'}
                    </div>
                    <div style="color: #7f8c8d; margin-bottom: 5px;">
                        <i class="fas fa-map-marker-alt"></i> ${order.receiverAddress || 'N/A'}
                    </div>
                    <div style="color: #7f8c8d;">
                        <i class="fas fa-calendar"></i> ${dateStr} ${timeStr}
                    </div>
                    ${isSubmitted && order.codSubmittedDate ? `
                        <div style="color: #3498db; margin-top: 5px; font-size: 0.9rem;">
                            <i class="fas fa-check-circle"></i> Đã nộp: ${new Date(order.codSubmittedDate).toLocaleDateString('vi-VN')}
                        </div>
                    ` : ''}
                </div>
                <div style="text-align: right;">
                    <div class="cod-amount">${formatCurrency(order.codAmount)}</div>
                    ${!isSubmitted ? `
                        <button class="btn btn-sm btn-success" style="margin-top: 10px;" onclick="markAsPaid('${order.id || order.trackingNumber}')">
                            <i class="fas fa-check"></i> Đánh dấu đã nộp
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    renderPagination(totalPages);
}

// ==================== PAGINATION ====================
function renderPagination(totalPages) {
    const container = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<div class="pagination-controls">';
    
    // Previous button
    html += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += '<span class="pagination-ellipsis">...</span>';
        }
    }
    
    // Next button
    html += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    html += '</div>';
    html += `<div class="pagination-info">Trang ${currentPage} / ${totalPages} (${filteredCODOrders.length} giao dịch)</div>`;
    
    container.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    renderCODList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== SUBMIT COD ====================
function showSubmitForm() {
    // Calculate pending COD
    let pendingAmount = 0;
    codOrders.forEach(order => {
        if (!(order.codStatus === 'submitted' || order.codSubmitted)) {
            pendingAmount += parseFloat(order.codAmount) || 0;
        }
    });
    
    if (pendingAmount === 0) {
        showNotification('Không có COD nào để nộp!', 'warning');
        return;
    }
    
    document.getElementById('submit-amount').value = formatCurrency(pendingAmount);
    document.getElementById('submit-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('submit-note').value = '';
    document.getElementById('submit-form-section').style.display = 'block';
    
    // Scroll to form
    document.getElementById('submit-form-section').scrollIntoView({ behavior: 'smooth' });
}

function cancelSubmitCOD() {
    document.getElementById('submit-form-section').style.display = 'none';
}

function confirmSubmitCOD() {
    const date = document.getElementById('submit-date').value;
    const note = document.getElementById('submit-note').value;
    
    if (!date) {
        showNotification('Vui lòng chọn ngày nộp!', 'error');
        return;
    }
    
    if (!confirm('Xác nhận nộp toàn bộ COD chưa nộp cho công ty?')) return;
    
    // Calculate pending COD
    let pendingAmount = 0;
    let submittedOrders = [];
    
    codOrders.forEach(order => {
        if (!(order.codStatus === 'submitted' || order.codSubmitted)) {
            pendingAmount += parseFloat(order.codAmount) || 0;
            submittedOrders.push(order.id || order.trackingNumber);
        }
    });
    
    // Create submission record
    const submission = {
        id: 'SUB' + Date.now(),
        driver: currentDriver.username,
        driverName: currentDriver.fullname || currentDriver.username,
        amount: pendingAmount,
        orderCount: submittedOrders.length,
        orders: submittedOrders,
        submittedDate: date,
        note: note,
        createdDate: new Date().toISOString(),
        status: 'submitted'
    };
    
    codSubmissions.push(submission);
    
    // Update orders
    allOrders.forEach(order => {
        if (submittedOrders.includes(order.id || order.trackingNumber)) {
            order.codStatus = 'submitted';
            order.codSubmitted = true;
            order.codSubmittedDate = date;
            order.codSubmissionNote = note;
        }
    });
    
    // Save data
    if (typeof DataSync !== 'undefined') {
        DataSync.set('orders', allOrders);
        DataSync.set('codSubmissions', codSubmissions);
    } else {
        localStorage.setItem('orders', JSON.stringify(allOrders));
        localStorage.setItem('codSubmissions', JSON.stringify(codSubmissions));
    }
    
    showNotification(`Đã nộp ${formatCurrency(pendingAmount)} thành công!`, 'success');
    
    cancelSubmitCOD();
    loadAllData();
}

// ==================== MARK SINGLE ORDER AS PAID ====================
function markAsPaid(orderId) {
    if (!confirm('Đánh dấu đơn hàng này đã nộp COD?')) return;
    
    const order = allOrders.find(o => (o.id || o.trackingNumber) === orderId);
    if (!order) {
        showNotification('Không tìm thấy đơn hàng!', 'error');
        return;
    }
    
    order.codStatus = 'submitted';
    order.codSubmitted = true;
    order.codSubmittedDate = new Date().toISOString();
    
    // Save
    if (typeof DataSync !== 'undefined') {
        DataSync.set('orders', allOrders);
    } else {
        localStorage.setItem('orders', JSON.stringify(allOrders));
    }
    
    showNotification('Đã đánh dấu đơn hàng đã nộp COD', 'success');
    loadAllData();
}

// ==================== EXPORT REPORT ====================
function exportCODReport() {
    if (filteredCODOrders.length === 0) {
        showNotification('Không có dữ liệu để xuất!', 'warning');
        return;
    }
    
    // Create CSV content
    let csv = 'Mã đơn hàng,Người nhận,Địa chỉ,Số tiền COD,Trạng thái,Ngày giao,Ngày nộp\n';
    
    filteredCODOrders.forEach(order => {
        const isSubmitted = order.codStatus === 'submitted' || order.codSubmitted;
        const status = isSubmitted ? 'Đã nộp' : 'Chưa nộp';
        const deliveredDate = order.deliveredDate ? new Date(order.deliveredDate).toLocaleDateString('vi-VN') : '';
        const submittedDate = isSubmitted && order.codSubmittedDate ? new Date(order.codSubmittedDate).toLocaleDateString('vi-VN') : '';
        
        csv += `"${order.id || order.trackingNumber}","${order.receiverName}","${order.receiverAddress}",${order.codAmount},"${status}","${deliveredDate}","${submittedDate}"\n`;
    });
    
    // Download CSV
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `COD_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showNotification('Đã xuất báo cáo thành công!', 'success');
}

// ==================== UTILITY FUNCTIONS ====================
function formatCurrency(amount) {
    if (!amount || amount === 0) return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

function showNotification(message, type) {
    type = type || 'info';
    const colors = { success: '#27ae60', error: '#e74c3c', warning: '#f39c12', info: '#3498db' };
    const icons = { success: 'check-circle', error: 'times-circle', warning: 'exclamation-triangle', info: 'info-circle' };
    
    const notification = document.createElement('div');
    notification.style.cssText = 'position:fixed;top:20px;right:20px;background:' + colors[type] + ';color:white;padding:15px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:10000;font-weight:500;display:flex;align-items:center;gap:10px;max-width:400px;';
    notification.innerHTML = '<i class="fas fa-' + icons[type] + '"></i><span>' + message + '</span>';
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.style.opacity = '0';
        setTimeout(function() { notification.remove(); }, 300);
    }, 3000);
}

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

// ==================== AUTO REFRESH ====================
if (typeof DataSync !== 'undefined') {
    window.addEventListener('dataSync', function(event) {
        console.log('[Driver COD] DataSync event received:', event.detail.key);
        if (event.detail.key === 'orders' || event.detail.key === 'codSubmissions') {
            loadAllData();
        }
    });
}

console.log('[Driver COD] Script loaded successfully');
