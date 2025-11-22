// ==================== GLOBAL VARIABLES ====================
let currentUser = null;
let allOrders = [];
let myPayments = [];
let filteredPayments = [];
let currentFilter = 'all';
let currentSort = 'date-desc';

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadAllData();
});

function checkAuth() {
    const user = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = JSON.parse(user);
    
    if (currentUser.role !== 'customer') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = currentUser.role === 'admin' ? 'index.html' : 'index-driver.html';
        return;
    }
    
    // Update user name in header
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) {
        userNameEl.textContent = currentUser.fullName || currentUser.name || 'Khách hàng';
    }
}

function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        sessionStorage.removeItem('loggedInUser');
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    }
}

function loadAllData() {
    // Load orders from DataSync or localStorage
    if (typeof DataSync !== 'undefined') {
        allOrders = DataSync.get('orders') || [];
    } else {
        allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    }
    
    // Filter orders belonging to current customer
    const customerOrders = allOrders.filter(order => {
        return order.customerId === currentUser.userId ||
               order.customerName === (currentUser.fullName || currentUser.name) ||
               order.senderName === (currentUser.fullName || currentUser.name) ||
               order.senderPhone === currentUser.phone ||
               order.receiverPhone === currentUser.phone ||
               order.customerPhone === currentUser.phone ||
               order.senderEmail === currentUser.email ||
               order.customerEmail === currentUser.email;
    });
    
    // Convert orders to payment records
    myPayments = [];
    customerOrders.forEach(order => {
        const orderId = order.orderId || order.id;
        const shippingFee = parseFloat(order.shippingFee) || 0;
        const codAmount = parseFloat(order.codAmount) || 0;
        
        // Payment for shipping fee
        if (shippingFee > 0) {
            myPayments.push({
                id: `PAY-${orderId}-SHIP`,
                orderId: orderId,
                type: 'shipping',
                amount: shippingFee,
                method: order.paymentMethod || 'cod',
                status: getPaymentStatus(order),
                description: `Phí vận chuyển - Đơn hàng #${orderId}`,
                createdAt: order.createdAt,
                paidAt: order.status === 'delivered' ? order.deliveredAt : null,
                orderStatus: order.status
            });
        }
        
        // Payment for COD amount (if exists and paid)
        if (codAmount > 0 && order.status === 'delivered') {
            myPayments.push({
                id: `PAY-${orderId}-COD`,
                orderId: orderId,
                type: 'cod',
                amount: codAmount,
                method: 'cod',
                status: 'paid',
                description: `Thu hộ COD - Đơn hàng #${orderId}`,
                createdAt: order.createdAt,
                paidAt: order.deliveredAt,
                orderStatus: order.status
            });
        }
    });
    
    console.log('[Payment History] Total orders:', allOrders.length);
    console.log('[Payment History] Customer orders:', customerOrders.length);
    console.log('[Payment History] Payment records:', myPayments.length);
    
    // Render statistics and payments
    renderStatistics();
    filterPayments();
}

function getPaymentStatus(order) {
    if (order.status === 'cancelled') {
        return 'cancelled';
    } else if (order.status === 'delivered') {
        return 'paid';
    } else if (order.status === 'pending' || order.status === 'assigned' || 
               order.status === 'picking' || order.status === 'delivering') {
        return 'pending';
    }
    return 'pending';
}

// ==================== RENDER STATISTICS ====================
function renderStatistics() {
    let totalAmount = 0;
    let totalCount = 0;
    let paidAmount = 0;
    let paidCount = 0;
    let pendingAmount = 0;
    let pendingCount = 0;
    let codAmount = 0;
    let codCount = 0;
    
    myPayments.forEach(payment => {
        totalAmount += payment.amount;
        totalCount++;
        
        if (payment.status === 'paid') {
            paidAmount += payment.amount;
            paidCount++;
        } else if (payment.status === 'pending') {
            pendingAmount += payment.amount;
            pendingCount++;
        }
        
        if (payment.type === 'cod') {
            codAmount += payment.amount;
            codCount++;
        }
    });
    
    // Update DOM
    document.getElementById('total-amount').textContent = formatMoney(totalAmount) + ' đ';
    document.getElementById('total-count').textContent = totalCount;
    
    document.getElementById('paid-amount').textContent = formatMoney(paidAmount) + ' đ';
    document.getElementById('paid-count').textContent = paidCount;
    
    document.getElementById('pending-amount').textContent = formatMoney(pendingAmount) + ' đ';
    document.getElementById('pending-count').textContent = pendingCount;
    
    document.getElementById('cod-amount').textContent = formatMoney(codAmount) + ' đ';
    document.getElementById('cod-count').textContent = codCount;
}

// ==================== FILTER & SEARCH ====================
function filterPayments() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    const statusFilter = document.getElementById('status-filter').value;
    
    filteredPayments = myPayments.filter(payment => {
        // Filter by status
        let statusMatch = statusFilter === 'all' || payment.status === statusFilter;
        
        // Filter by search term
        let searchMatch = true;
        if (searchTerm) {
            searchMatch = 
                payment.orderId.toLowerCase().includes(searchTerm) ||
                payment.description.toLowerCase().includes(searchTerm) ||
                payment.amount.toString().includes(searchTerm);
        }
        
        return statusMatch && searchMatch;
    });
    
    sortPayments();
}

function searchPayments() {
    filterPayments();
}

function sortPayments() {
    const sortType = document.getElementById('sort-select').value;
    
    switch(sortType) {
        case 'date-desc':
            filteredPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'date-asc':
            filteredPayments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'amount-desc':
            filteredPayments.sort((a, b) => b.amount - a.amount);
            break;
        case 'amount-asc':
            filteredPayments.sort((a, b) => a.amount - b.amount);
            break;
    }
    
    renderPayments();
}

function refreshPayments() {
    loadAllData();
    showNotification('Đã làm mới dữ liệu', 'success');
}

// ==================== RENDER PAYMENTS ====================
function renderPayments() {
    const container = document.getElementById('payments-table-container');
    
    if (filteredPayments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <h3>Chưa có giao dịch nào</h3>
                <p>Hãy tạo đơn hàng để bắt đầu sử dụng dịch vụ</p>
                <button class="btn btn-primary" onclick="window.location.href='customer-create-order.html'">
                    <i class="fas fa-plus-circle"></i> Tạo đơn hàng
                </button>
            </div>
        `;
        return;
    }
    
    let html = `
        <table class="payment-table">
            <thead>
                <tr>
                    <th>Mã giao dịch</th>
                    <th>Mã đơn hàng</th>
                    <th>Mô tả</th>
                    <th>Số tiền</th>
                    <th>Phương thức</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    filteredPayments.forEach(payment => {
        const statusInfo = getStatusBadge(payment.status);
        const methodInfo = getMethodBadge(payment.method);
        
        html += `
            <tr>
                <td><strong>${payment.id}</strong></td>
                <td>
                    <a href="#" onclick="viewOrderDetail('${payment.orderId}'); return false;" 
                       style="color: #3498db; text-decoration: none;">
                        #${payment.orderId}
                    </a>
                </td>
                <td>${payment.description}</td>
                <td><strong style="color: #e74c3c;">${formatMoney(payment.amount)} đ</strong></td>
                <td>${methodInfo}</td>
                <td>${statusInfo}</td>
                <td>${formatDateTime(payment.createdAt)}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="viewPaymentDetail('${payment.id}')" 
                            title="Chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function getStatusBadge(status) {
    const badges = {
        'paid': '<span class="payment-status paid"><i class="fas fa-check-circle"></i> Đã thanh toán</span>',
        'pending': '<span class="payment-status pending"><i class="fas fa-clock"></i> Chờ thanh toán</span>',
        'cancelled': '<span class="payment-status cancelled"><i class="fas fa-times-circle"></i> Đã hủy</span>'
    };
    return badges[status] || badges.pending;
}

function getMethodBadge(method) {
    const badges = {
        'cod': '<span class="payment-method cod"><i class="fas fa-hand-holding-usd"></i> COD</span>',
        'bank': '<span class="payment-method bank"><i class="fas fa-university"></i> Chuyển khoản</span>',
        'wallet': '<span class="payment-method wallet"><i class="fas fa-wallet"></i> Ví điện tử</span>'
    };
    return badges[method] || badges.cod;
}

// ==================== PAYMENT DETAIL ====================
function viewPaymentDetail(paymentId) {
    const payment = myPayments.find(p => p.id === paymentId);
    if (!payment) return;
    
    const statusInfo = getStatusBadge(payment.status);
    const methodInfo = getMethodBadge(payment.method);
    
    let html = `
        <div style="max-width: 500px;">
            <h2 style="margin: 0 0 20px 0; color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 15px;">
                <i class="fas fa-receipt"></i> Chi tiết giao dịch
            </h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <div style="margin-bottom: 15px;">
                    <strong style="color: #7f8c8d;">Mã giao dịch:</strong><br>
                    <span style="font-size: 1.1rem; color: #2c3e50;">${payment.id}</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <strong style="color: #7f8c8d;">Trạng thái:</strong><br>
                        ${statusInfo}
                    </div>
                    <div>
                        <strong style="color: #7f8c8d;">Phương thức:</strong><br>
                        ${methodInfo}
                    </div>
                </div>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #ecf0f1; margin-bottom: 20px;">
                <div style="margin-bottom: 15px;">
                    <strong style="color: #7f8c8d;">Mã đơn hàng:</strong>
                    <p style="margin: 5px 0; color: #2c3e50; font-size: 1.1rem;">#${payment.orderId}</p>
                </div>
                <div style="margin-bottom: 15px;">
                    <strong style="color: #7f8c8d;">Mô tả:</strong>
                    <p style="margin: 5px 0; color: #2c3e50;">${payment.description}</p>
                </div>
                <div style="margin-bottom: 15px;">
                    <strong style="color: #7f8c8d;">Loại thanh toán:</strong>
                    <p style="margin: 5px 0; color: #2c3e50;">
                        ${payment.type === 'shipping' ? '<i class="fas fa-shipping-fast"></i> Phí vận chuyển' : '<i class="fas fa-hand-holding-usd"></i> Thu hộ COD'}
                    </p>
                </div>
                <div style="border-top: 2px solid #ecf0f1; padding-top: 15px; margin-top: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 1.2rem; font-weight: 600;">Số tiền:</span>
                        <span style="font-size: 1.5rem; font-weight: 700; color: #e74c3c;">
                            ${formatMoney(payment.amount)} đ
                        </span>
                    </div>
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <div style="margin-bottom: 10px;">
                    <strong style="color: #7f8c8d;">Ngày tạo:</strong>
                    <p style="margin: 5px 0; color: #2c3e50;">${formatDateTime(payment.createdAt)}</p>
                </div>
                ${payment.paidAt ? `
                <div>
                    <strong style="color: #7f8c8d;">Ngày thanh toán:</strong>
                    <p style="margin: 5px 0; color: #27ae60;">${formatDateTime(payment.paidAt)}</p>
                </div>
                ` : ''}
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button class="btn btn-primary" onclick="viewOrderDetail('${payment.orderId}')">
                    <i class="fas fa-box"></i> Xem đơn hàng
                </button>
                <button class="btn btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Đóng
                </button>
            </div>
        </div>
    `;
    
    showModal(html);
}

function viewOrderDetail(orderId) {
    closeModal();
    window.location.href = `customer-my-orders.html?orderId=${orderId}`;
}

// ==================== EXPORT FUNCTION ====================
function exportPayments() {
    if (filteredPayments.length === 0) {
        showNotification('Không có dữ liệu để xuất', 'warning');
        return;
    }
    
    // Create CSV content
    let csv = 'Mã giao dịch,Mã đơn hàng,Mô tả,Số tiền,Phương thức,Trạng thái,Ngày tạo\n';
    
    filteredPayments.forEach(payment => {
        const methodText = payment.method === 'cod' ? 'COD' : 
                          payment.method === 'bank' ? 'Chuyển khoản' : 'Ví điện tử';
        const statusText = payment.status === 'paid' ? 'Đã thanh toán' :
                          payment.status === 'pending' ? 'Chờ thanh toán' : 'Đã hủy';
        
        csv += `"${payment.id}","${payment.orderId}","${payment.description}",`;
        csv += `"${formatMoney(payment.amount)}","${methodText}","${statusText}",`;
        csv += `"${formatDateTime(payment.createdAt)}"\n`;
    });
    
    // Create download link
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Lich_su_thanh_toan_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Đã xuất file thành công', 'success');
}

// ==================== HELPER FUNCTIONS ====================
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount || 0);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColors = {
        'success': '#27ae60',
        'error': '#e74c3c',
        'info': '#3498db',
        'warning': '#f39c12'
    };
    
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'info': 'fa-info-circle',
        'warning': 'fa-exclamation-triangle'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColors[type]};
        color: white;
        padding: 18px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 25px rgba(0,0,0,0.2);
        z-index: 10001;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideInRight 0.3s;
        max-width: 400px;
    `;
    
    notification.innerHTML = `
        <i class="fas ${icons[type]}" style="font-size: 1.3rem;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(400px)';
        notification.style.transition = 'all 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function showModal(html) {
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: fadeIn 0.3s;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 35px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s;
    `;
    modalContent.innerHTML = html;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.remove();
}
