// Test data for driver orders - Run in browser console
// localStorage.clear(); // Clear old data first if needed

// Sample orders data
var sampleOrders = [
    {
        id: 1,
        maVanDon: 'WB001',
        tenNguoiGui: 'Cửa Hàng Điện Thoại A',
        sdtNguoiGui: '0909123456',
        diaChiLayHang: '123 Nguyễn Văn Linh, Q.7',
        tenNguoiNhan: 'Anh Bình',
        sdtNguoiNhan: '0911122334',
        diaChiGiaoHang: '45 Lê Lợi, Q.1',
        loaiHang: 'Điện thoại',
        khoiLuong: 0.5,
        tienThuHo: 7500000,
        loaiDichVu: 'NHANH',
        trangThai: 'DANG_GIAO',
        idTaiXe: 1,
        idTuyenDuong: 1,
        thoiGianTao: '2025-11-21T08:00:00',
        thoiGianCapNhat: '2025-11-21T08:00:00'
    },
    {
        id: 2,
        maVanDon: 'WB002',
        tenNguoiGui: 'Chị Hoa',
        sdtNguoiGui: '0987654321',
        diaChiLayHang: '78 Hoàng Văn Thụ, Q.Phú Nhuận',
        tenNguoiNhan: 'Chị Liên',
        sdtNguoiNhan: '0978965432',
        diaChiGiaoHang: '102 Pasteur, Q.3',
        loaiHang: 'Mỹ phẩm',
        khoiLuong: 1.2,
        tienThuHo: 0,
        loaiDichVu: 'THONG_THUONG',
        trangThai: 'CHO_LAY_HANG',
        idTaiXe: null,
        idTuyenDuong: null,
        thoiGianTao: '2025-11-21T09:00:00',
        thoiGianCapNhat: '2025-11-21T09:00:00'
    },
    {
        id: 3,
        maVanDon: 'WB003',
        tenNguoiGui: 'Công Ty Máy Tính XYZ',
        sdtNguoiGui: '02838250123',
        diaChiLayHang: 'Lô A1, Khu Công Nghệ Cao',
        tenNguoiNhan: 'Anh Tuấn',
        sdtNguoiNhan: '0933344556',
        diaChiGiaoHang: '11 Nguyễn Huệ, Q.1',
        loaiHang: 'Laptop',
        khoiLuong: 2.0,
        tienThuHo: 22500000,
        loaiDichVu: 'NHANH',
        trangThai: 'DA_LAY_HANG',
        idTaiXe: 1,
        idTuyenDuong: 1,
        thoiGianTao: '2025-11-21T10:00:00',
        thoiGianCapNhat: '2025-11-21T10:00:00'
    },
    {
        id: 4,
        maVanDon: 'WB004',
        tenNguoiGui: 'Shop Quần Áo Online',
        sdtNguoiGui: '0909555666',
        diaChiLayHang: 'Số 5, đường 12, Q.Gò Vấp',
        tenNguoiNhan: 'Chị Ngọc',
        sdtNguoiNhan: '0899888777',
        diaChiGiaoHang: '300 Lý Thường Kiệt, Q.Tân Bình',
        loaiHang: 'Quần áo',
        khoiLuong: 3.5,
        tienThuHo: 1200000,
        loaiDichVu: 'THONG_THUONG',
        trangThai: 'GIAO_THANH_CONG',
        idTaiXe: 3,
        idTuyenDuong: 3,
        thoiGianTao: '2025-11-20T14:00:00',
        thoiGianCapNhat: '2025-11-20T16:30:00'
    },
    {
        id: 5,
        maVanDon: 'WB005',
        tenNguoiGui: 'Nhà Sách Sư Phạm',
        sdtNguoiGui: '02838365432',
        diaChiLayHang: '366 Phan Văn Trị, Q.5',
        tenNguoiNhan: 'Thư viện ĐH B',
        sdtNguoiNhan: '02838667788',
        diaChiGiaoHang: 'Ký túc xá Khu A, Đại học B',
        loaiHang: 'Sách giáo trình',
        khoiLuong: 15.0,
        tienThuHo: 0,
        loaiDichVu: 'THONG_THUONG',
        trangThai: 'THAT_BAI',
        idTaiXe: 3,
        idTuyenDuong: 3,
        thoiGianTao: '2025-11-20T11:00:00',
        thoiGianCapNhat: '2025-11-20T15:00:00'
    },
    {
        id: 6,
        maVanDon: 'WB006',
        tenNguoiGui: 'Siêu Thị Điện Máy',
        sdtNguoiGui: '0281234567',
        diaChiLayHang: '100 Cách Mạng Tháng 8, Q.3',
        tenNguoiNhan: 'Anh Nam',
        sdtNguoiNhan: '0912345678',
        diaChiGiaoHang: '50 Trần Hưng Đạo, Q.5',
        loaiHang: 'Tivi',
        khoiLuong: 25.0,
        tienThuHo: 15000000,
        loaiDichVu: 'NHANH',
        trangThai: 'CHO_LAY_HANG',
        idTaiXe: 1,
        idTuyenDuong: 1,
        thoiGianTao: '2025-11-21T11:30:00',
        thoiGianCapNhat: '2025-11-21T11:30:00'
    }
];

// Save to localStorage
localStorage.setItem('orders', JSON.stringify(sampleOrders));

console.log('✅ Sample orders data saved to localStorage!');
console.log('Total orders:', sampleOrders.length);
console.log('Orders for driver 1:', sampleOrders.filter(o => o.idTaiXe === 1).length);
console.log('Orders for driver 3:', sampleOrders.filter(o => o.idTaiXe === 3).length);
