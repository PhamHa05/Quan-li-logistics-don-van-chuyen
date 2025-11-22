// ==================== GLOBAL VARIABLES ====================
let currentDriver = null;
let myOrders = [];
let allOrders = [];
let allDrivers = [];
let currentOrderPage = 1;
const ordersPerPage = 15;
let filteredOrders = [];
let currentUploadOrderId = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    loadCurrentDriver();
    setupImageUpload();
    setTimeout(() => {
        loadAllData();
    }, 300);
});

// ==================== AUTHENTICATION ====================
function loadCurrentDriver() {
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('loggedInUser');
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
    
    console.log('[Driver Orders] Logged in as:', currentDriver);
}

// ==================== DATA LOADING ====================
function loadAllData() {
    if (typeof DataSync !== 'undefined') {
        allOrders = DataSync.get('orders') || [];
        allDrivers = DataSync.get('drivers') || [];
        console.log('[Driver Orders] Loaded via DataSync:', allOrders.length, 'orders');
    } else {
        allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        allDrivers = JSON.parse(localStorage.getItem('drivers') || '[]');
        console.log('[Driver Orders] Loaded via localStorage:', allOrders.length, 'orders');
    }
    
    // Find driver info
    const driverInfo = allDrivers.find(d => 
        d.email === currentDriver.email || 
        d.name === currentDriver.username ||
        d.name === currentDriver.fullname ||
        d.email === currentDriver.username
    );
    
    console.log('[Driver Orders] Driver info:', driverInfo);
    
    // Filter orders for current driver - kiểm tra nhiều trường để đảm bảo không bỏ sót
    myOrders = allOrders.filter(order => {
        const driverMatch = 
            order.driver === currentDriver.username || 
            order.driver === currentDriver.fullname ||
            order.driverEmail === currentDriver.email ||
            order.assignedDriver === currentDriver.username ||
            order.assignedDriver === currentDriver.fullname ||
            order.assignedDriverEmail === currentDriver.email ||
            order.driverId === currentDriver.id ||
            (driverInfo && (
                order.driver === driverInfo.name ||
                order.driverEmail === driverInfo.email ||
                order.assignedDriver === driverInfo.name ||
                order.driverId === driverInfo.id
            ));
        
        return driverMatch;
    });
    
    console.log('[Driver Orders] My orders:', myOrders.length);
    
    renderOrdersPage();
}

// ==================== ORDERS PAGE ====================
function renderOrdersPage() {
    const tbody = document.getElementById('orders-table');
    if (!tbody) return;
    
    updateOrdersStatistics();
    applyOrderFilters();
    
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const startIndex = (currentOrderPage - 1) * ordersPerPage;
    const endIndex = Math.min(startIndex + ordersPerPage, filteredOrders.length);
    const pageOrders = filteredOrders.slice(startIndex, endIndex);
    
    document.getElementById('orders-count-badge').textContent = filteredOrders.length;
    
    if (filteredOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px; color:#7f8c8d;"><i class="fas fa-box-open" style="font-size:3rem;opacity:0.3;"></i><p>Không có đơn hàng nào</p></td></tr>';
        document.getElementById('orders-pagination').style.display = 'none';
        return;
    }
    
    tbody.innerHTML = pageOrders.map(order => {
        const orderId = order.id || order.trackingNumber || 'N/A';
        const codAmount = order.codAmount || 0;
        
        // Xác định địa chỉ hiện tại theo trạng thái
        let currentAddress = '';
        let currentContact = '';
        let currentName = '';
        
        if (order.status === 'assigned' || order.status === 'picking') {
            // Đang lấy hàng -> hiển thị thông tin người gửi
            currentAddress = order.pickupAddress || order.senderAddress || 'N/A';
            currentContact = order.senderPhone || order.customerPhone || 'N/A';
            currentName = order.senderName || order.customerName || 'Người gửi';
        } else {
            // Đang giao hàng -> hiển thị thông tin người nhận
            currentAddress = order.deliveryAddress || order.receiverAddress || 'N/A';
            currentContact = order.receiverPhone || order.customerPhone || 'N/A';
            currentName = order.receiverName || order.customerName || 'Người nhận';
        }
        
        return `
            <tr style="cursor: pointer;" onmouseover="this.style.backgroundColor='#f8f9fa'" onmouseout="this.style.backgroundColor=''" onclick="showOrderDetail('${orderId}')">
                <td>
                    <div style="display: flex; flex-direction: column;">
                        <strong style="color: #2c3e50; font-size: 1rem;">${orderId}</strong>
                        <small style="color: #95a5a6; margin-top: 3px;">
                            <i class="fas fa-calendar"></i> ${formatDateTime(order.createdAt || order.createdDate)}
                        </small>
                    </div>
                </td>
                <td>
                    <div style="display: flex; flex-direction: column;">
                        <div style="font-weight: 600; color: #2c3e50;">${currentName}</div>
                        <small style="color: #7f8c8d; margin-top: 2px;">
                            ${order.status === 'assigned' || order.status === 'picking' ? 
                                '<i class="fas fa-box-open" style="color: #3498db;"></i> Lấy hàng' : 
                                '<i class="fas fa-shipping-fast" style="color: #27ae60;"></i> Giao hàng'}
                        </small>
                    </div>
                </td>
                <td>
                    <div style="max-width: 300px; line-height: 1.4;">
                        <i class="fas fa-map-marker-alt" style="color: #e74c3c;"></i>
                        ${currentAddress}
                        ${order.routeName ? `<div style="margin-top: 5px;"><span style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.85rem; display: inline-block;"><i class="fas fa-route"></i> ${order.routeName}</span></div>` : ''}
                    </div>
                </td>
                <td onclick="event.stopPropagation()">
                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        <a href="tel:${currentContact}" class="btn btn-sm btn-primary" style="text-decoration: none; padding: 5px 10px;">
                            <i class="fas fa-phone"></i> ${currentContact}
                        </a>
                    </div>
                </td>
                <td>
                    <strong style="color: ${codAmount > 0 ? '#e74c3c' : '#95a5a6'}; font-size: 1.05rem;">
                        ${formatCurrency(codAmount)}
                    </strong>
                </td>
                <td>${getStatusBadge(order.status)}</td>
                <td onclick="event.stopPropagation()">
                    <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                        ${getOrderActions(order)}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    if (totalPages > 1) {
        renderOrdersPagination(totalPages, startIndex, endIndex);
    } else {
        document.getElementById('orders-pagination').style.display = 'none';
    }
    
    console.log('[Orders] Rendered:', pageOrders.length, 'of', filteredOrders.length, 'orders');
}

function updateOrdersStatistics() {
    const total = myOrders.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Các trạng thái theo quy trình nghiệp vụ
    const pending = myOrders.filter(o => o.status === 'assigned' || o.status === 'picking').length;
    const delivering = myOrders.filter(o => o.status === 'delivering').length;
    const deliveredToday = myOrders.filter(o => {
        if (o.status !== 'delivered') return false;
        const deliveredDate = new Date(o.deliveredAt || o.deliveredDate);
        return deliveredDate >= today;
    }).length;
    
    // Tính tổng COD cần thu hôm nay
    const totalCOD = myOrders
        .filter(o => (o.status === 'assigned' || o.status === 'picking' || o.status === 'delivering') && o.codAmount > 0)
        .reduce((sum, o) => sum + (parseFloat(o.codAmount) || 0), 0);
    
    document.getElementById('orders-total').textContent = total;
    document.getElementById('orders-pending').textContent = pending;
    document.getElementById('orders-intransit').textContent = delivering;
    document.getElementById('orders-delivered').textContent = deliveredToday;
    document.getElementById('orders-total-cod').textContent = formatCurrency(totalCOD);
}

function applyOrderFilters() {
    const searchText = (document.getElementById('orderSearchInput')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('orderStatusFilter')?.value || '';
    const codFilter = document.getElementById('orderCODFilter')?.value || '';
    const sortBy = document.getElementById('orderSortBy')?.value || 'dateDesc';
    
    filteredOrders = [...myOrders];
    
    if (searchText) {
        filteredOrders = filteredOrders.filter(order => {
            const orderId = (order.id || order.trackingNumber || '').toLowerCase();
            const senderName = (order.senderName || order.customerName || '').toLowerCase();
            const receiverName = (order.receiverName || order.customerName || '').toLowerCase();
            const receiverPhone = (order.receiverPhone || order.customerPhone || '').toLowerCase();
            const senderPhone = (order.senderPhone || order.customerPhone || '').toLowerCase();
            const pickupAddress = (order.pickupAddress || order.senderAddress || '').toLowerCase();
            const deliveryAddress = (order.deliveryAddress || order.receiverAddress || '').toLowerCase();
            
            return orderId.includes(searchText) || 
                   senderName.includes(searchText) ||
                   receiverName.includes(searchText) || 
                   receiverPhone.includes(searchText) ||
                   senderPhone.includes(searchText) ||
                   pickupAddress.includes(searchText) ||
                   deliveryAddress.includes(searchText);
        });
    }
    
    if (statusFilter) {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }
    
    if (codFilter === 'hasCOD') {
        filteredOrders = filteredOrders.filter(order => order.codAmount && parseFloat(order.codAmount) > 0);
    } else if (codFilter === 'noCOD') {
        filteredOrders = filteredOrders.filter(order => !order.codAmount || parseFloat(order.codAmount) === 0);
    }
    
    switch (sortBy) {
        case 'dateAsc':
            filteredOrders.sort((a, b) => new Date(a.createdAt || a.createdDate || 0) - new Date(b.createdAt || b.createdDate || 0));
            break;
        case 'dateDesc':
            filteredOrders.sort((a, b) => new Date(b.createdAt || b.createdDate || 0) - new Date(a.createdAt || a.createdDate || 0));
            break;
        case 'codAsc':
            filteredOrders.sort((a, b) => (parseFloat(a.codAmount) || 0) - (parseFloat(b.codAmount) || 0));
            break;
        case 'codDesc':
            filteredOrders.sort((a, b) => (parseFloat(b.codAmount) || 0) - (parseFloat(a.codAmount) || 0));
            break;
        case 'status':
            const statusOrder = { 'assigned': 1, 'picking': 2, 'delivering': 3, 'delivered': 4, 'failed': 5, 'cancelled': 6 };
            filteredOrders.sort((a, b) => (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99));
            break;
    }
    
    currentOrderPage = 1;
}

function renderOrdersPagination(totalPages, startIndex, endIndex) {
    const pagination = document.getElementById('orders-pagination');
    const buttonsContainer = document.getElementById('orders-pagination-buttons');
    
    document.getElementById('orders-showing-start').textContent = startIndex + 1;
    document.getElementById('orders-showing-end').textContent = endIndex;
    document.getElementById('orders-showing-total').textContent = filteredOrders.length;
    
    let buttons = '';
    
    buttons += `<button class="btn btn-sm ${currentOrderPage === 1 ? 'btn-secondary' : 'btn-primary'}" 
                        onclick="goToOrderPage(${currentOrderPage - 1})" 
                        ${currentOrderPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i>
                </button>`;
    
    const maxButtons = 5;
    let startPage = Math.max(1, currentOrderPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        buttons += `<button class="btn btn-sm ${i === currentOrderPage ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="goToOrderPage(${i})">
                        ${i}
                    </button>`;
    }
    
    buttons += `<button class="btn btn-sm ${currentOrderPage === totalPages ? 'btn-secondary' : 'btn-primary'}" 
                        onclick="goToOrderPage(${currentOrderPage + 1})" 
                        ${currentOrderPage === totalPages ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </button>`;
    
    buttonsContainer.innerHTML = buttons;
    pagination.style.display = 'flex';
}

function goToOrderPage(page) {
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentOrderPage = page;
    renderOrdersPage();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearOrderFilters() {
    document.getElementById('orderSearchInput').value = '';
    document.getElementById('orderStatusFilter').value = '';
    document.getElementById('orderCODFilter').value = '';
    document.getElementById('orderSortBy').value = 'dateDesc';
    currentOrderPage = 1;
    filterOrders();
    showNotification('Đã xóa tất cả bộ lọc', 'info');
}

function filterOrders() {
    renderOrdersPage();
}

function filterByStatus(statuses) {
    const statusFilter = document.getElementById('orderStatusFilter');
    if (statuses === 'all') {
        statusFilter.value = '';
    } else {
        // Chọn status đầu tiên nếu có nhiều status
        const statusArray = statuses.split(',');
        statusFilter.value = statusArray[0];
    }
    filterOrders();
}

function refreshOrders() {
    showNotification('Đang làm mới dữ liệu...', 'info');
    loadAllData();
}

// ==================== ORDER DETAIL MODAL ====================
function showOrderDetail(orderId) {
    const order = myOrders.find(o => (o.id || o.trackingNumber) === orderId);
    if (!order) {
        showNotification('Không tìm thấy đơn hàng!', 'error');
        return;
    }
    
    document.getElementById('modal-order-id').textContent = '#' + orderId;
    
    const content = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                <h4 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-info-circle"></i> Thông tin đơn hàng
                </h4>
                <div style="margin-bottom: 12px;">
                    <div style="opacity: 0.9; font-size: 0.9rem; margin-bottom: 5px;">Mã đơn hàng</div>
                    <div style="font-weight: 700; font-size: 1.2rem;">${order.id || order.trackingNumber}</div>
                </div>
                <div style="margin-bottom: 12px;">
                    <div style="opacity: 0.9; font-size: 0.9rem; margin-bottom: 5px;">Trạng thái</div>
                    <div>${getStatusBadge(order.status)}</div>
                </div>
                ${order.routeName ? `
                <div style="margin-bottom: 12px;">
                    <div style="opacity: 0.9; font-size: 0.9rem; margin-bottom: 5px;">Tuyến đường</div>
                    <div style="font-weight: 600; font-size: 1.1rem; background: rgba(255,255,255,0.2); padding: 8px 12px; border-radius: 6px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-route"></i> ${order.routeName}
                    </div>
                </div>
                ` : ''}
                ${order.deliveryArea ? `
                <div style="margin-bottom: 12px;">
                    <div style="opacity: 0.9; font-size: 0.9rem; margin-bottom: 5px;">Khu vực giao hàng</div>
                    <div style="font-weight: 600; background: rgba(255,255,255,0.2); padding: 6px 10px; border-radius: 6px; display: inline-block;">
                        <i class="fas fa-map-marked-alt"></i> ${order.deliveryArea}
                    </div>
                </div>
                ` : ''}
                <div style="margin-bottom: 12px;">
                    <div style="opacity: 0.9; font-size: 0.9rem; margin-bottom: 5px;">Ngày tạo</div>
                    <div style="font-weight: 500;">${formatDateTime(order.createdAt || order.createdDate)}</div>
                </div>
                ${order.timeline && order.timeline.length > 0 ? `
                <div>
                    <div style="opacity: 0.9; font-size: 0.9rem; margin-bottom: 5px;">Cập nhật lần cuối</div>
                    <div style="font-weight: 500;">${formatDateTime(order.timeline[order.timeline.length - 1].time)}</div>
                </div>
                ` : ''}
            </div>
            
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);">
                <h4 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-money-bill-wave"></i> Thông tin COD
                </h4>
                <div style="margin-bottom: 12px;">
                    <div style="opacity: 0.9; font-size: 0.9rem; margin-bottom: 5px;">Số tiền COD</div>
                    <div style="font-weight: 700; font-size: 1.5rem;">${formatCurrency(order.codAmount || 0)}</div>
                </div>
                <div style="margin-bottom: 12px;">
                    <div style="opacity: 0.9; font-size: 0.9rem; margin-bottom: 5px;">Phí vận chuyển</div>
                    <div style="font-weight: 600; font-size: 1.1rem;">${formatCurrency(order.shippingFee || 0)}</div>
                </div>
                <div>
                    <div style="opacity: 0.9; font-size: 0.9rem; margin-bottom: 5px;">Trạng thái COD</div>
                    <div style="font-weight: 600;">
                        ${order.codCollected ? 
                            '<i class="fas fa-check-circle"></i> Đã thu' : 
                            order.codAmount > 0 ? '<i class="fas fa-clock"></i> Chưa thu' : '<i class="fas fa-minus"></i> Không có COD'
                        }
                    </div>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid #3498db;">
                <h4 style="margin: 0 0 15px 0; color: #2c3e50; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-box-open"></i> Thông tin lấy hàng
                </h4>
                <div style="margin-bottom: 12px;">
                    <div style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 5px;">Người gửi</div>
                    <div style="font-weight: 600; color: #2c3e50;">${order.senderName || order.customerName || 'N/A'}</div>
                </div>
                <div style="margin-bottom: 12px;">
                    <div style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 5px;">Số điện thoại</div>
                    <div style="font-weight: 500;">
                        <a href="tel:${order.senderPhone || order.customerPhone}" class="btn btn-sm btn-primary" style="text-decoration: none;">
                            <i class="fas fa-phone"></i> ${order.senderPhone || order.customerPhone || 'N/A'}
                        </a>
                    </div>
                </div>
                <div>
                    <div style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 5px;">Địa chỉ lấy hàng</div>
                    <div style="font-weight: 500; line-height: 1.6; color: #2c3e50;">
                        <i class="fas fa-map-marker-alt" style="color: #3498db;"></i>
                        ${order.pickupAddress || order.senderAddress || 'N/A'}
                    </div>
                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.pickupAddress || order.senderAddress)}" 
                       target="_blank" 
                       class="btn btn-sm btn-secondary" 
                       style="margin-top: 10px; text-decoration: none;">
                        <i class="fas fa-map"></i> Xem bản đồ
                    </a>
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid #27ae60;">
                <h4 style="margin: 0 0 15px 0; color: #2c3e50; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-shipping-fast"></i> Thông tin giao hàng
                </h4>
                <div style="margin-bottom: 12px;">
                    <div style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 5px;">Người nhận</div>
                    <div style="font-weight: 600; color: #2c3e50;">${order.receiverName || order.customerName || 'N/A'}</div>
                </div>
                <div style="margin-bottom: 12px;">
                    <div style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 5px;">Số điện thoại</div>
                    <div style="font-weight: 500;">
                        <a href="tel:${order.receiverPhone || order.customerPhone}" class="btn btn-sm btn-success" style="text-decoration: none;">
                            <i class="fas fa-phone"></i> ${order.receiverPhone || order.customerPhone || 'N/A'}
                        </a>
                    </div>
                </div>
                <div>
                    <div style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 5px;">Địa chỉ giao hàng</div>
                    <div style="font-weight: 500; line-height: 1.6; color: #2c3e50;">
                        <i class="fas fa-map-marker-alt" style="color: #27ae60;"></i>
                        ${order.deliveryAddress || order.receiverAddress || 'N/A'}
                    </div>
                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress || order.receiverAddress)}" 
                       target="_blank" 
                       class="btn btn-sm btn-secondary" 
                       style="margin-top: 10px; text-decoration: none;">
                        <i class="fas fa-map"></i> Xem bản đồ
                    </a>
                </div>
            </div>
        </div>
        
        ${order.notes ? `
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
            <div style="color: #856404; font-weight: 600; margin-bottom: 8px;">
                <i class="fas fa-sticky-note"></i> Ghi chú đơn hàng
            </div>
            <div style="color: #856404; line-height: 1.6;">
                ${order.notes}
            </div>
        </div>
        ` : ''}
        
        ${order.timeline && order.timeline.length > 0 ? `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 15px 0; color: #2c3e50; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-history"></i> Lịch sử vận chuyển
            </h4>
            <div style="position: relative; padding-left: 30px;">
                ${order.timeline.map((item, index) => `
                    <div style="position: relative; padding-bottom: ${index === order.timeline.length - 1 ? '0' : '20px'};">
                        <div style="position: absolute; left: -30px; top: 0; width: 20px; height: 20px; border-radius: 50%; background: ${getTimelineColor(item.status)}; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                        ${index !== order.timeline.length - 1 ? `<div style="position: absolute; left: -21px; top: 20px; width: 2px; height: calc(100% - 20px); background: #dee2e6;"></div>` : ''}
                        <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px;">${getStatusText(item.status)}</div>
                        <div style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 3px;">${item.description}</div>
                        <div style="color: #95a5a6; font-size: 0.85rem;">
                            <i class="fas fa-clock"></i> ${formatDateTime(item.time)}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${order.failureNote ? `
        <div style="background: #f8d7da; padding: 15px; border-radius: 8px; border-left: 4px solid #e74c3c; margin-bottom: 20px;">
            <div style="color: #721c24; font-weight: 600; margin-bottom: 8px;">
                <i class="fas fa-exclamation-triangle"></i> Lý do thất bại
            </div>
            <div style="color: #721c24; line-height: 1.6;">
                ${order.failureNote}
            </div>
        </div>
        ` : ''}
        
        <div style="display: flex; gap: 10px; justify-content: flex-end; padding-top: 20px; border-top: 2px solid #ecf0f1; flex-wrap: wrap;">
            ${getOrderDetailActions(order)}
            <button class="btn btn-secondary" onclick="closeOrderDetailModal()">
                <i class="fas fa-times"></i> Đóng
            </button>
        </div>
    `;
    
    document.getElementById('order-detail-content').innerHTML = content;
    document.getElementById('orderDetailModal').style.display = 'flex';
}

function getOrderDetailActions(order) {
    const orderId = order.id || order.trackingNumber;
    let actions = '';
    
    // QUY TRÌNH NGHIỆP VỤ TÀI XẾ
    switch (order.status) {
        case 'assigned':
            // Mới nhận đơn -> Bắt đầu đi lấy hàng
            actions = `
                <button class="btn btn-primary" onclick="updateOrderStatus('${orderId}', 'picking'); closeOrderDetailModal();">
                    <i class="fas fa-motorcycle"></i> Đi lấy hàng
                </button>
            `;
            break;
            
        case 'picking':
            // Đang đi lấy hàng -> Đã lấy hàng, bắt đầu giao
            actions = `
                <button class="btn btn-success" onclick="confirmPickup('${orderId}'); closeOrderDetailModal();">
                    <i class="fas fa-box"></i> Đã lấy hàng
                </button>
                <button class="btn btn-danger" onclick="failPickup('${orderId}'); closeOrderDetailModal();">
                    <i class="fas fa-times"></i> Không lấy được
                </button>
            `;
            break;
            
        case 'delivering':
            // Đang giao hàng -> Giao thành công hoặc thất bại
            actions = `
                <button class="btn btn-success" onclick="confirmDelivery('${orderId}');">
                    <i class="fas fa-check-circle"></i> Giao thành công
                </button>
                <button class="btn btn-warning" onclick="openImageUploadModal('${orderId}')">
                    <i class="fas fa-camera"></i> Chụp ảnh
                </button>
                <button class="btn btn-danger" onclick="failDelivery('${orderId}'); closeOrderDetailModal();">
                    <i class="fas fa-times-circle"></i> Giao thất bại
                </button>
            `;
            break;
            
        case 'delivered':
            // Đã giao hàng -> Chỉ xem thông tin
            if (order.codAmount > 0 && !order.codCollected) {
                actions = `
                    <button class="btn btn-info" disabled>
                        <i class="fas fa-check-double"></i> Đã giao hàng
                    </button>
                    <button class="btn btn-warning" onclick="confirmCODCollected('${orderId}'); closeOrderDetailModal();">
                        <i class="fas fa-money-bill-wave"></i> Xác nhận thu COD
                    </button>
                `;
            } else {
                actions = `
                    <button class="btn btn-info" disabled>
                        <i class="fas fa-check-double"></i> Hoàn thành
                    </button>
                `;
            }
            break;
            
        case 'failed':
            // Thất bại -> Có thể thử giao lại
            actions = `
                <button class="btn btn-warning" onclick="updateOrderStatus('${orderId}', 'delivering'); closeOrderDetailModal();">
                    <i class="fas fa-redo"></i> Thử giao lại
                </button>
            `;
            break;
    }
    
    return actions;
}

function closeOrderDetailModal() {
    document.getElementById('orderDetailModal').style.display = 'none';
}

function getTimelineColor(status) {
    const colors = {
        'pending': '#95a5a6',
        'assigned': '#3498db',
        'picking': '#f39c12',
        'delivering': '#e67e22',
        'delivered': '#27ae60',
        'failed': '#e74c3c',
        'cancelled': '#7f8c8d'
    };
    return colors[status] || '#95a5a6';
}

// ==================== ORDER STATUS UPDATE ====================
function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge badge-secondary"><i class="fas fa-clock"></i> Chờ phân</span>',
        'assigned': '<span class="badge badge-primary"><i class="fas fa-clipboard-list"></i> Mới nhận</span>',
        'picking': '<span class="badge" style="background: #f39c12;"><i class="fas fa-motorcycle"></i> Đang lấy hàng</span>',
        'delivering': '<span class="badge badge-warning"><i class="fas fa-shipping-fast"></i> Đang giao hàng</span>',
        'delivered': '<span class="badge badge-success"><i class="fas fa-check-circle"></i> Đã giao</span>',
        'failed': '<span class="badge badge-danger"><i class="fas fa-times-circle"></i> Thất bại</span>',
        'cancelled': '<span class="badge badge-dark"><i class="fas fa-ban"></i> Đã hủy</span>'
    };
    return badges[status] || '<span class="badge badge-secondary">N/A</span>';
}

function getStatusText(status) {
    const texts = {
        'pending': 'Chờ phân công',
        'assigned': 'Mới nhận đơn',
        'picking': 'Đang đi lấy hàng',
        'delivering': 'Đang giao hàng',
        'delivered': 'Đã giao thành công',
        'failed': 'Giao thất bại',
        'cancelled': 'Đã hủy'
    };
    return texts[status] || status;
}

function getOrderActions(order) {
    const orderId = order.id || order.trackingNumber;
    
    switch (order.status) {
        case 'assigned':
            return `<button class="btn btn-primary btn-sm" onclick="updateOrderStatus('${orderId}', 'picking')"><i class="fas fa-motorcycle"></i> Đi lấy</button>`;
        case 'picking':
            return `<button class="btn btn-success btn-sm" onclick="confirmPickup('${orderId}')"><i class="fas fa-box"></i> Đã lấy</button>`;
        case 'delivering':
            return `
                <button class="btn btn-success btn-sm" onclick="confirmDelivery('${orderId}')"><i class="fas fa-check"></i> Đã giao</button>
                <button class="btn btn-danger btn-sm" onclick="failDelivery('${orderId}')"><i class="fas fa-times"></i> Thất bại</button>
            `;
        case 'delivered':
            return '<span class="badge badge-success"><i class="fas fa-check-double"></i> Hoàn thành</span>';
        case 'failed':
            return `<button class="btn btn-warning btn-sm" onclick="updateOrderStatus('${orderId}', 'delivering')"><i class="fas fa-redo"></i> Giao lại</button>`;
        default:
            return '<span style="color:#95a5a6;">-</span>';
    }
}

function updateOrderStatus(orderId, newStatus) {
    const order = myOrders.find(o => (o.id || o.trackingNumber) === orderId);
    if (!order) {
        showNotification('Không tìm thấy đơn hàng!', 'error');
        return;
    }
    
    const messages = {
        'picking': 'Xác nhận bắt đầu đi lấy hàng cho đơn ' + orderId + '?',
        'delivering': 'Xác nhận bắt đầu giao đơn hàng ' + orderId + '?'
    };
    
    if (messages[newStatus] && !confirm(messages[newStatus])) return;
    
    const oldStatus = order.status;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    
    // Cập nhật timeline
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
        status: newStatus,
        time: new Date().toISOString(),
        description: `Tài xế cập nhật: ${getStatusText(newStatus)}`
    });
    
    saveOrderChanges(order, `Đã cập nhật trạng thái từ "${getStatusText(oldStatus)}" sang "${getStatusText(newStatus)}"`);
}

function confirmPickup(orderId) {
    const order = myOrders.find(o => (o.id || o.trackingNumber) === orderId);
    if (!order) return;
    
    if (!confirm(`Xác nhận bạn đã lấy hàng thành công cho đơn ${orderId}?`)) return;
    
    order.status = 'delivering';
    order.pickedUpAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
        status: 'delivering',
        time: new Date().toISOString(),
        description: 'Đã lấy hàng thành công, bắt đầu giao cho người nhận'
    });
    
    saveOrderChanges(order, 'Đã lấy hàng thành công, bắt đầu giao hàng');
}

function confirmDelivery(orderId) {
    const order = myOrders.find(o => (o.id || o.trackingNumber) === orderId);
    if (!order) return;
    
    const receiverName = prompt('Nhập tên người nhận hàng để xác nhận:', order.receiverName || order.customerName || '');
    if (!receiverName) return;
    
    order.status = 'delivered';
    order.deliveredAt = new Date().toISOString();
    order.receivedBy = receiverName;
    order.updatedAt = new Date().toISOString();
    
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
        status: 'delivered',
        time: new Date().toISOString(),
        description: `Giao hàng thành công. Người nhận: ${receiverName}`
    });
    
    saveOrderChanges(order, `Giao hàng thành công cho đơn ${orderId}`);
    closeOrderDetailModal();
    
    // Thông báo nhắc thu COD nếu có
    if (order.codAmount && parseFloat(order.codAmount) > 0) {
        setTimeout(() => {
            if (confirm(`Đơn hàng có COD ${formatCurrency(order.codAmount)}. Bạn đã thu tiền COD chưa?`)) {
                confirmCODCollected(orderId);
            }
        }, 500);
    }
}

function failPickup(orderId) {
    const order = myOrders.find(o => (o.id || o.trackingNumber) === orderId);
    if (!order) return;
    
    const reason = prompt('Lý do không lấy được hàng:', 'Người gửi không có mặt / Không liên lạc được');
    if (!reason) return;
    
    order.status = 'failed';
    order.failedAt = new Date().toISOString();
    order.failureNote = 'Lấy hàng thất bại: ' + reason;
    order.updatedAt = new Date().toISOString();
    
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
        status: 'failed',
        time: new Date().toISOString(),
        description: order.failureNote
    });
    
    saveOrderChanges(order, 'Không lấy được hàng');
}

function failDelivery(orderId) {
    const order = myOrders.find(o => (o.id || o.trackingNumber) === orderId);
    if (!order) return;
    
    const reason = prompt('Lý do giao hàng thất bại:', 'Người nhận không có mặt / Không nghe máy / Từ chối nhận hàng');
    if (!reason) return;
    
    order.status = 'failed';
    order.failedAt = new Date().toISOString();
    order.failureNote = 'Giao hàng thất bại: ' + reason;
    order.updatedAt = new Date().toISOString();
    
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
        status: 'failed',
        time: new Date().toISOString(),
        description: order.failureNote
    });
    
    saveOrderChanges(order, 'Giao hàng thất bại');
}

function confirmCODCollected(orderId) {
    const order = myOrders.find(o => (o.id || o.trackingNumber) === orderId);
    if (!order) return;
    
    if (order.codCollected) {
        showNotification('COD đã được xác nhận thu trước đó', 'info');
        return;
    }
    
    if (!confirm(`Xác nhận đã thu COD ${formatCurrency(order.codAmount)} cho đơn ${orderId}?`)) return;
    
    order.codCollected = true;
    order.codCollectedDate = new Date().toISOString();
    order.codStatus = 'collected';
    order.updatedAt = new Date().toISOString();
    
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
        status: 'cod_collected',
        time: new Date().toISOString(),
        description: `Đã xác nhận thu COD: ${formatCurrency(order.codAmount)}`
    });
    
    saveOrderChanges(order, `Đã xác nhận thu COD ${formatCurrency(order.codAmount)}`);
}

function saveOrderChanges(order, message) {
    const orderIndex = allOrders.findIndex(o => (o.id || o.trackingNumber) === (order.id || order.trackingNumber));
    if (orderIndex !== -1) {
        allOrders[orderIndex] = order;
        
        if (typeof DataSync !== 'undefined') {
            DataSync.set('orders', allOrders);
            DataSync.triggerSync('orders');
        } else {
            localStorage.setItem('orders', JSON.stringify(allOrders));
        }
        
        showNotification(message, 'success');
        loadAllData();
    }
}

// ==================== IMAGE UPLOAD ====================
function setupImageUpload() {
    const imageInput = document.getElementById('deliveryImageInput');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('previewImg').src = event.target.result;
                    document.getElementById('imagePreview').style.display = 'block';
                    document.getElementById('uploadImageBtn').style.display = 'inline-block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function openImageUploadModal(orderId) {
    currentUploadOrderId = orderId;
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('uploadImageBtn').style.display = 'none';
    document.getElementById('deliveryImageInput').value = '';
    document.getElementById('imageUploadModal').style.display = 'flex';
}

function closeImageUploadModal() {
    document.getElementById('imageUploadModal').style.display = 'none';
    currentUploadOrderId = null;
}

function uploadDeliveryImage() {
    if (!currentUploadOrderId) return;
    
    const fileInput = document.getElementById('deliveryImageInput');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Vui lòng chọn ảnh', 'warning');
        return;
    }
    
    // Trong thực tế, ảnh sẽ được upload lên server
    // Ở đây chúng ta lưu base64 string vào localStorage (demo only)
    const reader = new FileReader();
    reader.onload = function(event) {
        const order = myOrders.find(o => (o.id || o.trackingNumber) === currentUploadOrderId);
        if (order) {
            if (!order.deliveryImages) order.deliveryImages = [];
            order.deliveryImages.push({
                image: event.target.result,
                uploadedAt: new Date().toISOString()
            });
            
            if (!order.timeline) order.timeline = [];
            order.timeline.push({
                status: order.status,
                time: new Date().toISOString(),
                description: 'Đã chụp ảnh giao hàng'
            });
            
            saveOrderChanges(order, 'Đã tải ảnh giao hàng lên hệ thống');
            closeImageUploadModal();
        }
    };
    reader.readAsDataURL(file);
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
    return day + '/' + month + '/' + year;
}

function formatTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return hours + ':' + minutes;
}

function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    return formatDate(dateStr) + ' ' + formatTime(dateStr);
}

function showNotification(message, type) {
    type = type || 'info';
    const colors = { success: '#27ae60', error: '#e74c3c', warning: '#f39c12', info: '#3498db' };
    const icons = { success: 'check-circle', error: 'times-circle', warning: 'exclamation-triangle', info: 'info-circle' };
    
    const notification = document.createElement('div');
    notification.style.cssText = 'position:fixed;top:20px;right:20px;background:' + colors[type] + ';color:white;padding:15px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:10000;font-weight:500;display:flex;align-items:center;gap:10px;max-width:400px;animation:slideIn 0.3s ease-out;';
    notification.innerHTML = '<i class="fas fa-' + icons[type] + '"></i><span>' + message + '</span>';
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(function() { notification.remove(); }, 300);
    }, 3000);
}

function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('loggedInUser');
        sessionStorage.removeItem('loggedInUser');
        localStorage.removeItem('rememberMe');
        window.location.replace('login.html');
    }
}

// ==================== AUTO REFRESH & SYNC ====================
setInterval(function() {
    console.log('[Driver Orders] Auto-refreshing data...');
    const currentScroll = window.scrollY;
    loadAllData();
    window.scrollTo(0, currentScroll);
}, 30000);

if (typeof DataSync !== 'undefined') {
    window.addEventListener('dataSync', function(event) {
        console.log('[Driver Orders] DataSync event received:', event.detail.key);
        if (event.detail.key === 'orders') {
            loadAllData();
        }
    });
}

window.addEventListener('storage', function(event) {
    if (event.key === 'orders') {
        console.log('[Driver Orders] Storage event detected');
        loadAllData();
    }
});

console.log('[Driver Orders] Script loaded successfully');
