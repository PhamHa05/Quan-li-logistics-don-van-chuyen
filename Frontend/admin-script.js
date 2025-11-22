// Admin specific JavaScript

// Load data from localStorage or use sample data
let orders = JSON.parse(localStorage.getItem('orders')) || [
    {
        id: 'VD123456789',
        customerName: 'Nguyễn Văn B',
        customerPhone: '0912345678',
        pickupAddress: '123 Lê Lợi, Q1, TP.HCM',
        senderName: 'Công ty A',
        senderPhone: '0901234567',
        deliveryAddress: '456 Nguyễn Huệ, Q1, Hà Nội',
        receiverName: 'Nguyễn Văn B',
        receiverPhone: '0912345678',
        itemType: 'electronics',
        weight: 2.5,
        paymentMethod: 'cod', // COD - Đã thu tiền
        codAmount: 1250000,
        shippingFee: 35000,
        status: 'delivered',
        driverId: 'driver1',
        createdAt: '2025-11-08T10:30:00.000Z',
        deliveredAt: '2025-11-09T14:20:00.000Z',
        codCollected: true,
        codCollectedDate: '2025-11-09T14:20:00.000Z',
        notes: 'Giao hàng giờ hành chính',
        timeline: [
            { status: 'pending', time: '2025-11-08T10:30:00.000Z', description: 'Đơn hàng đã được tạo' },
            { status: 'assigned', time: '2025-11-08T10:35:00.000Z', description: 'Đã phân cho tài xế Trần Văn Tài' },
            { status: 'picking', time: '2025-11-08T11:00:00.000Z', description: 'Tài xế đang đến lấy hàng' },
            { status: 'delivering', time: '2025-11-08T12:00:00.000Z', description: 'Đang giao hàng' },
            { status: 'delivered', time: '2025-11-09T14:20:00.000Z', description: 'Giao hàng thành công' }
        ]
    },
    {
        id: 'VD123456788',
        customerName: 'Trần Thị C',
        customerPhone: '0934567890',
        pickupAddress: '789 Lý Thường Kiệt, Q10, TP.HCM',
        senderName: 'Cửa hàng B',
        senderPhone: '0923456789',
        deliveryAddress: '321 Hai Bà Trưng, Q3, TP.HCM',
        receiverName: 'Trần Thị C',
        receiverPhone: '0934567890',
        itemType: 'clothing',
        weight: 1.2,
        paymentMethod: 'cod', // COD - Đang giao
        codAmount: 850000,
        shippingFee: 25000,
        status: 'delivering',
        driverId: 'driver2',
        createdAt: '2025-11-09T08:15:00.000Z',
        notes: 'Gọi trước khi giao',
        timeline: [
            { status: 'pending', time: '2025-11-09T08:15:00.000Z', description: 'Đơn hàng đã được tạo' },
            { status: 'assigned', time: '2025-11-09T08:20:00.000Z', description: 'Đã phân cho tài xế Lê Thị Hoa' },
            { status: 'picking', time: '2025-11-09T09:00:00.000Z', description: 'Tài xế đang đến lấy hàng' },
            { status: 'delivering', time: '2025-11-09T10:00:00.000Z', description: 'Đang giao hàng' }
        ]
    },
    {
        id: 'VD123456787',
        customerName: 'Lê Văn D',
        customerPhone: '0956789012',
        pickupAddress: '555 Trần Hưng Đạo, Q5, TP.HCM',
        senderName: 'Shop C',
        senderPhone: '0945678901',
        deliveryAddress: '888 Lê Duẩn, Hải Châu, Đà Nẵng',
        receiverName: 'Lê Văn D',
        receiverPhone: '0956789012',
        itemType: 'food',
        weight: 3.5,
        paymentMethod: 'prepaid', // Trả trước - không COD
        codAmount: 0,
        shippingFee: 45000,
        status: 'pending',
        driverId: null,
        createdAt: '2025-11-09T09:00:00.000Z',
        notes: 'Hàng dễ hỏng, cần giao nhanh',
        timeline: [
            { status: 'pending', time: '2025-11-09T09:00:00.000Z', description: 'Đơn hàng đã được tạo' }
        ]
    },
    {
        id: 'VD123456786',
        customerName: 'Phạm Thị E',
        customerPhone: '0978901234',
        pickupAddress: '222 Võ Văn Tần, Q3, TP.HCM',
        senderName: 'Công ty D',
        senderPhone: '0967890123',
        deliveryAddress: '111 Lạch Tray, Ngô Quyền, Hải Phòng',
        receiverName: 'Phạm Thị E',
        receiverPhone: '0978901234',
        itemType: 'document',
        weight: 0.5,
        paymentMethod: 'cod', // COD - Đã hủy
        codAmount: 450000,
        shippingFee: 30000,
        status: 'cancelled',
        driverId: 'driver1',
        createdAt: '2025-11-08T14:00:00.000Z',
        cancelReason: 'Không liên lạc được người nhận',
        cancelledAt: '2025-11-08T16:00:00.000Z',
        notes: '',
        timeline: [
            { status: 'pending', time: '2025-11-08T14:00:00.000Z', description: 'Đơn hàng đã được tạo' },
            { status: 'assigned', time: '2025-11-08T14:10:00.000Z', description: 'Đã phân cho tài xế Trần Văn Tài' },
            { status: 'cancelled', time: '2025-11-08T16:00:00.000Z', description: 'Đơn hàng đã bị hủy. Lý do: Không liên lạc được người nhận' }
        ]
    },
    // Thêm các đơn COD khác để có đủ dữ liệu
    {
        id: 'VD123456790',
        customerName: 'Võ Văn F',
        customerPhone: '0987654321',
        pickupAddress: '100 Điện Biên Phủ, Q3, TP.HCM',
        senderName: 'Shop D',
        senderPhone: '0976543210',
        deliveryAddress: '200 Lê Văn Việt, Q9, TP.HCM',
        receiverName: 'Võ Văn F',
        receiverPhone: '0987654321',
        itemType: 'electronics',
        weight: 1.8,
        paymentMethod: 'cod', // COD - Đã giao, đã thu
        codAmount: 3200000,
        shippingFee: 40000,
        status: 'delivered',
        driverId: 'driver2',
        createdAt: '2025-11-07T09:00:00.000Z',
        deliveredAt: '2025-11-08T16:30:00.000Z',
        codCollected: true,
        codCollectedDate: '2025-11-08T16:30:00.000Z',
        notes: 'Hàng công nghệ cao cấp',
        timeline: [
            { status: 'pending', time: '2025-11-07T09:00:00.000Z', description: 'Đơn hàng đã được tạo' },
            { status: 'assigned', time: '2025-11-07T09:15:00.000Z', description: 'Đã phân cho tài xế Lê Thị Hoa' },
            { status: 'picking', time: '2025-11-07T10:00:00.000Z', description: 'Tài xế đang đến lấy hàng' },
            { status: 'delivering', time: '2025-11-08T14:00:00.000Z', description: 'Đang giao hàng' },
            { status: 'delivered', time: '2025-11-08T16:30:00.000Z', description: 'Giao hàng thành công' }
        ]
    },
    {
        id: 'VD123456791',
        customerName: 'Đặng Thị G',
        customerPhone: '0965432109',
        pickupAddress: '50 Cách Mạng Tháng 8, Q10, TP.HCM',
        senderName: 'Cửa hàng E',
        senderPhone: '0954321098',
        deliveryAddress: '75 Hoàng Văn Thụ, Tân Bình, TP.HCM',
        receiverName: 'Đặng Thị G',
        receiverPhone: '0965432109',
        itemType: 'clothing',
        weight: 2.0,
        paymentMethod: 'cod', // COD - Đã giao, đã thu, đã quyết toán
        codAmount: 1850000,
        shippingFee: 28000,
        status: 'delivered',
        driverId: 'driver3',
        createdAt: '2025-11-05T11:00:00.000Z',
        deliveredAt: '2025-11-06T10:00:00.000Z',
        codCollected: true,
        codCollectedDate: '2025-11-06T10:00:00.000Z',
        codSettled: true,
        codSettlementDate: '2025-11-07T09:00:00.000Z',
        notes: 'Quần áo thời trang',
        timeline: [
            { status: 'pending', time: '2025-11-05T11:00:00.000Z', description: 'Đơn hàng đã được tạo' },
            { status: 'assigned', time: '2025-11-05T11:10:00.000Z', description: 'Đã phân cho tài xế Nguyễn Văn Nam' },
            { status: 'picking', time: '2025-11-05T12:00:00.000Z', description: 'Tài xế đang đến lấy hàng' },
            { status: 'delivering', time: '2025-11-06T08:00:00.000Z', description: 'Đang giao hàng' },
            { status: 'delivered', time: '2025-11-06T10:00:00.000Z', description: 'Giao hàng thành công' }
        ]
    },
    {
        id: 'VD123456792',
        customerName: 'Hoàng Văn H',
        customerPhone: '0943210987',
        pickupAddress: '88 Nguyễn Thị Minh Khai, Q1, TP.HCM',
        senderName: 'Công ty F',
        senderPhone: '0932109876',
        deliveryAddress: '99 Phan Đăng Lưu, Phú Nhuận, TP.HCM',
        receiverName: 'Hoàng Văn H',
        receiverPhone: '0943210987',
        itemType: 'document',
        weight: 0.8,
        paymentMethod: 'cod', // COD - Đã giao, đã thu, chưa quyết toán
        codAmount: 680000,
        shippingFee: 20000,
        status: 'delivered',
        driverId: 'driver1',
        createdAt: '2025-11-06T13:00:00.000Z',
        deliveredAt: '2025-11-07T11:30:00.000Z',
        codCollected: true,
        codCollectedDate: '2025-11-07T11:30:00.000Z',
        notes: 'Tài liệu quan trọng',
        timeline: [
            { status: 'pending', time: '2025-11-06T13:00:00.000Z', description: 'Đơn hàng đã được tạo' },
            { status: 'assigned', time: '2025-11-06T13:15:00.000Z', description: 'Đã phân cho tài xế Trần Văn Tài' },
            { status: 'picking', time: '2025-11-06T14:00:00.000Z', description: 'Tài xế đang đến lấy hàng' },
            { status: 'delivering', time: '2025-11-07T09:00:00.000Z', description: 'Đang giao hàng' },
            { status: 'delivered', time: '2025-11-07T11:30:00.000Z', description: 'Giao hàng thành công' }
        ]
    },
    {
        id: 'VD123456793',
        customerName: 'Bùi Thị I',
        customerPhone: '0921098765',
        pickupAddress: '33 Pasteur, Q1, TP.HCM',
        senderName: 'Shop G',
        senderPhone: '0910987654',
        deliveryAddress: '44 Lý Chính Thắng, Q3, TP.HCM',
        receiverName: 'Bùi Thị I',
        receiverPhone: '0921098765',
        itemType: 'food',
        weight: 1.5,
        paymentMethod: 'cod', // COD - Đã giao, đã thu, chưa quyết toán
        codAmount: 950000,
        shippingFee: 22000,
        status: 'delivered',
        driverId: 'driver2',
        createdAt: '2025-11-08T07:00:00.000Z',
        deliveredAt: '2025-11-08T12:00:00.000Z',
        codCollected: true,
        codCollectedDate: '2025-11-08T12:00:00.000Z',
        notes: 'Thực phẩm tươi sống',
        timeline: [
            { status: 'pending', time: '2025-11-08T07:00:00.000Z', description: 'Đơn hàng đã được tạo' },
            { status: 'assigned', time: '2025-11-08T07:10:00.000Z', description: 'Đã phân cho tài xế Lê Thị Hoa' },
            { status: 'picking', time: '2025-11-08T08:00:00.000Z', description: 'Tài xế đang đến lấy hàng' },
            { status: 'delivering', time: '2025-11-08T10:00:00.000Z', description: 'Đang giao hàng' },
            { status: 'delivered', time: '2025-11-08T12:00:00.000Z', description: 'Giao hàng thành công' }
        ]
    }
];

let drivers = JSON.parse(localStorage.getItem('drivers')) || [
    {
        id: 'driver1',
        name: 'Trần Văn Tài',
        username: 'taixe01',
        password: '123456',
        email: 'trantai@gmail.com',
        phone: '0912345678',
        phoneNumber: '0912345678',
        fullname: 'Trần Văn Tài',
        vehicle: '29A-12345',
        vehiclePlate: '29A-12345',
        licensePlate: '29A-12345',
        vehicleType: 'Xe máy',
        license: 'B2-123456',
        driverLicense: 'B2-123456',
        licenseNumber: 'B2-123456',
        licenseExpiry: '2030-12-31',
        licenseDate: '2020-01-15',
        idCard: '079123456789',
        dateOfBirth: '1990-05-20',
        birthday: '1990-05-20',
        address: '123 Lê Lợi, Quận 1, TP.HCM',
        status: 'active',
        currentOrders: 3,
        maxOrders: 15,
        rating: 4.8,
        role: 'driver',
        createdAt: '2024-01-10T08:00:00.000Z'
    },
    {
        id: 'driver2',
        name: 'Lê Thị Hoa',
        username: 'taixe02',
        password: '123456',
        email: 'lehoa@gmail.com',
        phone: '0923456789',
        phoneNumber: '0923456789',
        fullname: 'Lê Thị Hoa',
        vehicle: '30B-67890',
        vehiclePlate: '30B-67890',
        licensePlate: '30B-67890',
        vehicleType: 'Xe tải nhỏ',
        license: 'B2-789012',
        driverLicense: 'B2-789012',
        licenseNumber: 'B2-789012',
        licenseExpiry: '2029-06-30',
        licenseDate: '2019-03-10',
        idCard: '079234567890',
        dateOfBirth: '1988-08-15',
        birthday: '1988-08-15',
        address: '456 Nguyễn Huệ, Quận 1, TP.HCM',
        status: 'active',
        currentOrders: 12,
        maxOrders: 15,
        rating: 4.9,
        role: 'driver',
        createdAt: '2024-02-05T09:00:00.000Z'
    },
    {
        id: 'driver3',
        name: 'Nguyễn Văn Nam',
        username: 'taixe03',
        password: '123456',
        email: 'nguyennam@gmail.com',
        phone: '0934567890',
        phoneNumber: '0934567890',
        fullname: 'Nguyễn Văn Nam',
        vehicle: '51C-11111',
        vehiclePlate: '51C-11111',
        licensePlate: '51C-11111',
        vehicleType: 'Xe máy',
        license: 'B2-345678',
        driverLicense: 'B2-345678',
        licenseNumber: 'B2-345678',
        licenseExpiry: '2028-12-31',
        licenseDate: '2018-06-20',
        idCard: '079345678901',
        dateOfBirth: '1992-03-10',
        birthday: '1992-03-10',
        address: '789 Lý Thường Kiệt, Quận 10, TP.HCM',
        status: 'active',
        currentOrders: 5,
        maxOrders: 15,
        rating: 4.7,
        role: 'driver',
        createdAt: '2024-03-12T10:00:00.000Z'
    }
];

// Save data to localStorage
function saveData() {
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('drivers', JSON.stringify(drivers));
    
    // DataSync support
    if (typeof DataSync !== 'undefined') {
        DataSync.set('orders', orders);
        DataSync.set('drivers', drivers);
        DataSync.triggerSync('orders');
        DataSync.triggerSync('drivers');
        console.log('[Admin] Data synced via DataSync');
    }
}

// Initialize and save sample data if needed
function initializeSampleData() {
    const existingOrders = localStorage.getItem('orders');
    if (!existingOrders) {
        console.log('Initializing sample orders with COD data...');
        saveData();
        console.log('Sample data saved to localStorage');
    } else {
        // Kiểm tra xem orders đã có paymentMethod chưa
        const parsedOrders = JSON.parse(existingOrders);
        if (parsedOrders.length > 0 && !parsedOrders[0].hasOwnProperty('paymentMethod')) {
            console.log('Updating orders with paymentMethod field...');
            // Cập nhật orders hiện có với paymentMethod
            orders.forEach((order, index) => {
                if (parsedOrders[index]) {
                    parsedOrders[index].paymentMethod = order.paymentMethod || (order.codAmount > 0 ? 'cod' : 'prepaid');
                    if (order.codCollected !== undefined) parsedOrders[index].codCollected = order.codCollected;
                    if (order.codCollectedDate) parsedOrders[index].codCollectedDate = order.codCollectedDate;
                    if (order.codSettled !== undefined) parsedOrders[index].codSettled = order.codSettled;
                    if (order.codSettlementDate) parsedOrders[index].codSettlementDate = order.codSettlementDate;
                }
            });
            orders.length = 0;
            orders.push(...parsedOrders);
            saveData();
            console.log('Orders updated with COD fields');
        }
    }
}

// Call initialization on script load
initializeSampleData();

// Kiểm tra quyền admin
function checkAdminAccess() {
    const user = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
    
    console.log('[Admin] Checking access');
    
    if (!user) {
        console.log('[Admin] No user found, redirecting to login');
        window.location.href = 'login.html';
        return null;
    }
    
    const userData = JSON.parse(user);
    console.log('[Admin] User role:', userData.role);
    
    if (userData.role !== 'admin') {
        console.log('[Admin] Access denied, redirecting...');
        alert('Trang này chỉ dành cho quản trị viên!');
        switch(userData.role) {
            case 'driver':
                window.location.href = 'index-driver.html';
                break;
            case 'customer':
                window.location.href = 'index-customer.html';
                break;
            default:
                window.location.href = 'login.html';
        }
        return null;
    }
    
    console.log('[Admin] Access granted');
    return userData;
}

// Hiển thị thông tin admin
function displayAdminInfo() {
    const user = checkAdminAccess();
    if (!user) return;
    
    const userNameElement = document.querySelector('.user-name');
    const userRoleElement = document.querySelector('.user-role');
    const userAvatarElement = document.querySelector('.user-avatar');
    
    if (userNameElement) userNameElement.textContent = user.fullName;
    if (userRoleElement) userRoleElement.textContent = 'Quản trị viên';
    if (userAvatarElement) {
        const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        userAvatarElement.textContent = initials;
    }
}

// Cập nhật thống kê dashboard
function updateDashboardStats() {
    const totalOrders = orders.length;
    const deliveringOrders = orders.filter(o => o.status === 'delivering').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const totalCOD = orders.filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + o.cod, 0);
    
    document.querySelector('.dashboard-cards .card:nth-child(1) .card-value').textContent = totalOrders;
    document.querySelector('.dashboard-cards .card:nth-child(2) .card-value').textContent = deliveringOrders;
    document.querySelector('.dashboard-cards .card:nth-child(3) .card-value').textContent = deliveredOrders;
    document.querySelector('.dashboard-cards .card:nth-child(4) .card-value').textContent = 
        (totalCOD / 1000000).toFixed(1) + 'M';
}

// Render danh sách đơn hàng
function renderOrdersTable(filterStatus = 'all') {
    const tbody = document.querySelector('#orders-table tbody');
    if (!tbody) return;
    
    let filteredOrders = orders;
    if (filterStatus !== 'all') {
        filteredOrders = orders.filter(o => o.status === filterStatus);
    }
    
    tbody.innerHTML = filteredOrders.map(order => {
        const statusBadge = getStatusBadge(order.status);
        return `
            <tr data-order-id="${order.id}">
                <td><strong>${order.id}</strong></td>
                <td>${order.sender.name}</td>
                <td>${order.receiver.name}</td>
                <td>${order.receiver.address.split(',').slice(-2).join(',')}</td>
                <td>${statusBadge}</td>
                <td><strong>${order.cod.toLocaleString('vi-VN')} đ</strong></td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="viewOrderDetail('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${order.status === 'pending' ? `
                        <button class="btn btn-success btn-sm" onclick="assignDriver('${order.id}')">
                            <i class="fas fa-user-plus"></i> Phân công
                        </button>
                    ` : ''}
                    ${order.status === 'failed' ? `
                        <button class="btn btn-warning btn-sm" onclick="reassignOrder('${order.id}')">
                            <i class="fas fa-redo"></i> Giao lại
                        </button>
                    ` : ''}
                    <button class="btn btn-danger btn-sm" onclick="deleteOrder('${order.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Lấy badge trạng thái
function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge badge-primary"><i class="fas fa-clock"></i> Chờ lấy hàng</span>',
        'picked': '<span class="badge badge-info"><i class="fas fa-box"></i> Đã lấy hàng</span>',
        'delivering': '<span class="badge badge-warning"><i class="fas fa-truck"></i> Đang giao</span>',
        'delivered': '<span class="badge badge-success"><i class="fas fa-check"></i> Đã giao</span>',
        'failed': '<span class="badge badge-danger"><i class="fas fa-times"></i> Thất bại</span>',
        'cancelled': '<span class="badge badge-secondary"><i class="fas fa-ban"></i> Đã hủy</span>'
    };
    return badges[status] || badges['pending'];
}

// Xem chi tiết đơn hàng
function viewOrderDetail(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modalHTML = `
        <div class="modal show" id="order-detail-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-file-alt"></i> Chi tiết đơn hàng ${orderId}</h3>
                    <button class="modal-close" onclick="closeModal('order-detail-modal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="order-detail-section">
                        <h4><i class="fas fa-info-circle"></i> Thông tin chung</h4>
                        <div class="detail-row">
                            <span class="detail-label">Mã vận đơn:</span>
                            <span class="detail-value">${order.id}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Trạng thái:</span>
                            <span>${getStatusBadge(order.status)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Ngày tạo:</span>
                            <span class="detail-value">${order.createdAt}</span>
                        </div>
                        ${order.deliveredAt ? `
                            <div class="detail-row">
                                <span class="detail-label">Ngày giao:</span>
                                <span class="detail-value">${order.deliveredAt}</span>
                            </div>
                        ` : ''}
                        ${order.driver ? `
                            <div class="detail-row">
                                <span class="detail-label">Tài xế:</span>
                                <span class="detail-value">${order.driver}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="order-detail-section">
                        <h4><i class="fas fa-user"></i> Người gửi</h4>
                        <div class="detail-row">
                            <span class="detail-label">Tên:</span>
                            <span class="detail-value">${order.sender.name}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">SĐT:</span>
                            <span class="detail-value">${order.sender.phone}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Địa chỉ:</span>
                            <span class="detail-value">${order.sender.address}</span>
                        </div>
                    </div>
                    
                    <div class="order-detail-section">
                        <h4><i class="fas fa-map-marker-alt"></i> Người nhận</h4>
                        <div class="detail-row">
                            <span class="detail-label">Tên:</span>
                            <span class="detail-value">${order.receiver.name}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">SĐT:</span>
                            <span class="detail-value">${order.receiver.phone}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Địa chỉ:</span>
                            <span class="detail-value">${order.receiver.address}</span>
                        </div>
                    </div>
                    
                    <div class="order-detail-section">
                        <h4><i class="fas fa-box"></i> Hàng hóa & Chi phí</h4>
                        <div class="detail-row">
                            <span class="detail-label">Loại hàng:</span>
                            <span class="detail-value">${order.product.type}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Khối lượng:</span>
                            <span class="detail-value">${order.product.weight} kg</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Giá trị hàng:</span>
                            <span class="detail-value">${order.product.value.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Phí vận chuyển:</span>
                            <span class="detail-value">${order.shippingFee.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">COD:</span>
                            <span class="detail-value" style="color: var(--danger); font-size: 1.1rem;">${order.cod.toLocaleString('vi-VN')} đ</span>
                        </div>
                        ${order.note ? `
                            <div class="detail-row">
                                <span class="detail-label">Ghi chú:</span>
                                <span class="detail-value">${order.note}</span>
                            </div>
                        ` : ''}
                        ${order.failReason ? `
                            <div class="detail-row">
                                <span class="detail-label">Lý do thất bại:</span>
                                <span class="detail-value" style="color: var(--danger);">${order.failReason}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    ${order.status === 'pending' ? `
                        <button class="btn btn-success" onclick="assignDriver('${order.id}'); closeModal('order-detail-modal');">
                            <i class="fas fa-user-plus"></i> Phân công tài xế
                        </button>
                    ` : ''}
                    <button class="btn btn-primary" onclick="printOrder('${order.id}')">
                        <i class="fas fa-print"></i> In phiếu
                    </button>
                    <button class="btn btn-secondary" onclick="closeModal('order-detail-modal')">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Phân công tài xế
function assignDriver(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modalHTML = `
        <div class="modal show" id="assign-driver-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-user-plus"></i> Phân công tài xế cho đơn ${orderId}</h3>
                    <button class="modal-close" onclick="closeModal('assign-driver-modal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 15px; color: #666;">
                        <i class="fas fa-info-circle"></i> 
                        Chọn tài xế phù hợp để giao đơn hàng này
                    </p>
                    <div class="driver-list">
                        ${drivers.map(driver => `
                            <div class="driver-card ${driver.id === selectedDriverId ? 'selected' : ''}" 
                                 onclick="selectDriver('${driver.id}')">
                                <h5><i class="fas fa-user"></i> ${driver.name}</h5>
                                <p><i class="fas fa-phone"></i> ${driver.phone}</p>
                                <p><i class="fas fa-truck"></i> ${driver.vehicle}</p>
                                <p><i class="fas fa-box"></i> ${driver.currentOrders}/${driver.maxOrders} đơn</p>
                                <p><i class="fas fa-star"></i> Đánh giá: ${driver.rating}/5</p>
                                <span class="status ${driver.status}">
                                    ${driver.status === 'available' ? '✓ Sẵn sàng' : '⚠ Đang bận'}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-success" onclick="confirmAssignDriver('${orderId}')">
                        <i class="fas fa-check"></i> Xác nhận phân công
                    </button>
                    <button class="btn btn-secondary" onclick="closeModal('assign-driver-modal')">
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

let selectedDriverId = null;

function selectDriver(driverId) {
    selectedDriverId = driverId;
    document.querySelectorAll('.driver-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.driver-card').classList.add('selected');
}

function confirmAssignDriver(orderId) {
    if (!selectedDriverId) {
        alert('Vui lòng chọn tài xế!');
        return;
    }
    
    const driver = drivers.find(d => d.id === selectedDriverId);
    const order = orders.find(o => o.id === orderId);
    
    if (driver && order) {
        order.driver = driver.name;
        order.driverId = driver.id;
        order.status = 'picked';
        driver.currentOrders++;
        
        if (driver.currentOrders >= driver.maxOrders) {
            driver.status = 'busy';
        }
        
        alert(`Đã phân công đơn hàng ${orderId} cho tài xế ${driver.name}!`);
        closeModal('assign-driver-modal');
        renderOrdersTable();
        updateDashboardStats();
    }
}

// Giao lại đơn hàng
function reassignOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    if (confirm(`Giao lại đơn hàng ${orderId}?\n\nĐơn hàng sẽ được đặt lại trạng thái chờ xử lý.`)) {
        order.status = 'pending';
        order.driver = null;
        order.driverId = null;
        order.failReason = null;
        
        alert('Đơn hàng đã được đặt lại! Vui lòng phân công tài xế mới.');
        renderOrdersTable();
        updateDashboardStats();
    }
}

// Xóa đơn hàng
function deleteOrder(orderId) {
    if (confirm(`Bạn có chắc chắn muốn xóa đơn hàng ${orderId}?\n\nHành động này không thể hoàn tác!`)) {
        const index = orders.findIndex(o => o.id === orderId);
        if (index > -1) {
            orders.splice(index, 1);
            alert('Đã xóa đơn hàng thành công!');
            renderOrdersTable();
            updateDashboardStats();
        }
    }
}

// In phiếu đơn hàng
function printOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const printContent = `
        <html>
        <head>
            <title>Phiếu giao hàng - ${orderId}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; }
                .section { margin: 20px 0; border: 1px solid #000; padding: 15px; }
                .row { display: flex; justify-content: space-between; margin: 10px 0; }
                .label { font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>PHIẾU GIAO HÀNG</h1>
            <div class="section">
                <h3>Mã vận đơn: ${order.id}</h3>
                <p>Ngày tạo: ${order.createdAt}</p>
            </div>
            <div class="section">
                <h3>NGƯỜI GỬI</h3>
                <div class="row"><span class="label">Tên:</span><span>${order.sender.name}</span></div>
                <div class="row"><span class="label">SĐT:</span><span>${order.sender.phone}</span></div>
                <div class="row"><span class="label">Địa chỉ:</span><span>${order.sender.address}</span></div>
            </div>
            <div class="section">
                <h3>NGƯỜI NHẬN</h3>
                <div class="row"><span class="label">Tên:</span><span>${order.receiver.name}</span></div>
                <div class="row"><span class="label">SĐT:</span><span>${order.receiver.phone}</span></div>
                <div class="row"><span class="label">Địa chỉ:</span><span>${order.receiver.address}</span></div>
            </div>
            <div class="section">
                <h3>HÀNG HÓA</h3>
                <div class="row"><span class="label">Loại:</span><span>${order.product.type}</span></div>
                <div class="row"><span class="label">Khối lượng:</span><span>${order.product.weight} kg</span></div>
                <div class="row"><span class="label">Giá trị:</span><span>${order.product.value.toLocaleString('vi-VN')} đ</span></div>
            </div>
            <div class="section">
                <h3>CHI PHÍ</h3>
                <div class="row"><span class="label">Phí vận chuyển:</span><span>${order.shippingFee.toLocaleString('vi-VN')} đ</span></div>
                <div class="row"><span class="label">COD:</span><span style="font-size: 1.2em; color: red;">${order.cod.toLocaleString('vi-VN')} đ</span></div>
            </div>
            ${order.note ? `
                <div class="section">
                    <h3>GHI CHÚ</h3>
                    <p>${order.note}</p>
                </div>
            ` : ''}
            <div style="margin-top: 40px;">
                <p>Chữ ký người gửi: _________________</p>
                <p>Chữ ký người nhận: _________________</p>
                <p>Chữ ký tài xế: _________________</p>
            </div>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

// Đóng modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// Tìm kiếm đơn hàng
function searchOrders() {
    const searchTerm = document.getElementById('search-orders').value.toLowerCase();
    const filteredOrders = orders.filter(order => 
        order.id.toLowerCase().includes(searchTerm) ||
        order.sender.name.toLowerCase().includes(searchTerm) ||
        order.receiver.name.toLowerCase().includes(searchTerm) ||
        order.receiver.address.toLowerCase().includes(searchTerm)
    );
    
    const tbody = document.querySelector('#orders-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = filteredOrders.map(order => {
        const statusBadge = getStatusBadge(order.status);
        return `
            <tr data-order-id="${order.id}">
                <td><strong>${order.id}</strong></td>
                <td>${order.sender.name}</td>
                <td>${order.receiver.name}</td>
                <td>${order.receiver.address.split(',').slice(-2).join(',')}</td>
                <td>${statusBadge}</td>
                <td><strong>${order.cod.toLocaleString('vi-VN')} đ</strong></td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="viewOrderDetail('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${order.status === 'pending' ? `
                        <button class="btn btn-success btn-sm" onclick="assignDriver('${order.id}')">
                            <i class="fas fa-user-plus"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra quyền admin
    const user = checkAdminAccess();
    if (!user) return;
    
    // Hiển thị thông tin admin
    displayAdminInfo();
    
    // Cập nhật dashboard
    updateDashboardStats();
    renderOrdersTable();
    
    // Xử lý đăng xuất
    const logoutButtons = document.querySelectorAll('.btn-primary');
    logoutButtons.forEach(btn => {
        if (btn.innerHTML.includes('Đăng xuất')) {
            btn.addEventListener('click', function() {
                if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                    sessionStorage.removeItem('loggedInUser');
                    localStorage.removeItem('loggedInUser');
                    localStorage.removeItem('rememberMe');
                    window.location.href = 'login.html';
                }
            });
        }
    });
    
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
    
    // Tìm kiếm
    const searchInput = document.getElementById('search-orders');
    if (searchInput) {
        searchInput.addEventListener('input', searchOrders);
    }
    
    // Lọc theo trạng thái
    const filterSelect = document.getElementById('filter-status');
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            renderOrdersTable(this.value);
        });
    }
    
    // Form tạo đơn hàng
    const createOrderForm = document.getElementById('create-order-form');
    if (createOrderForm) {
        createOrderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Đơn hàng đã được tạo thành công!');
            this.reset();
        });
    }
});

// Helper functions for all admin pages
function getStatusText(status) {
    const statusTexts = {
        'pending': 'Chờ xử lý',
        'assigned': 'Đã phân tài xế',
        'picking': 'Đang lấy hàng',
        'delivering': 'Đang giao',
        'delivered': 'Đã giao',
        'cancelled': 'Đã hủy',
        'failed': 'Thất bại'
    };
    return statusTexts[status] || status;
}

function getStatusClass(status) {
    const statusClasses = {
        'pending': 'badge-warning',
        'assigned': 'badge-primary',
        'picking': 'badge-primary',
        'delivering': 'badge-primary',
        'delivered': 'badge-success',
        'cancelled': 'badge-secondary',
        'failed': 'badge-danger'
    };
    return statusClasses[status] || 'badge-secondary';
}

function formatMoney(amount) {
    if (!amount && amount !== 0) return '0₫';
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Logout function
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
