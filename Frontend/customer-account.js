// ==================== GLOBAL VARIABLES ====================
let currentUser = null;
let allOrders = [];
let allUsers = [];
let savedAddresses = [];
let currentTab = 'profile';

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Account] DOM loaded, initializing...');
    
    checkAuth();
    
    // Wait for DataSync to initialize if it exists
    if (typeof DataSync !== 'undefined') {
        console.log('[Account] DataSync detected, waiting for initialization...');
        // Give DataSync time to initialize
        setTimeout(() => {
            loadAllData();
            setTimeout(() => {
                displayProfile();
            }, 200);
        }, 300);
    } else {
        console.log('[Account] No DataSync, loading directly...');
        loadAllData();
        setTimeout(() => {
            displayProfile();
        }, 200);
    }
});

function checkAuth() {
    const user = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(user);
    } catch (e) {
        console.error('Error parsing user data:', e);
        alert('Lỗi dữ liệu người dùng. Vui lòng đăng nhập lại!');
        window.location.href = 'login.html';
        return;
    }
    
    // Check role - allow if role is customer or undefined (backward compatibility)
    if (currentUser.role && currentUser.role !== 'customer') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = currentUser.role === 'admin' ? 'index.html' : 'index-driver.html';
        return;
    }
    
    // If no role specified, assume customer (backward compatibility)
    if (!currentUser.role) {
        currentUser.role = 'customer';
    }
    
    // Update user name in header
    const headerNameEl = document.getElementById('header-user-name');
    if (headerNameEl) {
        headerNameEl.textContent = currentUser.fullName || currentUser.name || 'Khách hàng';
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
    // Load users from DataSync or localStorage
    if (typeof DataSync !== 'undefined' && DataSync.cache) {
        allUsers = DataSync.cache.users || [];
        allOrders = DataSync.cache.orders || [];
    } else {
        allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    }
    
    console.log('[Account] Loaded users:', allUsers.length, 'orders:', allOrders.length);
    console.log('[Account] Current user before merge:', currentUser);
    
    // Find current user in users array to get latest data
    const userIndex = allUsers.findIndex(u => 
        u.id === currentUser.userId || 
        u.id === currentUser.id ||
        u.userId === currentUser.userId ||
        u.email === currentUser.email ||
        u.phone === currentUser.phone ||
        u.username === currentUser.username
    );
    
    console.log('[Account] Found user at index:', userIndex);
    
    if (userIndex !== -1) {
        // Merge currentUser with data from storage, but preserve login session info
        const storedUser = allUsers[userIndex];
        currentUser = { 
            ...storedUser,
            ...currentUser,
            // Ensure important fields from storage are used
            id: storedUser.id || currentUser.id,
            userId: storedUser.userId || storedUser.id || currentUser.userId,
            name: storedUser.name || storedUser.fullName || currentUser.fullName,
            fullName: storedUser.fullName || storedUser.name || currentUser.fullName,
            birthday: storedUser.birthday || currentUser.birthday || '',
            gender: storedUser.gender || currentUser.gender || '',
            idCard: storedUser.idCard || currentUser.idCard || '',
            addresses: storedUser.addresses || currentUser.addresses || [],
            createdAt: storedUser.createdAt || currentUser.createdAt || new Date().toISOString(),
            role: currentUser.role || storedUser.role || 'customer' // Preserve role from login
        };
        
        console.log('[Account] Merged user data:', currentUser);
        
        // Update sessionStorage/localStorage
        sessionStorage.setItem('loggedInUser', JSON.stringify(currentUser));
        localStorage.setItem('loggedInUser', JSON.stringify(currentUser));
    } else {
        console.log('[Account] User not found in storage, creating new entry');
        
        // If user not found in users array, add them
        const newUser = {
            id: currentUser.userId || currentUser.id || 'USER' + Date.now(),
            userId: currentUser.userId || currentUser.id || 'USER' + Date.now(),
            username: currentUser.username || currentUser.email.split('@')[0],
            password: currentUser.password,
            name: currentUser.fullName || currentUser.name || 'Khách hàng',
            fullName: currentUser.fullName || currentUser.name || 'Khách hàng',
            email: currentUser.email,
            phone: currentUser.phone,
            address: currentUser.address || '',
            role: 'customer',
            createdAt: currentUser.createdAt || new Date().toISOString(),
            birthday: currentUser.birthday || '',
            gender: currentUser.gender || '',
            idCard: currentUser.idCard || '',
            addresses: currentUser.addresses || [],
            status: 'active'
        };
        
        allUsers.push(newUser);
        
        // Save to storage
        if (typeof DataSync !== 'undefined') {
            DataSync.set('users', allUsers);
        } else {
            localStorage.setItem('users', JSON.stringify(allUsers));
        }
        
        currentUser = newUser;
        sessionStorage.setItem('loggedInUser', JSON.stringify(currentUser));
        localStorage.setItem('loggedInUser', JSON.stringify(currentUser));
    }
    
    // Load saved addresses
    savedAddresses = currentUser.addresses || [];
    
    console.log('[Account] Final current user:', currentUser);
    console.log('[Account] Total orders:', allOrders.length);
    console.log('[Account] Saved addresses:', savedAddresses.length);
    
    // Update header with loaded data
    const headerNameEl = document.getElementById('header-user-name');
    if (headerNameEl) {
        headerNameEl.textContent = currentUser.fullName || currentUser.name || 'Khách hàng';
    }
}

// ==================== TAB SWITCHING ====================
function switchTab(tabName) {
    console.log('🔄 Switching to tab:', tabName);
    
    // Update active menu item
    document.querySelectorAll('.account-menu li').forEach(li => {
        li.classList.remove('active');
    });
    const menuItem = document.querySelector(`[data-tab="${tabName}"]`);
    if (menuItem) {
        menuItem.classList.add('active');
        console.log('✅ Menu item activated:', tabName);
    } else {
        console.error('❌ Menu item not found for tab:', tabName);
    }
    
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
        console.log('👁️ Hiding tab:', tab.id);
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
        console.log('✅ Showing tab:', selectedTab.id);
    } else {
        console.error('❌ Tab content not found:', `${tabName}-tab`);
    }
    
    currentTab = tabName;
    
    // Load tab-specific data
    if (tabName === 'profile') {
        displayProfile();
    } else if (tabName === 'edit') {
        loadEditForm();
    } else if (tabName === 'addresses') {
        console.log('📍 Loading addresses, count:', savedAddresses.length);
        renderAddresses();
    } else if (tabName === 'statistics') {
        console.log('📊 Loading statistics');
        loadStatistics();
    }
}

// ==================== PROFILE TAB ====================
function displayProfile() {
    console.log('[displayProfile] Starting...');
    console.log('[displayProfile] Current user:', currentUser);
    
    if (!currentUser) {
        console.error('[displayProfile] No current user!');
        return;
    }
    
    // Profile header
    const fullName = currentUser.fullName || currentUser.name || 'Khách hàng';
    const email = currentUser.email || 'Chưa có';
    const phone = currentUser.phone || 'Chưa có';
    const joinDate = currentUser.createdAt ? formatDate(currentUser.createdAt) : '01/01/2024';
    
    console.log('[displayProfile] Display data:', { fullName, email, phone, joinDate });
    
    // Avatar initials
    const initials = getInitials(fullName);
    const avatarEl = document.getElementById('profile-avatar');
    if (avatarEl) {
        console.log('[displayProfile] Setting avatar to:', initials);
        avatarEl.textContent = initials;
        avatarEl.style.display = 'flex'; // Ensure visible
    } else {
        console.error('[displayProfile] Element not found: profile-avatar');
    }
    
    // Profile info - Update each element individually with visibility check
    const updateElement = (id, value) => {
        const el = document.getElementById(id);
        if (el) {
            console.log(`[displayProfile] Setting ${id} to:`, value);
            el.textContent = value;
            el.innerHTML = value; // Force update
            el.style.opacity = '1'; // Ensure visible
            el.style.display = ''; // Remove any display:none
        } else {
            console.error(`[displayProfile] Element not found: ${id}`);
        }
    };
    
    // Update profile header
    updateElement('profile-fullname', fullName);
    updateElement('profile-email', email);
    updateElement('profile-phone', phone);
    updateElement('profile-joindate', joinDate);
    
    // Update info grid
    updateElement('info-fullname', fullName);
    updateElement('info-email', email);
    updateElement('info-phone', phone);
    updateElement('info-birthday', currentUser.birthday ? formatDate(currentUser.birthday) : 'Chưa cập nhật');
    updateElement('info-gender', getGenderText(currentUser.gender));
    updateElement('info-address', currentUser.address || 'Chưa cập nhật');
    
    console.log('[displayProfile] Profile displayed successfully');
    
    // Force a repaint
    document.getElementById('profile-tab').style.display = 'block';
}

function getInitials(name) {
    const words = name.trim().split(' ');
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function getGenderText(gender) {
    const genders = {
        'male': 'Nam',
        'female': 'Nữ',
        'other': 'Khác'
    };
    return genders[gender] || 'Chưa cập nhật';
}

// ==================== EDIT PROFILE TAB ====================
function loadEditForm() {
    console.log('✏️ loadEditForm() called');
    console.log('Current user data:', currentUser);
    
    document.getElementById('edit-fullname').value = currentUser.fullName || currentUser.name || '';
    document.getElementById('edit-email').value = currentUser.email || '';
    document.getElementById('edit-phone').value = currentUser.phone || '';
    document.getElementById('edit-birthday').value = currentUser.birthday || '';
    document.getElementById('edit-gender').value = currentUser.gender || '';
    document.getElementById('edit-idcard').value = currentUser.idCard || '';
    document.getElementById('edit-address').value = currentUser.address || '';
    
    console.log('✅ Edit form loaded with user data');
}

function saveProfile(event) {
    event.preventDefault();
    
    // Get form values
    const fullName = document.getElementById('edit-fullname').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    const birthday = document.getElementById('edit-birthday').value;
    const gender = document.getElementById('edit-gender').value;
    const idCard = document.getElementById('edit-idcard').value.trim();
    const address = document.getElementById('edit-address').value.trim();
    
    // Validate
    if (!fullName || !email || !phone) {
        showNotification('Vui lòng điền đầy đủ thông tin bắt buộc!', 'error');
        return;
    }
    
    // Check if email already exists (except current user)
    const emailExists = allUsers.some(u => 
        u.email === email && 
        u.userId !== currentUser.userId &&
        u.id !== currentUser.userId &&
        u.id !== currentUser.id
    );
    
    if (emailExists) {
        showNotification('Email này đã được sử dụng bởi tài khoản khác!', 'error');
        return;
    }
    
    // Check if phone already exists (except current user)
    const phoneExists = allUsers.some(u => 
        u.phone === phone && 
        u.userId !== currentUser.userId &&
        u.id !== currentUser.userId &&
        u.id !== currentUser.id
    );
    
    if (phoneExists) {
        showNotification('Số điện thoại này đã được sử dụng bởi tài khoản khác!', 'error');
        return;
    }
    
    // Update current user
    currentUser.fullName = fullName;
    currentUser.name = fullName; // Keep both for compatibility
    currentUser.email = email;
    currentUser.phone = phone;
    currentUser.birthday = birthday;
    currentUser.gender = gender;
    currentUser.idCard = idCard;
    currentUser.address = address;
    currentUser.updatedAt = new Date().toISOString();
    
    // Update in users array
    const userIndex = allUsers.findIndex(u => 
        u.userId === currentUser.userId || 
        u.id === currentUser.userId || 
        u.id === currentUser.id
    );
    
    if (userIndex !== -1) {
        // Preserve all existing fields and update with new data
        allUsers[userIndex] = { 
            ...allUsers[userIndex], 
            ...currentUser,
            username: allUsers[userIndex].username || currentUser.username,
            password: allUsers[userIndex].password || currentUser.password
        };
    } else {
        // Add as new user if not found
        allUsers.push({
            ...currentUser,
            username: currentUser.username || currentUser.email.split('@')[0]
        });
    }
    
    // Save to storage
    if (typeof DataSync !== 'undefined') {
        DataSync.set('users', allUsers);
        DataSync.triggerSync();
    } else {
        localStorage.setItem('users', JSON.stringify(allUsers));
    }
    
    // Update session
    sessionStorage.setItem('loggedInUser', JSON.stringify(currentUser));
    localStorage.setItem('loggedInUser', JSON.stringify(currentUser));
    
    showNotification('Cập nhật thông tin thành công!', 'success');
    
    // Switch to profile tab
    setTimeout(() => {
        switchTab('profile');
    }, 1000);
}

// ==================== CHANGE PASSWORD TAB ====================
function changePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate current password
    if (currentUser.password !== currentPassword) {
        showNotification('Mật khẩu hiện tại không đúng!', 'error');
        return;
    }
    
    // Validate new password
    if (newPassword.length < 6) {
        showNotification('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
        return;
    }
    
    // Validate confirm password
    if (newPassword !== confirmPassword) {
        showNotification('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }
    
    // Check if new password is same as current
    if (newPassword === currentPassword) {
        showNotification('Mật khẩu mới phải khác mật khẩu hiện tại!', 'error');
        return;
    }
    
    // Update password
    currentUser.password = newPassword;
    currentUser.updatedAt = new Date().toISOString();
    
    // Update in users array
    const userIndex = allUsers.findIndex(u => 
        u.userId === currentUser.userId || 
        u.id === currentUser.userId || 
        u.id === currentUser.id
    );
    
    if (userIndex !== -1) {
        allUsers[userIndex].password = newPassword;
        allUsers[userIndex].updatedAt = currentUser.updatedAt;
    }
    
    // Save to storage
    if (typeof DataSync !== 'undefined') {
        DataSync.set('users', allUsers);
        DataSync.triggerSync();
    } else {
        localStorage.setItem('users', JSON.stringify(allUsers));
    }
    
    // Update session
    sessionStorage.setItem('loggedInUser', JSON.stringify(currentUser));
    localStorage.setItem('loggedInUser', JSON.stringify(currentUser));
    
    showNotification('Đổi mật khẩu thành công!', 'success');
    
    // Clear form
    document.getElementById('change-password-form').reset();
}

// ==================== ADDRESSES TAB ====================
function renderAddresses() {
    console.log('📍 renderAddresses() called');
    console.log('Saved addresses:', savedAddresses);
    
    const container = document.getElementById('address-list');
    if (!container) {
        console.error('❌ Address list container not found!');
        return;
    }
    
    console.log('✅ Container found:', container);
    
    if (savedAddresses.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                <i class="fas fa-map-marker-alt" style="font-size: 4rem; opacity: 0.3; margin-bottom: 15px;"></i>
                <h3>Chưa có địa chỉ nào</h3>
                <p>Thêm địa chỉ để dễ dàng tạo đơn hàng hơn</p>
            </div>
        `;
        console.log('📍 Showing empty state');
        return;
    }
    
    let html = '';
    savedAddresses.forEach((addr, index) => {
        const isDefault = addr.isDefault || index === 0;
        html += `
            <div class="address-card ${isDefault ? 'default' : ''}">
                ${isDefault ? '<span class="address-badge"><i class="fas fa-check"></i> Mặc định</span>' : ''}
                
                <div class="address-header">
                    <i class="fas fa-map-marker-alt" style="color: #3498db;"></i>
                    <h4>${addr.label || 'Địa chỉ ' + (index + 1)}</h4>
                </div>
                
                <div class="address-details">
                    <p style="margin: 5px 0;"><strong>${addr.name}</strong></p>
                    <p style="margin: 5px 0;"><i class="fas fa-phone"></i> ${addr.phone}</p>
                    <p style="margin: 5px 0;">${addr.address}</p>
                </div>
                
                <div class="address-actions">
                    ${!isDefault ? `<button class="btn btn-success btn-sm" onclick="setDefaultAddress(${index})">
                        <i class="fas fa-check"></i> Đặt làm mặc định
                    </button>` : ''}
                    <button class="btn btn-info btn-sm" onclick="editAddress(${index})">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAddress(${index})">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log('✅ Rendered', savedAddresses.length, 'addresses');
}

function showAddAddressModal() {
    const html = `
        <div style="max-width: 600px;">
            <h2 style="margin: 0 0 25px 0; color: #2c3e50;">
                <i class="fas fa-plus-circle"></i> Thêm địa chỉ mới
            </h2>
            
            <form id="add-address-form" onsubmit="saveNewAddress(event)">
                <div class="form-group">
                    <label><i class="fas fa-tag"></i> Nhãn địa chỉ</label>
                    <input type="text" class="form-control" id="new-addr-label" 
                           placeholder="VD: Nhà riêng, Văn phòng..." required>
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-user"></i> Tên người nhận <span style="color: red;">*</span></label>
                    <input type="text" class="form-control" id="new-addr-name" required>
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-phone"></i> Số điện thoại <span style="color: red;">*</span></label>
                    <input type="tel" class="form-control" id="new-addr-phone" required>
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-map-marker-alt"></i> Địa chỉ chi tiết <span style="color: red;">*</span></label>
                    <textarea class="form-control" id="new-addr-address" rows="3" required></textarea>
                </div>
                
                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                        <input type="checkbox" id="new-addr-default" style="width: 18px; height: 18px;">
                        <span>Đặt làm địa chỉ mặc định</span>
                    </label>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">
                        <i class="fas fa-times"></i> Hủy
                    </button>
                    <button type="submit" class="btn btn-success">
                        <i class="fas fa-save"></i> Lưu địa chỉ
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal(html);
}

function saveNewAddress(event) {
    event.preventDefault();
    
    const label = document.getElementById('new-addr-label').value.trim();
    const name = document.getElementById('new-addr-name').value.trim();
    const phone = document.getElementById('new-addr-phone').value.trim();
    const address = document.getElementById('new-addr-address').value.trim();
    const isDefault = document.getElementById('new-addr-default').checked;
    
    // Create new address
    const newAddress = {
        id: Date.now(),
        label: label,
        name: name,
        phone: phone,
        address: address,
        isDefault: isDefault,
        createdAt: new Date().toISOString()
    };
    
    // If set as default, unset other defaults
    if (isDefault) {
        savedAddresses.forEach(addr => addr.isDefault = false);
    }
    
    // Add to addresses array
    savedAddresses.push(newAddress);
    
    // Update current user
    currentUser.addresses = savedAddresses;
    
    // Update in users array
    const userIndex = allUsers.findIndex(u => u.userId === currentUser.userId);
    if (userIndex !== -1) {
        allUsers[userIndex].addresses = savedAddresses;
    }
    
    // Save to storage
    if (typeof DataSync !== 'undefined') {
        DataSync.set('users', allUsers);
        DataSync.triggerSync();
    } else {
        localStorage.setItem('users', JSON.stringify(allUsers));
    }
    
    // Update session
    sessionStorage.setItem('loggedInUser', JSON.stringify(currentUser));
    
    showNotification('Thêm địa chỉ thành công!', 'success');
    closeModal();
    renderAddresses();
}

function setDefaultAddress(index) {
    // Unset all defaults
    savedAddresses.forEach(addr => addr.isDefault = false);
    
    // Set new default
    savedAddresses[index].isDefault = true;
    
    // Update and save
    updateAddresses();
    showNotification('Đã đặt làm địa chỉ mặc định!', 'success');
}

function editAddress(index) {
    const addr = savedAddresses[index];
    
    const html = `
        <div style="max-width: 600px;">
            <h2 style="margin: 0 0 25px 0; color: #2c3e50;">
                <i class="fas fa-edit"></i> Chỉnh sửa địa chỉ
            </h2>
            
            <form id="edit-address-form" onsubmit="updateAddress(event, ${index})">
                <div class="form-group">
                    <label><i class="fas fa-tag"></i> Nhãn địa chỉ</label>
                    <input type="text" class="form-control" id="edit-addr-label" 
                           value="${addr.label || ''}" required>
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-user"></i> Tên người nhận <span style="color: red;">*</span></label>
                    <input type="text" class="form-control" id="edit-addr-name" 
                           value="${addr.name}" required>
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-phone"></i> Số điện thoại <span style="color: red;">*</span></label>
                    <input type="tel" class="form-control" id="edit-addr-phone" 
                           value="${addr.phone}" required>
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-map-marker-alt"></i> Địa chỉ chi tiết <span style="color: red;">*</span></label>
                    <textarea class="form-control" id="edit-addr-address" rows="3" required>${addr.address}</textarea>
                </div>
                
                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                        <input type="checkbox" id="edit-addr-default" 
                               ${addr.isDefault ? 'checked' : ''} 
                               style="width: 18px; height: 18px;">
                        <span>Đặt làm địa chỉ mặc định</span>
                    </label>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">
                        <i class="fas fa-times"></i> Hủy
                    </button>
                    <button type="submit" class="btn btn-success">
                        <i class="fas fa-save"></i> Cập nhật
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal(html);
}

function updateAddress(event, index) {
    event.preventDefault();
    
    const label = document.getElementById('edit-addr-label').value.trim();
    const name = document.getElementById('edit-addr-name').value.trim();
    const phone = document.getElementById('edit-addr-phone').value.trim();
    const address = document.getElementById('edit-addr-address').value.trim();
    const isDefault = document.getElementById('edit-addr-default').checked;
    
    // If set as default, unset other defaults
    if (isDefault) {
        savedAddresses.forEach(addr => addr.isDefault = false);
    }
    
    // Update address
    savedAddresses[index] = {
        ...savedAddresses[index],
        label: label,
        name: name,
        phone: phone,
        address: address,
        isDefault: isDefault,
        updatedAt: new Date().toISOString()
    };
    
    // Update and save
    updateAddresses();
    showNotification('Cập nhật địa chỉ thành công!', 'success');
    closeModal();
}

function deleteAddress(index) {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    
    // Remove address
    savedAddresses.splice(index, 1);
    
    // If no addresses left, or deleted default, set first as default
    if (savedAddresses.length > 0 && !savedAddresses.some(addr => addr.isDefault)) {
        savedAddresses[0].isDefault = true;
    }
    
    // Update and save
    updateAddresses();
    showNotification('Đã xóa địa chỉ!', 'success');
}

function updateAddresses() {
    // Update current user
    currentUser.addresses = savedAddresses;
    
    // Update in users array
    const userIndex = allUsers.findIndex(u => 
        u.userId === currentUser.userId || 
        u.id === currentUser.userId || 
        u.id === currentUser.id
    );
    
    if (userIndex !== -1) {
        allUsers[userIndex].addresses = savedAddresses;
        allUsers[userIndex].updatedAt = new Date().toISOString();
    }
    
    // Save to storage
    if (typeof DataSync !== 'undefined') {
        DataSync.set('users', allUsers);
        DataSync.triggerSync();
    } else {
        localStorage.setItem('users', JSON.stringify(allUsers));
    }
    
    // Update session
    sessionStorage.setItem('loggedInUser', JSON.stringify(currentUser));
    
    // Re-render
    renderAddresses();
}

// ==================== STATISTICS TAB ====================
function loadStatistics() {
    console.log('📊 Loading statistics for user:', currentUser);
    console.log('Total orders in system:', allOrders.length);
    
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
    
    console.log('Customer orders found:', customerOrders.length, customerOrders);
    
    // Calculate statistics
    const totalOrders = customerOrders.length;
    const completedOrders = customerOrders.filter(o => o.status === 'delivered').length;
    const shippingOrders = customerOrders.filter(o => 
        o.status === 'picking' || o.status === 'delivering' || o.status === 'assigned'
    ).length;
    const cancelledOrders = customerOrders.filter(o => o.status === 'cancelled').length;
    
    // Calculate money
    let totalSpent = 0;
    let totalCOD = 0;
    customerOrders.forEach(order => {
        const shippingFee = parseFloat(order.shippingFee) || 0;
        const codAmount = parseFloat(order.codAmount) || 0;
        
        totalSpent += shippingFee;
        if (order.status === 'delivered') {
            totalCOD += codAmount;
        }
    });
    
    // Calculate average rating
    const ratedOrders = customerOrders.filter(o => o.rating && o.rating.stars);
    const avgRating = ratedOrders.length > 0 
        ? (ratedOrders.reduce((sum, o) => sum + o.rating.stars, 0) / ratedOrders.length).toFixed(1)
        : '0.0';
    
    // Update DOM
    const elements = {
        'stat-total-orders': totalOrders,
        'stat-completed-orders': completedOrders,
        'stat-shipping-orders': shippingOrders,
        'stat-cancelled-orders': cancelledOrders,
        'stat-total-spent': formatMoney(totalSpent) + ' đ',
        'stat-total-cod': formatMoney(totalCOD) + ' đ',
        'stat-avg-rating': avgRating + ' ⭐',
        'stat-member-since': currentUser.createdAt ? formatDate(currentUser.createdAt) : '01/01/2024'
    };
    
    // Update with animation
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            element.style.opacity = '1';
            console.log(`✅ Updated ${id}: ${value}`);
        } else {
            console.warn(`❌ Element ${id} not found`);
        }
    });
    
    console.log('📊 Statistics loaded successfully');
}

// ==================== HELPER FUNCTIONS ====================
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
