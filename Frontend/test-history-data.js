// Script to create test delivery history data
// Run this in browser console (F12) to add sample completed orders

function createTestHistoryData() {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('loggedInUser') || '{"username":"driver1","role":"driver"}');
    
    // Get existing orders or create new array
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Create sample completed orders for the driver
    const testOrders = [
        {
            id: 'DH001',
            trackingNumber: 'DH001',
            customerName: 'Nguyễn Văn A',
            receiverName: 'Nguyễn Văn A',
            receiverPhone: '0901234567',
            receiverAddress: '123 Láng Hạ, Ba Đình, Hà Nội',
            deliveryAddress: '123 Láng Hạ, Ba Đình, Hà Nội',
            codAmount: 500000,
            shippingFee: 30000,
            status: 'delivered',
            driver: currentUser.username,
            assignedDriver: currentUser.username,
            driverEmail: currentUser.email,
            deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            receivedBy: 'Nguyễn Văn A',
            codCollected: true,
            codStatus: 'submitted',
            notes: 'Giao hàng đúng giờ',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            timeline: [
                { status: 'pending', time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), description: 'Đơn hàng được tạo' },
                { status: 'assigned', time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), description: 'Đã phân công tài xế' },
                { status: 'picking', time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), description: 'Tài xế đang đi lấy hàng' },
                { status: 'delivering', time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), description: 'Đang giao hàng cho khách' },
                { status: 'delivered', time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 7200000).toISOString(), description: 'Giao hàng thành công' }
            ]
        },
        {
            id: 'DH002',
            trackingNumber: 'DH002',
            customerName: 'Trần Thị B',
            receiverName: 'Trần Thị B',
            receiverPhone: '0912345678',
            receiverAddress: '456 Giải Phóng, Hoàng Mai, Hà Nội',
            deliveryAddress: '456 Giải Phóng, Hoàng Mai, Hà Nội',
            codAmount: 750000,
            shippingFee: 35000,
            status: 'delivered',
            driver: currentUser.username,
            assignedDriver: currentUser.username,
            driverEmail: currentUser.email,
            deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            receivedBy: 'Trần Thị B',
            codCollected: true,
            codStatus: 'submitted',
            notes: 'Khách yêu cầu giao buổi sáng',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            timeline: [
                { status: 'pending', time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), description: 'Đơn hàng được tạo' },
                { status: 'assigned', time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), description: 'Đã phân công tài xế' },
                { status: 'picking', time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), description: 'Tài xế đang đi lấy hàng' },
                { status: 'delivering', time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), description: 'Đang giao hàng cho khách' },
                { status: 'delivered', time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 7200000).toISOString(), description: 'Giao hàng thành công' }
            ]
        },
        {
            id: 'DH003',
            trackingNumber: 'DH003',
            customerName: 'Lê Văn C',
            receiverName: 'Lê Văn C',
            receiverPhone: '0923456789',
            receiverAddress: '789 Trần Duy Hưng, Cầu Giấy, Hà Nội',
            deliveryAddress: '789 Trần Duy Hưng, Cầu Giấy, Hà Nội',
            codAmount: 1200000,
            shippingFee: 40000,
            status: 'delivered',
            driver: currentUser.username,
            assignedDriver: currentUser.username,
            driverEmail: currentUser.email,
            deliveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            receivedBy: 'Lê Văn C',
            codCollected: false,
            notes: 'Hàng dễ vỡ, cẩn thận',
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            timeline: [
                { status: 'pending', time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), description: 'Đơn hàng được tạo' },
                { status: 'assigned', time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), description: 'Đã phân công tài xế' },
                { status: 'picking', time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), description: 'Tài xế đang đi lấy hàng' },
                { status: 'delivering', time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), description: 'Đang giao hàng cho khách' },
                { status: 'delivered', time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 7200000).toISOString(), description: 'Giao hàng thành công' }
            ]
        },
        {
            id: 'DH004',
            trackingNumber: 'DH004',
            customerName: 'Phạm Thị D',
            receiverName: 'Phạm Thị D',
            receiverPhone: '0934567890',
            receiverAddress: '321 Nguyễn Trãi, Thanh Xuân, Hà Nội',
            deliveryAddress: '321 Nguyễn Trãi, Thanh Xuân, Hà Nội',
            codAmount: 0,
            shippingFee: 25000,
            status: 'failed',
            driver: currentUser.username,
            assignedDriver: currentUser.username,
            driverEmail: currentUser.email,
            deliveredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
            failureNote: 'Không liên lạc được với khách hàng',
            notes: 'Giao trước 5h chiều',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            timeline: [
                { status: 'pending', time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), description: 'Đơn hàng được tạo' },
                { status: 'assigned', time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), description: 'Đã phân công tài xế' },
                { status: 'picking', time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), description: 'Tài xế đang đi lấy hàng' },
                { status: 'delivering', time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), description: 'Đang giao hàng cho khách' },
                { status: 'failed', time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 7200000).toISOString(), description: 'Giao hàng thất bại: Không liên lạc được với khách hàng' }
            ]
        },
        {
            id: 'DH005',
            trackingNumber: 'DH005',
            customerName: 'Hoàng Văn E',
            receiverName: 'Hoàng Văn E',
            receiverPhone: '0945678901',
            receiverAddress: '555 Xã Đàn, Đống Đa, Hà Nội',
            deliveryAddress: '555 Xã Đàn, Đống Đa, Hà Nội',
            codAmount: 350000,
            shippingFee: 30000,
            status: 'delivered',
            driver: currentUser.username,
            assignedDriver: currentUser.username,
            driverEmail: currentUser.email,
            deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            receivedBy: 'Hoàng Văn E',
            codCollected: true,
            codStatus: 'submitted',
            createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            timeline: [
                { status: 'pending', time: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), description: 'Đơn hàng được tạo' },
                { status: 'assigned', time: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), description: 'Đã phân công tài xế' },
                { status: 'picking', time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), description: 'Tài xế đang đi lấy hàng' },
                { status: 'delivering', time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), description: 'Đang giao hàng cho khách' },
                { status: 'delivered', time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 7200000).toISOString(), description: 'Giao hàng thành công' }
            ]
        },
        {
            id: 'DH006',
            trackingNumber: 'DH006',
            customerName: 'Vũ Thị F',
            receiverName: 'Vũ Thị F',
            receiverPhone: '0956789012',
            receiverAddress: '888 Tây Sơn, Đống Đa, Hà Nội',
            deliveryAddress: '888 Tây Sơn, Đống Đa, Hà Nội',
            codAmount: 2000000,
            shippingFee: 45000,
            status: 'failed',
            driver: currentUser.username,
            assignedDriver: currentUser.username,
            driverEmail: currentUser.email,
            deliveredAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
            failureNote: 'Khách hàng từ chối nhận hàng vì giao trễ',
            notes: 'Hàng cao cấp, cẩn thận',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            timeline: [
                { status: 'pending', time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), description: 'Đơn hàng được tạo' },
                { status: 'assigned', time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), description: 'Đã phân công tài xế' },
                { status: 'picking', time: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), description: 'Tài xế đang đi lấy hàng' },
                { status: 'delivering', time: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), description: 'Đang giao hàng cho khách' },
                { status: 'failed', time: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 7200000).toISOString(), description: 'Giao hàng thất bại: Khách hàng từ chối nhận hàng vì giao trễ' }
            ]
        }
    ];
    
    // Remove existing test orders with same IDs
    orders = orders.filter(o => !testOrders.find(t => t.id === o.id));
    
    // Add new test orders
    orders = orders.concat(testOrders);
    
    // Save to localStorage
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // If DataSync exists, also save there
    if (typeof DataSync !== 'undefined') {
        DataSync.set('orders', orders);
    }
    
    console.log('✅ Created', testOrders.length, 'test delivery history orders');
    console.log('📦 Total orders in system:', orders.length);
    console.log('👤 Driver:', currentUser.username);
    
    alert('Đã tạo ' + testOrders.length + ' đơn hàng mẫu cho lịch sử giao hàng!\n\nTải lại trang để xem dữ liệu.');
    
    return orders;
}

// Auto-run the function
createTestHistoryData();
