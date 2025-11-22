// Check admin access
checkAdminAccess();

// COD data
let codRecords = [];
let filteredCOD = [];
let selectedCODIds = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadCODRecords();
    updateStatsCards();
    loadDriversFilter(); // Load after codRecords is populated
});

// Load COD records from orders
function loadCODRecords() {
    codRecords = [];
    
    console.log('Loading COD records...'); // Debug
    console.log('Total orders:', orders.length); // Debug
    
    // Get all orders with COD
    const codOrders = orders.filter(o => o.paymentMethod === 'cod' && o.codAmount > 0);
    console.log('COD orders found:', codOrders.length); // Debug
    
    codOrders.forEach(order => {
        const driver = drivers.find(d => d.id === order.driverId);
        
        // Xác định trạng thái COD theo quy trình nghiệp vụ
        let codStatus = 'pending'; // Chờ giao hàng
        let collectedDate = null;
        let settlementDate = null;
        
        // Logic trạng thái COD:
        // 1. Đơn đang giao (delivering/picking/assigned) → pending (Chờ giao)
        // 2. Đơn đã giao (delivered) NHƯNG chưa thu tiền → collected (Cần thu)
        // 3. Đơn đã giao VÀ đã thu tiền → collected (Đã thu, chờ quyết toán)
        // 4. Đơn đã quyết toán → settled (Đã quyết toán)
        
        if (order.status === 'delivered') {
            // Đơn đã giao thành công
            if (order.codSettled) {
                // Đã quyết toán
                codStatus = 'settled';
                collectedDate = order.codCollectedDate || order.deliveredAt;
                settlementDate = order.codSettlementDate;
            } else if (order.codCollected) {
                // Đã thu tiền, chờ quyết toán
                codStatus = 'collected';
                collectedDate = order.codCollectedDate || order.deliveredAt;
            } else {
                // Đã giao nhưng CHƯA thu tiền → Cần thu COD
                codStatus = 'pending_collection';
                collectedDate = null;
            }
        } else if (order.status === 'delivering' || order.status === 'picking') {
            // Đơn đang giao
            codStatus = 'pending';
        } else if (order.status === 'cancelled' || order.status === 'failed') {
            // Đơn hủy/thất bại
            codStatus = 'cancelled';
        }
        
        codRecords.push({
            id: order.id,
            orderId: order.id,
            driverId: order.driverId,
            driverName: driver ? driver.name : 'Chưa phân',
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            amount: order.codAmount,
            status: codStatus,
            collectedDate: collectedDate,
            settlementDate: settlementDate,
            createdAt: order.createdAt,
            deliveryAddress: order.deliveryAddress,
            orderStatus: order.status
        });
    });
    
    console.log('COD records loaded:', codRecords.length); // Debug
    console.log('Pending collection:', codRecords.filter(c => c.status === 'pending_collection').length);
    console.log('Collected (ready to settle):', codRecords.filter(c => c.status === 'collected').length);
    console.log('Settled:', codRecords.filter(c => c.status === 'settled').length);
    
    filteredCOD = [...codRecords];
    filterCOD();
}

// Load drivers for filter
function loadDriversFilter() {
    const driverFilter = document.getElementById('driverFilter');
    const settlementDriverSelect = document.getElementById('settlementDriverSelect');
    
    console.log('Loading drivers filter...'); // Debug
    console.log('Total drivers:', drivers.length); // Debug
    console.log('COD records:', codRecords.length); // Debug
    
    if (driverFilter) {
        driverFilter.innerHTML = '<option value="">Tất cả tài xế</option>';
        drivers.forEach(driver => {
            driverFilter.innerHTML += `<option value="${driver.id}">${driver.name}</option>`;
        });
        console.log('Loaded driver filter with', drivers.length, 'drivers');
    }
    
    if (settlementDriverSelect) {
        settlementDriverSelect.innerHTML = '<option value="">-- Chọn tài xế --</option>';
        
        // Hiển thị TẤT CẢ tài xế, không chỉ những người có đơn chờ quyết toán
        drivers.forEach(driver => {
            const unsettledCount = codRecords.filter(c => c.driverId === driver.id && c.status === 'collected').length;
            const totalCOD = codRecords.filter(c => c.driverId === driver.id && c.status === 'collected').reduce((sum, c) => sum + c.amount, 0);
            
            // Hiển thị tất cả tài xế, ghi rõ số đơn chờ quyết toán
            if (unsettledCount > 0) {
                settlementDriverSelect.innerHTML += `<option value="${driver.id}">${driver.name} (${unsettledCount} đơn - ${formatCurrency(totalCOD)})</option>`;
            } else {
                // Vẫn hiển thị tài xế nhưng ghi "Không có đơn"
                settlementDriverSelect.innerHTML += `<option value="${driver.id}">${driver.name} (Không có đơn)</option>`;
            }
        });
        
        console.log('Loaded settlement driver select with', drivers.length, 'drivers');
    }
}

// Update stats cards
function updateStatsCards() {
    const totalCOD = codRecords.reduce((sum, c) => sum + c.amount, 0);
    const pendingCOD = codRecords.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0);
    const collectedCOD = codRecords.filter(c => c.status === 'collected' || c.status === 'settled').reduce((sum, c) => sum + c.amount, 0);
    const unsettledCOD = codRecords.filter(c => c.status === 'collected').reduce((sum, c) => sum + c.amount, 0);
    
    const elem1 = document.getElementById('totalCODAmount');
    const elem2 = document.getElementById('pendingCODAmount');
    const elem3 = document.getElementById('collectedCODAmount');
    const elem4 = document.getElementById('unsettledCODAmount');
    
    if (elem1) elem1.textContent = formatCurrency(totalCOD);
    if (elem2) elem2.textContent = formatCurrency(pendingCOD);
    if (elem3) elem3.textContent = formatCurrency(collectedCOD);
    if (elem4) elem4.textContent = formatCurrency(unsettledCOD);
}

// Filter COD
function filterCOD() {
    const searchInput = document.getElementById('searchCOD');
    const statusFilter = document.getElementById('statusFilter');
    const driverFilter = document.getElementById('driverFilter');
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    
    const searchValue = searchInput ? searchInput.value.toLowerCase() : '';
    const statusValue = statusFilter ? statusFilter.value : '';
    const driverValue = driverFilter ? driverFilter.value : '';
    const dateFromValue = dateFrom ? dateFrom.value : '';
    const dateToValue = dateTo ? dateTo.value : '';
    
    filteredCOD = codRecords.filter(cod => {
        const matchSearch = !searchValue || 
            cod.orderId.toLowerCase().includes(searchValue) ||
            cod.driverName.toLowerCase().includes(searchValue) ||
            cod.customerName.toLowerCase().includes(searchValue) ||
            cod.customerPhone.includes(searchValue);
        
        const matchStatus = !statusValue || cod.status === statusValue;
        const matchDriver = !driverValue || cod.driverId === driverValue;
        
        let matchDate = true;
        const codDate = new Date(cod.collectedDate || cod.createdAt);
        if (dateFromValue) {
            matchDate = matchDate && codDate >= new Date(dateFromValue);
        }
        if (dateToValue) {
            matchDate = matchDate && codDate <= new Date(dateToValue + 'T23:59:59');
        }
        
        return matchSearch && matchStatus && matchDriver && matchDate;
    });
    
    renderCOD();
}

// Render COD table
function renderCOD() {
    const tbody = document.getElementById('codTableBody');
    if (!tbody) return;
    
    console.log('Rendering COD table, filtered count:', filteredCOD.length); // Debug
    
    if (filteredCOD.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 10px; display: block;"></i>
                    <div style="font-size: 1.2rem; margin-bottom: 10px;">Không tìm thấy bản ghi COD nào</div>
                    <div style="font-size: 0.9rem; color: #7f8c8d;">
                        ${codRecords.length === 0 ? 
                            'Chưa có đơn hàng COD nào trong hệ thống. Tạo đơn hàng với phương thức thanh toán COD để bắt đầu.' : 
                            'Thử thay đổi bộ lọc để xem kết quả khác.'}
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredCOD.map(cod => {
        const statusInfo = getCODStatusInfo(cod.status);
        const isSelected = selectedCODIds.includes(cod.id);
        
        return `
            <tr>
                <td>
                    <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleCODSelect('${cod.id}')">
                </td>
                <td>
                    <div style="font-weight: 600; color: var(--primary);">
                        <i class="fas fa-box"></i> ${cod.orderId}
                    </div>
                </td>
                <td>
                    <div style="font-weight: 600; color: #2c3e50;">
                        <i class="fas fa-user"></i> ${cod.driverName}
                    </div>
                </td>
                <td>
                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 3px;">
                        ${cod.customerName}
                    </div>
                    <div style="font-size: 0.85rem; color: #7f8c8d;">
                        <i class="fas fa-phone"></i> ${cod.customerPhone}
                    </div>
                </td>
                <td>
                    <div style="font-size: 1.2rem; font-weight: bold; color: #e74c3c;">
                        ${formatCurrency(cod.amount)}
                    </div>
                </td>
                <td>
                    <div style="font-size: 0.9rem; color: #7f8c8d;">
                        ${cod.collectedDate ? formatDateTime(cod.collectedDate) : '-'}
                    </div>
                </td>
                <td>
                    <div style="font-size: 0.9rem; color: #7f8c8d;">
                        ${cod.settlementDate ? formatDateTime(cod.settlementDate) : '-'}
                    </div>
                </td>
                <td style="text-align: center;">
                    <span class="badge ${statusInfo.class}">
                        <i class="${statusInfo.icon}"></i> ${statusInfo.text}
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: center;">
                        <button class="btn btn-sm btn-info" onclick="viewCODDetail('${cod.id}')" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${cod.status === 'collected' ? `
                            <button class="btn btn-sm btn-success" onclick="settleSingleCOD('${cod.id}')" title="Quyết toán">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Update count badge
    const badge = document.getElementById('codCountBadge');
    if (badge) {
        badge.textContent = filteredCOD.length;
    }
}

// Get COD status info
function getCODStatusInfo(status) {
    const info = {
        'pending': { text: 'Chờ giao', class: 'badge-secondary', icon: 'fas fa-clock' },
        'pending_collection': { text: 'Cần thu', class: 'badge-warning', icon: 'fas fa-exclamation-triangle' },
        'collected': { text: 'Đã thu', class: 'badge-success', icon: 'fas fa-check-circle' },
        'settled': { text: 'Đã quyết toán', class: 'badge-info', icon: 'fas fa-hand-holding-usd' },
        'cancelled': { text: 'Đã hủy', class: 'badge-danger', icon: 'fas fa-times-circle' }
    };
    return info[status] || info.pending;
}

// Reset filters
function resetFilters() {
    document.getElementById('searchCOD').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('driverFilter').value = '';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    filterCOD();
}

// Sort table
let currentSortColumn = 'createdAt';
let currentSortDirection = 'desc';

function sortTable(column) {
    // Toggle direction if same column
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'desc';
    }
    
    // Sort filtered data
    filteredCOD.sort((a, b) => {
        let valA, valB;
        
        switch(column) {
            case 'orderId':
                valA = a.orderId;
                valB = b.orderId;
                break;
            case 'driver':
                valA = a.driverName;
                valB = b.driverName;
                break;
            case 'customer':
                valA = a.customerName;
                valB = b.customerName;
                break;
            case 'amount':
                valA = a.amount;
                valB = b.amount;
                break;
            case 'collectedDate':
                valA = new Date(a.collectedDate || 0);
                valB = new Date(b.collectedDate || 0);
                break;
            case 'settlementDate':
                valA = new Date(a.settlementDate || 0);
                valB = new Date(b.settlementDate || 0);
                break;
            case 'status':
                valA = a.status;
                valB = b.status;
                break;
            default:
                valA = a.createdAt;
                valB = b.createdAt;
        }
        
        if (currentSortDirection === 'asc') {
            return valA > valB ? 1 : valA < valB ? -1 : 0;
        } else {
            return valA < valB ? 1 : valA > valB ? -1 : 0;
        }
    });
    
    renderCOD();
    
    // Update sort icons
    document.querySelectorAll('#codTable th i.fa-sort, #codTable th i.fa-sort-up, #codTable th i.fa-sort-down').forEach(icon => {
        icon.className = 'fas fa-sort';
    });
    
    const header = document.querySelector(`#codTable th[onclick*="${column}"] i`);
    if (header) {
        header.className = currentSortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }
}

// Toggle select all
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('#codTableBody input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
    
    if (selectAll.checked) {
        selectedCODIds = filteredCOD.map(c => c.id);
    } else {
        selectedCODIds = [];
    }
    
    updateSelectedButton();
}

// Toggle COD select
function toggleCODSelect(codId) {
    const index = selectedCODIds.indexOf(codId);
    if (index > -1) {
        selectedCODIds.splice(index, 1);
    } else {
        selectedCODIds.push(codId);
    }
    
    // Update select all checkbox
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.checked = selectedCODIds.length === filteredCOD.length;
    }
    
    updateSelectedButton();
}

// Update selected button
function updateSelectedButton() {
    const btn = document.getElementById('settleSelectedBtn');
    const countSpan = document.getElementById('selectedCount');
    
    if (btn && countSpan) {
        // Only show button if there are collected (not settled) CODs selected
        const selectedCollectedCODs = codRecords.filter(c => 
            selectedCODIds.includes(c.id) && c.status === 'collected'
        );
        
        if (selectedCollectedCODs.length > 0) {
            btn.style.display = 'block';
            countSpan.textContent = selectedCollectedCODs.length;
        } else {
            btn.style.display = 'none';
        }
    }
}

// Settle selected CODs
function settleSelectedCODs() {
    const selectedCODs = codRecords.filter(c => 
        selectedCODIds.includes(c.id) && c.status === 'collected'
    );
    
    if (selectedCODs.length === 0) {
        showNotification('Vui lòng chọn các đơn đã thu tiền để quyết toán', 'warning');
        return;
    }
    
    const totalAmount = selectedCODs.reduce((sum, c) => sum + c.amount, 0);
    const driverGroups = {};
    
    // Group by driver
    selectedCODs.forEach(cod => {
        if (!driverGroups[cod.driverId]) {
            driverGroups[cod.driverId] = {
                name: cod.driverName,
                cods: [],
                total: 0
            };
        }
        driverGroups[cod.driverId].cods.push(cod);
        driverGroups[cod.driverId].total += cod.amount;
    });
    
    const driversList = Object.values(driverGroups).map(g => 
        `${g.name}: ${g.cods.length} đơn - ${formatCurrency(g.total)}`
    ).join('\n');
    
    if (confirm(`Xác nhận quyết toán ${selectedCODs.length} đơn COD với tổng số tiền ${formatCurrency(totalAmount)}?\n\nChi tiết:\n${driversList}`)) {
        const settlementDate = new Date().toISOString();
        
        selectedCODs.forEach(cod => {
            cod.status = 'settled';
            cod.settlementDate = settlementDate;
            
            // Update order
            const order = orders.find(o => o.id === cod.orderId);
            if (order) {
                order.codSettled = true;
                order.codSettlementDate = settlementDate;
            }
        });
        
        // Save to localStorage
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Reset and reload
        selectedCODIds = [];
        loadCODRecords();
        updateStatsCards();
        updateSelectedButton();
        
        showNotification(`Đã quyết toán thành công ${selectedCODs.length} đơn COD, tổng ${formatCurrency(totalAmount)}`, 'success');
    }
}

// View COD detail
function viewCODDetail(codId) {
    const cod = codRecords.find(c => c.id === codId);
    if (!cod) return;
    
    const order = orders.find(o => o.id === cod.orderId);
    if (!order) return;
    
    const driver = drivers.find(d => d.id === cod.driverId);
    const statusInfo = getCODStatusInfo(cod.status);
    
    // Thống kê COD của tài xế này
    let driverCODStats = '';
    if (driver) {
        const driverCODs = codRecords.filter(c => c.driverId === driver.id);
        const totalCollected = driverCODs.filter(c => c.status === 'collected' || c.status === 'settled').length;
        const totalAmount = driverCODs.reduce((sum, c) => sum + c.amount, 0);
        const unsettledAmount = driverCODs.filter(c => c.status === 'collected').reduce((sum, c) => sum + c.amount, 0);
        
        driverCODStats = `
            <div class="detail-section" style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <h4><i class="fas fa-chart-bar"></i> Thống kê COD của tài xế</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 10px;">
                    <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 0.85rem; color: #7f8c8d; margin-bottom: 5px;">Tổng đơn COD</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--primary);">${driverCODs.length}</div>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 0.85rem; color: #7f8c8d; margin-bottom: 5px;">Đã thu</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: #27ae60;">${totalCollected}</div>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 0.85rem; color: #7f8c8d; margin-bottom: 5px;">Tổng tiền</div>
                        <div style="font-size: 1.3rem; font-weight: bold; color: #e74c3c;">${formatCurrency(totalAmount)}</div>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 0.85rem; color: #7f8c8d; margin-bottom: 5px;">Chờ quyết toán</div>
                        <div style="font-size: 1.3rem; font-weight: bold; color: #f39c12;">${formatCurrency(unsettledAmount)}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    const content = `
        <div class="detail-section">
            <h4><i class="fas fa-box"></i> Thông tin đơn hàng</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Mã đơn hàng:</label>
                    <span style="font-weight: 600; color: var(--primary);">${cod.orderId}</span>
                </div>
                <div class="detail-item">
                    <label>Trạng thái đơn:</label>
                    <span style="font-weight: 600; text-transform: capitalize;">${cod.orderStatus}</span>
                </div>
                <div class="detail-item">
                    <label>Trạng thái COD:</label>
                    <span class="badge ${statusInfo.class}">
                        <i class="${statusInfo.icon}"></i> ${statusInfo.text}
                    </span>
                </div>
                <div class="detail-item">
                    <label>Số tiền COD:</label>
                    <span style="font-size: 1.3rem; font-weight: bold; color: #e74c3c;">
                        ${formatCurrency(cod.amount)}
                    </span>
                </div>
                <div class="detail-item">
                    <label>Ngày tạo đơn:</label>
                    <span>${formatDateTime(cod.createdAt)}</span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h4><i class="fas fa-user"></i> Thông tin khách hàng</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Tên khách hàng:</label>
                    <span style="font-weight: 600;">${cod.customerName}</span>
                </div>
                <div class="detail-item">
                    <label>Số điện thoại:</label>
                    <span>${cod.customerPhone}</span>
                </div>
                <div class="detail-item" style="grid-column: 1 / -1;">
                    <label>Địa chỉ giao hàng:</label>
                    <span>${cod.deliveryAddress}</span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h4><i class="fas fa-truck"></i> Thông tin tài xế</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Tên tài xế:</label>
                    <span style="font-weight: 600;">${cod.driverName}</span>
                </div>
                ${driver ? `
                    <div class="detail-item">
                        <label>Số điện thoại:</label>
                        <span>${driver.phone}</span>
                    </div>
                    <div class="detail-item">
                        <label>Biển số xe:</label>
                        <span>${driver.vehicle}</span>
                    </div>
                ` : ''}
            </div>
        </div>

        <div class="detail-section">
            <h4><i class="fas fa-clock"></i> Thời gian xử lý</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Ngày thu tiền:</label>
                    <span>${cod.collectedDate ? formatDateTime(cod.collectedDate) : 'Chưa thu'}</span>
                </div>
                <div class="detail-item">
                    <label>Ngày quyết toán:</label>
                    <span>${cod.settlementDate ? formatDateTime(cod.settlementDate) : 'Chưa quyết toán'}</span>
                </div>
            </div>
        </div>
        
        ${driverCODStats}
    `;
    
    document.getElementById('codDetailContent').innerHTML = content;
    document.getElementById('codDetailModal').style.display = 'flex';
}

// Close COD detail modal
function closeCODDetailModal() {
    document.getElementById('codDetailModal').style.display = 'none';
}

// View settlement history
function viewSettlementHistory() {
    const settlements = JSON.parse(localStorage.getItem('settlements') || '[]');
    
    if (settlements.length === 0) {
        showNotification('Chưa có lịch sử quyết toán nào', 'info');
        return;
    }
    
    const content = `
        <div style="margin-bottom: 20px;">
            <p><strong>Tổng số phiếu quyết toán:</strong> ${settlements.length}</p>
        </div>
        
        <div style="max-height: 600px; overflow-y: auto;">
            ${settlements.map(settlement => `
                <div class="settlement-history-item" style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 15px; background: #f8f9fa;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div>
                            <h4 style="margin: 0 0 10px 0; color: #3498db;">
                                <i class="fas fa-file-invoice-dollar"></i> ${settlement.id}
                            </h4>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 0.9rem;">
                                <div><i class="fas fa-user"></i> <strong>Tài xế:</strong> ${settlement.driverName}</div>
                                <div><i class="fas fa-calendar"></i> <strong>Ngày:</strong> ${formatDateTime(settlement.settlementDate)}</div>
                                <div><i class="fas fa-box"></i> <strong>Số đơn:</strong> ${settlement.orderCount}</div>
                                <div><i class="fas fa-user-shield"></i> <strong>Người QT:</strong> ${settlement.createdBy}</div>
                            </div>
                            ${settlement.settlementNote ? `
                                <div style="margin-top: 10px; padding: 10px; background: #fff3cd; border-left: 3px solid #ffc107; border-radius: 4px;">
                                    <i class="fas fa-sticky-note"></i> <strong>Ghi chú:</strong> ${settlement.settlementNote}
                                </div>
                            ` : ''}
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 0.85rem; color: #7f8c8d; margin-bottom: 5px;">Tổng tiền</div>
                            <div style="font-size: 2rem; font-weight: bold; color: #27ae60;">
                                ${formatCurrency(settlement.totalAmount)}
                            </div>
                        </div>
                    </div>
                    
                    <details style="margin-top: 15px;">
                        <summary style="cursor: pointer; padding: 10px; background: white; border-radius: 5px; font-weight: bold;">
                            <i class="fas fa-list"></i> Chi tiết ${settlement.orderCount} đơn hàng
                        </summary>
                        <div style="margin-top: 10px; background: white; padding: 15px; border-radius: 5px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: #ecf0f1;">
                                        <th style="padding: 8px; text-align: left;">STT</th>
                                        <th style="padding: 8px; text-align: left;">Mã đơn</th>
                                        <th style="padding: 8px; text-align: left;">Khách hàng</th>
                                        <th style="padding: 8px; text-align: right;">Số tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${settlement.orders.map((order, index) => `
                                        <tr style="border-bottom: 1px solid #ecf0f1;">
                                            <td style="padding: 8px;">${index + 1}</td>
                                            <td style="padding: 8px;"><strong>${order.orderId}</strong></td>
                                            <td style="padding: 8px;">${order.customerName}</td>
                                            <td style="padding: 8px; text-align: right; font-weight: bold;">${formatCurrency(order.amount)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </details>
                    
                    <div style="margin-top: 15px; text-align: right;">
                        <button class="btn btn-sm btn-primary" onclick="printSettlement('${settlement.id}')" title="In phiếu quyết toán">
                            <i class="fas fa-print"></i> In phiếu
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('settlementHistoryContent').innerHTML = content;
    document.getElementById('settlementHistoryModal').style.display = 'flex';
}

// Close settlement history modal
function closeSettlementHistoryModal() {
    document.getElementById('settlementHistoryModal').style.display = 'none';
}

// Open settlement modal
function openSettlementModal() {
    console.log('Opening settlement modal...');
    
    // Reload COD records to get latest data
    loadCODRecords();
    
    // Wait for COD records to load, then load drivers
    setTimeout(() => {
        loadDriversFilter();
        
        // Reset selection
        selectedCODIds = [];
        
        // Hide unsettled list initially
        const unsettledList = document.getElementById('unsettledCODList');
        if (unsettledList) {
            unsettledList.style.display = 'none';
        }
        
        // Reset driver select
        const driverSelect = document.getElementById('settlementDriverSelect');
        if (driverSelect) {
            driverSelect.value = '';
        }
        
        // Show modal
        document.getElementById('settlementModal').style.display = 'flex';
        
        console.log('Settlement modal opened successfully');
        console.log('Available drivers:', drivers.length);
        console.log('Total COD records:', codRecords.length);
        console.log('COD records with status=collected:', codRecords.filter(c => c.status === 'collected').length);
    }, 150);
}

// Close settlement modal
function closeSettlementModal() {
    document.getElementById('settlementModal').style.display = 'none';
    document.getElementById('unsettledCODList').style.display = 'none';
    document.getElementById('settlementDriverSelect').value = '';
}

// Load driver unsettled COD
function loadDriverUnsettledCOD() {
    const driverId = document.getElementById('settlementDriverSelect').value;
    const unsettledListDiv = document.getElementById('unsettledCODList');
    
    console.log('Loading unsettled COD for driver:', driverId); // Debug
    
    if (!driverId) {
        unsettledListDiv.style.display = 'none';
        return;
    }
    
    const driver = drivers.find(d => d.id === driverId);
    
    // Lấy các đơn đã giao NHƯNG CHƯA thu COD (pending_collection)
    const pendingCollectionCODs = codRecords.filter(c => 
        c.driverId === driverId && c.status === 'pending_collection'
    );
    
    console.log('Found pending collection CODs:', pendingCollectionCODs.length); // Debug
    
    if (pendingCollectionCODs.length === 0) {
        // Hiển thị thông báo trực tiếp trong modal
        unsettledListDiv.innerHTML = `
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 30px; text-align: center;">
                <i class="fas fa-check-circle" style="font-size: 3rem; color: #0c5460; margin-bottom: 15px;"></i>
                <h4 style="color: #0c5460; margin-bottom: 10px;">Không có đơn cần thu COD</h4>
                <p style="color: #0c5460; margin-bottom: 0;">
                    Tài xế <strong>${driver ? driver.name : 'này'}</strong> hiện không có đơn hàng COD nào trong trạng thái "Đã giao - Chưa thu tiền".
                </p>
                <p style="color: #0c5460; font-size: 0.9rem; margin-top: 10px;">
                    Chỉ các đơn đã giao thành công nhưng <strong>chưa xác nhận thu COD</strong> mới xuất hiện ở đây.
                </p>
            </div>
        `;
        unsettledListDiv.style.display = 'block';
        return;
    }
    
    const totalAmount = pendingCollectionCODs.reduce((sum, c) => sum + c.amount, 0);
    
    // Hiển thị lại template với danh sách đơn CHƯA thu
    unsettledListDiv.innerHTML = `
        <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 1.5rem; color: #856404;"></i>
                <h4 style="margin: 0; color: #856404;">Danh sách đơn CHƯA THU COD</h4>
            </div>
            <p style="margin: 0; color: #856404; font-size: 0.9rem;">
                Các đơn hàng đã giao thành công nhưng chưa xác nhận thu tiền từ khách hàng. 
                Hãy xác nhận thu COD trong trang Đơn hàng trước khi quyết toán.
            </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div>
                    <div style="font-size: 0.9rem; color: #7f8c8d; margin-bottom: 5px;">Tổng tiền cần thu</div>
                    <div style="font-size: 2rem; font-weight: bold; color: #e74c3c;" id="totalUnsettledAmount">${formatCurrency(totalAmount)}</div>
                </div>
                <div>
                    <div style="font-size: 0.9rem; color: #7f8c8d; margin-bottom: 5px;">Số đơn hàng</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: #3498db;" id="totalUnsettledOrders">${pendingCollectionCODs.length}</div>
                </div>
                <div>
                    <button class="btn btn-warning btn-lg" onclick="alert('Vui lòng xác nhận thu COD trong trang Đơn hàng trước!')" disabled>
                        <i class="fas fa-exclamation-circle"></i> Chưa thể quyết toán
                    </button>
                </div>
            </div>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Ngày giao</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                </tr>
            </thead>
            <tbody id="unsettledCODTableBody">
                ${pendingCollectionCODs.map(cod => {
                    const order = orders.find(o => o.id === cod.orderId);
                    return `
                        <tr>
                            <td style="font-weight: 600; color: var(--primary);">${cod.orderId}</td>
                            <td>${cod.customerName}</td>
                            <td style="font-size: 0.9rem; color: #7f8c8d;">${order && order.deliveredAt ? formatDateTime(order.deliveredAt) : '-'}</td>
                            <td style="font-weight: bold; color: #e74c3c;">${formatCurrency(cod.amount)}</td>
                            <td><span class="badge badge-warning"><i class="fas fa-exclamation-triangle"></i> Chưa thu</span></td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    unsettledListDiv.style.display = 'block';
    
    console.log('Displayed pending collection CODs'); // Debug
}

// Toggle select all settlement
function toggleSelectAllSettlement() {
    const selectAll = document.getElementById('selectAllSettlement');
    const checkboxes = document.querySelectorAll('#unsettledCODTableBody input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
    
    if (selectAll.checked) {
        const driverId = document.getElementById('settlementDriverSelect').value;
        const unsettledCODs = codRecords.filter(c => c.driverId === driverId && c.status === 'collected');
        selectedCODIds = unsettledCODs.map(c => c.id);
    } else {
        selectedCODIds = [];
    }
    
    // Update total
    loadDriverUnsettledCOD();
}

// Toggle unsettled COD
function toggleUnsettledCOD(codId) {
    const index = selectedCODIds.indexOf(codId);
    if (index > -1) {
        selectedCODIds.splice(index, 1);
    } else {
        selectedCODIds.push(codId);
    }
    
    // Update total amount
    const selectedCODs = codRecords.filter(c => selectedCODIds.includes(c.id));
    const totalAmount = selectedCODs.reduce((sum, c) => sum + c.amount, 0);
    document.getElementById('totalUnsettledAmount').textContent = formatCurrency(totalAmount);
    document.getElementById('totalUnsettledOrders').textContent = selectedCODs.length;
}

// Process settlement
function processSettlement() {
    if (selectedCODIds.length === 0) {
        showNotification('Vui lòng chọn ít nhất một đơn để quyết toán', 'warning');
        return;
    }
    
    const selectedCODs = codRecords.filter(c => selectedCODIds.includes(c.id));
    const totalAmount = selectedCODs.reduce((sum, c) => sum + c.amount, 0);
    const driverName = selectedCODs[0].driverName;
    const driverId = selectedCODs[0].driverId;
    
    // Tạo prompt với form nhập thông tin quyết toán
    const settlementNote = prompt(
        `QUYẾT TOÁN COD\n\n` +
        `Tài xế: ${driverName}\n` +
        `Số đơn: ${selectedCODs.length}\n` +
        `Tổng tiền: ${formatCurrency(totalAmount)}\n\n` +
        `Nhập ghi chú quyết toán (không bắt buộc):`,
        `Quyết toán COD tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`
    );
    
    if (settlementNote === null) return; // User cancelled
    
    if (confirm(`XÁC NHẬN QUYẾT TOÁN\n\nTài xế: ${driverName}\nSố đơn: ${selectedCODs.length}\nTổng tiền: ${formatCurrency(totalAmount)}\nGhi chú: ${settlementNote}\n\nBạn có chắc chắn muốn quyết toán?`)) {
        const settlementDate = new Date().toISOString();
        const settlementId = 'SETTLE' + Date.now();
        
        console.log('Processing settlement:', {
            settlementId,
            driverId,
            driverName,
            orderCount: selectedCODs.length,
            totalAmount,
            settlementNote
        });
        
        // Cập nhật từng COD record
        selectedCODIds.forEach(codId => {
            const cod = codRecords.find(c => c.id === codId);
            if (cod) {
                cod.status = 'settled';
                cod.settlementDate = settlementDate;
                cod.settlementId = settlementId;
                cod.settlementNote = settlementNote;
                
                // Update order
                const order = orders.find(o => o.id === cod.orderId);
                if (order) {
                    order.codSettled = true;
                    order.codSettlementDate = settlementDate;
                    order.codSettlementId = settlementId;
                    order.codSettlementNote = settlementNote;
                    
                    // Add to order timeline
                    if (!order.timeline) order.timeline = [];
                    order.timeline.push({
                        status: 'cod_settled',
                        time: settlementDate,
                        description: `COD đã quyết toán - ${formatCurrency(order.codAmount)} - ${settlementNote}`
                    });
                }
            }
        });
        
        // Lưu lịch sử quyết toán
        const settlements = JSON.parse(localStorage.getItem('settlements') || '[]');
        settlements.unshift({
            id: settlementId,
            driverId: driverId,
            driverName: driverName,
            orderCount: selectedCODs.length,
            totalAmount: totalAmount,
            orders: selectedCODIds.map(id => {
                const cod = selectedCODs.find(c => c.id === id);
                return {
                    orderId: cod.orderId,
                    amount: cod.amount,
                    customerName: cod.customerName
                };
            }),
            settlementDate: settlementDate,
            settlementNote: settlementNote,
            createdBy: 'Admin User' // Có thể lấy từ session
        });
        localStorage.setItem('settlements', JSON.stringify(settlements));
        
        // Save orders to localStorage
        localStorage.setItem('orders', JSON.stringify(orders));
        
        console.log('Settlement saved successfully');
        
        // Reset and reload
        selectedCODIds = [];
        closeSettlementModal();
        loadCODRecords();
        updateStatsCards();
        
        // Hiển thị thông báo thành công và option in phiếu
        showNotification(`✅ Đã quyết toán thành công ${selectedCODs.length} đơn COD, tổng ${formatCurrency(totalAmount)}`, 'success');
        
        // Hỏi có muốn in phiếu quyết toán không
        setTimeout(() => {
            if (confirm(`Quyết toán thành công!\n\nBạn có muốn in phiếu quyết toán không?`)) {
                printSettlement(settlementId);
            }
        }, 500);
    }
}

// Settle single COD
function settleSingleCOD(codId) {
    const cod = codRecords.find(c => c.id === codId);
    if (!cod) return;
    
    const settlementNote = prompt(
        `QUYẾT TOÁN ĐƠN LẺ\n\n` +
        `Mã đơn: ${cod.orderId}\n` +
        `Tài xế: ${cod.driverName}\n` +
        `Khách hàng: ${cod.customerName}\n` +
        `Số tiền: ${formatCurrency(cod.amount)}\n\n` +
        `Nhập ghi chú quyết toán (không bắt buộc):`,
        `Quyết toán đơn ${cod.orderId}`
    );
    
    if (settlementNote === null) return; // User cancelled
    
    if (confirm(`XÁC NHẬN QUYẾT TOÁN\n\nĐơn hàng: ${cod.orderId}\nSố tiền: ${formatCurrency(cod.amount)}\nGhi chú: ${settlementNote}\n\nXác nhận quyết toán?`)) {
        const settlementDate = new Date().toISOString();
        const settlementId = 'SETTLE' + Date.now();
        
        cod.status = 'settled';
        cod.settlementDate = settlementDate;
        cod.settlementId = settlementId;
        cod.settlementNote = settlementNote;
        
        // Update order
        const order = orders.find(o => o.id === cod.orderId);
        if (order) {
            order.codSettled = true;
            order.codSettlementDate = settlementDate;
            order.codSettlementId = settlementId;
            order.codSettlementNote = settlementNote;
            
            // Add to order timeline
            if (!order.timeline) order.timeline = [];
            order.timeline.push({
                status: 'cod_settled',
                time: settlementDate,
                description: `COD đã quyết toán - ${formatCurrency(order.codAmount)} - ${settlementNote}`
            });
        }
        
        // Lưu lịch sử quyết toán
        const settlements = JSON.parse(localStorage.getItem('settlements') || '[]');
        settlements.unshift({
            id: settlementId,
            driverId: cod.driverId,
            driverName: cod.driverName,
            orderCount: 1,
            totalAmount: cod.amount,
            orders: [{
                orderId: cod.orderId,
                amount: cod.amount,
                customerName: cod.customerName
            }],
            settlementDate: settlementDate,
            settlementNote: settlementNote,
            createdBy: 'Admin User'
        });
        localStorage.setItem('settlements', JSON.stringify(settlements));
        
        // Save to localStorage
        localStorage.setItem('orders', JSON.stringify(orders));
        
        loadCODRecords();
        updateStatsCards();
        
        showNotification(`✅ Đã quyết toán thành công đơn ${cod.orderId}`, 'success');
        
        // Hỏi có muốn in phiếu không
        setTimeout(() => {
            if (confirm(`Quyết toán thành công!\n\nBạn có muốn in phiếu quyết toán không?`)) {
                printSettlement(settlementId);
            }
        }, 500);
    }
}

// Export COD to CSV/Excel
function exportCOD() {
    if (filteredCOD.length === 0) {
        showNotification('Không có dữ liệu để xuất', 'warning');
        return;
    }
    
    // Prepare CSV data
    const headers = ['Mã đơn', 'Tài xế', 'Khách hàng', 'SĐT', 'Địa chỉ', 'Số tiền', 'Trạng thái', 'Ngày thu', 'Ngày quyết toán'];
    const rows = filteredCOD.map(cod => [
        cod.orderId,
        cod.driverName,
        cod.customerName,
        cod.customerPhone,
        cod.deliveryAddress,
        cod.amount,
        getCODStatusInfo(cod.status).text,
        cod.collectedDate ? formatDateTime(cod.collectedDate) : '',
        cod.settlementDate ? formatDateTime(cod.settlementDate) : ''
    ]);
    
    // Create CSV content
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const filename = `COD_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours()}${now.getMinutes()}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`Đã xuất ${filteredCOD.length} bản ghi COD`, 'success');
}

// Print settlement receipt
function printSettlement(settlementId) {
    const settlements = JSON.parse(localStorage.getItem('settlements') || '[]');
    const settlement = settlements.find(s => s.id === settlementId);
    
    if (!settlement) {
        showNotification('Không tìm thấy thông tin quyết toán', 'error');
        return;
    }
    
    // Tạo nội dung phiếu quyết toán
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Phiếu quyết toán COD - ${settlement.id}</title>
            <style>
                @page { size: A4; margin: 2cm; }
                body { 
                    font-family: 'Arial', sans-serif; 
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #3498db;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #3498db;
                    margin: 0 0 10px 0;
                    font-size: 28px;
                }
                .info-section {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    padding: 8px 0;
                    border-bottom: 1px solid #e0e0e0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th {
                    background: #3498db;
                    color: white;
                    padding: 12px;
                    text-align: left;
                }
                td {
                    padding: 10px 12px;
                    border-bottom: 1px solid #e0e0e0;
                }
                .total-section {
                    background: #e8f5e9;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: right;
                }
                .total-amount {
                    font-size: 32px;
                    font-weight: bold;
                    color: #1b5e20;
                }
                .signature-section {
                    margin-top: 50px;
                    display: flex;
                    justify-content: space-between;
                }
                .signature-box {
                    text-align: center;
                    flex: 1;
                }
                .signature-line {
                    margin-top: 60px;
                    border-top: 1px solid #333;
                    padding-top: 5px;
                    font-weight: bold;
                }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>PHIẾU QUYẾT TOÁN COD</h1>
                <p><strong>Mã phiếu:</strong> ${settlement.id}</p>
                <p><strong>Ngày:</strong> ${formatDateTime(settlement.settlementDate)}</p>
            </div>
            
            <div class="info-section">
                <div class="info-row">
                    <span><strong>Tài xế:</strong></span>
                    <span>${settlement.driverName}</span>
                </div>
                <div class="info-row">
                    <span><strong>Số đơn hàng:</strong></span>
                    <span>${settlement.orderCount} đơn</span>
                </div>
                <div class="info-row">
                    <span><strong>Ghi chú:</strong></span>
                    <span>${settlement.settlementNote || '-'}</span>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th style="text-align: right;">Số tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${settlement.orders.map((order, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${order.orderId}</td>
                            <td>${order.customerName}</td>
                            <td style="text-align: right;">${formatCurrency(order.amount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total-section">
                <div style="font-size: 18px; font-weight: bold;">TỔNG TIỀN</div>
                <div class="total-amount">${formatCurrency(settlement.totalAmount)}</div>
            </div>
            
            <div class="signature-section">
                <div class="signature-box">
                    <p><strong>Người lập phiếu</strong></p>
                    <div class="signature-line">${settlement.createdBy}</div>
                </div>
                <div class="signature-box">
                    <p><strong>Tài xế</strong></p>
                    <div class="signature-line">${settlement.driverName}</div>
                </div>
                <div class="signature-box">
                    <p><strong>Kế toán</strong></p>
                    <div class="signature-line"></div>
                </div>
            </div>
            
            <div class="no-print" style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" style="padding: 12px 30px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    In phiếu
                </button>
                <button onclick="window.close()" style="padding: 12px 30px; background: #95a5a6; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                    Đóng
                </button>
            </div>
        </body>
        </html>
    `;
    
    // Mở cửa sổ mới để in
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Format date time
function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
}

// Show notification
function showNotification(message, type = 'success') {
    // Tạo notification container nếu chưa có
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000;';
        document.body.appendChild(container);
    }
    
    // Tạo notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
        color: white;
        padding: 15px 20px;
        margin-bottom: 10px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-times-circle' : 
                 type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span style="flex: 1;">${message}</span>
        <i class="fas fa-times" style="cursor: pointer; opacity: 0.8;" onclick="this.parentElement.remove()"></i>
    `;
    
    container.appendChild(notification);
    
    // Tự động xóa sau 5 giây
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};
