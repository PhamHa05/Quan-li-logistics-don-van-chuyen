// Customer specific JavaScript

// ==================== GLOBAL VARIABLES ====================
let currentCustomer = null;
let allOrders = [];
let allDrivers = [];
let myOrders = [];

// ==================== KIỂM TRA QUYỀN TRUY CẬP ====================
function checkCustomerAccess() {
    const user = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
    
    console.log('[Customer] Checking access, user:', user);
    
    if (!user) {
        console.log('[Customer] No user found, redirecting to login');
        window.location.href = 'login.html';
        return null;
    }
    
    const userData = JSON.parse(user);
    console.log('[Customer] User role:', userData.role);
    
    // Chỉ cho phép customer truy cập
    if (userData.role !== 'customer') {
        console.log('[Customer] Access denied, redirecting...');
        alert('Bạn không có quyền truy cập trang này!');
        // Chuyển về trang tương ứng với role
        switch(userData.role) {
            case 'admin':
                window.location.href = 'index.html';
                break;
            case 'driver':
                window.location.href = 'index-driver.html';
                break;
            default:
                window.location.href = 'login.html';
        }
        return null;
    }
    
    console.log('[Customer] Access granted');
    return userData;
}

// ==================== LOAD DATA ====================
function loadAllData() {
    // Load orders
    if (typeof DataSync !== 'undefined') {
        allOrders = DataSync.get('orders') || [];
        allDrivers = DataSync.get('drivers') || [];
        console.log('[Customer] Loaded via DataSync');
    } else {
        allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        allDrivers = JSON.parse(localStorage.getItem('drivers') || '[]');
        console.log('[Customer] Loaded via localStorage');
    }
    
    // Filter orders của customer hiện tại
    myOrders = allOrders.filter(order => {
        return order.customerName === currentCustomer.fullName ||
               order.customerPhone === currentCustomer.phone ||
               order.customerEmail === currentCustomer.email ||
               order.senderName === currentCustomer.fullName ||
               order.senderPhone === currentCustomer.phone ||
               order.customerId === currentCustomer.userId;
    });
    
    console.log('[Customer] My orders:', myOrders.length);
    
    // Render dữ liệu
    renderDashboardStats();
}

// Hiển thị thông tin khách hàng
function displayCustomerInfo() {
    const user = checkCustomerAccess();
    if (!user) return;
    
    currentCustomer = user;
    
    // Cập nhật thông tin header
    const userNameElement = document.querySelector('.user-name');
    const userRoleElement = document.querySelector('.user-role');
    const userAvatarElement = document.querySelector('.user-avatar');
    const customerNameElement = document.getElementById('customer-name');
    
    if (userNameElement) userNameElement.textContent = user.fullName || user.fullname;
    if (userRoleElement) userRoleElement.textContent = 'Tài khoản cá nhân';
    if (customerNameElement) customerNameElement.textContent = user.fullName || user.fullname;
    if (userAvatarElement) {
        const initials = (user.fullName || user.fullname || 'KH').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        userAvatarElement.textContent = initials;
    }
    
    // Điền sẵn thông tin người gửi trong form
    const senderNameInput = document.getElementById('sender-name');
    const senderPhoneInput = document.getElementById('sender-phone');
    const senderAddressInput = document.getElementById('sender-address');
    
    if (senderNameInput) senderNameInput.value = user.fullName || user.fullname || '';
    if (senderPhoneInput) senderPhoneInput.value = user.phone || '';
    if (senderAddressInput) senderAddressInput.value = user.address || '';
    
    // Load all data
    loadAllData();
}

// ==================== RENDER DASHBOARD ====================
function renderDashboardStats() {
    const totalOrders = myOrders.length;
    const shippingOrders = myOrders.filter(o => ['assigned', 'picking', 'delivering'].includes(o.status)).length;
    const completedOrders = myOrders.filter(o => o.status === 'delivered').length;
    
    // Tính tổng chi phí tháng này
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthOrders = myOrders.filter(o => new Date(o.createdAt) >= firstDayOfMonth);
    const monthCost = thisMonthOrders.reduce((sum, o) => sum + (parseFloat(o.shippingFee) || 0), 0);
    
    // Update UI
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('shipping-orders').textContent = shippingOrders;
    document.getElementById('completed-orders').textContent = completedOrders;
    document.getElementById('month-cost').textContent = formatCurrencyShort(monthCost);
    
    console.log('[Customer] Stats:', { totalOrders, shippingOrders, completedOrders, monthCost });
}

function getOrderStatusInfo(status) {
    const statusMap = {
        'pending': { text: 'Chờ xử lý', class: 'badge-secondary', icon: 'fas fa-clock' },
        'assigned': { text: 'Đã phân tài xế', class: 'badge-info', icon: 'fas fa-user-check' },
        'picking': { text: 'Đang lấy hàng', class: 'badge-primary', icon: 'fas fa-box' },
        'delivering': { text: 'Đang giao', class: 'badge-warning', icon: 'fas fa-truck' },
        'delivered': { text: 'Đã giao', class: 'badge-success', icon: 'fas fa-check-circle' },
        'failed': { text: 'Giao thất bại', class: 'badge-danger', icon: 'fas fa-times-circle' },
        'cancelled': { text: 'Đã hủy', class: 'badge-dark', icon: 'fas fa-ban' }
    };
    return statusMap[status] || statusMap.pending;
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

// ==================== ORDER DETAIL ====================
function viewOrderDetail(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Không tìm thấy đơn hàng!', 'error');
        return;
    }
    
    const statusInfo = getOrderStatusInfo(order.status);
    const timeline = order.timeline || [];
    
    let detailHtml = `
        <div style="max-width: 600px;">
            <h3 style="color: #667eea; margin-bottom: 20px;">
                <i class="fas fa-box"></i> Chi tiết đơn hàng #${order.id}
            </h3>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="margin-bottom: 10px;"><i class="fas fa-info-circle"></i> Trạng thái</h4>
                <span class="badge ${statusInfo.class}" style="font-size: 1rem; padding: 8px 15px;">
                    <i class="${statusInfo.icon}"></i> ${statusInfo.text}
                </span>
                ${order.routeName ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                    <p style="margin: 0; color: #666; font-size: 0.9rem; margin-bottom: 5px;">Tuyến giao hàng</p>
                    <span style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 8px 15px; border-radius: 6px; display: inline-block; font-weight: 600;">
                        <i class="fas fa-route"></i> ${order.routeName}
                    </span>
                </div>
                ` : ''}
                ${order.deliveryArea ? `
                <div style="margin-top: 10px;">
                    <p style="margin: 0; color: #666; font-size: 0.9rem; margin-bottom: 5px;">Khu vực giao hàng</p>
                    <span style="background: #e3f2fd; color: #1976d2; padding: 6px 12px; border-radius: 6px; display: inline-block; font-weight: 600;">
                        <i class="fas fa-map-marked-alt"></i> ${order.deliveryArea}
                    </span>
                </div>
                ` : ''}
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="margin-bottom: 10px;"><i class="fas fa-user"></i> Người gửi</h4>
                <p><strong>Tên:</strong> ${order.senderName || order.customerName}</p>
                <p><strong>SĐT:</strong> ${order.senderPhone || order.customerPhone}</p>
                <p><strong>Địa chỉ:</strong> ${order.pickupAddress}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="margin-bottom: 10px;"><i class="fas fa-map-marker-alt"></i> Người nhận</h4>
                <p><strong>Tên:</strong> ${order.receiverName}</p>
                <p><strong>SĐT:</strong> ${order.receiverPhone}</p>
                <p><strong>Địa chỉ:</strong> ${order.deliveryAddress || order.receiverAddress}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="margin-bottom: 10px;"><i class="fas fa-box"></i> Hàng hóa</h4>
                <p><strong>Loại:</strong> ${getItemTypeText(order.itemType)}</p>
                <p><strong>Khối lượng:</strong> ${order.weight} kg</p>
                ${order.itemDescription ? `<p><strong>Mô tả:</strong> ${order.itemDescription}</p>` : ''}
            </div>
            
            ${order.driver ? `
                <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h4 style="margin-bottom: 10px; color: #27ae60;"><i class="fas fa-user-tie"></i> Tài xế</h4>
                    <p><strong>Tên:</strong> ${order.driver}</p>
                </div>
            ` : ''}
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="margin-bottom: 10px;"><i class="fas fa-money-bill-wave"></i> Chi phí</h4>
                <p><strong>Phí vận chuyển:</strong> ${formatCurrency(order.shippingFee || 0)}</p>
                ${order.codAmount > 0 ? `<p><strong>COD:</strong> ${formatCurrency(order.codAmount)}</p>` : ''}
                <p style="font-size: 1.2rem; color: #f39c12; margin-top: 10px;">
                    <strong>Tổng cộng: ${formatCurrency((order.shippingFee || 0) + (order.codAmount || 0))}</strong>
                </p>
            </div>
            
            ${timeline.length > 0 ? `
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <h4 style="margin-bottom: 15px;"><i class="fas fa-history"></i> Lịch sử vận chuyển</h4>
                    ${timeline.map(t => `
                        <div style="padding: 10px 0; border-left: 3px solid #667eea; padding-left: 15px; margin-bottom: 10px;">
                            <strong>${getOrderStatusInfo(t.status).text}</strong><br>
                            <small style="color: #666;">${formatDateTime(t.time)}</small><br>
                            <span style="color: #999;">${t.description || ''}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
    
    // Tạo modal tùy chỉnh
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;';
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background: white; border-radius: 12px; padding: 30px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);';
    modalContent.innerHTML = detailHtml + `
        <div style="text-align: center; margin-top: 20px;">
            <button class="btn btn-primary" onclick="this.closest('[style*=\\"z-index: 10000\\"]').remove()">
                <i class="fas fa-times"></i> Đóng
            </button>
        </div>
    `;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
        }
    });
}

// Liên hệ hỗ trợ
function contactSupport(orderId) {
    const message = 'Bạn cần hỗ trợ gì cho đơn hàng ' + orderId + '?';
    const options = [
        '1. Đơn hàng giao chậm',
        '2. Thay đổi địa chỉ giao hàng',
        '3. Hủy đơn hàng',
        '4. Khiếu nại về hàng hóa',
        '5. Vấn đề khác'
    ];
    
    alert(message + '\n\n' + options.join('\n') + '\n\n' +
          'Hotline: 1900-xxxx\n' +
          'Email: support@logistics.com\n' +
          'Chat: Đang kết nối...');
    
    console.log('Liên hệ hỗ trợ cho đơn:', orderId);
}

// Đặt lại đơn hàng
function reorder(orderId) {
    const order = myOrders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Không tìm thấy đơn hàng!', 'error');
        return;
    }
    
    if (confirm('Bạn muốn tạo đơn hàng mới với thông tin giống đơn ' + orderId + '?')) {
        // Lưu thông tin đơn hàng vào sessionStorage
        sessionStorage.setItem('reorderData', JSON.stringify({
            senderName: order.senderName || '',
            senderPhone: order.senderPhone || '',
            pickupAddress: order.pickupAddress || '',
            receiverName: order.receiverName || '',
            receiverPhone: order.receiverPhone || '',
            deliveryAddress: order.deliveryAddress || '',
            itemType: order.itemType || '',
            weight: order.weight || '',
            codAmount: order.codAmount || 0,
            notes: order.notes || ''
        }));
        
        showNotification('Đang chuyển đến trang tạo đơn...', 'info');
        
        // Chuyển đến trang tạo đơn
        setTimeout(() => {
            window.location.href = 'customer-create-order.html';
        }, 500);
    }
}

// Hủy đơn hàng
function cancelOrder(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Không tìm thấy đơn hàng!', 'error');
        return;
    }
    
    if (!['pending', 'assigned'].includes(order.status)) {
        showNotification('Không thể hủy đơn hàng ở trạng thái này!', 'error');
        return;
    }
    
    const reason = prompt('Vui lòng cho biết lý do hủy đơn hàng ' + orderId + ':');
    
    if (reason && reason.trim()) {
        if (confirm('Xác nhận hủy đơn hàng ' + orderId + '?\n\nLý do: ' + reason + '\n\n' +
                   'Lưu ý: Đơn hàng đã hủy không thể khôi phục.')) {
            
            // Cập nhật status
            order.status = 'cancelled';
            order.cancelReason = reason;
            order.cancelledAt = new Date().toISOString();
            order.updatedAt = new Date().toISOString();
            
            if (!order.timeline) order.timeline = [];
            order.timeline.push({
                status: 'cancelled',
                time: new Date().toISOString(),
                description: 'Đơn hàng đã hủy. Lý do: ' + reason
            });
            
            // Lưu vào storage
            if (typeof DataSync !== 'undefined') {
                DataSync.set('orders', allOrders);
                DataSync.triggerSync('orders');
            } else {
                localStorage.setItem('orders', JSON.stringify(allOrders));
            }
            
            showNotification('Đã hủy đơn hàng thành công!', 'success');
            
            // Reload data
            loadAllData();
        }
    }
}

// Tra cứu vận đơn
function searchTracking() {
    const trackingCode = document.getElementById('tracking-code').value.trim();
    const trackingResult = document.getElementById('tracking-result');
    const trackingOrderId = document.getElementById('tracking-order-id');
    
    if (!trackingCode) {
        showNotification('Vui lòng nhập mã vận đơn!', 'warning');
        return;
    }
    
    // Tìm order
    const order = allOrders.find(o => o.id === trackingCode);
    
    if (!order) {
        showNotification('Không tìm thấy vận đơn: ' + trackingCode, 'error');
        if (trackingResult) trackingResult.style.display = 'none';
        return;
    }
    
    console.log('[Customer] Tracking order:', order);
    
    // Render timeline
    const timeline = order.timeline || [];
    const timelineContainer = document.querySelector('.tracking-timeline');
    
    if (timelineContainer && timeline.length > 0) {
        timelineContainer.innerHTML = timeline.map((item, index) => {
            const isCompleted = index < timeline.length - 1;
            const isActive = index === timeline.length - 1 && order.status !== 'delivered' && order.status !== 'cancelled';
            const statusInfo = getOrderStatusInfo(item.status);
            
            return `
                <div class="timeline-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}">
                    <div class="timeline-icon">
                        <i class="${statusInfo.icon}"></i>
                    </div>
                    <div class="timeline-content">
                        <h5>${statusInfo.text}</h5>
                        <p>${formatDateTime(item.time)}</p>
                        <small>${item.description || ''}</small>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Hiển thị kết quả
    if (trackingOrderId) trackingOrderId.textContent = trackingCode;
    if (trackingResult) {
        trackingResult.style.display = 'block';
        
        // Scroll to result
        setTimeout(() => {
            trackingResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

// Tính phí vận chuyển
function calculateShippingFee() {
    const weight = parseFloat(document.getElementById('weight')?.value) || 0;
    const productType = document.getElementById('product-type')?.value || '';
    const express = document.getElementById('express')?.checked || false;
    const insurance = document.getElementById('insurance')?.checked || false;
    
    let baseFee = 25000; // Phí cơ bản
    
    // Tính theo khối lượng
    if (weight > 0) {
        baseFee += weight * 5000;
    }
    
    // Phụ phí theo loại hàng
    if (productType === 'electronics') {
        baseFee += 10000;
    } else if (productType === 'food') {
        baseFee += 15000;
    }
    
    // Phụ phí giao nhanh
    if (express) {
        baseFee += 30000;
    }
    
    // Phí bảo hiểm
    if (insurance) {
        baseFee += 20000;
    }
    
    return baseFee;
}

// Xử lý form tạo đơn hàng
function handleCreateOrder(e) {
    e.preventDefault();
    
    const formData = {
        sender: {
            name: document.getElementById('sender-name').value,
            phone: document.getElementById('sender-phone').value,
            address: document.getElementById('sender-address').value
        },
        receiver: {
            name: document.getElementById('receiver-name').value,
            phone: document.getElementById('receiver-phone').value,
            address: document.getElementById('receiver-address').value
        },
        product: {
            type: document.getElementById('product-type').value,
            weight: document.getElementById('weight').value,
            description: document.getElementById('product-description').value
        },
        cod: document.getElementById('cod-amount').value,
        services: {
            insurance: document.getElementById('insurance').checked,
            fragile: document.getElementById('fragile').checked,
            express: document.getElementById('express').checked
        },
        notes: document.getElementById('notes').value
    };
    
    // Validate
    if (!formData.sender.name || !formData.sender.phone || !formData.sender.address) {
        showNotification('Vui lòng điền đầy đủ thông tin người gửi!', 'error');
        return;
    }
    if (!formData.receiver.name || !formData.receiver.phone || !formData.receiver.address) {
        showNotification('Vui lòng điền đầy đủ thông tin người nhận!', 'error');
        return;
    }
    if (!formData.product.type || !formData.product.weight) {
        showNotification('Vui lòng điền thông tin hàng hóa!', 'error');
        return;
    }
    
    // Tính phí vận chuyển
    const shippingFee = calculateShippingFee();
    
    // Hiển thị xác nhận
    const confirmMessage = 'XÁC NHẬN ĐƠN HÀNG\n\n' +
                          'Người gửi: ' + formData.sender.name + '\n' +
                          'Người nhận: ' + formData.receiver.name + '\n' +
                          'Địa chỉ: ' + formData.receiver.address + '\n' +
                          'Khối lượng: ' + formData.product.weight + ' kg\n' +
                          'COD: ' + parseInt(formData.cod || 0).toLocaleString('vi-VN') + ' đ\n' +
                          'Phí vận chuyển: ' + shippingFee.toLocaleString('vi-VN') + ' đ\n\n' +
                          'Xác nhận tạo đơn hàng?';
    
    if (confirm(confirmMessage)) {
        // Tạo đơn hàng mới
        const orderId = 'VD' + Date.now();
        const now = new Date().toISOString();
        
        const newOrder = {
            id: orderId,
            customerId: currentCustomer.userId,
            customerName: formData.sender.name,
            customerPhone: formData.sender.phone,
            customerEmail: currentCustomer.email,
            senderName: formData.sender.name,
            senderPhone: formData.sender.phone,
            pickupAddress: formData.sender.address,
            receiverName: formData.receiver.name,
            receiverPhone: formData.receiver.phone,
            deliveryAddress: formData.receiver.address,
            itemType: formData.product.type,
            weight: parseFloat(formData.product.weight),
            itemDescription: formData.product.description,
            paymentMethod: parseInt(formData.cod) > 0 ? 'cod' : 'prepaid',
            codAmount: parseInt(formData.cod) || 0,
            shippingFee: shippingFee,
            status: 'pending',
            driverId: null,
            driver: null,
            insurance: formData.services.insurance,
            fragile: formData.services.fragile,
            express: formData.services.express,
            notes: formData.notes,
            createdAt: now,
            updatedAt: now,
            timeline: [
                {
                    status: 'pending',
                    time: now,
                    description: 'Đơn hàng đã được tạo bởi ' + formData.sender.name
                }
            ]
        };
        
        // Thêm vào allOrders
        allOrders.unshift(newOrder);
        
        // Lưu vào storage
        if (typeof DataSync !== 'undefined') {
            DataSync.set('orders', allOrders);
            DataSync.triggerSync('orders');
            console.log('[Customer] Order saved via DataSync');
        } else {
            localStorage.setItem('orders', JSON.stringify(allOrders));
            console.log('[Customer] Order saved to localStorage');
        }
        
        showNotification('Tạo đơn hàng thành công! Mã vận đơn: ' + orderId, 'success');
        
        console.log('[Customer] New order created:', orderId);
        
        // Reset form
        e.target.reset();
        
        // Reload data
        loadAllData();
        
        // Chuyển sang tab đơn hàng của tôi
        setTimeout(() => {
            const myOrdersTab = document.querySelector('.tab[data-tab="my-orders"]');
            if (myOrdersTab) myOrdersTab.click();
        }, 1500);
    }
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

function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
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
    }, 5000);
}

// ==================== EVENT LISTENERS ====================
// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra quyền truy cập
    const user = checkCustomerAccess();
    if (!user) return;
    
    // Hiển thị thông tin khách hàng
    displayCustomerInfo();
    
    // Xử lý đăng xuất
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                // Xóa tất cả thông tin đăng nhập
                localStorage.removeItem('currentUser');
                localStorage.removeItem('loggedInUser');
                sessionStorage.removeItem('loggedInUser');
                localStorage.removeItem('rememberMe');
                
                // Chuyển về trang đăng nhập
                window.location.replace('login.html');
            }
        });
    }
    
    // Xử lý form tạo đơn hàng
    const createOrderForm = document.getElementById('create-order-form');
    if (createOrderForm) {
        createOrderForm.addEventListener('submit', handleCreateOrder);
        
        // Tự động tính phí khi thay đổi
        const weightInput = document.getElementById('weight');
        const productTypeSelect = document.getElementById('product-type');
        const expressCheckbox = document.getElementById('express');
        const insuranceCheckbox = document.getElementById('insurance');
        
        [weightInput, productTypeSelect, expressCheckbox, insuranceCheckbox].forEach(element => {
            if (element) {
                element.addEventListener('change', function() {
                    const fee = calculateShippingFee();
                    console.log('Phí vận chuyển dự kiến:', fee.toLocaleString('vi-VN') + ' đ');
                });
            }
        });
    }
    
    // Xử lý tra cứu khi nhấn Enter
    const trackingInput = document.getElementById('tracking-code');
    if (trackingInput) {
        trackingInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchTracking();
            }
        });
    }
    
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Listen for DataSync events
    if (typeof DataSync !== 'undefined') {
        window.addEventListener('dataSync', function(event) {
            console.log('[Customer] DataSync event received:', event.detail.key);
            if (event.detail.key === 'orders') {
                loadAllData();
            }
        });
    }
});
