// Script to initialize sample data for demo purposes
// This will create sample orders for customer accounts

function initializeSampleData() {
    // Check if orders already exist
    const existingOrders = localStorage.getItem('orders');
    if (existingOrders && JSON.parse(existingOrders).length > 0) {
        console.log('[Sample Data] Orders already exist, skipping initialization');
        return;
    }
    
    // Sample orders for customer1 (Phạm Thị Lan - CUST001)
    const sampleOrders = [
        {
            id: 'ORD001',
            orderId: 'ORD001',
            customerId: 'CUST001',
            customerName: 'Phạm Thị Lan',
            customerPhone: '0934567890',
            customerEmail: 'customer1@gmail.com',
            senderName: 'Phạm Thị Lan',
            senderPhone: '0934567890',
            senderAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
            receiverName: 'Nguyễn Văn A',
            receiverPhone: '0901234567',
            receiverAddress: '456 Lê Văn Sỹ, Quận 3, TP.HCM',
            itemType: 'documents',
            itemWeight: 0.5,
            itemValue: 100000,
            itemDescription: 'Tài liệu hợp đồng',
            shippingFee: 30000,
            codAmount: 0,
            paymentMethod: 'bank',
            status: 'delivered',
            createdAt: '2024-11-01T08:00:00.000Z',
            assignedAt: '2024-11-01T08:30:00.000Z',
            pickingAt: '2024-11-01T09:00:00.000Z',
            deliveringAt: '2024-11-01T10:00:00.000Z',
            deliveredAt: '2024-11-01T11:30:00.000Z',
            driverId: 'DRV001',
            driverName: 'Trần Văn Tài',
            timeline: [
                { status: 'pending', timestamp: '2024-11-01T08:00:00.000Z', note: 'Đơn hàng đã được tạo' },
                { status: 'assigned', timestamp: '2024-11-01T08:30:00.000Z', note: 'Đã phân công tài xế Trần Văn Tài' },
                { status: 'picking', timestamp: '2024-11-01T09:00:00.000Z', note: 'Tài xế đang đến lấy hàng' },
                { status: 'delivering', timestamp: '2024-11-01T10:00:00.000Z', note: 'Đang giao hàng' },
                { status: 'delivered', timestamp: '2024-11-01T11:30:00.000Z', note: 'Giao hàng thành công' }
            ],
            rating: {
                stars: 5,
                comment: 'Giao hàng rất nhanh và chuyên nghiệp!',
                createdAt: '2024-11-01T12:00:00.000Z'
            }
        },
        {
            id: 'ORD002',
            orderId: 'ORD002',
            customerId: 'CUST001',
            customerName: 'Phạm Thị Lan',
            customerPhone: '0934567890',
            customerEmail: 'customer1@gmail.com',
            senderName: 'Phạm Thị Lan',
            senderPhone: '0934567890',
            senderAddress: '88 Đồng Khởi, Quận 1, TP.HCM',
            receiverName: 'Lê Thị B',
            receiverPhone: '0912345678',
            receiverAddress: '789 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
            itemType: 'electronics',
            itemWeight: 2,
            itemValue: 5000000,
            itemDescription: 'Laptop Dell XPS 13',
            shippingFee: 50000,
            codAmount: 5000000,
            paymentMethod: 'cod',
            status: 'delivered',
            createdAt: '2024-11-05T10:00:00.000Z',
            assignedAt: '2024-11-05T10:30:00.000Z',
            pickingAt: '2024-11-05T11:00:00.000Z',
            deliveringAt: '2024-11-05T14:00:00.000Z',
            deliveredAt: '2024-11-05T15:30:00.000Z',
            driverId: 'DRV002',
            driverName: 'Lê Thị Hoa',
            timeline: [
                { status: 'pending', timestamp: '2024-11-05T10:00:00.000Z', note: 'Đơn hàng đã được tạo' },
                { status: 'assigned', timestamp: '2024-11-05T10:30:00.000Z', note: 'Đã phân công tài xế Lê Thị Hoa' },
                { status: 'picking', timestamp: '2024-11-05T11:00:00.000Z', note: 'Tài xế đang đến lấy hàng' },
                { status: 'delivering', timestamp: '2024-11-05T14:00:00.000Z', note: 'Đang giao hàng' },
                { status: 'delivered', timestamp: '2024-11-05T15:30:00.000Z', note: 'Giao hàng thành công, đã thu COD' }
            ],
            rating: {
                stars: 5,
                comment: 'Tuyệt vời, hàng nguyên vẹn!',
                createdAt: '2024-11-05T16:00:00.000Z'
            }
        },
        {
            id: 'ORD003',
            orderId: 'ORD003',
            customerId: 'CUST001',
            customerName: 'Phạm Thị Lan',
            customerPhone: '0934567890',
            customerEmail: 'customer1@gmail.com',
            senderName: 'Phạm Thị Lan',
            senderPhone: '0934567890',
            senderAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
            receiverName: 'Trần Văn C',
            receiverPhone: '0923456789',
            receiverAddress: '321 Võ Văn Tần, Quận 3, TP.HCM',
            itemType: 'clothing',
            itemWeight: 1,
            itemValue: 800000,
            itemDescription: 'Áo vest công sở',
            shippingFee: 35000,
            codAmount: 800000,
            paymentMethod: 'cod',
            status: 'delivering',
            createdAt: '2024-11-18T09:00:00.000Z',
            assignedAt: '2024-11-18T09:30:00.000Z',
            pickingAt: '2024-11-18T10:00:00.000Z',
            deliveringAt: '2024-11-18T11:00:00.000Z',
            driverId: 'DRV001',
            driverName: 'Trần Văn Tài',
            timeline: [
                { status: 'pending', timestamp: '2024-11-18T09:00:00.000Z', note: 'Đơn hàng đã được tạo' },
                { status: 'assigned', timestamp: '2024-11-18T09:30:00.000Z', note: 'Đã phân công tài xế Trần Văn Tài' },
                { status: 'picking', timestamp: '2024-11-18T10:00:00.000Z', note: 'Tài xế đang đến lấy hàng' },
                { status: 'delivering', timestamp: '2024-11-18T11:00:00.000Z', note: 'Đang giao hàng đến người nhận' }
            ]
        },
        {
            id: 'ORD004',
            orderId: 'ORD004',
            customerId: 'CUST001',
            customerName: 'Phạm Thị Lan',
            customerPhone: '0934567890',
            customerEmail: 'customer1@gmail.com',
            senderName: 'Phạm Thị Lan',
            senderPhone: '0934567890',
            senderAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
            receiverName: 'Hoàng Thị D',
            receiverPhone: '0934567890',
            receiverAddress: '555 Lý Thường Kiệt, Quận 10, TP.HCM',
            itemType: 'food',
            itemWeight: 3,
            itemValue: 500000,
            itemDescription: 'Bánh kẹo đặc sản',
            shippingFee: 45000,
            codAmount: 0,
            paymentMethod: 'bank',
            status: 'picking',
            createdAt: '2024-11-19T14:00:00.000Z',
            assignedAt: '2024-11-19T14:30:00.000Z',
            pickingAt: '2024-11-19T15:00:00.000Z',
            driverId: 'DRV002',
            driverName: 'Lê Thị Hoa',
            timeline: [
                { status: 'pending', timestamp: '2024-11-19T14:00:00.000Z', note: 'Đơn hàng đã được tạo' },
                { status: 'assigned', timestamp: '2024-11-19T14:30:00.000Z', note: 'Đã phân công tài xế Lê Thị Hoa' },
                { status: 'picking', timestamp: '2024-11-19T15:00:00.000Z', note: 'Tài xế đang đến lấy hàng' }
            ]
        },
        {
            id: 'ORD005',
            orderId: 'ORD005',
            customerId: 'CUST001',
            customerName: 'Phạm Thị Lan',
            customerPhone: '0934567890',
            customerEmail: 'customer1@gmail.com',
            senderName: 'Phạm Thị Lan',
            senderPhone: '0934567890',
            senderAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
            receiverName: 'Phan Văn E',
            receiverPhone: '0945678901',
            receiverAddress: '999 Nguyễn Thái Học, Quận 1, TP.HCM',
            itemType: 'books',
            itemWeight: 1.5,
            itemValue: 300000,
            itemDescription: 'Sách chuyên ngành',
            shippingFee: 40000,
            codAmount: 300000,
            paymentMethod: 'cod',
            status: 'cancelled',
            createdAt: '2024-11-10T10:00:00.000Z',
            cancelledAt: '2024-11-10T11:00:00.000Z',
            cancelReason: 'Khách hàng yêu cầu hủy',
            timeline: [
                { status: 'pending', timestamp: '2024-11-10T10:00:00.000Z', note: 'Đơn hàng đã được tạo' },
                { status: 'cancelled', timestamp: '2024-11-10T11:00:00.000Z', note: 'Đơn hàng đã bị hủy: Khách hàng yêu cầu hủy' }
            ]
        },
        // Sample orders for customer2 (Hoàng Văn Nam - CUST002)
        {
            id: 'ORD006',
            orderId: 'ORD006',
            customerId: 'CUST002',
            customerName: 'Hoàng Văn Nam',
            customerPhone: '0945678901',
            customerEmail: 'customer2@gmail.com',
            senderName: 'Hoàng Văn Nam',
            senderPhone: '0945678901',
            senderAddress: '456 Lê Lợi, Quận 1, TP.HCM',
            receiverName: 'Nguyễn Thị F',
            receiverPhone: '0956789012',
            receiverAddress: '123 Hai Bà Trưng, Quận 1, TP.HCM',
            itemType: 'electronics',
            itemWeight: 0.3,
            itemValue: 2000000,
            itemDescription: 'Điện thoại iPhone',
            shippingFee: 40000,
            codAmount: 2000000,
            paymentMethod: 'cod',
            status: 'delivered',
            createdAt: '2024-11-08T12:00:00.000Z',
            assignedAt: '2024-11-08T12:30:00.000Z',
            pickingAt: '2024-11-08T13:00:00.000Z',
            deliveringAt: '2024-11-08T14:00:00.000Z',
            deliveredAt: '2024-11-08T15:00:00.000Z',
            driverId: 'DRV001',
            driverName: 'Trần Văn Tài',
            timeline: [
                { status: 'pending', timestamp: '2024-11-08T12:00:00.000Z', note: 'Đơn hàng đã được tạo' },
                { status: 'assigned', timestamp: '2024-11-08T12:30:00.000Z', note: 'Đã phân công tài xế' },
                { status: 'picking', timestamp: '2024-11-08T13:00:00.000Z', note: 'Đang lấy hàng' },
                { status: 'delivering', timestamp: '2024-11-08T14:00:00.000Z', note: 'Đang giao hàng' },
                { status: 'delivered', timestamp: '2024-11-08T15:00:00.000Z', note: 'Giao hàng thành công' }
            ],
            rating: {
                stars: 4,
                comment: 'Tốt, giao đúng giờ',
                createdAt: '2024-11-08T15:30:00.000Z'
            }
        },
        {
            id: 'ORD007',
            orderId: 'ORD007',
            customerId: 'CUST002',
            customerName: 'Hoàng Văn Nam',
            customerPhone: '0945678901',
            customerEmail: 'customer2@gmail.com',
            senderName: 'Hoàng Văn Nam',
            senderPhone: '0945678901',
            senderAddress: '456 Lê Lợi, Quận 1, TP.HCM',
            receiverName: 'Trần Văn G',
            receiverPhone: '0967890123',
            receiverAddress: '789 Võ Thị Sáu, Quận 3, TP.HCM',
            itemType: 'documents',
            itemWeight: 0.2,
            itemValue: 50000,
            itemDescription: 'Hồ sơ',
            shippingFee: 25000,
            codAmount: 0,
            paymentMethod: 'bank',
            status: 'assigned',
            createdAt: '2024-11-20T08:00:00.000Z',
            assignedAt: '2024-11-20T08:15:00.000Z',
            driverId: 'DRV002',
            driverName: 'Lê Thị Hoa',
            timeline: [
                { status: 'pending', timestamp: '2024-11-20T08:00:00.000Z', note: 'Đơn hàng đã được tạo' },
                { status: 'assigned', timestamp: '2024-11-20T08:15:00.000Z', note: 'Đã phân công tài xế Lê Thị Hoa' }
            ]
        }
    ];
    
    // Save to localStorage
    localStorage.setItem('orders', JSON.stringify(sampleOrders));
    console.log('[Sample Data] Initialized', sampleOrders.length, 'sample orders');
    
    // Also initialize with DataSync if available
    if (typeof DataSync !== 'undefined') {
        DataSync.set('orders', sampleOrders);
        DataSync.triggerSync();
    }
}

// Run initialization when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSampleData);
} else {
    initializeSampleData();
}
