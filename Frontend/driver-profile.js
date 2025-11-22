// ==================== GLOBAL VARIABLES ====================
let currentDriver = null;
let allDrivers = [];
let allOrders = [];
let isEditMode = false;
let isEditVehicleMode = false;
let originalData = {};
let originalVehicleData = {};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    loadCurrentDriver();
    loadAllData();
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
    document.getElementById('profile-avatar-large').textContent = initials;
    
    console.log('[Driver Profile] Logged in as:', currentDriver);
}

// ==================== DATA LOADING ====================
function loadAllData() {
    if (typeof DataSync !== 'undefined') {
        allDrivers = DataSync.get('drivers') || [];
        allOrders = DataSync.get('orders') || [];
        console.log('[Driver Profile] Loaded via DataSync');
    } else {
        allDrivers = JSON.parse(localStorage.getItem('drivers') || '[]');
        allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        console.log('[Driver Profile] Loaded via localStorage');
    }
    
    // Find full driver data với nhiều cách mapping
    const fullDriverData = allDrivers.find(d => 
        d.username === currentDriver.username || 
        d.email === currentDriver.email ||
        d.name === currentDriver.username ||
        d.fullname === currentDriver.username ||
        d.phone === currentDriver.phone ||
        d.id === currentDriver.id
    );
    
    if (fullDriverData) {
        // Merge và normalize dữ liệu
        currentDriver = { 
            ...currentDriver, 
            ...fullDriverData,
            // Đảm bảo có các trường chuẩn
            fullname: fullDriverData.fullname || fullDriverData.name,
            username: fullDriverData.username || currentDriver.username,
            phone: fullDriverData.phone || fullDriverData.phoneNumber,
            phoneNumber: fullDriverData.phoneNumber || fullDriverData.phone,
            vehiclePlate: fullDriverData.vehiclePlate || fullDriverData.vehicle || fullDriverData.licensePlate,
            vehicleType: fullDriverData.vehicleType || 'Xe máy',
            driverLicense: fullDriverData.driverLicense || fullDriverData.license || fullDriverData.licenseNumber,
            dateOfBirth: fullDriverData.dateOfBirth || fullDriverData.birthday
        };
        localStorage.setItem('currentUser', JSON.stringify(currentDriver));
        console.log('[Driver Profile] Merged driver data with admin data');
    }
    
    console.log('[Driver Profile] Full driver data:', currentDriver);
    console.log('[Driver Profile] Total orders:', allOrders.length);
    
    renderProfile();
    renderStatistics();
}

// ==================== RENDER PROFILE ====================
function renderProfile() {
    // Personal Information
    document.getElementById('profile-name').textContent = currentDriver.fullname || currentDriver.username || 'Tài xế';
    document.getElementById('fullname-display').textContent = currentDriver.fullname || currentDriver.name || '-';
    document.getElementById('fullname-input').value = currentDriver.fullname || currentDriver.name || '';
    document.getElementById('username-display').textContent = currentDriver.username || '-';
    document.getElementById('email-display').textContent = currentDriver.email || '-';
    document.getElementById('email-input').value = currentDriver.email || '';
    document.getElementById('phone-display').textContent = currentDriver.phone || currentDriver.phoneNumber || '-';
    document.getElementById('phone-input').value = currentDriver.phone || currentDriver.phoneNumber || '';
    
    if (currentDriver.dateOfBirth) {
        document.getElementById('dob-display').textContent = new Date(currentDriver.dateOfBirth).toLocaleDateString('vi-VN');
        document.getElementById('dob-input').value = currentDriver.dateOfBirth;
    } else {
        document.getElementById('dob-display').textContent = '-';
        document.getElementById('dob-input').value = '';
    }
    
    document.getElementById('address-display').textContent = currentDriver.address || '-';
    document.getElementById('address-input').value = currentDriver.address || '';
    
    // Vehicle Information
    document.getElementById('vehicle-plate').textContent = currentDriver.vehiclePlate || currentDriver.licensePlate || '-';
    document.getElementById('vehicle-plate-input').value = currentDriver.vehiclePlate || currentDriver.licensePlate || '';
    
    document.getElementById('vehicle-type').textContent = currentDriver.vehicleType || currentDriver.vehicle || '-';
    document.getElementById('vehicle-type-input').value = currentDriver.vehicleType || currentDriver.vehicle || '';
    
    document.getElementById('driver-license').textContent = currentDriver.driverLicense || currentDriver.licenseNumber || '-';
    document.getElementById('driver-license-input').value = currentDriver.driverLicense || currentDriver.licenseNumber || '';
    
    if (currentDriver.licenseDate) {
        document.getElementById('license-date').textContent = new Date(currentDriver.licenseDate).toLocaleDateString('vi-VN');
        document.getElementById('license-date-input').value = currentDriver.licenseDate;
    } else {
        document.getElementById('license-date').textContent = '-';
        document.getElementById('license-date-input').value = '';
    }
}

// ==================== STATISTICS ====================
function renderStatistics() {
    // Filter orders for this driver với nhiều cách mapping
    const myOrders = allOrders.filter(order => {
        return order.driver === currentDriver.username || 
               order.driver === currentDriver.fullname ||
               order.driver === currentDriver.name ||
               order.driverEmail === currentDriver.email ||
               order.assignedDriver === currentDriver.username ||
               order.assignedDriver === currentDriver.fullname ||
               order.assignedDriver === currentDriver.name ||
               order.driverId === currentDriver.id ||
               order.driverPhone === currentDriver.phone;
    });
    
    console.log('[Driver Profile] My orders:', myOrders.length);
    
    const completedOrders = myOrders.filter(o => o.status === 'delivered');
    const failedOrders = myOrders.filter(o => o.status === 'failed');
    const totalOrders = myOrders.length;
    const successRate = totalOrders > 0 ? ((completedOrders.length / totalOrders) * 100).toFixed(1) : 0;
    
    // Calculate COD
    let totalCOD = 0;
    completedOrders.forEach(order => {
        if (order.codAmount) {
            totalCOD += parseFloat(order.codAmount) || 0;
        }
    });
    
    // Calculate working days (unique delivery dates)
    const deliveryDates = new Set();
    completedOrders.forEach(order => {
        if (order.deliveredAt) {
            const date = new Date(order.deliveredAt).toISOString().split('T')[0];
            deliveryDates.add(date);
        } else if (order.updatedAt && order.status === 'delivered') {
            const date = new Date(order.updatedAt).toISOString().split('T')[0];
            deliveryDates.add(date);
        }
    });
    
    // Get rating from currentDriver or calculate from orders
    const rating = currentDriver.rating || 4.8;
    
    // Profile sidebar stats
    document.getElementById('total-orders-stat').textContent = totalOrders;
    document.getElementById('success-rate-stat').textContent = successRate + '%';
    document.getElementById('total-cod-stat').textContent = formatCurrencyShort(totalCOD);
    document.getElementById('rating-stat').textContent = rating.toFixed(1);
    
    // Work statistics cards
    document.getElementById('days-worked').textContent = deliveryDates.size || 0;
    document.getElementById('total-deliveries').textContent = completedOrders.length;
    document.getElementById('avg-rating').textContent = rating.toFixed(1);
    document.getElementById('total-cod-collected').textContent = formatCurrency(totalCOD);
    
    console.log('[Driver Profile] Statistics:', {
        totalOrders,
        completed: completedOrders.length,
        failed: failedOrders.length,
        successRate: successRate + '%',
        totalCOD,
        workingDays: deliveryDates.size
    });
}

// ==================== EDIT PERSONAL INFO ====================
function toggleEditMode() {
    isEditMode = true;
    
    // Save original data for cancel
    originalData = {
        fullname: document.getElementById('fullname-input').value,
        email: document.getElementById('email-input').value,
        phone: document.getElementById('phone-input').value,
        dob: document.getElementById('dob-input').value,
        address: document.getElementById('address-input').value
    };
    
    // Show input fields, hide display values
    document.getElementById('personal-info-card').classList.add('edit-mode');
    
    // Toggle buttons
    document.getElementById('edit-btn').style.display = 'none';
    document.getElementById('save-btn').style.display = 'inline-block';
    document.getElementById('cancel-btn').style.display = 'inline-block';
}

function cancelEdit() {
    isEditMode = false;
    
    // Restore original values
    document.getElementById('fullname-input').value = originalData.fullname;
    document.getElementById('email-input').value = originalData.email;
    document.getElementById('phone-input').value = originalData.phone;
    document.getElementById('dob-input').value = originalData.dob;
    document.getElementById('address-input').value = originalData.address;
    
    // Hide input fields, show display values
    document.getElementById('personal-info-card').classList.remove('edit-mode');
    
    // Toggle buttons
    document.getElementById('edit-btn').style.display = 'inline-block';
    document.getElementById('save-btn').style.display = 'none';
    document.getElementById('cancel-btn').style.display = 'none';
}

function saveProfile() {
    // Get updated values
    const updatedData = {
        fullname: document.getElementById('fullname-input').value.trim(),
        email: document.getElementById('email-input').value.trim(),
        phone: document.getElementById('phone-input').value.trim(),
        dateOfBirth: document.getElementById('dob-input').value,
        address: document.getElementById('address-input').value.trim()
    };
    
    // Validate
    if (!updatedData.fullname) {
        showNotification('Vui lòng nhập họ tên!', 'error');
        return;
    }
    if (!updatedData.email) {
        showNotification('Vui lòng nhập email!', 'error');
        return;
    }
    if (!updatedData.phone) {
        showNotification('Vui lòng nhập số điện thoại!', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updatedData.email)) {
        showNotification('Email không hợp lệ!', 'error');
        return;
    }
    
    // Phone validation
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(updatedData.phone.replace(/\s/g, ''))) {
        showNotification('Số điện thoại không hợp lệ! (10-11 số)', 'error');
        return;
    }
    
    // Update currentDriver
    currentDriver.fullname = updatedData.fullname;
    currentDriver.name = updatedData.fullname;
    currentDriver.email = updatedData.email;
    currentDriver.phone = updatedData.phone;
    currentDriver.phoneNumber = updatedData.phone;
    currentDriver.dateOfBirth = updatedData.dateOfBirth;
    currentDriver.address = updatedData.address;
    currentDriver.updatedAt = new Date().toISOString();
    
    // Update in allDrivers array
    const driverIndex = allDrivers.findIndex(d => 
        d.username === currentDriver.username || 
        d.email === originalData.email ||
        d.id === currentDriver.id ||
        d.phone === currentDriver.phone
    );
    
    if (driverIndex !== -1) {
        // Update với đầy đủ trường để tương thích với admin
        allDrivers[driverIndex] = { 
            ...allDrivers[driverIndex], 
            ...updatedData,
            name: updatedData.fullname,
            phoneNumber: updatedData.phone,
            updatedAt: new Date().toISOString() 
        };
        
        // Save to storage
        if (typeof DataSync !== 'undefined') {
            DataSync.set('drivers', allDrivers);
            DataSync.triggerSync('drivers');
        } else {
            localStorage.setItem('drivers', JSON.stringify(allDrivers));
        }
        
        console.log('[Driver Profile] Updated driver data');
    }
    
    // Update currentUser in localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentDriver));
    
    showNotification('Đã cập nhật thông tin thành công!', 'success');
    
    // Exit edit mode
    isEditMode = false;
    document.getElementById('personal-info-card').classList.remove('edit-mode');
    document.getElementById('edit-btn').style.display = 'inline-block';
    document.getElementById('save-btn').style.display = 'none';
    document.getElementById('cancel-btn').style.display = 'none';
    
    // Re-render
    renderProfile();
}

// ==================== EDIT VEHICLE INFO ====================
function toggleEditVehicle() {
    isEditVehicleMode = true;
    
    // Save original data
    originalVehicleData = {
        vehiclePlate: document.getElementById('vehicle-plate-input').value,
        vehicleType: document.getElementById('vehicle-type-input').value,
        driverLicense: document.getElementById('driver-license-input').value,
        licenseDate: document.getElementById('license-date-input').value
    };
    
    // Toggle display
    document.getElementById('vehicle-info-card').classList.add('edit-mode-vehicle');
    
    // Toggle buttons
    document.getElementById('edit-vehicle-btn').style.display = 'none';
    document.getElementById('save-vehicle-btn').style.display = 'inline-block';
    document.getElementById('cancel-vehicle-btn').style.display = 'inline-block';
}

function cancelEditVehicle() {
    isEditVehicleMode = false;
    
    // Restore original values
    document.getElementById('vehicle-plate-input').value = originalVehicleData.vehiclePlate;
    document.getElementById('vehicle-type-input').value = originalVehicleData.vehicleType;
    document.getElementById('driver-license-input').value = originalVehicleData.driverLicense;
    document.getElementById('license-date-input').value = originalVehicleData.licenseDate;
    
    // Toggle display
    document.getElementById('vehicle-info-card').classList.remove('edit-mode-vehicle');
    
    // Toggle buttons
    document.getElementById('edit-vehicle-btn').style.display = 'inline-block';
    document.getElementById('save-vehicle-btn').style.display = 'none';
    document.getElementById('cancel-vehicle-btn').style.display = 'none';
}

function saveVehicle() {
    // Get updated values
    const updatedData = {
        vehiclePlate: document.getElementById('vehicle-plate-input').value.trim().toUpperCase(),
        vehicleType: document.getElementById('vehicle-type-input').value,
        driverLicense: document.getElementById('driver-license-input').value.trim(),
        licenseDate: document.getElementById('license-date-input').value
    };
    
    // Validate
    if (!updatedData.vehiclePlate) {
        showNotification('Vui lòng nhập biển số xe!', 'error');
        return;
    }
    if (!updatedData.vehicleType) {
        showNotification('Vui lòng chọn loại xe!', 'error');
        return;
    }
    if (!updatedData.driverLicense) {
        showNotification('Vui lòng nhập số giấy phép lái xe!', 'error');
        return;
    }
    
    // Update currentDriver
    currentDriver.vehiclePlate = updatedData.vehiclePlate;
    currentDriver.licensePlate = updatedData.vehiclePlate;
    currentDriver.vehicleType = updatedData.vehicleType;
    currentDriver.vehicle = updatedData.vehicleType;
    currentDriver.driverLicense = updatedData.driverLicense;
    currentDriver.licenseNumber = updatedData.driverLicense;
    currentDriver.licenseDate = updatedData.licenseDate;
    currentDriver.updatedAt = new Date().toISOString();
    
    // Update in allDrivers array
    const driverIndex = allDrivers.findIndex(d => 
        d.username === currentDriver.username ||
        d.id === currentDriver.id ||
        d.phone === currentDriver.phone
    );
    if (driverIndex !== -1) {
        // Update với đầy đủ trường để tương thích với admin
        allDrivers[driverIndex] = { 
            ...allDrivers[driverIndex], 
            ...updatedData,
            vehicle: updatedData.vehiclePlate,
            license: updatedData.driverLicense,
            updatedAt: new Date().toISOString() 
        };
        
        // Save to storage
        if (typeof DataSync !== 'undefined') {
            DataSync.set('drivers', allDrivers);
            DataSync.triggerSync('drivers');
        } else {
            localStorage.setItem('drivers', JSON.stringify(allDrivers));
        }
    }
    
    // Update currentUser
    localStorage.setItem('currentUser', JSON.stringify(currentDriver));
    
    showNotification('Đã cập nhật thông tin phương tiện thành công!', 'success');
    
    // Exit edit mode
    isEditVehicleMode = false;
    document.getElementById('vehicle-info-card').classList.remove('edit-mode-vehicle');
    document.getElementById('edit-vehicle-btn').style.display = 'inline-block';
    document.getElementById('save-vehicle-btn').style.display = 'none';
    document.getElementById('cancel-vehicle-btn').style.display = 'none';
    
    // Re-render
    renderProfile();
}

// ==================== CHANGE PASSWORD ====================
function changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    if (currentPassword !== currentDriver.password) {
        showNotification('Mật khẩu hiện tại không đúng!', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }
    
    if (newPassword === currentPassword) {
        showNotification('Mật khẩu mới phải khác mật khẩu hiện tại!', 'error');
        return;
    }
    
    // Update password
    currentDriver.password = newPassword;
    currentDriver.updatedAt = new Date().toISOString();
    
    // Update in allDrivers
    const driverIndex = allDrivers.findIndex(d => d.username === currentDriver.username);
    if (driverIndex !== -1) {
        allDrivers[driverIndex].password = newPassword;
        allDrivers[driverIndex].updatedAt = new Date().toISOString();
        
        // Save
        if (typeof DataSync !== 'undefined') {
            DataSync.set('drivers', allDrivers);
            DataSync.triggerSync('drivers');
        } else {
            localStorage.setItem('drivers', JSON.stringify(allDrivers));
        }
    }
    
    // Update currentUser
    localStorage.setItem('currentUser', JSON.stringify(currentDriver));
    
    showNotification('Đã đổi mật khẩu thành công! Vui lòng đăng nhập lại.', 'success');
    
    // Clear password fields
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('password-strength-indicator').innerHTML = '';
    
    // Auto logout after 2 seconds
    setTimeout(() => {
        logout();
    }, 2000);
}

// ==================== PASSWORD STRENGTH ====================
function checkPasswordStrength() {
    const password = document.getElementById('new-password').value;
    const indicator = document.getElementById('password-strength-indicator');
    
    if (!password) {
        indicator.innerHTML = '';
        return;
    }
    
    let strength = 0;
    let message = '';
    let className = '';
    let tips = [];
    
    // Check length
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    else if (password.length < 8) tips.push('Tăng độ dài (≥8 ký tự)');
    
    // Check complexity
    if (/[a-z]/.test(password)) strength++;
    else tips.push('Thêm chữ thường');
    
    if (/[A-Z]/.test(password)) strength++;
    else tips.push('Thêm chữ hoa');
    
    if (/[0-9]/.test(password)) strength++;
    else tips.push('Thêm số');
    
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    else tips.push('Thêm ký tự đặc biệt (@#$%...)');
    
    if (strength <= 2) {
        message = '<i class="fas fa-exclamation-triangle"></i> <strong>Mật khẩu yếu</strong>';
        if (tips.length > 0) message += ' - Khuyến nghị: ' + tips.slice(0, 2).join(', ');
        className = 'weak';
    } else if (strength <= 4) {
        message = '<i class="fas fa-check-circle"></i> <strong>Mật khẩu trung bình</strong>';
        if (tips.length > 0) message += ' - Nên: ' + tips[0];
        className = 'medium';
    } else {
        message = '<i class="fas fa-shield-alt"></i> <strong>Mật khẩu mạnh</strong> - Rất tốt! An toàn cao.';
        className = 'strong';
    }
    
    indicator.innerHTML = `<div class="password-strength ${className}">${message}</div>`;
}

// ==================== UTILITY FUNCTIONS ====================
function formatCurrency(amount) {
    if (!amount || amount === 0) return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

function formatCurrencyShort(amount) {
    if (!amount || amount === 0) return '0đ';
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(0) + 'K';
    }
    return amount + 'đ';
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
    }, 4000);
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
    console.log('[Driver Profile] Auto-refreshing statistics...');
    const currentScroll = window.scrollY;
    if (typeof DataSync !== 'undefined') {
        allOrders = DataSync.get('orders') || [];
        renderStatistics();
    }
    window.scrollTo(0, currentScroll);
}, 120000); // Refresh every 2 minutes

if (typeof DataSync !== 'undefined') {
    window.addEventListener('dataSync', function(event) {
        console.log('[Driver Profile] DataSync event received:', event.detail.key);
        if (event.detail.key === 'drivers') {
            loadAllData();
        } else if (event.detail.key === 'orders') {
            allOrders = DataSync.get('orders') || [];
            renderStatistics();
        }
    });
}

window.addEventListener('storage', function(event) {
    if (event.key === 'drivers' || event.key === 'orders') {
        console.log('[Driver Profile] Storage event detected');
        loadAllData();
    }
});

console.log('[Driver Profile] Script loaded successfully');
