// Check admin access
checkAdminAccess();

// Drivers data
let filteredDrivers = [];
let editingDriverId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadDrivers();
    updateStatsCards();
});

// Load drivers
function loadDrivers() {
    // Try DataSync first
    if (typeof DataSync !== 'undefined') {
        const syncedDrivers = DataSync.get('drivers');
        if (syncedDrivers && syncedDrivers.length > 0) {
            drivers.length = 0;
            drivers.push(...syncedDrivers);
            console.log('[Admin Drivers] Loaded from DataSync:', drivers.length);
        }
    } else {
        // Fallback to localStorage
        const savedDrivers = localStorage.getItem('drivers');
        if (savedDrivers) {
            try {
                const parsedDrivers = JSON.parse(savedDrivers);
                if (parsedDrivers && parsedDrivers.length > 0) {
                    drivers.length = 0;
                    drivers.push(...parsedDrivers);
                    console.log('[Admin Drivers] Loaded from localStorage:', drivers.length);
                }
            } catch (e) {
                console.error('Error loading drivers:', e);
            }
        }
    }
    
    filteredDrivers = [...drivers];
    filterDrivers();
}

// Update stats cards
function updateStatsCards() {
    const totalDrivers = drivers.length;
    const activeDrivers = drivers.filter(d => d.status === 'active').length;
    const workingDrivers = drivers.filter(d => d.status === 'active' && d.currentOrders > 0).length;
    
    const totalRating = drivers.reduce((sum, d) => sum + (d.rating || 0), 0);
    const avgRating = drivers.length > 0 ? (totalRating / drivers.length).toFixed(1) : 0;
    
    const elem1 = document.getElementById('totalDriversCount');
    const elem2 = document.getElementById('activeDriversCount');
    const elem3 = document.getElementById('workingDriversCount');
    const elem4 = document.getElementById('avgRating');
    
    if (elem1) elem1.textContent = totalDrivers;
    if (elem2) elem2.textContent = activeDrivers;
    if (elem3) elem3.textContent = workingDrivers;
    if (elem4) elem4.textContent = avgRating;
}

// Filter drivers
function filterDrivers() {
    const searchInput = document.getElementById('searchDriver');
    const statusFilter = document.getElementById('statusFilter');
    const sortBy = document.getElementById('sortBy');
    
    const searchValue = searchInput ? searchInput.value.toLowerCase() : '';
    const statusValue = statusFilter ? statusFilter.value : '';
    const sortValue = sortBy ? sortBy.value : 'name';
    
    // Filter
    filteredDrivers = drivers.filter(driver => {
        const matchSearch = !searchValue || 
            driver.name.toLowerCase().includes(searchValue) ||
            driver.phone.includes(searchValue) ||
            (driver.vehicle && driver.vehicle.toLowerCase().includes(searchValue));
        
        const matchStatus = !statusValue || driver.status === statusValue;
        
        return matchSearch && matchStatus;
    });
    
    // Sort
    filteredDrivers.sort((a, b) => {
        switch(sortValue) {
            case 'name':
                return a.name.localeCompare(b.name, 'vi');
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            case 'orders':
                return b.currentOrders - a.currentOrders;
            case 'available':
                const availA = a.maxOrders - a.currentOrders;
                const availB = b.maxOrders - b.currentOrders;
                return availB - availA;
            default:
                return 0;
        }
    });
    
    renderDrivers();
}

// Render drivers
function renderDrivers() {
    const tbody = document.getElementById('driversTableBody');
    if (!tbody) return;
    
    if (filteredDrivers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-user-slash" style="font-size: 3rem; margin-bottom: 10px; display: block;"></i>
                    Không tìm thấy tài xế nào
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredDrivers.map(driver => {
        const statusInfo = getDriverStatusInfo(driver);
        const availableOrders = driver.maxOrders - driver.currentOrders;
        const capacityPercent = (driver.currentOrders / driver.maxOrders) * 100;
        
        // Calculate performance
        const driverOrders = orders.filter(o => o.driverId === driver.id);
        const completedOrders = driverOrders.filter(o => o.status === 'delivered').length;
        const failedOrders = driverOrders.filter(o => o.status === 'failed').length;
        const successRate = driverOrders.length > 0 ? ((completedOrders / driverOrders.length) * 100).toFixed(0) : 0;
        
        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 45px; height: 45px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem; flex-shrink: 0;">
                            ${driver.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight: 600; color: #2c3e50; margin-bottom: 3px;">${driver.name}</div>
                            <div style="font-size: 0.85rem; color: #7f8c8d;">ID: ${driver.id}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div style="font-size: 0.9rem;">
                        <div style="margin-bottom: 3px;">
                            <i class="fas fa-phone" style="color: var(--primary); width: 16px;"></i> ${driver.phone}
                        </div>
                        ${driver.email ? `
                            <div style="color: #7f8c8d;">
                                <i class="fas fa-envelope" style="width: 16px;"></i> ${driver.email}
                            </div>
                        ` : ''}
                    </div>
                </td>
                <td>
                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 3px;">
                        <i class="fas fa-car" style="color: var(--primary);"></i> ${driver.vehicle}
                    </div>
                    <div style="font-size: 0.85rem; color: #7f8c8d;">${driver.vehicleType || 'Xe máy'}</div>
                </td>
                <td>
                    <div style="font-weight: 600; color: #2c3e50;">${driver.license}</div>
                    ${driver.licenseExpiry ? `
                        <div style="font-size: 0.85rem; color: #7f8c8d;">
                            HSD: ${formatDate(driver.licenseExpiry)}
                        </div>
                    ` : ''}
                </td>
                <td>
                    <div style="margin-bottom: 5px; font-size: 0.9rem;">
                        <strong style="color: ${capacityPercent > 80 ? '#e74c3c' : '#2c3e50'};">
                            ${driver.currentOrders}/${driver.maxOrders}
                        </strong> đơn
                    </div>
                    <div style="background: #ecf0f1; height: 6px; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${capacityPercent}%; height: 100%; background: ${capacityPercent > 80 ? '#e74c3c' : capacityPercent > 50 ? '#f39c12' : '#27ae60'}; transition: width 0.3s;"></div>
                    </div>
                    <div style="text-align: center; margin-top: 3px; font-size: 0.8rem; color: ${availableOrders > 0 ? '#27ae60' : '#e74c3c'};">
                        ${availableOrders > 0 ? `Còn ${availableOrders}` : 'Đầy'}
                    </div>
                </td>
                <td>
                    <div style="text-align: center; padding: 8px; background: #f8f9fa; border-radius: 6px;">
                        <div style="font-size: 1.3rem; font-weight: bold; color: var(--primary); margin-bottom: 3px;">
                            ${driverOrders.length}
                        </div>
                        <div style="font-size: 0.75rem; color: #7f8c8d; margin-bottom: 5px;">Tổng đơn</div>
                        <div style="display: flex; justify-content: space-around; gap: 10px; font-size: 0.85rem;">
                            <span style="color: #27ae60;" title="Hoàn thành">
                                <i class="fas fa-check"></i> ${completedOrders}
                            </span>
                            <span style="color: #e74c3c;" title="Thất bại">
                                <i class="fas fa-times"></i> ${failedOrders}
                            </span>
                        </div>
                        <div style="margin-top: 5px; font-size: 0.8rem; font-weight: 600; color: ${successRate >= 90 ? '#27ae60' : successRate >= 70 ? '#f39c12' : '#e74c3c'};">
                            ${successRate}% thành công
                        </div>
                    </div>
                </td>
                <td style="text-align: center;">
                    <div style="font-size: 1.5rem; color: #f39c12; margin-bottom: 3px;">
                        ${driver.rating || 0} <i class="fas fa-star" style="font-size: 1rem;"></i>
                    </div>
                    <div style="font-size: 0.8rem; color: #7f8c8d;">
                        ${driverOrders.length} đánh giá
                    </div>
                </td>
                <td style="text-align: center;">
                    <span class="badge ${statusInfo.class}">
                        <i class="${statusInfo.icon}"></i> ${statusInfo.text}
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: center;">
                        ${getDriverActionButtons(driver)}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Get driver status info
function getDriverStatusInfo(driver) {
    const info = {
        'active': { text: 'Đang hoạt động', class: 'badge-success', icon: 'fas fa-check-circle' },
        'busy': { text: 'Đang bận', class: 'badge-warning', icon: 'fas fa-clock' },
        'offline': { text: 'Nghỉ', class: 'badge-secondary', icon: 'fas fa-moon' },
        'inactive': { text: 'Tạm ngưng', class: 'badge-danger', icon: 'fas fa-ban' }
    };
    return info[driver.status] || info.active;
}

// Get driver action buttons based on status
function getDriverActionButtons(driver) {
    let buttons = '';
    
    // QUY TRÌNH NGHIỆP VỤ TÀI XẾ
    if (driver.status === 'active') {
        // Tài xế đang hoạt động
        buttons += `<button class="btn btn-sm btn-warning" onclick="setDriverOffline('${driver.id}')" title="Cho nghỉ">
            <i class="fas fa-moon"></i>
        </button>`;
        buttons += `<button class="btn btn-sm btn-info" onclick="viewDriverDetail('${driver.id}')" title="Xem chi tiết">
            <i class="fas fa-eye"></i>
        </button>`;
        buttons += `<button class="btn btn-sm btn-primary" onclick="viewPerformance('${driver.id}')" title="Hiệu suất">
            <i class="fas fa-chart-line"></i>
        </button>`;
    } else if (driver.status === 'offline') {
        // Tài xế đang nghỉ
        buttons += `<button class="btn btn-sm btn-success" onclick="setDriverActive('${driver.id}')" title="Kích hoạt">
            <i class="fas fa-check-circle"></i>
        </button>`;
        buttons += `<button class="btn btn-sm btn-info" onclick="viewDriverDetail('${driver.id}')" title="Xem chi tiết">
            <i class="fas fa-eye"></i>
        </button>`;
    } else if (driver.status === 'inactive') {
        // Tài xế bị tạm ngưng
        buttons += `<button class="btn btn-sm btn-success" onclick="reactivateDriver('${driver.id}')" title="Kích hoạt lại">
            <i class="fas fa-undo"></i>
        </button>`;
        buttons += `<button class="btn btn-sm btn-info" onclick="viewDriverDetail('${driver.id}')" title="Xem chi tiết">
            <i class="fas fa-eye"></i>
        </button>`;
    }
    
    // Common actions
    buttons += `<button class="btn btn-sm btn-secondary" onclick="editDriver('${driver.id}')" title="Chỉnh sửa">
        <i class="fas fa-edit"></i>
    </button>`;
    
    if (driver.currentOrders === 0) {
        buttons += `<button class="btn btn-sm btn-danger" onclick="deleteDriver('${driver.id}')" title="Xóa tài xế">
            <i class="fas fa-trash"></i>
        </button>`;
    } else {
        buttons += `<button class="btn btn-sm btn-danger" onclick="suspendDriver('${driver.id}')" title="Tạm ngưng">
            <i class="fas fa-ban"></i>
        </button>`;
    }
    
    return buttons;
}

// Reset filters
function resetFilters() {
    const searchInput = document.getElementById('searchDriver');
    const statusFilter = document.getElementById('statusFilter');
    const sortBy = document.getElementById('sortBy');
    
    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = '';
    if (sortBy) sortBy.value = 'name';
    
    filterDrivers();
}

// ========== MODAL FUNCTIONS ==========

function openAddDriverModal() {
    editingDriverId = null;
    const modal = document.getElementById('driverModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('driverForm');
    
    if (modalTitle) modalTitle.textContent = 'Thêm tài xế mới';
    if (form) form.reset();
    
    // Set defaults
    const maxOrdersInput = document.getElementById('maxOrders');
    const statusInput = document.getElementById('driverStatus');
    if (maxOrdersInput) maxOrdersInput.value = 15;
    if (statusInput) statusInput.value = 'active';
    
    if (modal) modal.style.display = 'flex';
}

function editDriver(driverId) {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;
    
    editingDriverId = driverId;
    const modal = document.getElementById('driverModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (modalTitle) modalTitle.textContent = 'Chỉnh sửa tài xế';
    
    // Fill form
    document.getElementById('driverId').value = driver.id;
    document.getElementById('driverName').value = driver.name;
    document.getElementById('driverPhone').value = driver.phone;
    document.getElementById('driverIdCard').value = driver.idCard || '';
    document.getElementById('driverVehicle').value = driver.vehicle;
    document.getElementById('vehicleType').value = driver.vehicleType || 'Xe máy';
    document.getElementById('driverLicense').value = driver.license;
    document.getElementById('licenseExpiry').value = driver.licenseExpiry || '';
    document.getElementById('driverEmail').value = driver.email || '';
    document.getElementById('driverBirthday').value = driver.birthday || '';
    document.getElementById('driverAddress').value = driver.address || '';
    document.getElementById('maxOrders').value = driver.maxOrders;
    document.getElementById('driverStatus').value = driver.status;
    document.getElementById('driverNotes').value = driver.notes || '';
    
    if (modal) modal.style.display = 'flex';
}

function closeDriverModal() {
    const modal = document.getElementById('driverModal');
    if (modal) modal.style.display = 'none';
    editingDriverId = null;
}

function saveDriver(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const driverData = {
        name: document.getElementById('driverName').value.trim(),
        fullname: document.getElementById('driverName').value.trim(),
        phone: document.getElementById('driverPhone').value.trim(),
        phoneNumber: document.getElementById('driverPhone').value.trim(),
        idCard: document.getElementById('driverIdCard').value.trim(),
        vehicle: document.getElementById('driverVehicle').value.trim(),
        vehiclePlate: document.getElementById('driverVehicle').value.trim(),
        licensePlate: document.getElementById('driverVehicle').value.trim(),
        vehicleType: document.getElementById('vehicleType').value,
        license: document.getElementById('driverLicense').value.trim(),
        driverLicense: document.getElementById('driverLicense').value.trim(),
        licenseNumber: document.getElementById('driverLicense').value.trim(),
        licenseExpiry: document.getElementById('licenseExpiry').value,
        licenseDate: document.getElementById('licenseExpiry').value,
        email: document.getElementById('driverEmail').value.trim(),
        birthday: document.getElementById('driverBirthday').value,
        dateOfBirth: document.getElementById('driverBirthday').value,
        address: document.getElementById('driverAddress').value.trim(),
        maxOrders: parseInt(document.getElementById('maxOrders').value) || 15,
        status: document.getElementById('driverStatus').value,
        notes: document.getElementById('driverNotes').value.trim()
    };
    
    if (editingDriverId) {
        // Update existing driver
        const driver = drivers.find(d => d.id === editingDriverId);
        if (driver) {
            Object.assign(driver, driverData);
            driver.updatedAt = new Date().toISOString();
            
            if (!driver.timeline) driver.timeline = [];
            driver.timeline.push({
                action: 'updated',
                time: new Date().toISOString(),
                description: 'Thông tin tài xế được cập nhật'
            });
            
            showNotification(`Cập nhật tài xế ${driver.name} thành công`, 'success');
        }
    } else {
        // Create new driver
        const timestamp = Date.now();
        const phoneDigits = driverData.phone.slice(-4);
        const newDriver = {
            id: 'DRV' + timestamp,
            ...driverData,
            username: 'driver' + phoneDigits,
            password: phoneDigits + '123',
            role: 'driver',
            currentOrders: 0,
            rating: 5.0,
            createdAt: new Date().toISOString(),
            timeline: [
                {
                    action: 'created',
                    time: new Date().toISOString(),
                    description: 'Tài xế được thêm vào hệ thống'
                }
            ]
        };
        
        drivers.unshift(newDriver);
        showNotification(`Thêm tài xế ${newDriver.name} thành công`, 'success');
    }
    
    saveDriversToStorage();
    closeDriverModal();
    loadDrivers();
    updateStatsCards();
}

// ========== WORKFLOW FUNCTIONS ==========

function setDriverActive(driverId) {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;
    
    if (confirm(`Kích hoạt tài xế ${driver.name} để làm việc?`)) {
        driver.status = 'active';
        
        if (!driver.timeline) driver.timeline = [];
        driver.timeline.push({
            action: 'activated',
            time: new Date().toISOString(),
            description: 'Tài xế bắt đầu làm việc'
        });
        
        saveDriversToStorage();
        loadDrivers();
        updateStatsCards();
        showNotification(`Tài xế ${driver.name} đã sẵn sàng làm việc`, 'success');
    }
}

function setDriverOffline(driverId) {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;
    
    if (driver.currentOrders > 0) {
        showNotification(`Tài xế ${driver.name} đang có ${driver.currentOrders} đơn hàng. Vui lòng hoàn thành trước khi nghỉ.`, 'warning');
        return;
    }
    
    if (confirm(`Cho tài xế ${driver.name} nghỉ?`)) {
        driver.status = 'offline';
        
        if (!driver.timeline) driver.timeline = [];
        driver.timeline.push({
            action: 'offline',
            time: new Date().toISOString(),
            description: 'Tài xế nghỉ làm'
        });
        
        saveDriversToStorage();
        loadDrivers();
        updateStatsCards();
        showNotification(`Tài xế ${driver.name} đã nghỉ làm`, 'info');
    }
}

function suspendDriver(driverId) {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;
    
    const reason = prompt(`Lý do tạm ngưng tài xế ${driver.name}:`);
    if (!reason) return;
    
    driver.status = 'inactive';
    driver.suspendReason = reason;
    
    if (!driver.timeline) driver.timeline = [];
    driver.timeline.push({
        action: 'suspended',
        time: new Date().toISOString(),
        description: `Tài xế bị tạm ngưng: ${reason}`
    });
    
    saveDriversToStorage();
    loadDrivers();
    updateStatsCards();
    showNotification(`Đã tạm ngưng tài xế ${driver.name}`, 'warning');
}

function reactivateDriver(driverId) {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;
    
    if (confirm(`Kích hoạt lại tài xế ${driver.name}?`)) {
        driver.status = 'active';
        delete driver.suspendReason;
        
        if (!driver.timeline) driver.timeline = [];
        driver.timeline.push({
            action: 'reactivated',
            time: new Date().toISOString(),
            description: 'Tài xế được kích hoạt lại'
        });
        
        saveDriversToStorage();
        loadDrivers();
        updateStatsCards();
        showNotification(`Đã kích hoạt lại tài xế ${driver.name}`, 'success');
    }
}

function deleteDriver(driverId) {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;
    
    if (driver.currentOrders > 0) {
        showNotification(`Không thể xóa tài xế ${driver.name} vì đang có ${driver.currentOrders} đơn hàng`, 'error');
        return;
    }
    
    if (confirm(`Bạn có chắc muốn xóa tài xế ${driver.name}? Hành động này không thể hoàn tác.`)) {
        const index = drivers.findIndex(d => d.id === driverId);
        if (index !== -1) {
            drivers.splice(index, 1);
            saveDriversToStorage();
            loadDrivers();
            updateStatsCards();
            showNotification(`Đã xóa tài xế ${driver.name}`, 'success');
        }
    }
}

// ========== DETAIL & PERFORMANCE FUNCTIONS ==========

function viewDriverDetail(driverId) {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;
    
    const driverOrders = orders.filter(o => o.driverId === driver.id);
    const completedOrders = driverOrders.filter(o => o.status === 'delivered').length;
    const failedOrders = driverOrders.filter(o => o.status === 'failed').length;
    const activeOrders = driverOrders.filter(o => ['assigned', 'picking', 'delivering'].includes(o.status)).length;
    
    const totalCOD = driverOrders
        .filter(o => o.status === 'delivered' && o.codCollected)
        .reduce((sum, o) => sum + (o.codAmount || 0), 0);
    
    const statusInfo = getDriverStatusInfo(driver);
    
    let ordersListHtml = '';
    if (driverOrders.length > 0) {
        const recentOrders = driverOrders.slice(0, 10);
        ordersListHtml = recentOrders.map(order => `
            <div style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${order.id}</strong> - ${order.customerName}
                        <div style="font-size: 0.85rem; color: #666;">
                            <i class="fas fa-map-marker-alt"></i> ${order.deliveryAddress}
                        </div>
                        <div style="font-size: 0.85rem; color: #999;">
                            ${formatDateTime(order.createdAt)}
                        </div>
                    </div>
                    <span class="badge ${getStatusClass(order.status)}">${getStatusText(order.status)}</span>
                </div>
            </div>
        `).join('');
    } else {
        ordersListHtml = '<p style="text-align: center; color: #999; padding: 20px;">Chưa có đơn hàng nào</p>';
    }
    
    const content = `
        <div class="driver-detail-container">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px;">
                <div class="detail-section" style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <h4><i class="fas fa-user"></i> Thông tin cá nhân</h4>
                    <div class="detail-grid" style="display: grid; gap: 12px;">
                        <div class="detail-item">
                            <span class="detail-label">Họ tên:</span>
                            <span class="detail-value"><strong>${driver.name}</strong></span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Số điện thoại:</span>
                            <span class="detail-value">${driver.phone}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Email:</span>
                            <span class="detail-value">${driver.email || 'Chưa cập nhật'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">CMND/CCCD:</span>
                            <span class="detail-value">${driver.idCard || 'Chưa cập nhật'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Ngày sinh:</span>
                            <span class="detail-value">${driver.birthday ? formatDate(driver.birthday) : 'Chưa cập nhật'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Địa chỉ:</span>
                            <span class="detail-value">${driver.address || 'Chưa cập nhật'}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section" style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <h4><i class="fas fa-car"></i> Thông tin phương tiện</h4>
                    <div class="detail-grid" style="display: grid; gap: 12px;">
                        <div class="detail-item">
                            <span class="detail-label">Biển số xe:</span>
                            <span class="detail-value"><strong>${driver.vehicle}</strong></span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Loại xe:</span>
                            <span class="detail-value">${driver.vehicleType || 'Xe máy'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">GPLX:</span>
                            <span class="detail-value">${driver.license}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Hạn GPLX:</span>
                            <span class="detail-value">${driver.licenseExpiry ? formatDate(driver.licenseExpiry) : 'Chưa cập nhật'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Trạng thái:</span>
                            <span class="badge ${statusInfo.class}"><i class="${statusInfo.icon}"></i> ${statusInfo.text}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Đánh giá:</span>
                            <span class="detail-value"><strong style="color: #f39c12;">${driver.rating || 0} <i class="fas fa-star"></i></strong></span>
                        </div>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
                <div style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; margin-bottom: 5px;">${driverOrders.length}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Tổng đơn hàng</div>
                </div>
                <div style="background: linear-gradient(135deg, #27ae60, #229954); color: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; margin-bottom: 5px;">${completedOrders}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Hoàn thành</div>
                </div>
                <div style="background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; margin-bottom: 5px;">${failedOrders}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Thất bại</div>
                </div>
                <div style="background: linear-gradient(135deg, #f39c12, #e67e22); color: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; margin-bottom: 5px;">${activeOrders}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Đang giao</div>
                </div>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h4><i class="fas fa-money-bill-wave"></i> Thông tin COD</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 15px;">
                    <div>
                        <span style="color: #7f8c8d;">Tổng COD đã thu:</span>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #27ae60; margin-top: 5px;">
                            ${formatMoney(totalCOD)}
                        </div>
                    </div>
                    <div>
                        <span style="color: #7f8c8d;">Công suất hiện tại:</span>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #3498db; margin-top: 5px;">
                            ${driver.currentOrders}/${driver.maxOrders} đơn
                        </div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-box"></i> Đơn hàng gần đây (${driverOrders.length})</h4>
                <div style="max-height: 400px; overflow-y: auto; margin-top: 15px;">
                    ${ordersListHtml}
                </div>
            </div>

            ${driver.timeline && driver.timeline.length > 0 ? `
                <div class="detail-section" style="margin-top: 30px;">
                    <h4><i class="fas fa-history"></i> Lịch sử hoạt động</h4>
                    <div class="timeline" style="margin-top: 15px;">
                        ${driver.timeline.slice(0, 10).map(t => `
                            <div class="timeline-item">
                                <div class="timeline-icon ${getTimelineIconClass(t.action)}">
                                    <i class="${getTimelineIcon(t.action)}"></i>
                                </div>
                                <div class="timeline-content">
                                    <div class="timeline-time">${formatDateTime(t.time)}</div>
                                    <div class="timeline-desc">${t.description}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${driver.notes ? `
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin-top: 20px;">
                    <strong><i class="fas fa-sticky-note"></i> Ghi chú:</strong>
                    <p style="margin: 10px 0 0 0;">${driver.notes}</p>
                </div>
            ` : ''}
        </div>
    `;
    
    const modalContent = document.getElementById('driverDetailContent');
    const modalId = document.getElementById('detailDriverId');
    const modal = document.getElementById('driverDetailModal');
    
    if (modalContent) modalContent.innerHTML = content;
    if (modalId) modalId.textContent = driver.name;
    if (modal) modal.style.display = 'flex';
}

function closeDriverDetailModal() {
    const modal = document.getElementById('driverDetailModal');
    if (modal) modal.style.display = 'none';
}

function viewPerformance(driverId) {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;
    
    const driverOrders = orders.filter(o => o.driverId === driver.id);
    const completedOrders = driverOrders.filter(o => o.status === 'delivered');
    const failedOrders = driverOrders.filter(o => o.status === 'failed');
    
    const successRate = driverOrders.length > 0 ? ((completedOrders.length / driverOrders.length) * 100).toFixed(1) : 0;
    const avgDeliveryTime = completedOrders.length > 0 ? 
        (completedOrders.reduce((sum, o) => {
            if (o.deliveredAt && o.createdAt) {
                const diff = new Date(o.deliveredAt) - new Date(o.createdAt);
                return sum + (diff / (1000 * 60 * 60)); // hours
            }
            return sum;
        }, 0) / completedOrders.length).toFixed(1) : 0;
    
    const totalCOD = completedOrders
        .filter(o => o.codCollected)
        .reduce((sum, o) => sum + (o.codAmount || 0), 0);
    
    // Calculate this month stats
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthOrders = driverOrders.filter(o => new Date(o.createdAt) >= firstDayOfMonth);
    const thisMonthCompleted = thisMonthOrders.filter(o => o.status === 'delivered').length;
    const thisMonthFailed = thisMonthOrders.filter(o => o.status === 'failed').length;
    
    const content = `
        <div class="performance-container">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px;">
                <div style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 30px; border-radius: 12px; text-align: center;">
                    <i class="fas fa-percent" style="font-size: 3rem; opacity: 0.3; margin-bottom: 15px;"></i>
                    <div style="font-size: 3rem; font-weight: bold; margin-bottom: 10px;">${successRate}%</div>
                    <div style="font-size: 1.1rem; opacity: 0.9;">Tỉ lệ giao thành công</div>
                </div>
                
                <div style="background: linear-gradient(135deg, #27ae60, #229954); color: white; padding: 30px; border-radius: 12px; text-align: center;">
                    <i class="fas fa-clock" style="font-size: 3rem; opacity: 0.3; margin-bottom: 15px;"></i>
                    <div style="font-size: 3rem; font-weight: bold; margin-bottom: 10px;">${avgDeliveryTime}h</div>
                    <div style="font-size: 1.1rem; opacity: 0.9;">Thời gian giao TB</div>
                </div>
            </div>

            <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
                <h4 style="margin-bottom: 20px;"><i class="fas fa-chart-bar"></i> Tổng quan hiệu suất</h4>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
                    <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: bold; color: #3498db; margin-bottom: 8px;">${driverOrders.length}</div>
                        <div style="font-size: 0.9rem; color: #7f8c8d;">Tổng đơn</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: bold; color: #27ae60; margin-bottom: 8px;">${completedOrders.length}</div>
                        <div style="font-size: 0.9rem; color: #7f8c8d;">Hoàn thành</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: bold; color: #e74c3c; margin-bottom: 8px;">${failedOrders.length}</div>
                        <div style="font-size: 0.9rem; color: #7f8c8d;">Thất bại</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: bold; color: #f39c12; margin-bottom: 8px;">${driver.rating || 0}</div>
                        <div style="font-size: 0.9rem; color: #7f8c8d;">Đánh giá</div>
                    </div>
                </div>
            </div>

            <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
                <h4 style="margin-bottom: 20px;"><i class="fas fa-calendar-alt"></i> Hiệu suất tháng này</h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: bold; color: #3498db; margin-bottom: 8px;">${thisMonthOrders.length}</div>
                        <div style="font-size: 0.9rem; color: #7f8c8d;">Tổng đơn</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: bold; color: #27ae60; margin-bottom: 8px;">${thisMonthCompleted}</div>
                        <div style="font-size: 0.9rem; color: #7f8c8d;">Hoàn thành</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: bold; color: #e74c3c; margin-bottom: 8px;">${thisMonthFailed}</div>
                        <div style="font-size: 0.9rem; color: #7f8c8d;">Thất bại</div>
                    </div>
                </div>
            </div>

            <div style="background: linear-gradient(135deg, #f39c12, #e67e22); color: white; padding: 25px; border-radius: 12px; text-align: center;">
                <h4 style="opacity: 0.9; margin-bottom: 15px;"><i class="fas fa-money-bill-wave"></i> Tổng COD đã thu</h4>
                <div style="font-size: 3rem; font-weight: bold;">${formatMoney(totalCOD)}</div>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #e8f5e9; border-radius: 8px;">
                <h4 style="color: #27ae60; margin-bottom: 15px;"><i class="fas fa-trophy"></i> Thành tích nổi bật</h4>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${successRate >= 90 ? '<li style="padding: 8px 0;"><i class="fas fa-check-circle" style="color: #27ae60;"></i> Tỉ lệ giao hàng thành công xuất sắc (≥90%)</li>' : ''}
                    ${driver.rating >= 4.5 ? '<li style="padding: 8px 0;"><i class="fas fa-star" style="color: #f39c12;"></i> Đánh giá cao từ khách hàng (≥4.5 sao)</li>' : ''}
                    ${completedOrders.length >= 100 ? '<li style="padding: 8px 0;"><i class="fas fa-medal" style="color: #3498db;"></i> Hoàn thành hơn 100 đơn hàng</li>' : ''}
                    ${failedOrders.length === 0 && completedOrders.length > 0 ? '<li style="padding: 8px 0;"><i class="fas fa-award" style="color: #9b59b6;"></i> Không có đơn hàng thất bại</li>' : ''}
                </ul>
            </div>
        </div>
    `;
    
    const modalContent = document.getElementById('performanceContent');
    const modalName = document.getElementById('performanceDriverName');
    const modal = document.getElementById('performanceModal');
    
    if (modalContent) modalContent.innerHTML = content;
    if (modalName) modalName.textContent = driver.name;
    if (modal) modal.style.display = 'flex';
}

function closePerformanceModal() {
    const modal = document.getElementById('performanceModal');
    if (modal) modal.style.display = 'none';
}

// ========== HELPER FUNCTIONS ==========

function getTimelineIcon(action) {
    const icons = {
        'created': 'fas fa-plus-circle',
        'updated': 'fas fa-edit',
        'activated': 'fas fa-check-circle',
        'offline': 'fas fa-moon',
        'suspended': 'fas fa-ban',
        'reactivated': 'fas fa-undo'
    };
    return icons[action] || 'fas fa-circle';
}

function getTimelineIconClass(action) {
    const classes = {
        'created': 'success',
        'updated': 'info',
        'activated': 'success',
        'offline': 'warning',
        'suspended': 'danger',
        'reactivated': 'success'
    };
    return classes[action] || 'primary';
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
}

function sortTable(column) {
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.value = column;
        filterDrivers();
    }
}

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

function saveDriversToStorage() {
    localStorage.setItem('drivers', JSON.stringify(drivers));
    
    // DataSync support
    if (typeof DataSync !== 'undefined') {
        DataSync.set('drivers', drivers);
        DataSync.triggerSync('drivers');
        console.log('[Admin Drivers] Synced via DataSync');
    }
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
