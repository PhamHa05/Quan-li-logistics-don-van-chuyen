// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadSystemInfo();
    loadStats();
    loadSettings();
});

// ============= TAB SWITCHING =============
function switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active from all buttons
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.closest('.tab-btn').classList.add('active');
}

// ============= GENERAL SETTINGS =============
function saveGeneralSettings() {
    const settings = {
        companyName: document.getElementById('companyName').value,
        companyPhone: document.getElementById('companyPhone').value,
        companyEmail: document.getElementById('companyEmail').value,
        companyWebsite: document.getElementById('companyWebsite').value,
        companyAddress: document.getElementById('companyAddress').value,
        autoAssignDriver: document.getElementById('autoAssignDriver').checked,
        enableNotifications: document.getElementById('enableNotifications').checked,
        enableSounds: document.getElementById('enableSounds').checked,
        timezone: document.getElementById('timezone').value
    };
    
    localStorage.setItem('generalSettings', JSON.stringify(settings));
    showNotification('Đã lưu cài đặt chung!', 'success');
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('generalSettings') || '{}');
    
    if (settings.companyName) document.getElementById('companyName').value = settings.companyName;
    if (settings.companyPhone) document.getElementById('companyPhone').value = settings.companyPhone;
    if (settings.companyEmail) document.getElementById('companyEmail').value = settings.companyEmail;
    if (settings.companyWebsite) document.getElementById('companyWebsite').value = settings.companyWebsite;
    if (settings.companyAddress) document.getElementById('companyAddress').value = settings.companyAddress;
    
    if (settings.autoAssignDriver !== undefined) document.getElementById('autoAssignDriver').checked = settings.autoAssignDriver;
    if (settings.enableNotifications !== undefined) document.getElementById('enableNotifications').checked = settings.enableNotifications;
    if (settings.enableSounds !== undefined) document.getElementById('enableSounds').checked = settings.enableSounds;
    if (settings.timezone) document.getElementById('timezone').value = settings.timezone;
    
    // Load appearance settings
    const appearance = JSON.parse(localStorage.getItem('appearanceSettings') || '{}');
    if (appearance.themeMode) document.getElementById('themeMode').value = appearance.themeMode;
    if (appearance.fontSize) document.getElementById('fontSize').value = appearance.fontSize;
    if (appearance.sidebarWidth) {
        document.getElementById('sidebarWidth').value = appearance.sidebarWidth;
        document.getElementById('sidebarWidthValue').textContent = appearance.sidebarWidth + 'px';
    }
    if (appearance.compactMode !== undefined) document.getElementById('compactMode').checked = appearance.compactMode;
    if (appearance.animationsEnabled !== undefined) document.getElementById('animationsEnabled').checked = appearance.animationsEnabled;
}

// ============= DATA MANAGEMENT =============
function loadStats() {
    if (typeof DataSync === 'undefined') {
        console.warn('DataSync not loaded yet');
        setTimeout(loadStats, 500);
        return;
    }
    
    const stats = DataSync.getStats();
    
    // Orders
    document.getElementById('statsOrders').textContent = stats.orders.total;
    document.getElementById('statsOrdersDetail').textContent = 
        `${stats.orders.pending} chờ, ${stats.orders.delivering} đang giao, ${stats.orders.delivered} đã giao`;
    
    // Drivers
    document.getElementById('statsDrivers').textContent = stats.drivers.total;
    document.getElementById('statsDriversDetail').textContent = 
        `${stats.drivers.active} đang hoạt động`;
    
    // Users
    document.getElementById('statsUsers').textContent = stats.users.total;
    document.getElementById('statsUsersDetail').textContent = 
        `${stats.users.admin} admin, ${stats.users.driver} tài xế, ${stats.users.customer} khách`;
    
    // Storage
    const storageMB = (stats.storage.used / (1024 * 1024)).toFixed(2);
    const storagePercent = ((stats.storage.used / stats.storage.limit) * 100).toFixed(1);
    document.getElementById('statsStorage').textContent = storageMB + ' MB';
    document.getElementById('statsStorageDetail').textContent = 
        `${storagePercent}% / 5MB`;
    
    // Update sync time
    if (stats.lastSync) {
        const lastSync = new Date(stats.lastSync);
        document.getElementById('lastSyncTime').textContent = formatDateTime(lastSync);
    }
}

function exportData() {
    if (typeof DataSync === 'undefined') {
        showNotification('DataSync chưa sẵn sàng!', 'error');
        return;
    }
    
    DataSync.exportData();
    showNotification('Đã xuất dữ liệu thành công!', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (typeof DataSync === 'undefined') {
        showNotification('DataSync chưa sẵn sàng!', 'error');
        return;
    }
    
    const confirmImport = confirm(
        'Nhập dữ liệu sẽ ghi đè toàn bộ dữ liệu hiện tại!\n\n' +
        'Bạn có chắc chắn muốn tiếp tục?'
    );
    
    if (!confirmImport) {
        event.target.value = '';
        return;
    }
    
    DataSync.importData(file);
    
    // Reload stats after import
    setTimeout(() => {
        loadStats();
        showNotification('Đã nhập dữ liệu thành công!', 'success');
    }, 500);
    
    event.target.value = '';
}

function clearAllData() {
    if (typeof DataSync === 'undefined') {
        showNotification('DataSync chưa sẵn sàng!', 'error');
        return;
    }
    
    const confirmClear = confirm(
        '⚠️ CẢNH BÁO ⚠️\n\n' +
        'Bạn sắp xóa TẤT CẢ dữ liệu trong hệ thống!\n\n' +
        'Bao gồm:\n' +
        '- Tất cả đơn hàng\n' +
        '- Tất cả tài xế\n' +
        '- Tất cả tuyến đường\n' +
        '- Tất cả người dùng\n' +
        '- Tất cả thanh toán COD\n\n' +
        'Hành động này KHÔNG THỂ HOÀN TÁC!\n\n' +
        'Bạn có chắc chắn muốn tiếp tục?'
    );
    
    if (!confirmClear) return;
    
    const confirmAgain = confirm('Xác nhận lần cuối: Xóa tất cả dữ liệu?');
    if (!confirmAgain) return;
    
    DataSync.clearAllData();
    
    // Reload stats
    setTimeout(() => {
        loadStats();
        showNotification('Đã xóa tất cả dữ liệu!', 'success');
    }, 500);
}

// ============= SYSTEM INFO =============
function loadSystemInfo() {
    // Browser info
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    
    if (ua.indexOf('Firefox') > -1) {
        browserName = 'Firefox';
    } else if (ua.indexOf('Chrome') > -1) {
        browserName = 'Chrome';
    } else if (ua.indexOf('Safari') > -1) {
        browserName = 'Safari';
    } else if (ua.indexOf('Edge') > -1) {
        browserName = 'Edge';
    }
    
    document.getElementById('browserName').textContent = browserName;
    document.getElementById('browserLang').textContent = navigator.language || 'vi-VN';
    document.getElementById('browserOnline').textContent = navigator.onLine ? 'Có' : 'Không';
}

function checkStorageQuota() {
    if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then(estimate => {
            const usedMB = (estimate.usage / (1024 * 1024)).toFixed(2);
            const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(2);
            const percent = ((estimate.usage / estimate.quota) * 100).toFixed(2);
            
            alert(
                'Storage Quota:\n\n' +
                `Đã dùng: ${usedMB} MB\n` +
                `Tổng cộng: ${quotaMB} MB\n` +
                `Phần trăm: ${percent}%`
            );
        });
    } else {
        alert('Trình duyệt không hỗ trợ Storage API');
    }
}

function testNotifications() {
    if (!("Notification" in window)) {
        alert("Trình duyệt không hỗ trợ thông báo desktop");
        return;
    }
    
    if (Notification.permission === "granted") {
        new Notification("Logistics Manager", {
            body: "Thông báo test thành công!",
            icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75'>🚚</text></svg>"
        });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("Logistics Manager", {
                    body: "Thông báo test thành công!",
                    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75'>🚚</text></svg>"
                });
            }
        });
    } else {
        alert('Thông báo đã bị chặn. Vui lòng bật trong cài đặt trình duyệt.');
    }
}

function clearCache() {
    const confirmClear = confirm('Xóa cache của trang?\n\nTrang sẽ được tải lại.');
    if (!confirmClear) return;
    
    // Clear session storage
    sessionStorage.clear();
    
    showNotification('Đã xóa cache!', 'success');
    setTimeout(() => {
        location.reload(true);
    }, 1000);
}

function viewConsole() {
    alert('Nhấn F12 để mở Developer Console');
}

// ============= DATA SYNC =============
function manualSync() {
    if (typeof DataSync === 'undefined') {
        showNotification('DataSync chưa sẵn sàng!', 'error');
        return;
    }
    
    DataSync.loadAllData();
    loadStats();
    showNotification('Đã đồng bộ dữ liệu!', 'success');
}

function toggleAutoSync(enable) {
    if (typeof DataSync === 'undefined') {
        showNotification('DataSync chưa sẵn sàng!', 'error');
        return;
    }
    
    if (enable) {
        DataSync.startAutoSync();
        document.getElementById('syncStatus').textContent = 'Đang bật';
        document.getElementById('syncStatus').style.color = '#27ae60';
        showNotification('Đã bật Auto-sync!', 'success');
    } else {
        DataSync.stopAutoSync();
        document.getElementById('syncStatus').textContent = 'Đang tắt';
        document.getElementById('syncStatus').style.color = '#e74c3c';
        showNotification('Đã tắt Auto-sync!', 'warning');
    }
}

// ============= APPEARANCE SETTINGS =============
function changeTheme(mode) {
    if (mode === 'dark') {
        document.body.style.filter = 'invert(1) hue-rotate(180deg)';
        showNotification('Chế độ tối (Demo)', 'info');
    } else {
        document.body.style.filter = 'none';
        showNotification('Chế độ sáng', 'info');
    }
}

function changeFontSize(size) {
    const sizes = {
        small: '14px',
        medium: '16px',
        large: '18px'
    };
    
    document.documentElement.style.fontSize = sizes[size];
    showNotification(`Đã đổi kích thước chữ: ${size}`, 'info');
}

function changeSidebarWidth(width) {
    document.getElementById('sidebarWidthValue').textContent = width + 'px';
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.style.width = width + 'px';
    }
}

function saveAppearanceSettings() {
    const settings = {
        themeMode: document.getElementById('themeMode').value,
        fontSize: document.getElementById('fontSize').value,
        sidebarWidth: document.getElementById('sidebarWidth').value,
        compactMode: document.getElementById('compactMode').checked,
        animationsEnabled: document.getElementById('animationsEnabled').checked
    };
    
    localStorage.setItem('appearanceSettings', JSON.stringify(settings));
    showNotification('Đã lưu cài đặt giao diện!', 'success');
}

function resetAppearance() {
    const confirmReset = confirm('Đặt lại tất cả cài đặt giao diện về mặc định?');
    if (!confirmReset) return;
    
    localStorage.removeItem('appearanceSettings');
    document.getElementById('themeMode').value = 'light';
    document.getElementById('fontSize').value = 'medium';
    document.getElementById('sidebarWidth').value = 260;
    document.getElementById('compactMode').checked = false;
    document.getElementById('animationsEnabled').checked = true;
    
    // Apply defaults
    document.body.style.filter = 'none';
    document.documentElement.style.fontSize = '16px';
    changeSidebarWidth(260);
    
    showNotification('Đã đặt lại cài đặt giao diện!', 'success');
}

// ============= UTILITIES =============
function formatDateTime(date) {
    if (!date) return '-';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function showNotification(message, type = 'info') {
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
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

// Auto-refresh stats every 5 seconds
setInterval(loadStats, 5000);
