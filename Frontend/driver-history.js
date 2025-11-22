// ==================== GLOBAL VARIABLES ====================
let currentDriver = null;
let allOrders = [];
let allDrivers = [];
let myHistory = [];
let filteredHistory = [];
let currentPage = 1;
const itemsPerPage = 15;
let currentDateRange = 'today';

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    loadCurrentDriver();
    loadAllData();
    // Set default range to 'all' to show all history
    setTimeout(() => {
        setQuickRange('all');
    }, 100);
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
    
    console.log('[Driver History] Logged in as:', currentDriver);
}

// ==================== DATA LOADING ====================
function loadAllData() {
    if (typeof DataSync !== 'undefined') {
        allOrders = DataSync.get('orders') || [];
        allDrivers = DataSync.get('drivers') || [];
        console.log('[Driver History] Loaded via DataSync:', allOrders.length, 'orders');
    } else {
        allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        allDrivers = JSON.parse(localStorage.getItem('drivers') || '[]');
        console.log('[Driver History] Loaded via localStorage:', allOrders.length, 'orders');
    }
    
    // Find driver info
    const driverInfo = allDrivers.find(d => 
        d.email === currentDriver.email || 
        d.name === currentDriver.username ||
        d.name === currentDriver.fullname ||
        d.email === currentDriver.username
    );
    
    // Filter completed orders for current driver
    myHistory = allOrders.filter(order => {
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

        // Get completed orders (delivered or failed)
        const isCompleted = order.status === 'delivered' || order.status === 'failed';

        return driverMatch && isCompleted;
    });
    
    console.log('[Driver History] My history:', myHistory.length, 'orders');
    console.log('[Driver History] Sample order:', myHistory[0]);
    
    // If no completed orders, show message
    if (myHistory.length === 0) {
        console.warn('[Driver History] No completed orders found for driver:', currentDriver.username);
        console.log('[Driver History] All orders:', allOrders.length);
        console.log('[Driver History] Driver info:', driverInfo);
    }
    
    updateSummaryCards();
    applyFilters();
}

// ==================== SUMMARY CARDS ====================
function updateSummaryCards() {
    const periodText = currentDateRange === 'today' ? 'Hôm nay' :
                      currentDateRange === 'week' ? 'Tuần này' :
                      currentDateRange === 'month' ? 'Tháng này' : 'Tất cả';
    
    const total = filteredHistory.length;
    const successful = filteredHistory.filter(o => o.status === 'delivered').length;
    const successRate = total > 0 ? ((successful / total) * 100).toFixed(1) : 0;
    
    let totalCOD = 0;
    filteredHistory.forEach(order => {
        if (order.status === 'delivered' && order.codAmount) {
            totalCOD += parseFloat(order.codAmount) || 0;
        }
    });
    
    document.getElementById('summary-period').textContent = periodText;
    document.getElementById('summary-total').textContent = total;
    document.getElementById('summary-cod').textContent = formatCurrency(totalCOD);
    document.getElementById('summary-rate').textContent = successRate + '%';
}

// ==================== DATE RANGE FILTER ====================
function setQuickRange(range) {
    currentDateRange = range;
    
    // Update button states
    document.querySelectorAll('.quick-range-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // Default to first button on page load
        const firstBtn = document.querySelector('.quick-range-btn');
        if (firstBtn) firstBtn.classList.add('active');
    }
    
    const today = new Date();
    let fromDate, toDate;
    
    switch(range) {
        case 'today':
            fromDate = today.toISOString().split('T')[0];
            toDate = today.toISOString().split('T')[0];
            break;
        case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            fromDate = weekStart.toISOString().split('T')[0];
            toDate = today.toISOString().split('T')[0];
            break;
        case 'month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            fromDate = monthStart.toISOString().split('T')[0];
            toDate = today.toISOString().split('T')[0];
            break;
        case 'all':
            fromDate = '';
            toDate = '';
            break;
    }
    
    document.getElementById('from-date').value = fromDate;
    document.getElementById('to-date').value = toDate;
    
    applyFilters();
}

function applyDateFilter() {
    // Remove active state from quick range buttons
    document.querySelectorAll('.quick-range-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    applyFilters();
}

// ==================== FILTERS ====================
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;
    const codFilter = document.getElementById('filter-cod').value;
    const sortBy = document.getElementById('sort-by').value;
    const fromDate = document.getElementById('from-date').value;
    const toDate = document.getElementById('to-date').value;
    
    console.log('[Driver History] Applying filters:', { searchTerm, statusFilter, codFilter, sortBy, fromDate, toDate });
    console.log('[Driver History] Total history before filter:', myHistory.length);
    
    filteredHistory = myHistory.filter(order => {
        // Search filter
        if (searchTerm) {
            const searchIn = [
                order.id || '',
                order.trackingNumber || '',
                order.receiverName || '',
                order.customerName || '',
                order.receiverPhone || '',
                order.customerPhone || '',
                order.receiverAddress || '',
                order.deliveryAddress || ''
            ].join(' ').toLowerCase();
            
            if (!searchIn.includes(searchTerm)) return false;
        }
        
        // Status filter
        if (statusFilter !== 'all' && order.status !== statusFilter) return false;
        
        // COD filter
        const hasCOD = order.codAmount && parseFloat(order.codAmount) > 0;
        const codCollected = order.codCollected || order.codStatus === 'submitted';
        
        if (codFilter === 'has-cod' && !hasCOD) return false;
        if (codFilter === 'no-cod' && hasCOD) return false;
        if (codFilter === 'collected' && (!hasCOD || !codCollected)) return false;
        if (codFilter === 'not-collected' && (!hasCOD || codCollected)) return false;
        
        // Date filter - only if dates are specified
        if (fromDate || toDate) {
            const orderDate = new Date(order.deliveredAt || order.updatedAt || order.createdAt).toISOString().split('T')[0];
            if (fromDate && orderDate < fromDate) return false;
            if (toDate && orderDate > toDate) return false;
        }
        
        return true;
    });
    
    console.log('[Driver History] Filtered history:', filteredHistory.length);
    
    // Sort
    filteredHistory.sort((a, b) => {
        const dateA = new Date(a.deliveredAt || a.updatedAt || a.createdAt);
        const dateB = new Date(b.deliveredAt || b.updatedAt || b.createdAt);
        const codA = parseFloat(a.codAmount) || 0;
        const codB = parseFloat(b.codAmount) || 0;
        
        switch(sortBy) {
            case 'date-desc': return dateB - dateA;
            case 'date-asc': return dateA - dateB;
            case 'cod-desc': return codB - codA;
            case 'cod-asc': return codA - codB;
            default: return dateB - dateA;
        }
    });
    
    currentPage = 1;
    updateSummaryCards();
    renderHistoryTable();
}

// ==================== HISTORY TABLE RENDERING ====================
function renderHistoryTable() {
    const tbody = document.getElementById('history-tbody');
    
    if (filteredHistory.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 60px 40px; color: #7f8c8d;">
                    <i class="fas fa-history" style="font-size: 4rem; opacity: 0.2; margin-bottom: 20px; display: block;"></i>
                    <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 10px;">Không tìm thấy lịch sử giao hàng</div>
                    <div style="font-size: 0.95rem; opacity: 0.7;">Thử thay đổi bộ lọc hoặc khoảng thời gian</div>
                </td>
            </tr>
        `;
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    // Pagination
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filteredHistory.slice(startIndex, endIndex);
    
    tbody.innerHTML = pageItems.map(order => {
        const statusBadge = order.status === 'delivered' ? 
            '<span class="badge badge-success" style="padding: 8px 12px; font-size: 0.85rem;"><i class="fas fa-check-circle"></i> Đã giao</span>' :
            '<span class="badge badge-danger" style="padding: 8px 12px; font-size: 0.85rem;"><i class="fas fa-times-circle"></i> Thất bại</span>';
        
        const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt) : 
                             new Date(order.updatedAt || order.createdAt);
        const dateStr = deliveredDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = deliveredDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        
        const codCollected = order.codCollected || order.codStatus === 'submitted';
        const codDisplay = order.codAmount ? 
            `<div style="font-weight: 700; color: #e74c3c; font-size: 1.1rem;">${formatCurrency(order.codAmount)}</div>
             ${codCollected ? 
                '<small style="color: #27ae60;"><i class="fas fa-check-circle"></i> Đã nộp</small>' : 
                '<small style="color: #f39c12;"><i class="fas fa-clock"></i> Chưa nộp</small>'}` : 
            '<span style="color: #95a5a6;">-</span>';
        
        const rowClass = order.status === 'delivered' ? 'row-delivered' : 'row-failed';
        
        return `
            <tr class="${rowClass}" onclick="showOrderDetail('${order.id || order.trackingNumber}')">
                <td>
                    <div style="font-weight: 600; color: #2c3e50; font-size: 1rem;">#${order.id || order.trackingNumber}</div>
                    ${order.notes ? '<small style="color: #7f8c8d;"><i class="fas fa-sticky-note"></i> Có ghi chú</small>' : ''}
                </td>
                <td>
                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px;">${order.receiverName || order.customerName || 'N/A'}</div>
                    <small style="color: #7f8c8d;"><i class="fas fa-phone"></i> ${order.receiverPhone || order.customerPhone || ''}</small>
                </td>
                <td style="max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${order.receiverAddress || order.deliveryAddress || 'N/A'}">
                    <i class="fas fa-map-marker-alt" style="color: #e74c3c;"></i> ${order.receiverAddress || order.deliveryAddress || 'N/A'}
                </td>
                <td>${codDisplay}</td>
                <td>${statusBadge}</td>
                <td>
                    <div style="font-weight: 500; color: #2c3e50;">${dateStr}</div>
                    <small style="color: #7f8c8d;"><i class="fas fa-clock"></i> ${timeStr}</small>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); showOrderDetail('${order.id || order.trackingNumber}');" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
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
    
    let html = '<div class="pagination-controls" style="display: flex; gap: 10px; align-items: center; justify-content: center; margin-top: 20px;">';
    
    // Previous button
    html += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
            onclick="changePage(${currentPage - 1})"
            style="padding: 10px 15px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer; transition: all 0.3s; ${currentPage === 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})"
                    style="padding: 10px 15px; border: 1px solid ${i === currentPage ? '#3498db' : '#ddd'}; 
                    background: ${i === currentPage ? 'linear-gradient(135deg, #3498db, #2980b9)' : 'white'}; 
                    color: ${i === currentPage ? 'white' : '#2c3e50'}; 
                    border-radius: 6px; cursor: pointer; transition: all 0.3s; font-weight: ${i === currentPage ? '600' : '400'};">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += '<span class="pagination-ellipsis" style="padding: 10px;">...</span>';
        }
    }
    
    // Next button
    html += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
            onclick="changePage(${currentPage + 1})"
            style="padding: 10px 15px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer; transition: all 0.3s; ${currentPage === totalPages ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    html += '</div>';
    html += `<div class="pagination-info" style="text-align: center; margin-top: 15px; color: #7f8c8d; font-size: 0.9rem;">
        Trang ${currentPage} / ${totalPages} • Hiển thị ${filteredHistory.length} đơn hàng
    </div>`;
    
    container.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    renderHistoryTable();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== ORDER DETAIL MODAL ====================
function showOrderDetail(orderId) {
    const order = allOrders.find(o => (o.id || o.trackingNumber) === orderId);
    if (!order) {
        showNotification('Không tìm thấy đơn hàng!', 'error');
        return;
    }
    
    document.getElementById('modal-order-id').textContent = '#' + (order.id || order.trackingNumber);
    
    const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.updatedAt || order.createdAt);
    const statusBadge = order.status === 'delivered' ? 
        '<span class="badge badge-success" style="font-size: 1.1rem; padding: 10px 20px;"><i class="fas fa-check-circle"></i> Đã giao thành công</span>' :
        '<span class="badge badge-danger" style="font-size: 1.1rem; padding: 10px 20px;"><i class="fas fa-times-circle"></i> Giao thất bại</span>';
    
    const codCollected = order.codCollected || order.codStatus === 'submitted';
    
    const content = `
        <div style="background: linear-gradient(135deg, ${order.status === 'delivered' ? '#27ae60, #2ecc71' : '#e74c3c, #c0392b'}); 
            color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.3); border-radius: 50%; 
                    display: flex; align-items: center; justify-content: center;">
                    <i class="fas ${order.status === 'delivered' ? 'fa-check-circle' : 'fa-times-circle'}" style="font-size: 2rem;"></i>
                </div>
                <div>
                    <h3 style="margin: 0; font-size: 1.5rem;">${order.status === 'delivered' ? 'Giao hàng thành công' : 'Giao hàng thất bại'}</h3>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Mã đơn: ${order.id || order.trackingNumber}</p>
                </div>
            </div>
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px; background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px;">
                    <div style="opacity: 0.9; font-size: 0.9rem; margin-bottom: 5px;">Ngày giao</div>
                    <div style="font-weight: 700; font-size: 1.2rem;">
                        ${deliveredDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        ${deliveredDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
                ${order.receivedBy ? `
                <div style="flex: 1; min-width: 200px; background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px;">
                    <div style="opacity: 0.9; font-size: 0.9rem; margin-bottom: 5px;">Người nhận hàng</div>
                    <div style="font-weight: 700; font-size: 1.2rem;">${order.receivedBy}</div>
                </div>
                ` : ''}
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px;">
            <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; border-left: 4px solid #3498db;">
                <h4 style="margin: 0 0 20px 0; color: #2c3e50; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-user-circle" style="color: #3498db;"></i> Thông tin người nhận
                </h4>
                <div style="margin-bottom: 15px;">
                    <div style="color: #7f8c8d; font-size: 0.85rem; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Tên người nhận</div>
                    <div style="font-weight: 600; font-size: 1.15rem; color: #2c3e50;">${order.receiverName || order.customerName || 'N/A'}</div>
                </div>
                <div style="margin-bottom: 15px;">
                    <div style="color: #7f8c8d; font-size: 0.85rem; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Số điện thoại</div>
                    <div style="font-weight: 500;">
                        <a href="tel:${order.receiverPhone || order.customerPhone}" class="btn btn-primary btn-sm" style="text-decoration: none;">
                            <i class="fas fa-phone"></i> ${order.receiverPhone || order.customerPhone || 'N/A'}
                        </a>
                    </div>
                </div>
                <div>
                    <div style="color: #7f8c8d; font-size: 0.85rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Địa chỉ giao hàng</div>
                    <div style="font-weight: 500; line-height: 1.6; color: #2c3e50; background: white; padding: 12px; border-radius: 8px;">
                        <i class="fas fa-map-marker-alt" style="color: #e74c3c;"></i> ${order.receiverAddress || order.deliveryAddress || 'N/A'}
                    </div>
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; border-left: 4px solid #e74c3c;">
                <h4 style="margin: 0 0 20px 0; color: #2c3e50; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-money-bill-wave" style="color: #e74c3c;"></i> Thông tin thanh toán
                </h4>
                <div style="margin-bottom: 15px;">
                    <div style="color: #7f8c8d; font-size: 0.85rem; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Số tiền COD</div>
                    <div style="font-weight: 700; font-size: 1.8rem; color: #e74c3c;">
                        ${order.codAmount ? formatCurrency(order.codAmount) : '0 đ'}
                    </div>
                </div>
                <div style="margin-bottom: 15px;">
                    <div style="color: #7f8c8d; font-size: 0.85rem; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Phí vận chuyển</div>
                    <div style="font-weight: 600; font-size: 1.2rem; color: #2c3e50;">
                        ${formatCurrency(order.shippingFee || 0)}
                    </div>
                </div>
                <div>
                    <div style="color: #7f8c8d; font-size: 0.85rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Trạng thái COD</div>
                    <div style="font-weight: 600; font-size: 1.1rem;">
                        ${order.codAmount > 0 ? 
                            (codCollected ? 
                                '<span style="color: #27ae60; background: rgba(46, 204, 113, 0.1); padding: 8px 12px; border-radius: 6px;"><i class="fas fa-check-circle"></i> Đã nộp tiền</span>' : 
                                '<span style="color: #f39c12; background: rgba(243, 156, 18, 0.1); padding: 8px 12px; border-radius: 6px;"><i class="fas fa-clock"></i> Chưa nộp tiền</span>') : 
                            '<span style="color: #95a5a6;"><i class="fas fa-minus"></i> Không có COD</span>'}
                    </div>
                </div>
            </div>
        </div>
        
        ${order.notes || (order.status === 'failed' && order.failureNote) ? `
        <div style="margin-bottom: 25px;">
            <h4 style="margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid ${order.status === 'failed' ? '#e74c3c' : '#f39c12'}; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-sticky-note" style="color: ${order.status === 'failed' ? '#e74c3c' : '#f39c12'};"></i> 
                Ghi chú ${order.status === 'failed' ? '& Lý do thất bại' : ''}
            </h4>
            <div style="background: ${order.status === 'failed' ? 'linear-gradient(to right, rgba(231, 76, 60, 0.1), transparent)' : 'linear-gradient(to right, rgba(243, 156, 18, 0.1), transparent)'}; 
                padding: 20px; border-radius: 8px; border-left: 4px solid ${order.status === 'failed' ? '#e74c3c' : '#ffc107'};">
                ${order.status === 'failed' && order.failureNote ? `
                    <div style="color: #c0392b; line-height: 1.6; font-size: 1.05rem; margin-bottom: 15px;">
                        <strong style="display: block; margin-bottom: 8px;">Lý do thất bại:</strong>
                        ${order.failureNote}
                    </div>
                ` : ''}
                ${order.notes ? `
                    <div style="color: #856404; line-height: 1.6; font-size: 1rem;">
                        <strong style="display: block; margin-bottom: 8px;">Ghi chú đơn hàng:</strong>
                        ${order.notes}
                    </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
        
        ${order.timeline && order.timeline.length > 0 ? `
        <div style="margin-bottom: 25px;">
            <h4 style="margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #9b59b6; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-history" style="color: #9b59b6;"></i> Lịch sử đơn hàng
            </h4>
            <div style="position: relative; padding-left: 30px;">
                ${order.timeline.slice().reverse().map((item, index) => `
                    <div style="position: relative; padding-bottom: 20px; ${index === order.timeline.length - 1 ? '' : 'border-left: 2px solid #ecf0f1;'}">
                        <div style="position: absolute; left: -35px; top: 0; width: 10px; height: 10px; background: #3498db; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #3498db;"></div>
                        <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                            <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px;">${item.description || getStatusText(item.status)}</div>
                            <small style="color: #7f8c8d;">
                                <i class="fas fa-clock"></i> ${new Date(item.time).toLocaleString('vi-VN')}
                            </small>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <div style="margin-top: 30px; padding-top: 25px; border-top: 2px solid #ecf0f1; display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
            <button class="btn btn-secondary" onclick="closeOrderModal()">
                <i class="fas fa-times"></i> Đóng
            </button>
        </div>
    `;
    
    document.getElementById('order-detail-content').innerHTML = content;
    document.getElementById('orderDetailModal').style.display = 'flex';
}

function getStatusText(status) {
    const texts = {
        'pending': 'Chờ xử lý',
        'assigned': 'Đã phân công',
        'picking': 'Đang lấy hàng',
        'delivering': 'Đang giao hàng',
        'delivered': 'Đã giao thành công',
        'failed': 'Giao thất bại'
    };
    return texts[status] || status;
}

function closeOrderModal() {
    document.getElementById('orderDetailModal').style.display = 'none';
}

// ==================== EXPORT REPORT ====================
function exportHistory() {
    if (filteredHistory.length === 0) {
        showNotification('Không có dữ liệu để xuất!', 'warning');
        return;
    }
    
    showNotification('Đang tạo file Excel...', 'info');
    
    // Create CSV content with BOM for Excel
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += 'STT,Mã đơn hàng,Người nhận,Số điện thoại,Địa chỉ,Số tiền COD,Trạng thái COD,Trạng thái giao hàng,Ngày giao,Người nhận hàng,Ghi chú\n';
    
    filteredHistory.forEach((order, index) => {
        const deliveredDate = order.deliveredAt ? 
            new Date(order.deliveredAt).toLocaleString('vi-VN') : 
            new Date(order.updatedAt || order.createdAt).toLocaleString('vi-VN');
        const status = order.status === 'delivered' ? 'Đã giao' : 'Thất bại';
        const codStatus = order.codAmount > 0 ? 
            ((order.codCollected || order.codStatus === 'submitted') ? 'Đã nộp' : 'Chưa nộp') : 
            'Không có COD';
        const note = order.status === 'failed' && order.failureNote ? order.failureNote : (order.notes || '');
        
        csv += `${index + 1},"${order.id || order.trackingNumber}","${order.receiverName || order.customerName || ''}","${order.receiverPhone || order.customerPhone || ''}","${order.receiverAddress || order.deliveryAddress || ''}","${formatCurrency(order.codAmount || 0)}","${codStatus}","${status}","${deliveredDate}","${order.receivedBy || ''}","${note.replace(/"/g, '""')}"\n`;
    });
    
    // Add summary
    const total = filteredHistory.length;
    const successful = filteredHistory.filter(o => o.status === 'delivered').length;
    const failed = filteredHistory.filter(o => o.status === 'failed').length;
    const successRate = total > 0 ? ((successful / total) * 100).toFixed(1) : 0;
    let totalCOD = 0;
    filteredHistory.forEach(order => {
        if (order.status === 'delivered' && order.codAmount) {
            totalCOD += parseFloat(order.codAmount) || 0;
        }
    });
    
    csv += '\n';
    csv += 'TỔNG KẾT\n';
    csv += `Tổng số đơn,${total}\n`;
    csv += `Giao thành công,${successful}\n`;
    csv += `Giao thất bại,${failed}\n`;
    csv += `Tỷ lệ thành công,${successRate}%\n`;
    csv += `Tổng COD đã thu,"${formatCurrency(totalCOD)}"\n`;
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Lich_Su_Giao_Hang_${currentDriver.username}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showNotification('Đã xuất báo cáo Excel thành công!', 'success');
}

function printReport() {
    if (filteredHistory.length === 0) {
        showNotification('Không có dữ liệu để in!', 'warning');
        return;
    }
    
    const total = filteredHistory.length;
    const successful = filteredHistory.filter(o => o.status === 'delivered').length;
    const failed = filteredHistory.filter(o => o.status === 'failed').length;
    const successRate = total > 0 ? ((successful / total) * 100).toFixed(1) : 0;
    let totalCOD = 0;
    filteredHistory.forEach(order => {
        if (order.status === 'delivered' && order.codAmount) {
            totalCOD += parseFloat(order.codAmount) || 0;
        }
    });
    
    const printWindow = window.open('', '', 'height=800,width=1000');
    printWindow.document.write(`
        <html>
        <head>
            <title>Báo cáo lịch sử giao hàng</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 30px; }
                h1 { text-align: center; color: #2c3e50; margin-bottom: 10px; }
                .header-info { text-align: center; color: #7f8c8d; margin-bottom: 30px; }
                .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
                .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
                .summary-item { text-align: center; }
                .summary-value { font-size: 2rem; font-weight: bold; color: #2c3e50; }
                .summary-label { color: #7f8c8d; font-size: 0.9rem; margin-top: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background: #3498db; color: white; font-weight: 600; }
                tr:nth-child(even) { background: #f8f9fa; }
                .badge { padding: 5px 10px; border-radius: 4px; font-size: 0.85rem; font-weight: 600; }
                .badge-success { background: #27ae60; color: white; }
                .badge-danger { background: #e74c3c; color: white; }
                @media print {
                    body { padding: 20px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <h1>BÁO CÁO LỊCH SỬ GIAO HÀNG</h1>
            <div class="header-info">
                <p><strong>Tài xế:</strong> ${currentDriver.fullname || currentDriver.username}</p>
                <p><strong>Ngày xuất báo cáo:</strong> ${new Date().toLocaleString('vi-VN')}</p>
                <p><strong>Khoảng thời gian:</strong> ${document.getElementById('summary-period').textContent}</p>
            </div>
            
            <div class="summary">
                <h3 style="margin-top: 0;">Tổng kết</h3>
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-value">${total}</div>
                        <div class="summary-label">Tổng đơn hàng</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value" style="color: #27ae60;">${successful}</div>
                        <div class="summary-label">Giao thành công</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value" style="color: #e74c3c;">${failed}</div>
                        <div class="summary-label">Giao thất bại</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value" style="color: #9b59b6;">${successRate}%</div>
                        <div class="summary-label">Tỷ lệ thành công</div>
                    </div>
                </div>
                <div style="margin-top: 20px; text-align: center;">
                    <strong style="font-size: 1.2rem; color: #e74c3c;">Tổng COD đã thu: ${formatCurrency(totalCOD)}</strong>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã đơn</th>
                        <th>Người nhận</th>
                        <th>Địa chỉ</th>
                        <th>COD</th>
                        <th>Trạng thái</th>
                        <th>Ngày giao</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredHistory.map((order, index) => {
                        const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.updatedAt || order.createdAt);
                        const statusBadge = order.status === 'delivered' ? 
                            '<span class="badge badge-success">Đã giao</span>' :
                            '<span class="badge badge-danger">Thất bại</span>';
                        
                        return `
                            <tr>
                                <td>${index + 1}</td>
                                <td><strong>${order.id || order.trackingNumber}</strong></td>
                                <td>${order.receiverName || order.customerName || 'N/A'}</td>
                                <td>${order.receiverAddress || order.deliveryAddress || 'N/A'}</td>
                                <td><strong>${order.codAmount ? formatCurrency(order.codAmount) : '-'}</strong></td>
                                <td>${statusBadge}</td>
                                <td>${deliveredDate.toLocaleDateString('vi-VN')} ${deliveredDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            
            <div style="margin-top: 40px; text-align: center;">
                <button class="no-print" onclick="window.print()" style="padding: 12px 30px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem;">
                    <strong>🖨️ In báo cáo</strong>
                </button>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
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
    notification.style.cssText = 'position:fixed;top:20px;right:20px;background:' + colors[type] + ';color:white;padding:15px 25px;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,0.2);z-index:10000;font-weight:500;display:flex;align-items:center;gap:12px;max-width:400px;animation:slideIn 0.3s ease-out;';
    notification.innerHTML = '<i class="fas fa-' + icons[type] + '" style="font-size:1.3rem;"></i><span>' + message + '</span>';
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(400px)';
        notification.style.transition = 'all 0.3s';
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
    console.log('[Driver History] Auto-refreshing data...');
    const currentScroll = window.scrollY;
    loadAllData();
    window.scrollTo(0, currentScroll);
}, 120000); // Refresh every 2 minutes

if (typeof DataSync !== 'undefined') {
    window.addEventListener('dataSync', function(event) {
        console.log('[Driver History] DataSync event received:', event.detail.key);
        if (event.detail.key === 'orders') {
            loadAllData();
        }
    });
}

window.addEventListener('storage', function(event) {
    if (event.key === 'orders') {
        console.log('[Driver History] Storage event detected');
        loadAllData();
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('orderDetailModal');
    if (event.target === modal) {
        closeOrderModal();
    }
}

console.log('[Driver History] Script loaded successfully');
