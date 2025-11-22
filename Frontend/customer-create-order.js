// Customer Create Order JavaScript

// ==================== GLOBAL VARIABLES ====================
let currentCustomer = null;
let allOrders = [];
let allRoutes = [];

// ==================== AUTHENTICATION ====================
function checkCustomerAccess() {
    const user = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
    
    console.log('[Customer Create Order] Checking access');
    
    if (!user) {
        console.log('[Customer Create Order] No user found, redirecting to login');
        window.location.href = 'login.html';
        return null;
    }
    
    const userData = JSON.parse(user);
    console.log('[Customer Create Order] User role:', userData.role);
    
    if (userData.role !== 'customer') {
        console.log('[Customer Create Order] Access denied, redirecting...');
        alert('Bạn không có quyền truy cập trang này!');
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
    
    console.log('[Customer Create Order] Access granted');
    return userData;
}

// ==================== INITIALIZATION ====================
function initializePage() {
    const user = checkCustomerAccess();
    if (!user) return;
    
    currentCustomer = user;
    
    // Update user info in header
    const userNameElement = document.querySelector('.user-name');
    const userAvatarElement = document.querySelector('.user-avatar');
    
    if (userNameElement) userNameElement.textContent = user.fullName || user.fullname || 'Khách hàng';
    if (userAvatarElement) {
        const initials = (user.fullName || user.fullname || 'KH').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        userAvatarElement.textContent = initials;
    }
    
    // Load orders
    loadOrders();
    
    // Pre-fill sender info
    fillSenderInfo();
}

function loadOrders() {
    if (typeof DataSync !== 'undefined') {
        allOrders = DataSync.get('orders') || [];
        allRoutes = DataSync.get('routes') || [];
        console.log('[Customer Create Order] Loaded orders and routes via DataSync');
    } else {
        allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        allRoutes = JSON.parse(localStorage.getItem('routes') || '[]');
        console.log('[Customer Create Order] Loaded orders and routes via localStorage');
    }
}

// ==================== ROUTE FUNCTIONS ====================
function detectAreaFromAddress(address) {
    const addressLower = address.toLowerCase();
    
    // Danh sách các quận/huyện Hà Nội và từ khóa
    const areaMap = {
        'Ba Đình': ['ba đình', 'ba dinh', 'hoàng hoa thám', 'ngọc hà', 'giảng võ', 'kim mã', 'ngọc khánh'],
        'Hoàn Kiếm': ['hoàn kiếm', 'hoan kiem', 'hồ gươm', 'phố cổ', 'tràng tiền', 'hàng bài', 'lý thái tổ', 'đinh tiên hoàng'],
        'Đống Đa': ['đống đa', 'dong da', 'láng hạ', 'xã đàn', 'khâm thiên', 'thái hà', 'ô chợ dừa'],
        'Hai Bà Trưng': ['hai bà trưng', 'hai ba trung', 'bạch mai', 'minh khai', 'thanh nhàn', 'vĩnh tuy'],
        'Thanh Xuân': ['thanh xuân', 'thanh xuan', 'khương trung', 'nhân chính', 'hạ đình', 'khương đình'],
        'Tây Hồ': ['tây hồ', 'tay ho', 'quảng an', 'yên phụ', 'bưởi', 'thụy khuê', 'west lake'],
        'Cầu Giấy': ['cầu giấy', 'cau giay', 'dịch vọng', 'trần thái tông', 'xuân thủy', 'yên hòa'],
        'Long Biên': ['long biên', 'long bien', 'ngọc lâm', 'phúc đồng', 'sài đồng', 'gia thụy'],
        'Hoàng Mai': ['hoàng mai', 'định công', 'giáp bát', 'yên sở', 'tân mai'],
        'Nam Từ Liêm': ['nam từ liêm', 'nam tu liem', 'mỹ đình', 'cầu diễn', 'đại mỗ', 'phú đô'],
        'Bắc Từ Liêm': ['bắc từ liêm', 'bac tu liem', 'xuân đỉnh', 'cổ nhuế', 'thụy phương', 'đức thắng'],
        'Hà Đông': ['hà đông', 'ha dong', 'dương nội', 'biên giang', 'yết kiêu', 'quang trung'],
        'Sơn Tây': ['sơn tây', 'son tay'],
        'Đan Phượng': ['đan phượng', 'dan phuong'],
        'Hoài Đức': ['hoài đức', 'hoai duc'],
        'Thanh Trì': ['thanh trì', 'thanh tri', 'văn điển', 'tứ hiệp'],
        'Gia Lâm': ['gia lâm', 'gia lam', 'trâu quỳ', 'yên viên'],
        'Đông Anh': ['đông anh', 'dong anh'],
        'Sóc Sơn': ['sóc sơn', 'soc son'],
        'Mê Linh': ['mê linh', 'me linh'],
        'Thường Tín': ['thường tín', 'thuong tin'],
        'Phú Xuyên': ['phú xuyên', 'phu xuyen'],
        'Ứng Hòa': ['ứng hòa', 'ung hoa'],
        'Mỹ Đức': ['mỹ đức', 'my duc'],
        'Chương Mỹ': ['chương mỹ', 'chuong my'],
        'Quốc Oai': ['quốc oai', 'quoc oai'],
        'Thạch Thất': ['thạch thất', 'thach that'],
        'Ba Vì': ['ba vì', 'ba vi'],
        'Phúc Thọ': ['phúc thọ', 'phuc tho'],
        'Thanh Oai': ['thanh oai']
    };
    
    // Tìm khu vực phù hợp
    for (const [area, keywords] of Object.entries(areaMap)) {
        for (const keyword of keywords) {
            if (addressLower.includes(keyword)) {
                return area;
            }
        }
    }
    
    return 'Khác';
}

function findOrCreateRoute(deliveryAddress) {
    const area = detectAreaFromAddress(deliveryAddress);
    const today = new Date().toISOString().split('T')[0];
    
    // Tìm route đang hoạt động (planning hoặc active) trong khu vực
    let matchingRoute = allRoutes.find(route => {
        const routeDate = route.routeDate ? route.routeDate.split('T')[0] : '';
        const routeArea = route.routeName || '';
        return (route.status === 'planning' || route.status === 'active') &&
               routeDate === today &&
               routeArea.includes(area);
    });
    
    // Nếu không tìm thấy, tạo route mới
    if (!matchingRoute) {
        const hour = new Date().getHours();
        const timeOfDay = hour < 12 ? 'Sáng' : hour < 17 ? 'Chiều' : 'Tối';
        
        matchingRoute = {
            id: 'ROUTE' + Date.now(),
            routeName: `Tuyến ${area} - ${timeOfDay}`,
            area: area,
            driverId: null,
            routeDate: new Date().toISOString(),
            startTime: `${hour.toString().padStart(2, '0')}:00`,
            orders: [],
            orderDetails: [], // Chi tiết địa chỉ các đơn hàng
            navigation: [], // Đường đi chi tiết
            notes: `Tuyến tự động tạo cho khu vực ${area}`,
            status: 'planning',
            estimatedDistance: 0,
            estimatedTime: 0,
            createdAt: new Date().toISOString(),
            timeline: [
                {
                    status: 'planning',
                    time: new Date().toISOString(),
                    description: 'Tuyến đường tự động tạo khi có đơn hàng mới'
                }
            ]
        };
        
        allRoutes.unshift(matchingRoute);
        console.log('[Customer Create Order] Created new route:', matchingRoute.routeName);
    }
    
    return matchingRoute;
}

function addOrderToRoute(orderId, routeId, orderData) {
    const route = allRoutes.find(r => r.id === routeId);
    if (route) {
        if (!route.orders) route.orders = [];
        if (!route.orders.includes(orderId)) {
            route.orders.push(orderId);
            
            // Thêm chi tiết địa chỉ cho navigation
            if (!route.orderDetails) route.orderDetails = [];
            route.orderDetails.push({
                orderId: orderId,
                pickupAddress: orderData.pickupAddress,
                deliveryAddress: orderData.deliveryAddress,
                receiverName: orderData.receiverName,
                receiverPhone: orderData.receiverPhone,
                senderName: orderData.senderName,
                senderPhone: orderData.senderPhone,
                codAmount: orderData.codAmount || 0,
                notes: orderData.notes || '',
                sequence: route.orders.length // Thứ tự giao hàng
            });
            
            // Cập nhật navigation
            if (!route.navigation) route.navigation = [];
            route.navigation.push({
                step: route.navigation.length + 1,
                action: 'pickup',
                address: orderData.pickupAddress,
                contact: orderData.senderName + ' - ' + orderData.senderPhone,
                orderId: orderId
            });
            route.navigation.push({
                step: route.navigation.length + 2,
                action: 'delivery',
                address: orderData.deliveryAddress,
                contact: orderData.receiverName + ' - ' + orderData.receiverPhone,
                orderId: orderId,
                cod: orderData.codAmount || 0
            });
            
            // Cập nhật timeline
            if (!route.timeline) route.timeline = [];
            route.timeline.push({
                status: 'order_added',
                time: new Date().toISOString(),
                description: `Đơn hàng ${orderId} đã được thêm vào tuyến`
            });
            
            console.log(`[Customer Create Order] Added order ${orderId} to route ${route.routeName}`);
        }
    }
}

function saveRoutes() {
    if (typeof DataSync !== 'undefined') {
        DataSync.set('routes', allRoutes);
        DataSync.triggerSync('routes');
        console.log('[Customer Create Order] Routes saved via DataSync');
    } else {
        localStorage.setItem('routes', JSON.stringify(allRoutes));
        console.log('[Customer Create Order] Routes saved to localStorage');
    }
}

// ==================== FORM FUNCTIONS ====================
function fillSenderInfo() {
    if (!currentCustomer) return;
    
    document.getElementById('sender-name').value = currentCustomer.fullName || currentCustomer.fullname || '';
    document.getElementById('sender-phone').value = currentCustomer.phone || '';
    document.getElementById('sender-address').value = currentCustomer.address || '';
    
    showNotification('Đã điền thông tin người gửi!', 'success');
}

function calculateShippingFee() {
    const weight = parseFloat(document.getElementById('weight')?.value) || 0;
    const productType = document.getElementById('product-type')?.value || '';
    const express = document.getElementById('express')?.checked || false;
    const insurance = document.getElementById('insurance')?.checked || false;
    
    let baseFee = 25000; // Phí cơ bản
    
    // Tính theo khối lượng
    if (weight > 0) {
        if (weight <= 1) {
            baseFee = 25000;
        } else if (weight <= 3) {
            baseFee = 25000 + (weight - 1) * 5000;
        } else if (weight <= 5) {
            baseFee = 35000 + (weight - 3) * 7000;
        } else {
            baseFee = 49000 + (weight - 5) * 10000;
        }
    }
    
    // Phụ phí theo loại hàng
    const typeFeesMap = {
        'electronics': 15000,
        'food': 20000,
        'cosmetics': 10000,
        'furniture': 30000,
        'fragile': 15000
    };
    
    if (typeFeesMap[productType]) {
        baseFee += typeFeesMap[productType];
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

function updateFeeDisplay() {
    const fee = calculateShippingFee();
    const feeElement = document.getElementById('estimated-fee');
    if (feeElement) {
        feeElement.textContent = formatCurrency(fee);
    }
}

function previewOrder() {
    const formData = collectFormData();
    
    if (!validateFormData(formData)) {
        return;
    }
    
    const fee = calculateShippingFee();
    const totalAmount = fee + parseInt(formData.cod || 0);
    
    const previewHtml = `
        <div style="max-width: 700px;">
            <h2 style="color: #667eea; margin-bottom: 25px; text-align: center;">
                <i class="fas fa-eye"></i> Xem trước đơn hàng
            </h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #2c3e50; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-bottom: 15px;">
                    <i class="fas fa-user" style="color: #667eea;"></i> Người gửi
                </h3>
                <p style="margin: 8px 0;"><strong>Tên:</strong> ${formData.sender.name}</p>
                <p style="margin: 8px 0;"><strong>SĐT:</strong> ${formData.sender.phone}</p>
                <p style="margin: 8px 0;"><strong>Địa chỉ:</strong> ${formData.sender.address}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #2c3e50; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-bottom: 15px;">
                    <i class="fas fa-map-marker-alt" style="color: #667eea;"></i> Người nhận
                </h3>
                <p style="margin: 8px 0;"><strong>Tên:</strong> ${formData.receiver.name}</p>
                <p style="margin: 8px 0;"><strong>SĐT:</strong> ${formData.receiver.phone}</p>
                <p style="margin: 8px 0;"><strong>Địa chỉ:</strong> ${formData.receiver.address}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #2c3e50; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-bottom: 15px;">
                    <i class="fas fa-box" style="color: #667eea;"></i> Hàng hóa
                </h3>
                <p style="margin: 8px 0;"><strong>Loại:</strong> ${getProductTypeName(formData.product.type)}</p>
                <p style="margin: 8px 0;"><strong>Khối lượng:</strong> ${formData.product.weight} kg</p>
                ${formData.product.description ? `<p style="margin: 8px 0;"><strong>Mô tả:</strong> ${formData.product.description}</p>` : ''}
                ${formData.cod > 0 ? `<p style="margin: 8px 0;"><strong>COD:</strong> ${formatCurrency(formData.cod)}</p>` : ''}
            </div>
            
            <div style="background: #e8f5e9; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #27ae60; border-bottom: 2px solid #27ae60; padding-bottom: 10px; margin-bottom: 15px;">
                    <i class="fas fa-cog" style="color: #27ae60;"></i> Dịch vụ bổ sung
                </h3>
                ${formData.services.insurance ? '<p style="margin: 8px 0;">✅ Bảo hiểm hàng hóa</p>' : ''}
                ${formData.services.fragile ? '<p style="margin: 8px 0;">✅ Hàng dễ vỡ</p>' : ''}
                ${formData.services.express ? '<p style="margin: 8px 0;">✅ Giao hàng nhanh</p>' : ''}
                ${!formData.services.insurance && !formData.services.fragile && !formData.services.express ? '<p style="color: #999;">Không có dịch vụ bổ sung</p>' : ''}
            </div>
            
            ${formData.notes ? `
                <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="color: #f39c12; border-bottom: 2px solid #f39c12; padding-bottom: 10px; margin-bottom: 15px;">
                        <i class="fas fa-sticky-note" style="color: #f39c12;"></i> Ghi chú
                    </h3>
                    <p style="margin: 0;">${formData.notes}</p>
                </div>
            ` : ''}
            
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 25px; border-radius: 10px; text-align: center;">
                <h3 style="margin: 0 0 15px 0; font-size: 1.2rem;">Chi phí dự kiến</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div style="text-align: left;">
                        <p style="margin: 5px 0; opacity: 0.9;">Phí vận chuyển:</p>
                        ${formData.cod > 0 ? '<p style="margin: 5px 0; opacity: 0.9;">COD:</p>' : ''}
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 5px 0; font-weight: 600;">${formatCurrency(fee)}</p>
                        ${formData.cod > 0 ? `<p style="margin: 5px 0; font-weight: 600;">${formatCurrency(formData.cod)}</p>` : ''}
                    </div>
                </div>
                <div style="border-top: 2px solid rgba(255,255,255,0.3); padding-top: 15px; margin-top: 15px;">
                    <p style="margin: 0 0 10px 0; font-size: 1.1rem; opacity: 0.9;">Tổng cộng</p>
                    <p style="margin: 0; font-size: 2.5rem; font-weight: bold;">${formatCurrency(totalAmount)}</p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
                <button class="btn btn-primary" onclick="this.closest('[style*=\\"z-index: 10000\\"]').remove()" style="padding: 12px 30px; font-size: 1.1rem;">
                    <i class="fas fa-times"></i> Đóng
                </button>
            </div>
        </div>
    `;
    
    showModal(previewHtml);
}

function collectFormData() {
    return {
        sender: {
            name: document.getElementById('sender-name').value.trim(),
            phone: document.getElementById('sender-phone').value.trim(),
            address: document.getElementById('sender-address').value.trim()
        },
        receiver: {
            name: document.getElementById('receiver-name').value.trim(),
            phone: document.getElementById('receiver-phone').value.trim(),
            address: document.getElementById('receiver-address').value.trim()
        },
        product: {
            type: document.getElementById('product-type').value,
            weight: document.getElementById('weight').value,
            description: document.getElementById('product-description').value.trim()
        },
        cod: parseInt(document.getElementById('cod-amount').value) || 0,
        services: {
            insurance: document.getElementById('insurance').checked,
            fragile: document.getElementById('fragile').checked,
            express: document.getElementById('express').checked
        },
        notes: document.getElementById('notes').value.trim()
    };
}

function validateFormData(formData) {
    if (!formData.sender.name || !formData.sender.phone || !formData.sender.address) {
        showNotification('Vui lòng điền đầy đủ thông tin người gửi!', 'error');
        document.getElementById('sender-name').focus();
        return false;
    }
    
    if (!formData.receiver.name || !formData.receiver.phone || !formData.receiver.address) {
        showNotification('Vui lòng điền đầy đủ thông tin người nhận!', 'error');
        document.getElementById('receiver-name').focus();
        return false;
    }
    
    if (!formData.product.type || !formData.product.weight) {
        showNotification('Vui lòng điền đầy đủ thông tin hàng hóa!', 'error');
        document.getElementById('product-type').focus();
        return false;
    }
    
    // Validate phone numbers
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.sender.phone.replace(/\s/g, ''))) {
        showNotification('Số điện thoại người gửi không hợp lệ!', 'error');
        document.getElementById('sender-phone').focus();
        return false;
    }
    
    if (!phoneRegex.test(formData.receiver.phone.replace(/\s/g, ''))) {
        showNotification('Số điện thoại người nhận không hợp lệ!', 'error');
        document.getElementById('receiver-phone').focus();
        return false;
    }
    
    // Validate weight
    const weight = parseFloat(formData.product.weight);
    if (weight <= 0 || weight > 50) {
        showNotification('Khối lượng phải từ 0.1 kg đến 50 kg!', 'error');
        document.getElementById('weight').focus();
        return false;
    }
    
    return true;
}

function handleCreateOrder(e) {
    e.preventDefault();
    
    const formData = collectFormData();
    
    if (!validateFormData(formData)) {
        return;
    }
    
    // Show loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    
    // Calculate shipping fee
    const shippingFee = calculateShippingFee();
    
    // Find or create route for this order
    const route = findOrCreateRoute(formData.receiver.address);
    const deliveryArea = detectAreaFromAddress(formData.receiver.address);
    
    // Create order
    const orderId = 'VD' + Date.now();
    const now = new Date().toISOString();
    
    const newOrder = {
        id: orderId,
        customerId: currentCustomer.userId || currentCustomer.id,
        customerName: formData.sender.name,
        customerPhone: formData.sender.phone,
        customerEmail: currentCustomer.email,
        senderName: formData.sender.name,
        senderPhone: formData.sender.phone,
        pickupAddress: formData.sender.address,
        receiverName: formData.receiver.name,
        receiverPhone: formData.receiver.phone,
        deliveryAddress: formData.receiver.address,
        deliveryArea: deliveryArea,
        routeId: route.id,
        routeName: route.routeName,
        itemType: formData.product.type,
        weight: parseFloat(formData.product.weight),
        itemDescription: formData.product.description,
        paymentMethod: formData.cod > 0 ? 'cod' : 'prepaid',
        codAmount: formData.cod,
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
            },
            {
                status: 'route_assigned',
                time: now,
                description: `Đơn hàng được gán vào ${route.routeName}`
            }
        ]
    };
    
    // Add to orders
    allOrders.unshift(newOrder);
    
    // Add order to route with full details
    addOrderToRoute(orderId, route.id, newOrder);
    
    // Save to storage
    if (typeof DataSync !== 'undefined') {
        DataSync.set('orders', allOrders);
        DataSync.triggerSync('orders');
        console.log('[Customer Create Order] Order saved via DataSync');
    } else {
        localStorage.setItem('orders', JSON.stringify(allOrders));
        console.log('[Customer Create Order] Order saved to localStorage');
    }
    
    // Save routes
    saveRoutes();
    
    // Show success
    setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        
        showSuccessModal(orderId, shippingFee);
        
        // Reset form
        e.target.reset();
        updateFeeDisplay();
        fillSenderInfo();
    }, 1000);
}

function showSuccessModal(orderId, shippingFee) {
    const successHtml = `
        <div style="max-width: 500px; text-align: center;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #27ae60, #229954); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; box-shadow: 0 10px 30px rgba(39, 174, 96, 0.3);">
                <i class="fas fa-check" style="font-size: 3rem; color: white;"></i>
            </div>
            
            <h2 style="color: #27ae60; margin-bottom: 15px; font-size: 2rem;">
                Tạo đơn hàng thành công!
            </h2>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; text-align: left;">
                <p style="margin: 12px 0; font-size: 1.1rem;">
                    <strong style="color: #667eea;">Mã vận đơn:</strong><br>
                    <span style="font-size: 1.5rem; font-weight: bold; color: #2c3e50;">${orderId}</span>
                </p>
                <p style="margin: 12px 0;">
                    <strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}
                </p>
                <p style="margin: 12px 0;">
                    <strong>Phí vận chuyển:</strong> ${formatCurrency(shippingFee)}
                </p>
            </div>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #2196f3;">
                <p style="margin: 0; color: #2c3e50;">
                    <i class="fas fa-route" style="color: #2196f3;"></i>
                    <strong>Tuyến giao hàng:</strong> <span style="color: #2196f3; font-weight: 600;">${allRoutes.find(r => r.id === allOrders[0].routeId)?.routeName || 'Đang xử lý'}</span>
                </p>
            </div>
            
            <div style="background: #e8f5e9; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #27ae60;">
                <p style="margin: 0; color: #2c3e50; line-height: 1.6;">
                    <i class="fas fa-info-circle" style="color: #27ae60;"></i>
                    Tài xế sẽ đến lấy hàng trong vòng <strong>2-4 giờ</strong>.<br>
                    Bạn có thể theo dõi đơn hàng bằng mã vận đơn.
                </p>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <button class="btn btn-success" onclick="window.location.href='index-customer.html'" style="padding: 12px 25px;">
                    <i class="fas fa-home"></i> Về trang chủ
                </button>
                <button class="btn btn-info" onclick="copyOrderId('${orderId}')" style="padding: 12px 25px;">
                    <i class="fas fa-copy"></i> Copy mã đơn
                </button>
                <button class="btn btn-secondary" onclick="this.closest('[style*=\\"z-index: 10000\\"]').remove(); fillSenderInfo();" style="padding: 12px 25px;">
                    <i class="fas fa-plus"></i> Tạo đơn mới
                </button>
            </div>
        </div>
    `;
    
    showModal(successHtml);
}

function copyOrderId(orderId) {
    navigator.clipboard.writeText(orderId).then(() => {
        showNotification('Đã copy mã vận đơn: ' + orderId, 'success');
    }).catch(() => {
        prompt('Copy mã vận đơn:', orderId);
    });
}

// ==================== UTILITY FUNCTIONS ====================
function formatCurrency(amount) {
    if (!amount || amount === 0) return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

function getProductTypeName(type) {
    const typeMap = {
        'electronics': 'Điện tử',
        'fashion': 'Thời trang',
        'food': 'Thực phẩm',
        'cosmetics': 'Mỹ phẩm',
        'books': 'Sách & Văn phòng phẩm',
        'document': 'Tài liệu',
        'furniture': 'Nội thất & Gia dụng',
        'toys': 'Đồ chơi',
        'other': 'Khác'
    };
    return typeMap[type] || 'Hàng hóa';
}

function showNotification(message, type) {
    type = type || 'info';
    const colors = { success: '#27ae60', error: '#e74c3c', warning: '#f39c12', info: '#3498db' };
    const icons = { success: 'check-circle', error: 'times-circle', warning: 'exclamation-triangle', info: 'info-circle' };
    
    const notification = document.createElement('div');
    notification.style.cssText = 'position:fixed;top:20px;right:20px;background:' + colors[type] + ';color:white;padding:15px 25px;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,0.2);z-index:10001;font-weight:500;display:flex;align-items:center;gap:12px;max-width:400px;animation:slideIn 0.3s ease-out;';
    notification.innerHTML = '<i class="fas fa-' + icons[type] + '" style="font-size:1.3rem;"></i><span>' + message + '</span>';
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(400px)';
        notification.style.transition = 'all 0.3s';
        setTimeout(function() { notification.remove(); }, 300);
    }, 4000);
}

function showModal(html) {
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.3s;';
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background: white; border-radius: 15px; padding: 35px; max-height: 90vh; overflow-y: auto; box-shadow: 0 15px 50px rgba(0,0,0,0.3); animation: slideUp 0.3s;';
    modalContent.innerHTML = html;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
        }
    });
}

// ==================== REORDER FUNCTIONALITY ====================
function loadReorderData() {
    const reorderData = sessionStorage.getItem('reorderData');
    if (!reorderData) return;
    
    try {
        const order = JSON.parse(reorderData);
        
        // Fill form fields
        if (order.senderName) document.getElementById('sender-name').value = order.senderName;
        if (order.senderPhone) document.getElementById('sender-phone').value = order.senderPhone;
        if (order.senderAddress) document.getElementById('sender-address').value = order.senderAddress;
        if (order.receiverName) document.getElementById('receiver-name').value = order.receiverName;
        if (order.receiverPhone) document.getElementById('receiver-phone').value = order.receiverPhone;
        if (order.receiverAddress) document.getElementById('receiver-address').value = order.receiverAddress;
        if (order.goodsDescription) document.getElementById('goods-description').value = order.goodsDescription;
        if (order.weight) document.getElementById('weight').value = order.weight;
        if (order.codAmount) document.getElementById('cod-amount').value = order.codAmount;
        if (order.notes) document.getElementById('notes').value = order.notes;
        
        // Set product type if exists
        if (order.productType) {
            const productTypeSelect = document.getElementById('product-type');
            if (productTypeSelect) {
                productTypeSelect.value = order.productType;
            }
        }
        
        // Set checkboxes
        if (order.express) {
            const expressCheckbox = document.getElementById('express');
            if (expressCheckbox) expressCheckbox.checked = true;
        }
        if (order.insurance) {
            const insuranceCheckbox = document.getElementById('insurance');
            if (insuranceCheckbox) insuranceCheckbox.checked = true;
        }
        
        // Update fee display
        updateFeeDisplay();
        
        // Clear session storage
        sessionStorage.removeItem('reorderData');
        
        // Show notification
        showNotification('Đã tải thông tin từ đơn hàng trước', 'info');
        
    } catch (error) {
        console.error('Error loading reorder data:', error);
        sessionStorage.removeItem('reorderData');
    }
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    
    // Load reorder data if available
    loadReorderData();
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('loggedInUser');
                sessionStorage.removeItem('loggedInUser');
                localStorage.removeItem('rememberMe');
                window.location.replace('login.html');
            }
        });
    }
    
    // Form submission
    const form = document.getElementById('create-order-form');
    if (form) {
        form.addEventListener('submit', handleCreateOrder);
        
        // Auto-update fee on change
        const feeInputs = ['weight', 'product-type', 'express', 'insurance'];
        feeInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', updateFeeDisplay);
                element.addEventListener('input', updateFeeDisplay);
            }
        });
    }
    
    // Add animation CSS
    if (!document.getElementById('modal-animations')) {
        const style = document.createElement('style');
        style.id = 'modal-animations';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
});
