// Users Management System
let users = [];
let drivers = [];
let filteredUsers = [];
let selectedUsers = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateStats();
    renderUsers();
    populateDriverSelect();
});

// Load data from localStorage
function loadData() {
    const savedUsers = localStorage.getItem('users');
    console.log('Loading users from localStorage:', savedUsers);
    
    if (savedUsers) {
        try {
            users = JSON.parse(savedUsers);
            console.log('Parsed users:', users);
        } catch (e) {
            console.error('Error parsing users:', e);
            users = [];
        }
    }
    
    // Create default admin account if no users exist
    if (users.length === 0) {
        console.log('No users found, creating default admin');
        users = [{
            id: 'USER' + Date.now(),
            name: 'Admin User',
            email: 'admin@logistics.com',
            phone: '0123456789',
            role: 'admin',
            password: hashPassword('admin123'), // Simple hash for demo
            address: '',
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            linkedDriverId: null
        }];
        saveUsers();
    }
    
    // Load drivers for linking
    const savedDrivers = localStorage.getItem('drivers');
    if (savedDrivers) {
        drivers = JSON.parse(savedDrivers);
    }
    
    filteredUsers = [...users];
}

// Save users to localStorage
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

// Simple password hashing (for demo purposes - use proper hashing in production)
function hashPassword(password) {
    // This is a simple hash for demonstration
    // In production, use bcrypt or similar
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

// Update statistics
function updateStats() {
    const total = users.length;
    const admins = users.filter(u => u.role === 'admin').length;
    const drivers = users.filter(u => u.role === 'driver').length;
    const customers = users.filter(u => u.role === 'customer').length;
    
    document.getElementById('totalUsersStat').textContent = total;
    document.getElementById('adminUsersStat').textContent = admins;
    document.getElementById('driverUsersStat').textContent = drivers;
    document.getElementById('customerUsersStat').textContent = customers;
}

// Filter users
function filterUsers() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    filteredUsers = users.filter(user => {
        const matchSearch = !searchText || 
            user.name.toLowerCase().includes(searchText) ||
            user.email.toLowerCase().includes(searchText) ||
            (user.phone && user.phone.includes(searchText));
        
        const matchRole = !roleFilter || user.role === roleFilter;
        const matchStatus = !statusFilter || user.status === statusFilter;
        
        return matchSearch && matchRole && matchStatus;
    });
    
    renderUsers();
}

// Render users table
function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    
    if (filteredUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 40px; color: #95a5a6;">
                    <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 10px; display: block;"></i>
                    Không tìm thấy người dùng nào
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredUsers.map(user => {
        const roleInfo = getRoleInfo(user.role);
        const statusInfo = getStatusInfo(user.status);
        const isSelected = selectedUsers.includes(user.id);
        
        // Get avatar initials
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        return `
            <tr style="${isSelected ? 'background-color: #f0f8ff;' : ''}">
                <td>
                    <input type="checkbox" class="user-checkbox" data-user-id="${user.id}" 
                           ${isSelected ? 'checked' : ''} onchange="toggleUserSelection('${user.id}')">
                </td>
                <td>
                    <div class="user-avatar" style="width: 50px; height: 50px; border-radius: 50%; background: ${roleInfo.color}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem;">
                        ${initials}
                    </div>
                </td>
                <td>
                    <div style="font-weight: 600; color: #2c3e50;">${user.name}</div>
                    ${user.linkedDriverId ? '<small style="color: #7f8c8d;"><i class="fas fa-link"></i> Liên kết với tài xế</small>' : ''}
                </td>
                <td>
                    <i class="fas fa-envelope" style="color: #7f8c8d; margin-right: 5px;"></i>
                    ${user.email}
                </td>
                <td>
                    ${user.phone ? `<i class="fas fa-phone" style="color: #7f8c8d; margin-right: 5px;"></i>${user.phone}` : '<span style="color: #95a5a6;">-</span>'}
                </td>
                <td>
                    <span class="badge ${roleInfo.class}">
                        <i class="${roleInfo.icon}"></i> ${roleInfo.text}
                    </span>
                </td>
                <td>
                    <span class="badge ${statusInfo.class}">
                        <i class="${statusInfo.icon}"></i> ${statusInfo.text}
                    </span>
                </td>
                <td style="font-size: 0.9rem; color: #7f8c8d;">
                    ${formatDateTime(user.createdAt)}
                </td>
                <td style="font-size: 0.9rem; color: #7f8c8d;">
                    ${user.lastLogin ? formatDateTime(user.lastLogin) : '<span style="color: #95a5a6;">Chưa đăng nhập</span>'}
                </td>
                <td>
                    <div style="display: flex; gap: 5px; justify-content: flex-start;">
                        <button class="btn btn-sm btn-info" onclick="viewUser('${user.id}')" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="editUser('${user.id}')" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="openResetPasswordModal('${user.id}')" title="Đặt lại mật khẩu">
                            <i class="fas fa-key"></i>
                        </button>
                        ${user.status === 'active' ? 
                            `<button class="btn btn-sm btn-secondary" onclick="toggleUserStatus('${user.id}')" title="Vô hiệu hóa">
                                <i class="fas fa-ban"></i>
                            </button>` :
                            `<button class="btn btn-sm btn-success" onclick="toggleUserStatus('${user.id}')" title="Kích hoạt">
                                <i class="fas fa-check"></i>
                            </button>`
                        }
                        <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Open create user modal
function openCreateUserModal() {
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Thêm người dùng mới';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userActive').checked = true;
    document.getElementById('userPassword').required = true;
    document.getElementById('userPasswordConfirm').required = true;
    document.getElementById('passwordHint').textContent = 'Tối thiểu 6 ký tự';
    document.getElementById('driverLinkSection').style.display = 'none';
    document.getElementById('userModal').style.display = 'block';
}

// Close user modal
function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

// Handle role change
function handleRoleChange() {
    const role = document.getElementById('userRole').value;
    const driverLinkSection = document.getElementById('driverLinkSection');
    
    if (role === 'driver') {
        driverLinkSection.style.display = 'block';
    } else {
        driverLinkSection.style.display = 'none';
        document.getElementById('linkedDriverId').value = '';
    }
}

// Populate driver select
function populateDriverSelect() {
    const select = document.getElementById('linkedDriverId');
    select.innerHTML = '<option value="">-- Chọn tài xế --</option>';
    
    drivers.forEach(driver => {
        // Check if driver is already linked to a user
        const isLinked = users.some(u => u.linkedDriverId === driver.id);
        if (!isLinked) {
            const option = document.createElement('option');
            option.value = driver.id;
            option.textContent = `${driver.name} - ${driver.phone}`;
            select.appendChild(option);
        }
    });
}

// Save user
function saveUser(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userId = formData.get('userId');
    const password = formData.get('userPassword');
    const passwordConfirm = formData.get('userPasswordConfirm');
    
    // Validate passwords match
    if (password !== passwordConfirm) {
        showNotification('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }
    
    // Validate password length
    if (password && password.length < 6) {
        showNotification('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
    }
    
    // Check email uniqueness
    const email = formData.get('userEmail');
    const existingUser = users.find(u => u.email === email && u.id !== userId);
    if (existingUser) {
        showNotification('Email đã được sử dụng!', 'error');
        return;
    }
    
    if (userId) {
        // Update existing user
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            const currentRole = users[userIndex].role;
            const newRole = formData.get('userRole');
            
            users[userIndex] = {
                ...users[userIndex],
                name: formData.get('userName'),
                fullName: formData.get('userName'),
                email: email,
                phone: formData.get('userPhone'),
                role: newRole,
                address: formData.get('userAddress'),
                status: formData.get('userActive') === 'on' ? 'active' : 'inactive',
                linkedDriverId: formData.get('linkedDriverId') || null,
                updatedAt: new Date().toISOString()
            };
            
            // Add customer-specific fields if role changed to customer
            if (newRole === 'customer' && currentRole !== 'customer') {
                users[userIndex].birthday = users[userIndex].birthday || '';
                users[userIndex].gender = users[userIndex].gender || '';
                users[userIndex].idCard = users[userIndex].idCard || '';
                users[userIndex].addresses = users[userIndex].addresses || [];
            }
            
            // Update password if provided
            if (password) {
                users[userIndex].password = hashPassword(password);
            }
            
            showNotification('Cập nhật người dùng thành công!', 'success');
        }
    } else {
        // Create new user
        const newUser = {
            id: 'USER' + Date.now(),
            userId: 'USER' + Date.now(),
            username: formData.get('userEmail').split('@')[0], // Generate username from email
            name: formData.get('userName'),
            fullName: formData.get('userName'),
            email: email,
            phone: formData.get('userPhone'),
            role: formData.get('userRole'),
            password: hashPassword(password),
            address: formData.get('userAddress'),
            status: formData.get('userActive') === 'on' ? 'active' : 'inactive',
            linkedDriverId: formData.get('linkedDriverId') || null,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        
        // Add customer-specific fields
        if (newUser.role === 'customer') {
            newUser.birthday = '';
            newUser.gender = '';
            newUser.idCard = '';
            newUser.addresses = [];
        }
        
        users.push(newUser);
        showNotification('Thêm người dùng thành công!', 'success');
    }
    
    saveUsers();
    updateStats();
    filterUsers();
    closeUserModal();
}

// Edit user
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-edit"></i> Chỉnh sửa người dùng';
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userPhone').value = user.phone || '';
    document.getElementById('userRole').value = user.role;
    document.getElementById('userAddress').value = user.address || '';
    document.getElementById('userActive').checked = user.status === 'active';
    document.getElementById('linkedDriverId').value = user.linkedDriverId || '';
    
    // Make password optional for edit
    document.getElementById('userPassword').required = false;
    document.getElementById('userPasswordConfirm').required = false;
    document.getElementById('userPassword').value = '';
    document.getElementById('userPasswordConfirm').value = '';
    document.getElementById('passwordHint').textContent = 'Để trống nếu không muốn thay đổi mật khẩu';
    
    // Show driver link section if driver role
    if (user.role === 'driver') {
        document.getElementById('driverLinkSection').style.display = 'block';
        populateDriverSelect();
        // Add current linked driver back to options
        if (user.linkedDriverId) {
            const driver = drivers.find(d => d.id === user.linkedDriverId);
            if (driver) {
                const select = document.getElementById('linkedDriverId');
                const option = document.createElement('option');
                option.value = driver.id;
                option.textContent = `${driver.name} - ${driver.phone}`;
                option.selected = true;
                select.insertBefore(option, select.children[1]);
            }
        }
    }
    
    document.getElementById('userModal').style.display = 'block';
}

// View user details
function viewUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const roleInfo = getRoleInfo(user.role);
    const statusInfo = getStatusInfo(user.status);
    
    let linkedDriverInfo = '';
    if (user.linkedDriverId) {
        const driver = drivers.find(d => d.id === user.linkedDriverId);
        if (driver) {
            linkedDriverInfo = `
                <div class="form-group">
                    <label><i class="fas fa-link"></i> Tài xế liên kết</label>
                    <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
                        <strong>${driver.name}</strong><br>
                        <small style="color: #7f8c8d;">${driver.phone} - ${driver.vehicleNumber}</small>
                    </div>
                </div>
            `;
        }
    }
    
    const content = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group">
                <label><i class="fas fa-user"></i> Họ và tên</label>
                <div style="font-weight: 600; font-size: 1.1rem;">${user.name}</div>
            </div>
            
            <div class="form-group">
                <label><i class="fas fa-envelope"></i> Email</label>
                <div>${user.email}</div>
            </div>
            
            <div class="form-group">
                <label><i class="fas fa-phone"></i> Số điện thoại</label>
                <div>${user.phone || '<span style="color: #95a5a6;">Chưa có</span>'}</div>
            </div>
            
            <div class="form-group">
                <label><i class="fas fa-user-tag"></i> Loại tài khoản</label>
                <div><span class="badge ${roleInfo.class}"><i class="${roleInfo.icon}"></i> ${roleInfo.text}</span></div>
            </div>
            
            <div class="form-group">
                <label><i class="fas fa-toggle-on"></i> Trạng thái</label>
                <div><span class="badge ${statusInfo.class}"><i class="${statusInfo.icon}"></i> ${statusInfo.text}</span></div>
            </div>
            
            <div class="form-group">
                <label><i class="fas fa-calendar"></i> Ngày tạo</label>
                <div>${formatDateTime(user.createdAt)}</div>
            </div>
        </div>
        
        ${linkedDriverInfo}
        
        ${user.address ? `
            <div class="form-group">
                <label><i class="fas fa-map-marker-alt"></i> Địa chỉ</label>
                <div>${user.address}</div>
            </div>
        ` : ''}
        
        <div class="form-group">
            <label><i class="fas fa-clock"></i> Đăng nhập lần cuối</label>
            <div>${user.lastLogin ? formatDateTime(user.lastLogin) : '<span style="color: #95a5a6;">Chưa đăng nhập</span>'}</div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid ${roleInfo.color};">
            <strong>Thông tin bổ sung:</strong><br>
            <small style="color: #7f8c8d;">
                ID: ${user.id}<br>
                ${user.updatedAt ? `Cập nhật lần cuối: ${formatDateTime(user.updatedAt)}` : ''}
            </small>
        </div>
    `;
    
    document.getElementById('viewUserContent').innerHTML = content;
    document.getElementById('viewUserModal').style.display = 'block';
}

// Close view user modal
function closeViewUserModal() {
    document.getElementById('viewUserModal').style.display = 'none';
}

// Toggle user status
function toggleUserStatus(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa';
    
    if (confirm(`Bạn có chắc muốn ${action} tài khoản "${user.name}"?`)) {
        user.status = newStatus;
        user.updatedAt = new Date().toISOString();
        saveUsers();
        updateStats();
        renderUsers();
        showNotification(`Đã ${action} tài khoản thành công!`, 'success');
    }
}

// Delete user
function deleteUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1) {
        showNotification('Không thể xóa admin duy nhất trong hệ thống!', 'error');
        return;
    }
    
    if (confirm(`Bạn có chắc muốn xóa người dùng "${user.name}"?\nHành động này không thể hoàn tác!`)) {
        users = users.filter(u => u.id !== userId);
        saveUsers();
        updateStats();
        filterUsers();
        showNotification('Đã xóa người dùng thành công!', 'success');
    }
}

// Open reset password modal
function openResetPasswordModal(userId) {
    document.getElementById('resetUserId').value = userId;
    document.getElementById('resetPasswordForm').reset();
    document.getElementById('resetPasswordModal').style.display = 'block';
}

// Close reset password modal
function closeResetPasswordModal() {
    document.getElementById('resetPasswordModal').style.display = 'none';
}

// Reset password
function resetPassword(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userId = formData.get('resetUserId');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('newPasswordConfirm');
    
    if (newPassword !== confirmPassword) {
        showNotification('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
    }
    
    const user = users.find(u => u.id === userId);
    if (user) {
        user.password = hashPassword(newPassword);
        user.updatedAt = new Date().toISOString();
        saveUsers();
        closeResetPasswordModal();
        showNotification('Đặt lại mật khẩu thành công!', 'success');
    }
}

// Toggle password visibility
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        field.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Toggle select all
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    if (selectAll.checked) {
        selectedUsers = filteredUsers.map(u => u.id);
    } else {
        selectedUsers = [];
    }
    renderUsers();
    updateBulkActionsBar();
}

// Toggle user selection
function toggleUserSelection(userId) {
    const index = selectedUsers.indexOf(userId);
    if (index > -1) {
        selectedUsers.splice(index, 1);
    } else {
        selectedUsers.push(userId);
    }
    
    // Update select all checkbox
    const selectAll = document.getElementById('selectAll');
    selectAll.checked = selectedUsers.length === filteredUsers.length;
    selectAll.indeterminate = selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length;
    
    updateBulkActionsBar();
    renderUsers();
}

// Update bulk actions bar
function updateBulkActionsBar() {
    const bar = document.getElementById('bulkActionsBar');
    const count = document.getElementById('selectedCount');
    
    if (selectedUsers.length > 0) {
        bar.style.display = 'block';
        count.textContent = `${selectedUsers.length} mục đã chọn`;
    } else {
        bar.style.display = 'none';
    }
}

// Clear selection
function clearSelection() {
    selectedUsers = [];
    document.getElementById('selectAll').checked = false;
    updateBulkActionsBar();
    renderUsers();
}

// Bulk activate
function bulkActivate() {
    if (selectedUsers.length === 0) return;
    
    if (confirm(`Bạn có chắc muốn kích hoạt ${selectedUsers.length} tài khoản đã chọn?`)) {
        selectedUsers.forEach(userId => {
            const user = users.find(u => u.id === userId);
            if (user) {
                user.status = 'active';
                user.updatedAt = new Date().toISOString();
            }
        });
        
        saveUsers();
        updateStats();
        clearSelection();
        renderUsers();
        showNotification(`Đã kích hoạt ${selectedUsers.length} tài khoản!`, 'success');
    }
}

// Bulk deactivate
function bulkDeactivate() {
    if (selectedUsers.length === 0) return;
    
    if (confirm(`Bạn có chắc muốn vô hiệu hóa ${selectedUsers.length} tài khoản đã chọn?`)) {
        selectedUsers.forEach(userId => {
            const user = users.find(u => u.id === userId);
            if (user) {
                user.status = 'inactive';
                user.updatedAt = new Date().toISOString();
            }
        });
        
        saveUsers();
        updateStats();
        clearSelection();
        renderUsers();
        showNotification(`Đã vô hiệu hóa ${selectedUsers.length} tài khoản!`, 'success');
    }
}

// Bulk delete
function bulkDelete() {
    if (selectedUsers.length === 0) return;
    
    // Check if trying to delete all admins
    const selectedAdmins = selectedUsers.filter(id => {
        const user = users.find(u => u.id === id);
        return user && user.role === 'admin';
    });
    
    const remainingAdmins = users.filter(u => u.role === 'admin' && !selectedUsers.includes(u.id)).length;
    
    if (selectedAdmins.length > 0 && remainingAdmins === 0) {
        showNotification('Không thể xóa tất cả admin trong hệ thống!', 'error');
        return;
    }
    
    if (confirm(`Bạn có chắc muốn xóa ${selectedUsers.length} tài khoản đã chọn?\nHành động này không thể hoàn tác!`)) {
        users = users.filter(u => !selectedUsers.includes(u.id));
        
        saveUsers();
        updateStats();
        clearSelection();
        filterUsers();
        showNotification(`Đã xóa ${selectedUsers.length} tài khoản!`, 'success');
    }
}

// Helper functions
function getRoleInfo(role) {
    const roles = {
        'admin': { text: 'Admin', class: 'badge-danger', icon: 'fas fa-user-shield', color: '#e74c3c' },
        'driver': { text: 'Tài xế', class: 'badge-success', icon: 'fas fa-user-tie', color: '#27ae60' },
        'customer': { text: 'Khách hàng', class: 'badge-warning', icon: 'fas fa-user', color: '#f39c12' }
    };
    return roles[role] || { text: role, class: 'badge-secondary', icon: 'fas fa-user', color: '#95a5a6' };
}

function getStatusInfo(status) {
    const statuses = {
        'active': { text: 'Hoạt động', class: 'badge-success', icon: 'fas fa-check-circle' },
        'inactive': { text: 'Vô hiệu hóa', class: 'badge-secondary', icon: 'fas fa-ban' }
    };
    return statuses[status] || { text: status, class: 'badge-secondary', icon: 'fas fa-question' };
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        // Xóa tất cả thông tin đăng nhập
        localStorage.removeItem('currentUser');
        localStorage.removeItem('loggedInUser');
        sessionStorage.removeItem('loggedInUser');
        localStorage.removeItem('rememberMe');
        
        // Chuyển về trang đăng nhập
        window.location.replace('login.html');
    }
}

// Debug localStorage
function debugLocalStorage() {
    const usersData = localStorage.getItem('users');
    console.log('=== DEBUG LOCALSTORAGE ===');
    console.log('Raw users data:', usersData);
    
    if (usersData) {
        try {
            const parsed = JSON.parse(usersData);
            console.log('Parsed users:', parsed);
            console.log('Total users:', parsed.length);
            parsed.forEach((user, index) => {
                console.log(`User ${index + 1}:`, {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status
                });
            });
            
            alert(`Tổng số người dùng trong localStorage: ${parsed.length}\n\n` +
                  `Admin: ${parsed.filter(u => u.role === 'admin').length}\n` +
                  `Driver: ${parsed.filter(u => u.role === 'driver').length}\n` +
                  `Customer: ${parsed.filter(u => u.role === 'customer').length}\n\n` +
                  `Xem console (F12) để biết chi tiết`);
        } catch (e) {
            console.error('Error parsing users:', e);
            alert('Lỗi khi đọc dữ liệu: ' + e.message);
        }
    } else {
        console.log('No users data in localStorage');
        alert('Không có dữ liệu người dùng trong localStorage');
    }
    console.log('=========================');
}

// Sync drivers to users
function syncDriversToUsers() {
    if (!confirm('Tạo tài khoản người dùng cho tất cả tài xế chưa có tài khoản?\n\n' +
                 'Mật khẩu mặc định: driver123')) {
        return;
    }
    
    let created = 0;
    
    drivers.forEach(driver => {
        // Check if user already exists for this driver
        const existingUser = users.find(u => u.linkedDriverId === driver.id);
        
        if (!existingUser) {
            // Create user account for driver
            const newUser = {
                id: 'USER' + Date.now() + Math.random().toString(36).substr(2, 9),
                name: driver.name,
                email: driver.email || `${driver.id.toLowerCase()}@logistics.com`,
                phone: driver.phone,
                role: 'driver',
                password: hashPassword('driver123'),
                address: '',
                status: 'active',
                linkedDriverId: driver.id,
                createdAt: new Date().toISOString(),
                lastLogin: null
            };
            
            users.push(newUser);
            created++;
            
            // Small delay to ensure unique IDs
            const now = Date.now();
            while (Date.now() < now + 2) { /* wait */ }
        }
    });
    
    if (created > 0) {
        saveUsers();
        updateStats();
        filterUsers();
        showNotification(`Đã tạo ${created} tài khoản người dùng cho tài xế!`, 'success');
    } else {
        showNotification('Tất cả tài xế đã có tài khoản người dùng!', 'info');
    }
}

// Create demo accounts
function createDemoAccounts() {
    if (!confirm('Tạo tài khoản demo cho hệ thống?\n\n' +
                 'Bao gồm:\n' +
                 '- 2 tài xế (driver1, driver2)\n' +
                 '- 2 khách hàng (customer1, customer2)\n\n' +
                 'Mật khẩu: driver123 / customer123')) {
        return;
    }
    
    const demoAccounts = [
        {
            id: 'USER' + Date.now() + '001',
            name: 'Trần Văn Tài',
            email: 'driver1@logistics.com',
            phone: '0912345678',
            role: 'driver',
            password: hashPassword('driver123'),
            address: '',
            status: 'active',
            linkedDriverId: null,
            createdAt: new Date().toISOString(),
            lastLogin: null
        },
        {
            id: 'USER' + Date.now() + '002',
            name: 'Lê Thị Hoa',
            email: 'driver2@logistics.com',
            phone: '0923456789',
            role: 'driver',
            password: hashPassword('driver123'),
            address: '',
            status: 'active',
            linkedDriverId: null,
            createdAt: new Date().toISOString(),
            lastLogin: null
        },
        {
            id: 'USER' + Date.now() + '003',
            name: 'Phạm Thị Lan',
            email: 'customer1@gmail.com',
            phone: '0934567890',
            role: 'customer',
            password: hashPassword('customer123'),
            address: '123 Nguyễn Huệ, Q1, TP.HCM',
            status: 'active',
            linkedDriverId: null,
            createdAt: new Date().toISOString(),
            lastLogin: null
        },
        {
            id: 'USER' + Date.now() + '004',
            name: 'Hoàng Văn Nam',
            email: 'customer2@gmail.com',
            phone: '0945678901',
            role: 'customer',
            password: hashPassword('customer123'),
            address: '456 Lê Lợi, Q1, TP.HCM',
            status: 'active',
            linkedDriverId: null,
            createdAt: new Date().toISOString(),
            lastLogin: null
        }
    ];
    
    let created = 0;
    
    demoAccounts.forEach(account => {
        // Check if email already exists
        const existingUser = users.find(u => u.email === account.email);
        if (!existingUser) {
            users.push(account);
            created++;
        }
    });
    
    if (created > 0) {
        saveUsers();
        updateStats();
        filterUsers();
        showNotification(`Đã tạo ${created} tài khoản demo!`, 'success');
    } else {
        showNotification('Tất cả tài khoản demo đã tồn tại!', 'info');
    }
}

// Import users from login.js legacy format
function importLegacyUsers() {
    // Legacy users from login.js
    const legacyUsers = [
        {
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            fullName: 'Nguyễn Văn Admin',
            phone: '0901234567',
            email: 'admin@logistics.com'
        },
        {
            username: 'driver1',
            password: 'driver123',
            role: 'driver',
            fullName: 'Trần Văn Tài',
            phone: '0912345678',
            email: 'driver1@logistics.com',
            vehicleNumber: '29A-12345',
            licenseNumber: 'B2-123456'
        },
        {
            username: 'driver2',
            password: 'driver123',
            role: 'driver',
            fullName: 'Lê Thị Hoa',
            phone: '0923456789',
            email: 'driver2@logistics.com',
            vehicleNumber: '30B-67890',
            licenseNumber: 'B2-789012'
        },
        {
            username: 'customer1',
            password: 'customer123',
            role: 'customer',
            fullName: 'Phạm Thị Lan',
            phone: '0934567890',
            email: 'customer1@gmail.com',
            address: '123 Nguyễn Huệ, Q1, TP.HCM'
        },
        {
            username: 'customer2',
            password: 'customer123',
            role: 'customer',
            fullName: 'Hoàng Văn Nam',
            phone: '0945678901',
            email: 'customer2@gmail.com',
            address: '456 Lê Lợi, Q1, TP.HCM'
        }
    ];
    
    if (!confirm(`Import ${legacyUsers.length} tài khoản từ hệ thống cũ?\n\n` +
                 'Bao gồm: admin, driver1, driver2, customer1, customer2\n\n' +
                 'Các tài khoản đã tồn tại sẽ bị bỏ qua.')) {
        return;
    }
    
    let imported = 0;
    let skipped = 0;
    
    legacyUsers.forEach((legacyUser, index) => {
        // Check if email already exists
        const existingUser = users.find(u => u.email === legacyUser.email);
        
        if (!existingUser) {
            const newUser = {
                id: 'USER' + Date.now() + String(index).padStart(3, '0'),
                name: legacyUser.fullName,
                email: legacyUser.email,
                phone: legacyUser.phone || '',
                role: legacyUser.role,
                password: hashPassword(legacyUser.password), // Hash the plain password
                address: legacyUser.address || '',
                status: 'active',
                linkedDriverId: null,
                createdAt: new Date().toISOString(),
                lastLogin: null
            };
            
            users.push(newUser);
            imported++;
            console.log('Imported user:', legacyUser.username, '→', newUser.email);
            
            // Small delay to ensure unique IDs
            const now = Date.now();
            while (Date.now() < now + 5) { /* wait */ }
        } else {
            skipped++;
            console.log('Skipped existing user:', legacyUser.username);
        }
    });
    
    if (imported > 0) {
        saveUsers();
        updateStats();
        filterUsers();
        showNotification(`Đã import ${imported} tài khoản${skipped > 0 ? `, bỏ qua ${skipped} tài khoản đã tồn tại` : ''}!`, 'success');
    } else {
        showNotification('Tất cả tài khoản đã tồn tại trong hệ thống!', 'info');
    }
}

// Reload data
function reloadData() {
    loadData();
    updateStats();
    filterUsers();
    populateDriverSelect();
    showNotification('Đã tải lại dữ liệu!', 'success');
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
