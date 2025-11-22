// Check admin access
checkAdminAccess();

// Pagination variables
let currentPage = 1;
let itemsPerPage = 15;
let filteredOrders = [];
let selectedOrders = [];
let sortField = 'date';
let sortDirection = 'desc';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Set default date range FIRST (last 30 days to today)
    const today = new Date();
    const last30Days = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const dateToInput = document.getElementById('dateTo');
    const dateFromInput = document.getElementById('dateFrom');
    
    if (dateToInput) dateToInput.valueAsDate = today;
    if (dateFromInput) dateFromInput.valueAsDate = last30Days;
    
    // Then load data
    loadOrders(); // Load data first from localStorage
    loadDriversFilter(); // Then load filters
    updateStatsCards();
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterOrders, 300));
    }
    
    console.log('Page initialized. Total orders:', orders.length);
});

// Update stats cards
function updateStatsCards() {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const deliveringOrders = orders.filter(o => o.status === 'delivering' || o.status === 'picking').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    
    document.getElementById('totalOrdersCount').textContent = totalOrders;
    document.getElementById('pendingOrdersCount').textContent = pendingOrders;
    document.getElementById('deliveringOrdersCount').textContent = deliveringOrders;
    document.getElementById('deliveredOrdersCount').textContent = deliveredOrders;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load drivers for filter
function loadDriversFilter() {
    const driverFilter = document.getElementById('driverFilter');
    drivers.forEach(driver => {
        const option = document.createElement('option');
        option.value = driver.id;
        option.textContent = driver.name;
        driverFilter.appendChild(option);
    });
}

// Load orders from localStorage
function loadOrders() {
    // Re-sync with localStorage in case data was updated
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
        try {
            const parsedOrders = JSON.parse(savedOrders);
            // Only update if we have data in localStorage
            if (parsedOrders && parsedOrders.length > 0) {
                orders.length = 0; // Clear existing array
                orders.push(...parsedOrders); // Add all items from localStorage
            }
        } catch (e) {
            console.error('Error loading orders from localStorage:', e);
        }
    }
    
    // Re-sync drivers too
    const savedDrivers = localStorage.getItem('drivers');
    if (savedDrivers) {
        try {
            const parsedDrivers = JSON.parse(savedDrivers);
            if (parsedDrivers && parsedDrivers.length > 0) {
                drivers.length = 0;
                drivers.push(...parsedDrivers);
            }
        } catch (e) {
            console.error('Error loading drivers from localStorage:', e);
        }
    }
    
    filteredOrders = [...orders];
    filterOrders();
}

// Filter orders
function filterOrders() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const driverFilter = document.getElementById('driverFilter').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    console.log('Filtering orders. Total orders:', orders.length);
    
    filteredOrders = orders.filter(order => {
        // Search filter
        const matchSearch = !searchText || 
            order.id.toLowerCase().includes(searchText) ||
            order.customerName.toLowerCase().includes(searchText) ||
            order.customerPhone.includes(searchText) ||
            order.pickupAddress.toLowerCase().includes(searchText) ||
            order.deliveryAddress.toLowerCase().includes(searchText);
        
        // Status filter
        const matchStatus = !statusFilter || order.status === statusFilter;
        
        // Driver filter
        let matchDriver = true;
        if (driverFilter === 'unassigned') {
            matchDriver = !order.driverId;
        } else if (driverFilter) {
            matchDriver = order.driverId === driverFilter;
        }
        
        // Date filter
        let matchDate = true;
        if (dateFrom || dateTo) {
            const orderDate = new Date(order.createdAt);
            if (dateFrom) {
                matchDate = matchDate && orderDate >= new Date(dateFrom);
            }
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59);
                matchDate = matchDate && orderDate <= toDate;
            }
        }
        
        return matchSearch && matchStatus && matchDriver && matchDate;
    });
    
    console.log('Filtered orders:', filteredOrders.length);
    
    // Sort orders
    sortOrders();
    
    // Reset to first page
    currentPage = 1;
    renderOrders();
    updatePagination();
}

// Sort orders
function sortBy(field) {
    if (sortField === field) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortField = field;
        sortDirection = 'asc';
    }
    sortOrders();
    renderOrders();
}

function sortOrders() {
    filteredOrders.sort((a, b) => {
        let aVal, bVal;
        
        switch(sortField) {
            case 'id':
                aVal = a.id;
                bVal = b.id;
                break;
            case 'customer':
                aVal = a.customerName;
                bVal = b.customerName;
                break;
            case 'pickup':
                aVal = a.pickupAddress;
                bVal = b.pickupAddress;
                break;
            case 'delivery':
                aVal = a.deliveryAddress;
                bVal = b.deliveryAddress;
                break;
            case 'driver':
                aVal = a.driverId || 'zzz';
                bVal = b.driverId || 'zzz';
                break;
            case 'cod':
                aVal = a.codAmount || 0;
                bVal = b.codAmount || 0;
                break;
            case 'status':
                aVal = a.status;
                bVal = b.status;
                break;
            case 'date':
                aVal = new Date(a.createdAt);
                bVal = new Date(b.createdAt);
                break;
            default:
                return 0;
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

// Reset filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('driverFilter').value = '';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    filterOrders();
}

// Render orders
function renderOrders() {
    const tbody = document.getElementById('ordersTableBody');
    
    if (!tbody) {
        console.error('ERROR: ordersTableBody element not found!');
        return;
    }
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageOrders = filteredOrders.slice(start, end);
    
    console.log('=== RENDER ORDERS ===');
    console.log('Current page:', currentPage);
    console.log('Items per page:', itemsPerPage);
    console.log('Total filtered orders:', filteredOrders.length);
    console.log('Page orders (showing):', pageOrders.length);
    console.log('Orders data:', pageOrders);
    
    if (pageOrders.length === 0) {
        console.log('No orders to display, showing empty message');
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 10px; display: block;"></i>
                    Không tìm thấy đơn hàng nào
                </td>
            </tr>
        `;
        return;
    }
    
    console.log('Generating HTML for', pageOrders.length, 'orders...');
    
    try {
        const htmlContent = pageOrders.map(order => {
            const driver = drivers.find(d => d.id === order.driverId);
            const statusClass = getStatusClass(order.status);
            const statusText = getStatusText(order.status);
            
            // Xác định các actions khả dụng theo trạng thái và quy trình nghiệp vụ
            let actions = '';
            
            // === QUY TRÌNH NGHIỆP VỤ LOGISTICS ===
            
            // 1. PENDING - Đơn hàng mới tạo, chờ phân tài xế
            if (order.status === 'pending') {
                if (!order.driverId) {
                    actions += `<button class="btn btn-sm btn-success" onclick="openAssignDriverModal('${order.id}')" title="Phân tài xế">
                        <i class="fas fa-user-plus"></i> Phân TX
                    </button>`;
                }
                actions += `<button class="btn btn-sm btn-secondary" onclick="editOrder('${order.id}')" title="Sửa đơn hàng">
                    <i class="fas fa-edit"></i>
                </button>`;
                actions += `<button class="btn btn-sm btn-danger" onclick="cancelOrder('${order.id}')" title="Hủy đơn">
                    <i class="fas fa-times"></i>
                </button>`;
            }
            
            // 2. ASSIGNED - Đã phân tài xế, chờ tài xế đi lấy hàng
            else if (order.status === 'assigned') {
                actions += `<button class="btn btn-sm btn-primary" onclick="confirmPickup('${order.id}')" title="Xác nhận tài xế đang đi lấy hàng">
                    <i class="fas fa-box-open"></i> Lấy hàng
                </button>`;
                actions += `<button class="btn btn-sm btn-warning" onclick="changeDriver('${order.id}')" title="Đổi tài xế">
                    <i class="fas fa-exchange-alt"></i>
                </button>`;
                actions += `<button class="btn btn-sm btn-danger" onclick="cancelOrder('${order.id}')" title="Hủy đơn">
                    <i class="fas fa-times"></i>
                </button>`;
            }
            
            // 3. PICKING - Tài xế đang đi lấy hàng
            else if (order.status === 'picking') {
                actions += `<button class="btn btn-sm btn-success" onclick="confirmPickedUp('${order.id}')" title="Xác nhận đã lấy hàng, bắt đầu giao">
                    <i class="fas fa-check-circle"></i> Đã lấy
                </button>`;
                actions += `<button class="btn btn-sm btn-warning" onclick="contactCustomer('${order.senderPhone || order.customerPhone}')" title="Gọi người gửi">
                    <i class="fas fa-phone"></i>
                </button>`;
                actions += `<button class="btn btn-sm btn-danger" onclick="failedPickup('${order.id}')" title="Không lấy được hàng">
                    <i class="fas fa-exclamation-triangle"></i>
                </button>`;
            }
            
            // 4. DELIVERING - Đang giao hàng cho người nhận
            else if (order.status === 'delivering') {
                actions += `<button class="btn btn-sm btn-success" onclick="confirmDelivered('${order.id}')" title="Xác nhận giao hàng thành công">
                    <i class="fas fa-check-double"></i> Hoàn thành
                </button>`;
                actions += `<button class="btn btn-sm btn-warning" onclick="contactCustomer('${order.receiverPhone}')" title="Gọi người nhận">
                    <i class="fas fa-phone"></i>
                </button>`;
                actions += `<button class="btn btn-sm btn-danger" onclick="failedDelivery('${order.id}')" title="Giao hàng thất bại">
                    <i class="fas fa-times-circle"></i>
                </button>`;
            }
            
            // 5. DELIVERED - Đã giao thành công
            else if (order.status === 'delivered') {
                actions += `<button class="btn btn-sm btn-secondary" onclick="printOrder('${order.id}')" title="In phiếu giao hàng">
                    <i class="fas fa-print"></i>
                </button>`;
                // Chỉ hiển thị nút xác nhận COD nếu có COD và CHƯA thu
                if (order.paymentMethod === 'cod' && order.codAmount > 0 && !order.codCollected) {
                    actions += `<button class="btn btn-sm btn-success" onclick="confirmCODCollected('${order.id}')" title="Xác nhận đã thu COD">
                        <i class="fas fa-money-bill-wave"></i> Thu COD
                    </button>`;
                }
            }
            
            // 6. CANCELLED hoặc FAILED
            else if (order.status === 'cancelled' || order.status === 'failed') {
                if (order.status === 'failed') {
                    actions += `<button class="btn btn-sm btn-primary" onclick="retryDelivery('${order.id}')" title="Giao lại">
                        <i class="fas fa-redo"></i>
                    </button>`;
                }
            }
            
            // Action xem chi tiết - luôn có
            actions += `<button class="btn btn-sm btn-info" onclick="viewOrderDetail('${order.id}')" title="Xem chi tiết đơn hàng">
                <i class="fas fa-info-circle"></i>
            </button>`;
            
            // Action xóa đơn hàng - chỉ cho đơn đã hoàn thành, hủy hoặc thất bại
            if (order.status === 'delivered' || order.status === 'cancelled' || order.status === 'failed') {
                actions += `<button class="btn btn-sm btn-danger" onclick="deleteOrder('${order.id}')" title="Xóa đơn hàng">
                    <i class="fas fa-trash"></i>
                </button>`;
            }
        
        return `
            <tr>
                <td><input type="checkbox" class="order-checkbox" value="${order.id}" onchange="updateSelection()"></td>
                <td><strong>${order.id}</strong></td>
                <td>
                    <div style="font-weight: 500;">${order.customerName}</div>
                    <small style="color: #999;"><i class="fas fa-phone"></i> ${order.customerPhone}</small>
                </td>
                <td>
                    <small title="${order.pickupAddress}">${truncateAddress(order.pickupAddress, 30)}</small>
                    ${order.senderName ? `<div style="color: #999; font-size: 0.8rem;"><i class="fas fa-user"></i> ${order.senderName}</div>` : ''}
                </td>
                <td>
                    <small title="${order.deliveryAddress}">${truncateAddress(order.deliveryAddress, 30)}</small>
                    ${order.receiverName ? `<div style="color: #999; font-size: 0.8rem;"><i class="fas fa-user"></i> ${order.receiverName}</div>` : ''}
                </td>
                <td>
                    ${driver ? `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">
                                ${driver.name.substring(0, 2)}
                            </div>
                            <div>
                                <div style="font-weight: 500; font-size: 0.9rem;">${driver.name}</div>
                                <small style="color: #999;">${driver.phone}</small>
                            </div>
                        </div>
                    ` : '<span class="badge badge-warning">Chưa phân</span>'}
                </td>
                <td>
                    <strong style="color: ${order.codAmount > 0 ? 'var(--danger)' : '#999'};">
                        ${formatMoney(order.codAmount || 0)}
                    </strong>
                    ${order.shippingFee ? `<div style="color: #999; font-size: 0.85rem;">Phí: ${formatMoney(order.shippingFee)}</div>` : ''}
                </td>
                <td>
                    <span class="badge ${statusClass}">${statusText}</span>
                    ${order.timeline && order.timeline.length > 0 ? `
                        <div style="color: #999; font-size: 0.75rem; margin-top: 3px;">
                            ${formatDateTime(order.timeline[order.timeline.length - 1].time)}
                        </div>
                    ` : ''}
                </td>
                <td>
                    <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                        ${actions}
                    </div>
                </td>
            </tr>
        `;
        }).join('');
        
        console.log('HTML generated successfully, length:', htmlContent.length, 'characters');
        tbody.innerHTML = htmlContent;
        console.log('tbody.innerHTML set successfully');
        
    } catch (error) {
        console.error('ERROR rendering orders:', error);
        console.error('Error stack:', error.stack);
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 40px; color: #f44336;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 10px; display: block;"></i>
                    <strong>Lỗi hiển thị dữ liệu</strong><br>
                    <small>${error.message}</small>
                </td>
            </tr>
        `;
    }
}

// Truncate address
function truncateAddress(address, maxLength = 40) {
    if (!address) return 'N/A';
    return address.length > maxLength ? address.substring(0, maxLength) + '...' : address;
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    document.getElementById('pageInfo').textContent = `Trang ${currentPage} / ${totalPages || 1}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage >= totalPages;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderOrders();
        updatePagination();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderOrders();
        updatePagination();
    }
}

// Selection functions
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.order-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
    updateSelection();
}

function updateSelection() {
    selectedOrders = Array.from(document.querySelectorAll('.order-checkbox:checked')).map(cb => cb.value);
    const bulkActions = document.getElementById('bulkActions');
    const selectedCount = document.getElementById('selectedCount');
    
    if (selectedOrders.length > 0) {
        bulkActions.style.display = 'flex';
        selectedCount.textContent = `${selectedOrders.length} đơn hàng được chọn`;
    } else {
        bulkActions.style.display = 'none';
    }
}

// Create order modal
function openCreateOrderModal() {
    document.getElementById('createOrderModal').style.display = 'flex';
    document.getElementById('createOrderForm').reset();
}

function closeCreateOrderModal() {
    document.getElementById('createOrderModal').style.display = 'none';
}

function createOrder(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const newOrder = {
        id: 'ORD' + Date.now(),
        customerName: formData.get('customerName') || '',
        customerPhone: formData.get('customerPhone') || '',
        pickupAddress: formData.get('pickupAddress') || '',
        senderName: formData.get('senderName') || formData.get('customerName') || '',
        senderPhone: formData.get('senderPhone') || formData.get('customerPhone') || '',
        deliveryAddress: formData.get('deliveryAddress') || '',
        receiverName: formData.get('receiverName') || formData.get('customerName') || '',
        receiverPhone: formData.get('receiverPhone') || '',
        itemType: formData.get('itemType') || 'other',
        weight: parseFloat(formData.get('weight')) || 0,
        paymentMethod: formData.get('paymentMethod') || 'cash',
        codAmount: parseInt(formData.get('codAmount')) || 0,
        shippingFee: parseInt(formData.get('shippingFee')) || 0,
        notes: formData.get('notes') || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [
            {
                status: 'pending',
                time: new Date().toISOString(),
                description: 'Đơn hàng đã được tạo'
            }
        ]
    };
    
    console.log('Creating new order:', newOrder);
    
    // Add to beginning of array
    orders.unshift(newOrder);
    console.log('Total orders after adding:', orders.length);
    
    // Save to localStorage immediately
    saveOrdersToStorage();
    console.log('Order saved to localStorage');
    
    // Close modal and reset form
    closeCreateOrderModal();
    form.reset();
    
    // Reload and refresh display
    loadOrders();
    updateStatsCards();
    
    console.log('Display refreshed. Total orders now:', orders.length);
    
    // Show success message
    showNotification('Tạo đơn hàng thành công! Mã đơn: ' + newOrder.id, 'success');
}

// Assign driver modal
let currentAssignOrderId = null;

function openAssignDriverModal(orderId) {
    currentAssignOrderId = orderId;
    const modal = document.getElementById('assignDriverModal');
    const driversList = document.getElementById('driversList');
    
    // Filter available drivers
    const availableDrivers = drivers.filter(d => d.status === 'active');
    
    driversList.innerHTML = availableDrivers.map(driver => `
        <div class="driver-card" onclick="assignDriverToOrder('${driver.id}')">
            <div class="driver-avatar">${driver.name.substring(0, 2)}</div>
            <div class="driver-info">
                <strong>${driver.name}</strong>
                <p><i class="fas fa-phone"></i> ${driver.phone}</p>
                <p><i class="fas fa-motorcycle"></i> ${driver.vehicle}</p>
                <p><i class="fas fa-star"></i> ${driver.rating} sao</p>
                <p><i class="fas fa-box"></i> ${driver.currentOrders} đơn đang giao</p>
            </div>
            <button class="btn-primary">Chọn</button>
        </div>
    `).join('');
    
    modal.style.display = 'flex';
}

function closeAssignModal() {
    document.getElementById('assignDriverModal').style.display = 'none';
    currentAssignOrderId = null;
}

function assignDriverToOrder(driverId) {
    if (!currentAssignOrderId) return;
    
    const order = orders.find(o => o.id === currentAssignOrderId);
    const driver = drivers.find(d => d.id === driverId);
    
    if (order && driver) {
        // Update multiple driver fields for compatibility with driver dashboard
        order.driverId = driverId;
        order.driver = driver.name;
        order.assignedDriver = driver.name;
        order.driverEmail = driver.email || '';
        order.assignedDriverEmail = driver.email || '';
        order.driverPhone = driver.phone || driver.phoneNumber || '';
        
        order.status = 'assigned';
        order.assignedAt = new Date().toISOString();
        order.timeline.push({
            status: 'assigned',
            time: new Date().toISOString(),
            description: `Đã phân cho tài xế ${driver.name}`
        });
        
        driver.currentOrders++;
        
        saveOrdersToStorage();
        saveDriversToStorage();
        
        // Trigger DataSync event if available
        if (typeof DataSync !== 'undefined') {
            DataSync.set('orders', orders);
            DataSync.triggerSync('orders');
        }
        
        closeAssignModal();
        filterOrders();
        updateStatsCards();
        
        console.log('[Admin Orders] Assigned order to driver:', {
            orderId: order.id,
            driverId: driver.id,
            driverName: driver.name,
            driverEmail: driver.email
        });
        
        showNotification('success', `Đã phân đơn hàng ${order.id} cho tài xế ${driver.name}`);
    }
}

// Bulk actions
function bulkAssignDriver() {
    if (selectedOrders.length === 0) return;
    
    const driverId = prompt('Nhập ID tài xế:');
    if (!driverId) return;
    
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) {
        showNotification('error', 'Không tìm thấy tài xế!');
        return;
    }
    
    let count = 0;
    selectedOrders.forEach(orderId => {
        const order = orders.find(o => o.id === orderId);
        if (order && !order.driverId && order.status === 'pending') {
            order.driverId = driverId;
            order.status = 'assigned';
            order.timeline.push({
                status: 'assigned',
                time: new Date().toISOString(),
                description: `Đã phân cho tài xế ${driver.name}`
            });
            count++;
        }
    });
    
    driver.currentOrders += count;
    
    saveOrdersToStorage();
    saveDriversToStorage();
    selectedOrders = [];
    document.getElementById('selectAll').checked = false;
    filterOrders();
    updateStatsCards();
    
    showNotification('success', `Đã phân ${count} đơn hàng cho tài xế ${driver.name}`);
}

function bulkExport() {
    if (selectedOrders.length === 0) return;
    
    const exportData = orders
        .filter(o => selectedOrders.includes(o.id))
        .map(o => {
            const driver = drivers.find(d => d.id === o.driverId);
            return {
                'Mã đơn': o.id,
                'Khách hàng': o.customerName,
                'SĐT': o.customerPhone,
                'Điểm lấy': o.pickupAddress,
                'Điểm giao': o.deliveryAddress,
                'Tài xế': driver ? driver.name : 'Chưa phân',
                'COD': o.codAmount || 0,
                'Phí ship': o.shippingFee,
                'Trạng thái': getStatusText(o.status),
                'Ngày tạo': formatDateTime(o.createdAt)
            };
        });
    
    // Simple CSV export
    const headers = Object.keys(exportData[0]);
    const csv = [
        headers.join(','),
        ...exportData.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${Date.now()}.csv`;
    link.click();
    
    showNotification('success', `Đã xuất ${selectedOrders.length} đơn hàng`);
}

function bulkCancel() {
    if (selectedOrders.length === 0) return;
    
    if (!confirm(`Bạn có chắc muốn hủy ${selectedOrders.length} đơn hàng?`)) return;
    
    let count = 0;
    selectedOrders.forEach(orderId => {
        const order = orders.find(o => o.id === orderId);
        if (order && order.status === 'pending') {
            order.status = 'cancelled';
            order.timeline.push({
                status: 'cancelled',
                time: new Date().toISOString(),
                description: 'Đơn hàng đã bị hủy bởi admin'
            });
            count++;
        }
    });
    
    saveOrdersToStorage();
    selectedOrders = [];
    document.getElementById('selectAll').checked = false;
    filterOrders();
    updateStatsCards();
    
    showNotification('success', `Đã hủy ${count} đơn hàng`);
}

// Cancel single order
function cancelOrder(orderId) {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const reason = prompt('Lý do hủy đơn:', 'Khách hàng yêu cầu hủy');
        if (!reason) return;
        
        order.status = 'cancelled';
        order.cancelReason = reason;
        order.cancelledAt = new Date().toISOString();
        order.timeline.push({
            status: 'cancelled',
            time: new Date().toISOString(),
            description: `Đơn hàng đã bị hủy. Lý do: ${reason}`
        });
        
        // Giảm số đơn của tài xế nếu đã phân
        if (order.driverId) {
            const driver = drivers.find(d => d.id === order.driverId);
            if (driver && driver.currentOrders > 0) {
                driver.currentOrders--;
                saveDriversToStorage();
            }
        }
        
        saveOrdersToStorage();
        filterOrders();
        updateStatsCards();
        showNotification('Đã hủy đơn hàng', 'success');
    }
}

// Delete order permanently
function deleteOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Không tìm thấy đơn hàng', 'error');
        return;
    }
    
    // Hiển thị thông tin đơn hàng và yêu cầu xác nhận
    const confirmMessage = `⚠️ BẠN ĐANG XÓA VĨNH VIỄN ĐỠN HÀNG\n\n` +
                          `Mã đơn: ${order.id}\n` +
                          `Khách hàng: ${order.customerName}\n` +
                          `Trạng thái: ${getStatusText(order.status)}\n\n` +
                          `Hành động này KHÔNG THỂ HOÀN TÁC!\n` +
                          `Bạn có chắc chắn muốn xóa?`;
    
    if (!confirm(confirmMessage)) return;
    
    // Yêu cầu xác nhận lần 2 để tránh xóa nhầm
    if (!confirm('Xác nhận lần cuối: Xóa đơn hàng này?')) return;
    
    // Giảm số đơn của tài xế nếu đơn đã được phân
    if (order.driverId) {
        const driver = drivers.find(d => d.id === order.driverId);
        if (driver && driver.currentOrders > 0) {
            driver.currentOrders--;
            saveDriversToStorage();
            console.log(`Decreased currentOrders for driver ${driver.name} to ${driver.currentOrders}`);
        }
    }
    
    // Xóa đơn hàng khỏi mảng
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
        orders.splice(index, 1);
        console.log(`Deleted order ${orderId}, remaining orders: ${orders.length}`);
        
        // Lưu vào localStorage
        saveOrdersToStorage();
        
        // Reload và cập nhật giao diện
        loadOrders();
        updateStatsCards();
        
        showNotification(`Đã xóa đơn hàng ${orderId}`, 'success');
    } else {
        console.error('Order not found in array:', orderId);
        showNotification('Lỗi khi xóa đơn hàng', 'error');
    }
}

// Change driver
function changeDriver(orderId) {
    currentAssignOrderId = orderId;
    const order = orders.find(o => o.id === orderId);
    const oldDriver = drivers.find(d => d.id === order.driverId);
    
    if (confirm(`Đơn hàng hiện tại được phân cho tài xế ${oldDriver ? oldDriver.name : 'N/A'}. Bạn muốn đổi tài xế?`)) {
        openAssignDriverModal(orderId);
    }
}

// ========== QUY TRÌNH NGHIỆP VỤ - WORKFLOW FUNCTIONS ==========

// 1. Xác nhận tài xế đang đi lấy hàng (Assigned → Picking)
function confirmPickup(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    if (confirm(`Xác nhận tài xế đang đi lấy hàng cho đơn ${order.id}?`)) {
        order.status = 'picking';
        order.timeline.push({
            status: 'picking',
            time: new Date().toISOString(),
            description: 'Tài xế đang đi lấy hàng'
        });
        
        saveOrdersToStorage();
        loadOrders();
        updateStatsCards();
        showNotification('success', `Đơn ${order.id} đang được lấy hàng`);
    }
}

// 2. Xác nhận đã lấy hàng thành công (Picking → Delivering)
function confirmPickedUp(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    if (confirm(`Xác nhận đã lấy hàng thành công và bắt đầu giao cho đơn ${order.id}?`)) {
        order.status = 'delivering';
        order.pickedUpAt = new Date().toISOString();
        order.timeline.push({
            status: 'delivering',
            time: new Date().toISOString(),
            description: 'Đã lấy hàng thành công, đang giao cho người nhận'
        });
        
        saveOrdersToStorage();
        loadOrders();
        updateStatsCards();
        showNotification('success', `Đơn ${order.id} đang trên đường giao`);
    }
}

// 3. Xác nhận giao hàng thành công (Delivering → Delivered)
function confirmDelivered(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const customerName = prompt('Tên người nhận (để xác nhận):', order.receiverName || order.customerName);
    if (!customerName) return;
    
    order.status = 'delivered';
    order.deliveredAt = new Date().toISOString();
    order.receivedBy = customerName;
    order.timeline.push({
        status: 'delivered',
        time: new Date().toISOString(),
        description: `Giao hàng thành công. Người nhận: ${customerName}`
    });
    
    // KHÔNG tự động thu COD - phải xác nhận thủ công
    // Đơn COD sẽ ở trạng thái "Cần thu" sau khi giao hàng thành công
    if (order.paymentMethod === 'cod' && order.codAmount > 0) {
        console.log(`Order ${order.id} delivered. COD status: pending_collection (needs manual confirmation)`);
    }
    
    // Giảm số đơn đang giao của tài xế
    const driver = drivers.find(d => d.id === order.driverId);
    if (driver && driver.currentOrders > 0) {
        driver.currentOrders--;
        saveDriversToStorage();
    }
    
    saveOrdersToStorage();
    loadOrders();
    updateStatsCards();
    
    // Thông báo với gợi ý thu COD nếu là đơn COD
    if (order.paymentMethod === 'cod' && order.codAmount > 0) {
        showNotification(`Giao hàng thành công đơn ${order.id}. Nhớ xác nhận thu COD: ${formatMoney(order.codAmount)}`, 'success');
    } else {
        showNotification(`Giao hàng thành công đơn ${order.id}`, 'success');
    }
}

// 4. Lấy hàng thất bại (Picking → Failed)
function failedPickup(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const reason = prompt('Lý do không lấy được hàng:', 'Người gửi không có mặt');
    if (!reason) return;
    
    order.status = 'failed';
    order.failReason = reason;
    order.failedAt = new Date().toISOString();
    order.timeline.push({
        status: 'failed',
        time: new Date().toISOString(),
        description: `Không lấy được hàng. Lý do: ${reason}`
    });
    
    // Giảm số đơn đang giao của tài xế
    const driver = drivers.find(d => d.id === order.driverId);
    if (driver && driver.currentOrders > 0) {
        driver.currentOrders--;
        saveDriversToStorage();
    }
    
    saveOrdersToStorage();
    loadOrders();
    updateStatsCards();
    showNotification('error', `Đơn ${order.id} không lấy được hàng`);
}

// 5. Giao hàng thất bại (Delivering → Failed)
function failedDelivery(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const reason = prompt('Lý do giao hàng thất bại:', 'Người nhận không có mặt / Không nghe máy');
    if (!reason) return;
    
    order.status = 'failed';
    order.failReason = reason;
    order.failedAt = new Date().toISOString();
    order.timeline.push({
        status: 'failed',
        time: new Date().toISOString(),
        description: `Giao hàng thất bại. Lý do: ${reason}`
    });
    
    // Giảm số đơn đang giao của tài xế
    const driver = drivers.find(d => d.id === order.driverId);
    if (driver && driver.currentOrders > 0) {
        driver.currentOrders--;
        saveDriversToStorage();
    }
    
    saveOrdersToStorage();
    loadOrders();
    updateStatsCards();
    showNotification('error', `Giao hàng thất bại đơn ${order.id}`);
}

// 6. Giao lại đơn hàng (Failed → Assigned)
function retryDelivery(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    if (confirm(`Giao lại đơn hàng ${order.id}?`)) {
        // Nếu chưa có tài xế, yêu cầu phân lại
        if (!order.driverId) {
            showNotification('warning', 'Vui lòng phân tài xế cho đơn hàng');
            openAssignDriverModal(orderId);
        } else {
            order.status = 'assigned';
            order.timeline.push({
                status: 'assigned',
                time: new Date().toISOString(),
                description: 'Đơn hàng được giao lại'
            });
            
            // Tăng số đơn của tài xế
            const driver = drivers.find(d => d.id === order.driverId);
            if (driver) {
                driver.currentOrders++;
                saveDriversToStorage();
            }
            
            saveOrdersToStorage();
            loadOrders();
            updateStatsCards();
            showNotification('success', `Đơn ${order.id} được giao lại`);
        }
    }
}

// 7. Xác nhận đã thu COD
function confirmCODCollected(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    if (order.codCollected) {
        showNotification('COD đã được xác nhận thu trước đó', 'info');
        return;
    }
    
    if (confirm(`Xác nhận đã thu COD ${formatMoney(order.codAmount)} cho đơn ${order.id}?`)) {
        order.codCollected = true;
        order.codCollectedDate = new Date().toISOString();
        order.timeline.push({
            status: 'cod_collected',
            time: new Date().toISOString(),
            description: `Đã xác nhận thu COD: ${formatMoney(order.codAmount)}`
        });
        
        saveOrdersToStorage();
        loadOrders();
        showNotification(`Đã xác nhận thu COD đơn ${order.id}`, 'success');
    }
}

// ==========================================================

// Edit order
function editOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Populate form với dữ liệu hiện tại
    document.querySelector('[name="customerName"]').value = order.customerName;
    document.querySelector('[name="customerPhone"]').value = order.customerPhone;
    document.querySelector('[name="pickupAddress"]').value = order.pickupAddress;
    document.querySelector('[name="senderName"]').value = order.senderName || '';
    document.querySelector('[name="senderPhone"]').value = order.senderPhone || '';
    document.querySelector('[name="deliveryAddress"]').value = order.deliveryAddress;
    document.querySelector('[name="receiverName"]').value = order.receiverName || '';
    document.querySelector('[name="receiverPhone"]').value = order.receiverPhone || '';
    document.querySelector('[name="itemType"]').value = order.itemType || 'other';
    document.querySelector('[name="weight"]').value = order.weight || '';
    document.querySelector('[name="codAmount"]').value = order.codAmount || '';
    document.querySelector('[name="shippingFee"]').value = order.shippingFee || '';
    document.querySelector('[name="notes"]').value = order.notes || '';
    
    // Thay đổi title và button
    document.querySelector('#createOrderModal .modal-header h3').innerHTML = '<i class="fas fa-edit"></i> Cập nhật đơn hàng';
    
    // Thay đổi submit handler
    const form = document.getElementById('createOrderForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        updateOrder(orderId, e);
    };
    
    openCreateOrderModal();
}

// Update order
function updateOrder(orderId, event) {
    const form = event.target;
    const formData = new FormData(form);
    
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Lưu lại các thông tin cũ để ghi log
    const oldData = { ...order };
    
    // Cập nhật thông tin
    order.customerName = formData.get('customerName');
    order.customerPhone = formData.get('customerPhone');
    order.pickupAddress = formData.get('pickupAddress');
    order.senderName = formData.get('senderName') || order.customerName;
    order.senderPhone = formData.get('senderPhone') || order.customerPhone;
    order.deliveryAddress = formData.get('deliveryAddress');
    order.receiverName = formData.get('receiverName') || order.customerName;
    order.receiverPhone = formData.get('receiverPhone');
    order.itemType = formData.get('itemType');
    order.weight = parseFloat(formData.get('weight')) || 0;
    order.codAmount = parseInt(formData.get('codAmount')) || 0;
    order.shippingFee = parseInt(formData.get('shippingFee'));
    order.notes = formData.get('notes');
    order.updatedAt = new Date().toISOString();
    
    // Ghi log thay đổi
    order.timeline.push({
        status: order.status,
        time: new Date().toISOString(),
        description: 'Đơn hàng đã được cập nhật bởi Admin'
    });
    
    saveOrdersToStorage();
    closeCreateOrderModal();
    filterOrders();
    updateStatsCards();
    
    // Reset form
    form.onsubmit = createOrder;
    document.querySelector('#createOrderModal .modal-header h3').innerHTML = '<i class="fas fa-plus"></i> Tạo đơn hàng mới';
    
    showNotification('success', 'Cập nhật đơn hàng thành công!');
}

// Contact customer
function contactCustomer(phone) {
    if (confirm(`Gọi cho khách hàng: ${phone}?`)) {
        // Trong thực tế, có thể tích hợp với hệ thống gọi điện
        window.open(`tel:${phone}`);
    }
}

// Print order slip - Enhanced
function printOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const driver = drivers.find(d => d.id === order.driverId);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Phiếu giao hàng - ${order.id}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    font-size: 14px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #000;
                    padding-bottom: 15px;
                }
                .header h1 {
                    font-size: 24px;
                    margin-bottom: 5px;
                }
                .header p {
                    color: #666;
                }
                .order-id {
                    background: #000;
                    color: white;
                    padding: 10px;
                    text-align: center;
                    font-size: 18px;
                    font-weight: bold;
                    margin: 20px 0;
                }
                .section {
                    margin: 20px 0;
                    border: 2px solid #000;
                    padding: 15px;
                }
                .section-title {
                    font-weight: bold;
                    font-size: 16px;
                    margin-bottom: 10px;
                    background: #f0f0f0;
                    padding: 8px;
                    border-left: 4px solid #000;
                }
                .info-row {
                    display: flex;
                    margin: 8px 0;
                    padding: 5px 0;
                    border-bottom: 1px dashed #ddd;
                }
                .info-label {
                    font-weight: bold;
                    width: 150px;
                    flex-shrink: 0;
                }
                .info-value {
                    flex: 1;
                }
                .cod-section {
                    background: #fff3cd;
                    border: 3px solid #ff6b6b;
                    padding: 15px;
                    margin: 20px 0;
                    text-align: center;
                }
                .cod-amount {
                    font-size: 28px;
                    font-weight: bold;
                    color: #ff6b6b;
                    margin: 10px 0;
                }
                .signature-section {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 40px;
                }
                .signature-box {
                    text-align: center;
                    width: 45%;
                }
                .signature-box p {
                    margin-bottom: 60px;
                    font-weight: bold;
                }
                .barcode {
                    text-align: center;
                    margin: 20px 0;
                    font-family: 'Courier New', monospace;
                    font-size: 24px;
                    letter-spacing: 2px;
                }
                @media print {
                    body { padding: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>LOGISTICS MANAGER</h1>
                <p>Hệ thống quản lý vận chuyển</p>
                <p>Hotline: 1900-xxxx | Email: support@logistics.vn</p>
            </div>
            
            <div class="order-id">MÃ ĐƠN HÀNG: ${order.id}</div>
            
            <div class="barcode">||||| ${order.id} |||||</div>
            
            <div class="section">
                <div class="section-title">🏠 THÔNG TIN LẤY HÀNG</div>
                <div class="info-row">
                    <div class="info-label">Người gửi:</div>
                    <div class="info-value">${order.senderName || order.customerName}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Số điện thoại:</div>
                    <div class="info-value">${order.senderPhone || order.customerPhone}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Địa chỉ:</div>
                    <div class="info-value"><strong>${order.pickupAddress}</strong></div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">📍 THÔNG TIN GIAO HÀNG</div>
                <div class="info-row">
                    <div class="info-label">Người nhận:</div>
                    <div class="info-value"><strong>${order.receiverName || order.customerName}</strong></div>
                </div>
                <div class="info-row">
                    <div class="info-label">Số điện thoại:</div>
                    <div class="info-value"><strong>${order.receiverPhone || order.customerPhone}</strong></div>
                </div>
                <div class="info-row">
                    <div class="info-label">Địa chỉ:</div>
                    <div class="info-value"><strong>${order.deliveryAddress}</strong></div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">📦 THÔNG TIN HÀNG HÓA</div>
                <div class="info-row">
                    <div class="info-label">Loại hàng:</div>
                    <div class="info-value">${order.itemType || 'Không xác định'}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Khối lượng:</div>
                    <div class="info-value">${order.weight || 0} kg</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Phí vận chuyển:</div>
                    <div class="info-value">${formatMoney(order.shippingFee || 0)}</div>
                </div>
                ${order.notes ? `
                <div class="info-row">
                    <div class="info-label">Ghi chú:</div>
                    <div class="info-value">${order.notes}</div>
                </div>
                ` : ''}
            </div>
            
            ${order.codAmount > 0 ? `
            <div class="cod-section">
                <div style="font-size: 18px; font-weight: bold;">💰 TIỀN THU HỘ (COD)</div>
                <div class="cod-amount">${formatMoney(order.codAmount)}</div>
                <div style="font-size: 12px; color: #666;">
                    Bằng chữ: ${numberToWords(order.codAmount)} đồng
                </div>
            </div>
            ` : ''}
            
            ${driver ? `
            <div class="section">
                <div class="section-title">🚚 THÔNG TIN TÀI XẾ</div>
                <div class="info-row">
                    <div class="info-label">Tên tài xế:</div>
                    <div class="info-value">${driver.name}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Số điện thoại:</div>
                    <div class="info-value">${driver.phone}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Biển số xe:</div>
                    <div class="info-value">${driver.vehicle || 'N/A'}</div>
                </div>
            </div>
            ` : ''}
            
            <div class="signature-section">
                <div class="signature-box">
                    <p>Chữ ký người gửi</p>
                    <p style="font-size: 12px;">(Ký và ghi rõ họ tên)</p>
                </div>
                <div class="signature-box">
                    <p>Chữ ký người nhận</p>
                    <p style="font-size: 12px;">(Ký và ghi rõ họ tên)</p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #666;">
                <p>Ngày tạo: ${formatDateTime(order.createdAt)}</p>
                <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
            </div>
            
            <div class="no-print" style="text-align: center; margin-top: 20px;">
                <button onclick="window.print()" style="padding: 10px 30px; font-size: 16px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    In phiếu
                </button>
                <button onclick="window.close()" style="padding: 10px 30px; font-size: 16px; background: #95a5a6; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                    Đóng
                </button>
            </div>
            
            <script>
                function formatMoney(amount) {
                    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
                }
                
                function numberToWords(num) {
                    if (num === 0) return "Không";
                    const ones = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
                    const tens = ["", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];
                    const scales = ["", "nghìn", "triệu", "tỷ"];
                    
                    // Simplified conversion - in production use a proper library
                    let result = num.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, " ");
                    return result;
                }
                
                // Auto print after load
                setTimeout(function() {
                    // window.print();
                }, 500);
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Cancel single order
function cancelOrder(orderId) {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'cancelled';
        order.timeline.push({
            status: 'cancelled',
            time: new Date().toISOString(),
            description: 'Đơn hàng đã bị hủy bởi admin'
        });
        
        saveOrdersToStorage();
        filterOrders();
        updateStatsCards();
        showNotification('success', 'Đã hủy đơn hàng');
    }
}

// Save to storage
function saveOrdersToStorage() {
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Trigger DataSync if available
    if (typeof DataSync !== 'undefined') {
        DataSync.set('orders', orders);
        DataSync.triggerSync('orders');
    }
}

function saveDriversToStorage() {
    localStorage.setItem('drivers', JSON.stringify(drivers));
    
    // Trigger DataSync if available
    if (typeof DataSync !== 'undefined') {
        DataSync.set('drivers', drivers);
        DataSync.triggerSync('drivers');
    }
}

// View order detail - Enhanced
function viewOrderDetail(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const driver = drivers.find(d => d.id === order.driverId);
    
    const content = `
        <div class="order-detail-section">
            <h4><i class="fas fa-info-circle"></i> Thông tin đơn hàng</h4>
            <div class="detail-grid">
                <div>
                    <strong>Mã đơn hàng</strong>
                    <div style="font-size: 1.1rem; color: var(--primary); font-weight: bold; margin-top: 5px;">${order.id}</div>
                </div>
                <div>
                    <strong>Trạng thái</strong>
                    <div style="margin-top: 5px;">
                        <span class="badge ${getStatusClass(order.status)}">${getStatusText(order.status)}</span>
                    </div>
                </div>
                ${order.routeName ? `
                <div>
                    <strong>Tuyến đường</strong>
                    <div style="margin-top: 5px;">
                        <span style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 6px 12px; border-radius: 6px; display: inline-block;">
                            <i class="fas fa-route"></i> ${order.routeName}
                        </span>
                    </div>
                </div>
                ` : ''}
                ${order.deliveryArea ? `
                <div>
                    <strong>Khu vực giao hàng</strong>
                    <div style="margin-top: 5px;">
                        <span style="background: #e3f2fd; color: #1976d2; padding: 6px 12px; border-radius: 6px; display: inline-block; font-weight: 600;">
                            <i class="fas fa-map-marked-alt"></i> ${order.deliveryArea}
                        </span>
                    </div>
                </div>
                ` : ''}
                <div>
                    <strong>Ngày tạo</strong>
                    <div style="margin-top: 5px;">${formatDateTime(order.createdAt)}</div>
                </div>
                ${order.updatedAt ? `
                <div>
                    <strong>Cập nhật lần cuối</strong>
                    <div style="margin-top: 5px;">${formatDateTime(order.updatedAt)}</div>
                </div>
                ` : ''}
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="order-detail-section">
                <h4><i class="fas fa-box-open"></i> Thông tin lấy hàng</h4>
                <div style="padding: 10px 0;">
                    <div style="margin-bottom: 12px;">
                        <strong style="color: #666; font-size: 0.9rem;">Người gửi</strong>
                        <div style="font-size: 1.05rem; margin-top: 3px;">${order.senderName || order.customerName}</div>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <strong style="color: #666; font-size: 0.9rem;">Số điện thoại</strong>
                        <div style="margin-top: 3px;">
                            <a href="tel:${order.senderPhone || order.customerPhone}" style="color: var(--primary); text-decoration: none;">
                                <i class="fas fa-phone"></i> ${order.senderPhone || order.customerPhone}
                            </a>
                        </div>
                    </div>
                    <div>
                        <strong style="color: #666; font-size: 0.9rem;">Địa chỉ lấy hàng</strong>
                        <div style="margin-top: 3px; padding: 8px; background: #f8f9fa; border-left: 3px solid var(--primary); border-radius: 4px;">
                            <i class="fas fa-map-marker-alt"></i> ${order.pickupAddress}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="order-detail-section">
                <h4><i class="fas fa-shipping-fast"></i> Thông tin giao hàng</h4>
                <div style="padding: 10px 0;">
                    <div style="margin-bottom: 12px;">
                        <strong style="color: #666; font-size: 0.9rem;">Người nhận</strong>
                        <div style="font-size: 1.05rem; margin-top: 3px;">${order.receiverName || order.customerName}</div>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <strong style="color: #666; font-size: 0.9rem;">Số điện thoại</strong>
                        <div style="margin-top: 3px;">
                            <a href="tel:${order.receiverPhone || order.customerPhone}" style="color: var(--primary); text-decoration: none;">
                                <i class="fas fa-phone"></i> ${order.receiverPhone || order.customerPhone}
                            </a>
                        </div>
                    </div>
                    <div>
                        <strong style="color: #666; font-size: 0.9rem;">Địa chỉ giao hàng</strong>
                        <div style="margin-top: 3px; padding: 8px; background: #f8f9fa; border-left: 3px solid var(--success); border-radius: 4px;">
                            <i class="fas fa-map-marker-alt"></i> ${order.deliveryAddress}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="order-detail-section">
            <h4><i class="fas fa-box"></i> Thông tin hàng hóa & Chi phí</h4>
            <div class="detail-grid">
                <div>
                    <strong>Loại hàng hóa</strong>
                    <div style="margin-top: 5px;">${getItemTypeText(order.itemType)}</div>
                </div>
                <div>
                    <strong>Khối lượng</strong>
                    <div style="margin-top: 5px;">${order.weight || 0} kg</div>
                </div>
                <div>
                    <strong>Phí vận chuyển</strong>
                    <div style="margin-top: 5px; color: var(--primary); font-weight: 600;">${formatMoney(order.shippingFee || 0)}</div>
                </div>
                <div>
                    <strong>Tiền COD</strong>
                    <div style="margin-top: 5px; color: ${order.codAmount > 0 ? 'var(--danger)' : '#999'}; font-weight: 600; font-size: 1.1rem;">
                        ${formatMoney(order.codAmount || 0)}
                    </div>
                </div>
            </div>
            ${order.notes ? `
            <div style="margin-top: 15px; padding: 12px; background: #fff3cd; border-left: 4px solid var(--warning); border-radius: 4px;">
                <strong><i class="fas fa-sticky-note"></i> Ghi chú:</strong>
                <div style="margin-top: 5px;">${order.notes}</div>
            </div>
            ` : ''}
        </div>
        
        ${driver ? `
        <div class="order-detail-section">
            <h4><i class="fas fa-user-tie"></i> Thông tin tài xế</h4>
            <div style="display: flex; align-items: center; gap: 20px; padding: 15px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px;">
                <div style="width: 70px; height: 70px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.8rem; flex-shrink: 0;">
                    ${driver.name.substring(0, 2)}
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 1.2rem; font-weight: 600; color: var(--secondary); margin-bottom: 8px;">${driver.name}</div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                        <div>
                            <i class="fas fa-phone" style="color: var(--primary);"></i>
                            <a href="tel:${driver.phone}" style="color: var(--primary); text-decoration: none; margin-left: 5px;">${driver.phone}</a>
                        </div>
                        <div>
                            <i class="fas fa-motorcycle" style="color: var(--primary);"></i>
                            <span style="margin-left: 5px;">${driver.vehicle || 'N/A'}</span>
                        </div>
                        <div>
                            <i class="fas fa-star" style="color: var(--warning);"></i>
                            <span style="margin-left: 5px;">${driver.rating || 0} sao</span>
                        </div>
                        <div>
                            <i class="fas fa-box" style="color: var(--primary);"></i>
                            <span style="margin-left: 5px;">${driver.currentOrders || 0} đơn đang giao</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ` : `
        <div class="order-detail-section" style="border: 2px dashed var(--warning); background: #fff3cd;">
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--warning); margin-bottom: 10px;"></i>
                <h4 style="color: var(--warning); margin-bottom: 10px;">Chưa phân tài xế</h4>
                <button class="btn btn-primary" onclick="closeOrderModal(); openAssignDriverModal('${order.id}')">
                    <i class="fas fa-user-plus"></i> Phân tài xế ngay
                </button>
            </div>
        </div>
        `}
        
        ${order.timeline && order.timeline.length > 0 ? `
        <div class="order-detail-section">
            <h4><i class="fas fa-history"></i> Lịch sử vận chuyển</h4>
            <div class="timeline">
                ${order.timeline.map((item, index) => `
                    <div class="timeline-item ${index === order.timeline.length - 1 ? 'current' : ''}">
                        <div class="timeline-icon ${getTimelineIconClass(item.status)}">
                            <i class="${getTimelineIcon(item.status)}"></i>
                        </div>
                        <div class="timeline-content">
                            <h5>${getStatusText(item.status)}</h5>
                            <p>${item.description}</p>
                            <small><i class="fas fa-clock"></i> ${formatDateTime(item.time)}</small>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${order.cancelReason ? `
        <div class="order-detail-section" style="border: 2px solid var(--danger); background: #ffe6e6;">
            <h4 style="color: var(--danger);"><i class="fas fa-ban"></i> Lý do hủy đơn</h4>
            <div style="padding: 10px; background: white; border-radius: 4px; margin-top: 10px;">
                ${order.cancelReason}
            </div>
            ${order.cancelledAt ? `
                <div style="margin-top: 8px; color: #666; font-size: 0.9rem;">
                    <i class="fas fa-clock"></i> Hủy lúc: ${formatDateTime(order.cancelledAt)}
                </div>
            ` : ''}
        </div>
        ` : ''}
        
        <div style="display: flex; gap: 10px; justify-content: flex-end; padding-top: 20px; border-top: 2px solid #f0f0f0;">
            ${!order.driverId && order.status === 'pending' ? `
                <button class="btn btn-primary" onclick="closeOrderModal(); openAssignDriverModal('${order.id}')">
                    <i class="fas fa-user-plus"></i> Phân tài xế
                </button>
            ` : ''}
            ${['pending', 'assigned'].includes(order.status) ? `
                <button class="btn btn-secondary" onclick="closeOrderModal(); editOrder('${order.id}')">
                    <i class="fas fa-edit"></i> Sửa đơn hàng
                </button>
            ` : ''}
            <button class="btn btn-primary" onclick="printOrder('${order.id}')">
                <i class="fas fa-print"></i> In phiếu giao hàng
            </button>
            ${['pending', 'assigned', 'picking'].includes(order.status) ? `
                <button class="btn btn-danger" onclick="closeOrderModal(); cancelOrder('${order.id}')">
                    <i class="fas fa-times"></i> Hủy đơn hàng
                </button>
            ` : ''}
        </div>
    `;
    
    document.getElementById('modalOrderId').textContent = order.id;
    document.getElementById('orderDetailContent').innerHTML = content;
    document.getElementById('orderDetailModal').style.display = 'flex';
}

function closeOrderModal() {
    document.getElementById('orderDetailModal').style.display = 'none';
}

// Helper functions for detail view
function getItemTypeText(type) {
    const types = {
        'document': '📄 Tài liệu',
        'food': '🍱 Thực phẩm',
        'electronics': '📱 Điện tử',
        'clothing': '👕 Quần áo',
        'other': '📦 Khác'
    };
    return types[type] || types['other'];
}

function getTimelineIcon(status) {
    const icons = {
        'pending': 'fas fa-clock',
        'assigned': 'fas fa-user-check',
        'picking': 'fas fa-box-open',
        'delivering': 'fas fa-shipping-fast',
        'delivered': 'fas fa-check-circle',
        'cancelled': 'fas fa-ban',
        'failed': 'fas fa-times-circle'
    };
    return icons[status] || 'fas fa-circle';
}

function getTimelineIconClass(status) {
    const classes = {
        'pending': 'warning',
        'assigned': 'primary',
        'picking': 'primary',
        'delivering': 'primary',
        'delivered': 'success',
        'cancelled': 'danger',
        'failed': 'danger'
    };
    return classes[status] || 'primary';
}

// Save to storage

// Show notification
function showNotification(typeOrMessage, messageOrType) {
    // Smart parameter detection - support both (type, message) and (message, type)
    let type, message;
    const validTypes = ['success', 'error', 'warning', 'info'];
    
    if (validTypes.includes(typeOrMessage)) {
        // Called as (type, message)
        type = typeOrMessage;
        message = messageOrType;
    } else {
        // Called as (message, type) - legacy format
        message = typeOrMessage;
        type = messageOrType || 'info';
    }
    
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}
