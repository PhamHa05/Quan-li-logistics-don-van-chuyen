// ==================== GLOBAL VARIABLES ====================
let currentUser = null;
let allOrders = [];
let myOrders = [];
let filteredOrders = [];
let currentFilter = 'all';
let currentSort = 'date-desc';
let selectedRating = 0;

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
    myOrders = allOrders.filter(order => {
        return order.customerId === currentUser.userId ||
               order.customerName === (currentUser.fullName || currentUser.name) ||
               order.senderName === (currentUser.fullName || currentUser.name) ||
               order.senderPhone === currentUser.phone ||
               order.receiverPhone === currentUser.phone ||
               order.customerPhone === currentUser.phone ||
               order.senderEmail === currentUser.email ||
               order.customerEmail === currentUser.email;
    });
    
    console.log('[My Orders] Total orders:', allOrders.length);
    console.log('[My Orders] My orders:', myOrders.length);
    
    // Apply filters and render
    applyOrderFilter();
}

// ==================== FILTER & SEARCH FUNCTIONS ====================
function applyOrderFilter() {
    const searchTerm = document.getElementById('order-search').value.toLowerCase().trim();
    
    // Start with all my orders
    filteredOrders = myOrders.filter(order => {
        // Filter by status
        let statusMatch = true;
        if (currentFilter !== 'all') {
            statusMatch = order.status === currentFilter;
        }
        
        // Filter by search term
        let searchMatch = true;
        if (searchTerm) {
            searchMatch = 
                (order.orderId || order.id || '').toLowerCase().includes(searchTerm) ||
                (order.receiverName || order.customerName || '').toLowerCase().includes(searchTerm) ||
                (order.receiverPhone || order.customerPhone || '').includes(searchTerm) ||
                (order.receiverAddress || order.deliveryAddress || '').toLowerCase().includes(searchTerm) ||
                (order.senderName || '').toLowerCase().includes(searchTerm) ||
                (order.goodsDescription || '').toLowerCase().includes(searchTerm);
        }
        
        return statusMatch && searchMatch;
    });
    
    // Apply sorting
    applySorting();
    
    // Update counts
    document.getElementById('total-count').textContent = myOrders.length;
    document.getElementById('filtered-count').textContent = filteredOrders.length;
    
    // Render orders
    renderOrders();
}

function applySorting() {
    switch(currentSort) {
        case 'date-desc':
            filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'date-asc':
            filteredOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'amount-desc':
            filteredOrders.sort((a, b) => b.totalAmount - a.totalAmount);
            break;
        case 'amount-asc':
            filteredOrders.sort((a, b) => a.totalAmount - b.totalAmount);
            break;
        case 'status':
            const statusOrder = {
                'pending': 1,
                'assigned': 2,
                'picking': 3,
                'delivering': 4,
                'delivered': 5,
                'cancelled': 6
            };
            filteredOrders.sort((a, b) => (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0));
            break;
    }
}

function filterByStatus(status) {
    currentFilter = status;
    
    // Update button active states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.filter-btn').classList.add('active');
    
    applyOrderFilter();
}

function searchOrders() {
    applyOrderFilter();
}

function sortOrders(sortType) {
    currentSort = sortType;
    applySorting();
    renderOrders();
}

function clearFilters() {
    currentFilter = 'all';
    currentSort = 'date-desc';
    document.getElementById('order-search').value = '';
    document.getElementById('order-sort').value = 'date-desc';
    
    // Reset active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.filter-btn[data-status="all"]').classList.add('active');
    
    applyOrderFilter();
}

function refreshOrders() {
    loadAllData();
    showNotification('Đã làm mới dữ liệu', 'success');
}

// ==================== RENDER FUNCTIONS ====================
function renderOrders() {
    const ordersList = document.getElementById('orders-list');
    
    if (filteredOrders.length === 0) {
        const emptyMessage = currentFilter === 'all' 
            ? 'Bạn chưa có đơn hàng nào'
            : `Không có đơn hàng ${getStatusText(currentFilter)}`;
            
        ordersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>${emptyMessage}</h3>
                <p>Hãy tạo đơn hàng mới để bắt đầu sử dụng dịch vụ</p>
                <button class="btn btn-primary" onclick="window.location.href='customer-create-order.html'">
                    <i class="fas fa-plus-circle"></i> Tạo đơn hàng
                </button>
            </div>
        `;
        return;
    }
    
    let html = '<div class="orders-list">';
    
    filteredOrders.forEach(order => {
        const statusInfo = getStatusInfo(order.status);
        const orderId = order.orderId || order.id;
        const hasRating = order.rating && order.rating > 0;
        const canRate = order.status === 'delivered' && !hasRating;
        const canCancel = order.status === 'pending' || order.status === 'assigned';
        
        html += `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <h4>Đơn hàng #${orderId}</h4>
                        <p class="order-date">
                            <i class="fas fa-calendar"></i> ${formatDateTime(order.createdAt)}
                        </p>
                    </div>
                    <span class="badge ${statusInfo.class}">
                        <i class="${statusInfo.icon}"></i> ${statusInfo.text}
                    </span>
                </div>
                <div class="order-body">
                    <div class="order-info">
                        <div class="info-row">
                            <i class="fas fa-user"></i>
                            <span><strong>Người nhận:</strong> ${order.receiverName || order.customerName || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <i class="fas fa-phone"></i>
                            <span><strong>SĐT:</strong> ${order.receiverPhone || order.customerPhone || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <i class="fas fa-map-marker-alt"></i>
                            <span><strong>Địa chỉ:</strong> ${order.receiverAddress || order.deliveryAddress || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <i class="fas fa-box"></i>
                            <span><strong>Hàng hóa:</strong> ${order.goodsDescription || getItemTypeText(order.itemType) || 'Không có mô tả'}</span>
                        </div>
                    </div>
                    <div class="order-pricing">
                        <div class="price-row">
                            <span>Phí vận chuyển:</span>
                            <strong>${formatMoney(order.shippingFee || 0)} đ</strong>
                        </div>
                        ${(order.codAmount && order.codAmount > 0) ? `
                        <div class="price-row">
                            <span>COD:</span>
                            <strong>${formatMoney(order.codAmount)} đ</strong>
                        </div>
                        ` : ''}
                        <div class="price-row total">
                            <span>Tổng cộng:</span>
                            <strong class="total-price">${formatMoney(order.totalAmount || ((order.shippingFee || 0) + (order.codAmount || 0)))} đ</strong>
                        </div>
                    </div>
                </div>
                <div class="order-footer">
                    <button class="btn btn-info btn-sm" onclick="viewOrderDetail('${orderId}')">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                    ${canRate ? `
                        <button class="btn btn-warning btn-sm" onclick="rateOrder('${orderId}')">
                            <i class="fas fa-star"></i> Đánh giá
                        </button>
                    ` : ''}
                    ${hasRating ? `
                        <span class="badge badge-warning" style="padding: 8px 15px;">
                            <i class="fas fa-star"></i> ${order.rating}/5
                        </span>
                    ` : ''}
                    ${canCancel ? `
                        <button class="btn btn-danger btn-sm" onclick="cancelOrder('${orderId}')">
                            <i class="fas fa-ban"></i> Hủy đơn
                        </button>
                    ` : ''}
                    ${order.status === 'delivered' ? `
                        <button class="btn btn-success btn-sm" onclick="reorder('${order.orderId}')">
                            <i class="fas fa-redo"></i> Đặt lại
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    ordersList.innerHTML = html;
}

// ==================== ORDER ACTIONS ====================
function viewOrderDetail(orderId) {
    const order = allOrders.find(o => (o.orderId || o.id) === orderId);
    if (!order) return;
    
    const statusInfo = getStatusInfo(order.status);
    const displayOrderId = order.orderId || order.id;
    
    let html = `
        <div style="max-width: 600px;">
            <h2 style="margin: 0 0 20px 0; color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 15px;">
                <i class="fas fa-file-invoice"></i> Chi tiết đơn hàng
            </h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <strong style="color: #7f8c8d;">Mã đơn hàng:</strong><br>
                        <span style="font-size: 1.1rem; color: #2c3e50;">#${displayOrderId}</span>
                    </div>
                    <div>
                        <strong style="color: #7f8c8d;">Trạng thái:</strong><br>
                        <span class="badge ${statusInfo.class}"><i class="${statusInfo.icon}"></i> ${statusInfo.text}</span>
                    </div>
                </div>
                <div>
                    <strong style="color: #7f8c8d;">Ngày tạo:</strong><br>
                    <span style="color: #2c3e50;">${formatDateTime(order.createdAt)}</span>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">
                    <i class="fas fa-user-circle"></i> Thông tin người gửi
                </h4>
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db;">
                    <p style="margin: 5px 0;"><strong>Tên:</strong> ${order.senderName || 'N/A'}</p>
                    <p style="margin: 5px 0;"><strong>SĐT:</strong> ${order.senderPhone || 'N/A'}</p>
                    <p style="margin: 5px 0;"><strong>Địa chỉ:</strong> ${order.senderAddress || 'N/A'}</p>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">
                    <i class="fas fa-map-marker-alt"></i> Thông tin người nhận
                </h4>
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #27ae60;">
                    <p style="margin: 5px 0;"><strong>Tên:</strong> ${order.receiverName || order.customerName || 'N/A'}</p>
                    <p style="margin: 5px 0;"><strong>SĐT:</strong> ${order.receiverPhone || order.customerPhone || 'N/A'}</p>
                    <p style="margin: 5px 0;"><strong>Địa chỉ:</strong> ${order.receiverAddress || order.deliveryAddress || 'N/A'}</p>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">
                    <i class="fas fa-box"></i> Thông tin hàng hóa
                </h4>
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f39c12;">
                    <p style="margin: 5px 0;"><strong>Mô tả:</strong> ${order.goodsDescription || 'Không có mô tả'}</p>
                    <p style="margin: 5px 0;"><strong>Khối lượng:</strong> ${order.weight} kg</p>
                    ${order.notes ? `<p style="margin: 5px 0;"><strong>Ghi chú:</strong> ${order.notes}</p>` : ''}
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">
                    <i class="fas fa-money-bill-wave"></i> Chi phí
                </h4>
                <div style="background: white; padding: 15px; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Phí vận chuyển:</span>
                        <strong>${formatMoney(order.shippingFee)} đ</strong>
                    </div>
                    ${order.codAmount > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>COD:</span>
                        <strong>${formatMoney(order.codAmount)} đ</strong>
                    </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid #ecf0f1;">
                        <span style="font-size: 1.1rem;"><strong>Tổng cộng:</strong></span>
                        <strong style="font-size: 1.3rem; color: #e74c3c;">${formatMoney(order.totalAmount)} đ</strong>
                    </div>
                </div>
            </div>
            
            ${order.timeline && order.timeline.length > 0 ? `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">
                    <i class="fas fa-history"></i> Lịch sử đơn hàng
                </h4>
                <div style="background: white; padding: 15px; border-radius: 8px;">
                    ${order.timeline.map(item => `
                        <div style="padding: 10px 0; border-bottom: 1px solid #ecf0f1;">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div>
                                    <strong style="color: #2c3e50;">${item.description}</strong>
                                    ${item.note ? `<p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">${item.note}</p>` : ''}
                                </div>
                                <small style="color: #95a5a6; white-space: nowrap; margin-left: 15px;">${formatDateTime(item.timestamp)}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${order.rating && order.rating > 0 ? `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">
                    <i class="fas fa-star"></i> Đánh giá của bạn
                </h4>
                <div style="background: #fff9e6; padding: 15px; border-radius: 8px; border-left: 4px solid #f39c12;">
                    <div style="font-size: 1.5rem; color: #f39c12; margin-bottom: 8px;">
                        ${'★'.repeat(order.rating)}${'☆'.repeat(5 - order.rating)}
                    </div>
                    ${order.ratingComment ? `<p style="margin: 5px 0; color: #7f8c8d;">${order.ratingComment}</p>` : ''}
                    <small style="color: #95a5a6;">Đánh giá lúc: ${formatDateTime(order.ratedAt)}</small>
                </div>
            </div>
            ` : ''}
            
            <div style="text-align: right; margin-top: 25px; padding-top: 20px; border-top: 2px solid #ecf0f1;">
                <button class="btn btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Đóng
                </button>
            </div>
        </div>
    `;
    
    showModal(html);
}

function cancelOrder(orderId) {
    const order = allOrders.find(o => (o.orderId || o.id) === orderId);
    if (!order) return;
    
    if (order.status !== 'pending' && order.status !== 'assigned') {
        showNotification('Không thể hủy đơn hàng ở trạng thái này', 'error');
        return;
    }
    
    const reason = prompt('Vui lòng nhập lý do hủy đơn:');
    if (!reason) return;
    
    order.status = 'cancelled';
    order.cancelReason = reason;
    order.cancelledAt = new Date().toISOString();
    
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
        timestamp: new Date().toISOString(),
        status: 'cancelled',
        description: 'Đơn hàng đã bị hủy',
        note: `Lý do: ${reason}`
    });
    
    // Save to storage
    if (typeof DataSync !== 'undefined') {
        DataSync.set('orders', allOrders);
        DataSync.triggerSync('orders');
    } else {
        localStorage.setItem('orders', JSON.stringify(allOrders));
    }
    
    loadAllData();
    showNotification('Đã hủy đơn hàng thành công', 'success');
}

function reorder(orderId) {
    const order = allOrders.find(o => (o.orderId || o.id) === orderId);
    if (!order) return;
    
    // Save order data to sessionStorage
    sessionStorage.setItem('reorderData', JSON.stringify(order));
    
    // Navigate to create order page
    showNotification('Đang chuyển đến trang tạo đơn...', 'info');
    setTimeout(() => {
        window.location.href = 'customer-create-order.html';
    }, 500);
}

function rateOrder(orderId) {
    selectedRating = 0;
    
    const html = `
        <div class="rating-content">
            <h3><i class="fas fa-star"></i> Đánh giá đơn hàng</h3>
            <div class="star-rating" id="star-rating">
                <i class="far fa-star" onclick="selectRating(1)"></i>
                <i class="far fa-star" onclick="selectRating(2)"></i>
                <i class="far fa-star" onclick="selectRating(3)"></i>
                <i class="far fa-star" onclick="selectRating(4)"></i>
                <i class="far fa-star" onclick="selectRating(5)"></i>
            </div>
            <div class="rating-comment">
                <label style="display: block; margin-bottom: 8px; font-weight: 600;">Nhận xét (không bắt buộc):</label>
                <textarea id="rating-comment" placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ..."></textarea>
            </div>
            <div class="rating-actions">
                <button class="btn btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Hủy
                </button>
                <button class="btn btn-primary" id="submit-rating-btn" onclick="submitRating('${orderId}')" disabled>
                    <i class="fas fa-paper-plane"></i> Gửi đánh giá
                </button>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'rating-modal';
    modal.id = 'rating-modal';
    modal.innerHTML = html;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function selectRating(rating) {
    selectedRating = rating;
    
    const stars = document.querySelectorAll('#star-rating i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.className = 'fas fa-star active';
        } else {
            star.className = 'far fa-star';
        }
    });
    
    document.getElementById('submit-rating-btn').disabled = false;
}

function submitRating(orderId) {
    if (selectedRating === 0) {
        showNotification('Vui lòng chọn số sao đánh giá', 'error');
        return;
    }
    
    const order = allOrders.find(o => (o.orderId || o.id) === orderId);
    if (!order) return;
    
    const comment = document.getElementById('rating-comment').value.trim();
    
    order.rating = selectedRating;
    order.ratingComment = comment;
    order.ratedAt = new Date().toISOString();
    
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
        timestamp: new Date().toISOString(),
        status: order.status,
        description: `Khách hàng đánh giá ${selectedRating}/5 sao`,
        note: comment ? `Nhận xét: ${comment}` : ''
    });
    
    // Save to storage
    if (typeof DataSync !== 'undefined') {
        DataSync.set('orders', allOrders);
        DataSync.triggerSync('orders');
    } else {
        localStorage.setItem('orders', JSON.stringify(allOrders));
    }
    
    closeModal();
    loadAllData();
    showNotification('Cảm ơn bạn đã đánh giá!', 'success');
}

// ==================== HELPER FUNCTIONS ====================
function getStatusInfo(status) {
    const statusMap = {
        'pending': { text: 'Chờ xử lý', class: 'badge-primary', icon: 'fas fa-clock' },
        'assigned': { text: 'Đã phân công', class: 'badge-info', icon: 'fas fa-user-check' },
        'picking': { text: 'Đang lấy hàng', class: 'badge-warning', icon: 'fas fa-hand-holding-box' },
        'delivering': { text: 'Đang giao', class: 'badge-warning', icon: 'fas fa-shipping-fast' },
        'delivered': { text: 'Đã giao', class: 'badge-success', icon: 'fas fa-check-circle' },
        'cancelled': { text: 'Đã hủy', class: 'badge-danger', icon: 'fas fa-ban' }
    };
    return statusMap[status] || { text: status, class: 'badge-secondary', icon: 'fas fa-question' };
}

function getStatusText(status) {
    const textMap = {
        'pending': 'chờ xử lý',
        'assigned': 'đã phân công',
        'picking': 'đang lấy hàng',
        'delivering': 'đang giao',
        'delivered': 'đã giao',
        'cancelled': 'đã hủy'
    };
    return textMap[status] || status;
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
}

function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount || 0);
}

function getItemTypeText(type) {
    const typeMap = {
        'electronics': 'Điện tử',
        'clothing': 'Quần áo',
        'food': 'Thực phẩm',
        'document': 'Tài liệu',
        'fashion': 'Thời trang',
        'other': 'Khác'
    };
    return typeMap[type] || 'Hàng hóa';
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
    const modal = document.getElementById('modal-overlay') || document.getElementById('rating-modal');
    if (modal) modal.remove();
}
