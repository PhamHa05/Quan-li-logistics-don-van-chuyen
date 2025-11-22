-- ========================================
-- SYNC NGUOIDUNG AND TAIXE DATA
-- ========================================
-- Script này đồng bộ dữ liệu NguoiDung và TaiXe
-- Cập nhật TaiXe để match với NguoiDung

USE LogisticsDB;
GO

PRINT '========================================';
PRINT 'ĐỒNG BỘ DỮ LIỆU NGUOIDUNG VÀ TAIXE';
PRINT '========================================';
PRINT '';

-- Kiểm tra dữ liệu hiện tại
PRINT '1. Dữ liệu NguoiDung (VaiTro=TAIXE):';
SELECT MaNguoiDung, HoTen, TenDangNhap, SoDienThoai, Email 
FROM NguoiDung 
WHERE VaiTro = 'TAIXE';

PRINT '';
PRINT '2. Dữ liệu TaiXe hiện tại:';
SELECT Id, HoTen, SoDienThoai FROM TaiXe;

PRINT '';
PRINT '========================================';
PRINT 'CẬP NHẬT TÀI XẾ';
PRINT '========================================';

-- Cập nhật tài xế 1: Phạm Văn Tài (từ NguoiDung)
UPDATE TaiXe
SET 
    HoTen = N'Phạm Văn Tài',
    SoDienThoai = '0933444555',
    LoaiPhuongTien = N'Xe máy',
    BienSoXe = '51A-123.45'
WHERE Id = 1;
PRINT '✅ Cập nhật tài xế ID=1: Phạm Văn Tài (0933444555)';

-- Cập nhật tài xế 2: Lê Hữu Đường (từ NguoiDung)
UPDATE TaiXe
SET 
    HoTen = N'Lê Hữu Đường',
    SoDienThoai = '0944555666',
    LoaiPhuongTien = N'Xe tải nhỏ',
    BienSoXe = '51B-678.90'
WHERE Id = 2;
PRINT '✅ Cập nhật tài xế ID=2: Lê Hữu Đường (0944555666)';

-- Giữ nguyên tài xế 3 và 4
UPDATE TaiXe
SET 
    HoTen = N'Nguyễn Văn Test',
    SoDienThoai = '0901234567',
    LoaiPhuongTien = N'Xe tải',
    BienSoXe = '29A-12345'
WHERE Id = 3;
PRINT '✅ Cập nhật tài xế ID=3: Nguyễn Văn Test (0901234567)';

UPDATE TaiXe
SET 
    HoTen = N'Trần Văn B Test',
    SoDienThoai = '0908888888',
    LoaiPhuongTien = N'Xe ba gác',
    BienSoXe = '30B-67890'
WHERE Id = 4;
PRINT '✅ Cập nhật tài xế ID=4: Trần Văn B Test (0908888888)';

PRINT '';
PRINT '========================================';
PRINT 'THÊM NGƯỜI DÙNG CHO TÀI XẾ TEST';
PRINT '========================================';

-- Thêm người dùng cho tài xế test nếu chưa có
IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE SoDienThoai = '0901234567')
BEGIN
    INSERT INTO NguoiDung (HoTen, TenDangNhap, MatKhau, VaiTro, Email, SoDienThoai, DiaChi)
    VALUES (N'Nguyễn Văn Test', 'taixe_test1', '123456', 'TAIXE', 'taixe_test1@gmail.com', '0901234567', N'123 Test St');
    PRINT '✅ Thêm NguoiDung cho tài xế test 1';
END

IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE SoDienThoai = '0908888888')
BEGIN
    INSERT INTO NguoiDung (HoTen, TenDangNhap, MatKhau, VaiTro, Email, SoDienThoai, DiaChi)
    VALUES (N'Trần Văn B Test', 'taixe_test2', '123456', 'TAIXE', 'taixe_test2@gmail.com', '0908888888', N'456 Test St');
    PRINT '✅ Thêm NguoiDung cho tài xế test 2';
END

PRINT '';
PRINT '========================================';
PRINT 'CẬP NHẬT ĐƠN HÀNG';
PRINT '========================================';

-- Cập nhật đơn hàng để có IdTaiXe đúng
-- Đơn của tài xế 1 (Phạm Văn Tài - ID=1)
UPDATE DonVanChuyen
SET IdTaiXe = 1
WHERE MaVanDon IN ('WB001', 'WB003');
PRINT '✅ Cập nhật đơn WB001, WB003 cho tài xế ID=1';

-- Đơn của tài xế 3 (Nguyễn Văn Test - ID=3)  
UPDATE DonVanChuyen
SET IdTaiXe = 3, TrangThai = N'Đã giao'
WHERE MaVanDon IN ('DH' + CONVERT(VARCHAR, DATEPART(YEAR, GETDATE())) + '001',
                    'DH' + CONVERT(VARCHAR, DATEPART(YEAR, GETDATE())) + '002');
PRINT '✅ Cập nhật đơn test cho tài xế ID=3';

PRINT '';
PRINT '========================================';
PRINT 'KẾT QUẢ SAU KHI ĐỒNG BỘ';
PRINT '========================================';

PRINT '';
PRINT '1. Mapping NguoiDung <-> TaiXe:';
SELECT 
    nd.MaNguoiDung as 'ID NguoiDung',
    nd.TenDangNhap as 'Username',
    nd.HoTen as 'Họ Tên (ND)',
    nd.SoDienThoai as 'SĐT (ND)',
    tx.Id as 'ID TaiXe',
    tx.HoTen as 'Họ Tên (TX)',
    tx.SoDienThoai as 'SĐT (TX)',
    CASE 
        WHEN tx.Id IS NOT NULL THEN 'Đã liên kết'
        ELSE 'Chưa liên kết'
    END as 'Trạng thái'
FROM NguoiDung nd
LEFT JOIN TaiXe tx ON nd.SoDienThoai = tx.SoDienThoai
WHERE nd.VaiTro = 'TAIXE'
ORDER BY nd.MaNguoiDung;

PRINT '';
PRINT '2. Đơn hàng theo tài xế:';
SELECT 
    tx.Id as 'ID TaiXe',
    tx.HoTen as 'Họ Tên',
    COUNT(dvc.Id) as 'Tổng đơn',
    SUM(CASE WHEN dvc.TrangThai = N'Đã giao' THEN 1 ELSE 0 END) as 'Đã giao',
    SUM(CASE WHEN dvc.TienThuHo > 0 AND dvc.TrangThai = N'Đã giao' THEN 1 ELSE 0 END) as 'Có COD'
FROM TaiXe tx
LEFT JOIN DonVanChuyen dvc ON tx.Id = dvc.IdTaiXe
GROUP BY tx.Id, tx.HoTen
ORDER BY tx.Id;

PRINT '';
PRINT '========================================';
PRINT '🎉 HOÀN TẤT ĐỒNG BỘ!';
PRINT '========================================';
PRINT '';
PRINT 'BẠN CÓ THỂ ĐĂNG NHẬP VỚI:';
PRINT '1. Username: taixe01, Password: 123456 (Phạm Văn Tài - ID TaiXe=1)';
PRINT '2. Username: taixe02, Password: 123456 (Lê Hữu Đường - ID TaiXe=2)';
PRINT '3. Username: taixe_test1, Password: 123456 (Nguyễn Văn Test - ID TaiXe=3)';
PRINT '4. Username: taixe_test2, Password: 123456 (Trần Văn B Test - ID TaiXe=4)';
PRINT '';

GO
