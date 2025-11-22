-- ========================================
-- INSERT SAMPLE DATA FOR DRIVER TESTING
-- ========================================
-- Script này tạo dữ liệu test cho 3 chức năng tài xế
-- Chạy script này nếu database chưa có dữ liệu test

USE LogisticsDB;
GO

-- ========================================
-- 1. THÊM TÀI XẾ TEST
-- ========================================
PRINT '1. Thêm tài xế test...';

-- Kiểm tra tài xế ID=1 có tồn tại không
IF NOT EXISTS (SELECT 1 FROM TaiXe WHERE Id = 1)
BEGIN
    SET IDENTITY_INSERT TaiXe ON;
    
    INSERT INTO TaiXe (Id, HoTen, SoDienThoai, Email, DiaChi, CMND, BienSoXe, LoaiXe, TrangThai, NgayTao)
    VALUES 
    (1, N'Nguyễn Văn Test', '0901234567', '[email protected]', N'123 Đường ABC, Q.1, TP.HCM', '123456789', '29A-12345', N'Xe tải', N'Hoạt động', GETDATE());
    
    SET IDENTITY_INSERT TaiXe OFF;
    PRINT '   ✅ Đã thêm tài xế ID=1';
END
ELSE
BEGIN
    PRINT '   ℹ Tài xế ID=1 đã tồn tại';
END

-- Thêm thêm tài xế nếu muốn
IF NOT EXISTS (SELECT 1 FROM TaiXe WHERE SoDienThoai = '0908888888')
BEGIN
    INSERT INTO TaiXe (HoTen, SoDienThoai, Email, DiaChi, CMND, BienSoXe, LoaiXe, TrangThai, NgayTao)
    VALUES 
    (N'Trần Văn B', '0908888888', '[email protected]', N'456 Đường DEF, Q.2, TP.HCM', '987654321', '30B-67890', N'Xe máy', N'Hoạt động', GETDATE());
    PRINT '   ✅ Đã thêm tài xế thứ 2';
END

GO

-- ========================================
-- 2. THÊM ĐỠN VẬN CHUYỂN TEST
-- ========================================
PRINT '2. Thêm đơn vận chuyển test...';

DECLARE @TaiXeId INT = 1;
DECLARE @OrderCount INT = 0;

-- Xóa đơn cũ của tài xế test (nếu muốn reset)
-- DELETE FROM DonVanChuyen WHERE IdTaiXe = @TaiXeId;

-- Kiểm tra số đơn hiện có
SELECT @OrderCount = COUNT(*) FROM DonVanChuyen WHERE IdTaiXe = @TaiXeId;

IF @OrderCount < 5
BEGIN
    -- Thêm đơn hàng ĐÃ GIAO, CÓ COD
    INSERT INTO DonVanChuyen (
        MaVanDon, TenNguoiGui, SdtNguoiGui, DiaChiNguoiGui,
        TenNguoiNhan, SdtNguoiNhan, DiaChiGiaoHang,
        LoaiHang, KhoiLuong, TienThuHo, PhiVanChuyen,
        TrangThai, IdTaiXe, ThoiGianTao, ThoiGianCapNhat
    )
    VALUES 
    -- Đơn 1: Đã giao, COD 500k
    (N'DH' + CONVERT(VARCHAR, DATEPART(YEAR, GETDATE())) + N'001', 
     N'Công ty ABC', '0909999999', N'456 ABC St, Q.1, TP.HCM',
     N'Lê Văn C', '0908888888', N'789 DEF St, Q.2, TP.HCM',
     N'Hàng điện tử', 5.5, 500000, 50000,
     N'Đã giao', @TaiXeId, DATEADD(DAY, -2, GETDATE()), DATEADD(DAY, -1, GETDATE())),
    
    -- Đơn 2: Đã giao, COD 1.2M
    (N'DH' + CONVERT(VARCHAR, DATEPART(YEAR, GETDATE())) + N'002', 
     N'Công ty XYZ', '0907777777', N'111 XYZ St, Q.3, TP.HCM',
     N'Phạm Thị D', '0906666666', N'222 GHI St, Q.4, TP.HCM',
     N'Thực phẩm', 10.0, 1200000, 80000,
     N'Đã giao', @TaiXeId, DATEADD(DAY, -3, GETDATE()), DATEADD(DAY, -2, GETDATE())),
    
    -- Đơn 3: Đã giao, COD 800k
    (N'DH' + CONVERT(VARCHAR, DATEPART(YEAR, GETDATE())) + N'003', 
     N'Shop Online', '0905555555', N'333 Online St, Q.5, TP.HCM',
     N'Hoàng Văn E', '0904444444', N'444 JKL St, Q.6, TP.HCM',
     N'Quần áo', 2.0, 800000, 40000,
     N'Đã giao', @TaiXeId, DATEADD(DAY, -1, GETDATE()), GETDATE()),
    
    -- Đơn 4: Đã giao, COD 350k
    (N'DH' + CONVERT(VARCHAR, DATEPART(YEAR, GETDATE())) + N'004', 
     N'Nhà sách X', '0903333333', N'555 Book St, Q.7, TP.HCM',
     N'Võ Thị F', '0902222222', N'666 MNO St, Q.8, TP.HCM',
     N'Sách vở', 1.5, 350000, 30000,
     N'Đã giao', @TaiXeId, GETDATE(), GETDATE()),
    
    -- Đơn 5: Đã giao, COD 600k
    (N'DH' + CONVERT(VARCHAR, DATEPART(YEAR, GETDATE())) + N'005', 
     N'Cửa hàng Y', '0901111111', N'777 Shop St, Q.9, TP.HCM',
     N'Đinh Văn G', '0909000000', N'888 PQR St, Q.10, TP.HCM',
     N'Mỹ phẩm', 0.8, 600000, 35000,
     N'Đã giao', @TaiXeId, GETDATE(), GETDATE());
    
    PRINT '   ✅ Đã thêm 5 đơn hàng "Đã giao" có COD';
END
ELSE
BEGIN
    PRINT '   ℹ Đã có ' + CAST(@OrderCount AS VARCHAR) + ' đơn hàng cho tài xế';
END

-- Thêm đơn THẤT BẠI để test lịch sử
INSERT INTO DonVanChuyen (
    MaVanDon, TenNguoiGui, SdtNguoiGui, DiaChiNguoiGui,
    TenNguoiNhan, SdtNguoiNhan, DiaChiGiaoHang,
    LoaiHang, KhoiLuong, TienThuHo, PhiVanChuyen,
    TrangThai, IdTaiXe, ThoiGianTao, ThoiGianCapNhat
)
VALUES 
-- Đơn thất bại
(N'DH' + CONVERT(VARCHAR, DATEPART(YEAR, GETDATE())) + N'099', 
 N'Công ty Z', '0909898989', N'999 Fail St, Q.11, TP.HCM',
 N'Người không nhận', '0908787878', N'000 NotFound St, Q.12, TP.HCM',
 N'Hàng khác', 3.0, 0, 40000,
 N'Thất bại', @TaiXeId, DATEADD(DAY, -4, GETDATE()), DATEADD(DAY, -3, GETDATE()));

PRINT '   ✅ Đã thêm 1 đơn hàng "Thất bại"';

GO

-- ========================================
-- 3. THÊM GIAO DỊCH COD
-- ========================================
PRINT '3. Thêm giao dịch COD...';

-- Xóa giao dịch COD cũ (nếu muốn reset)
-- DELETE FROM GiaoDichCOD WHERE IdDonVanChuyen IN (SELECT Id FROM DonVanChuyen WHERE IdTaiXe = 1);

-- Thêm giao dịch COD cho các đơn đã giao
INSERT INTO GiaoDichCOD (IdDonVanChuyen, SoTien, TrangThai, ThoiGianThu, ThoiGianNop)
SELECT 
    dvc.Id as IdDonVanChuyen,
    dvc.TienThuHo as SoTien,
    CASE 
        -- Đơn 1,3: Đã nộp
        WHEN dvc.Id % 2 = 1 THEN N'Đã nộp'
        -- Đơn 2,4,5: Chưa nộp
        ELSE N'Chưa nộp'
    END as TrangThai,
    dvc.ThoiGianCapNhat as ThoiGianThu,
    CASE 
        -- Nếu đã nộp thì set thời gian nộp = ngày hôm sau
        WHEN dvc.Id % 2 = 1 THEN DATEADD(DAY, 1, dvc.ThoiGianCapNhat)
        ELSE NULL
    END as ThoiGianNop
FROM DonVanChuyen dvc
WHERE dvc.IdTaiXe = 1 
    AND dvc.TrangThai = N'Đã giao'
    AND dvc.TienThuHo > 0
    AND NOT EXISTS (SELECT 1 FROM GiaoDichCOD WHERE IdDonVanChuyen = dvc.Id);

PRINT '   ✅ Đã thêm giao dịch COD';

GO

-- ========================================
-- 4. KIỂM TRA KẾT QUẢ
-- ========================================
PRINT '';
PRINT '========================================';
PRINT 'KẾT QUẢ KIỂM TRA:';
PRINT '========================================';

-- Kiểm tra tài xế
DECLARE @DriverCount INT;
SELECT @DriverCount = COUNT(*) FROM TaiXe;
PRINT '✅ Số tài xế: ' + CAST(@DriverCount AS VARCHAR);

-- Kiểm tra đơn hàng
DECLARE @OrderTotal INT, @OrderDelivered INT, @OrderFailed INT, @OrderWithCOD INT;
SELECT 
    @OrderTotal = COUNT(*),
    @OrderDelivered = SUM(CASE WHEN TrangThai = N'Đã giao' THEN 1 ELSE 0 END),
    @OrderFailed = SUM(CASE WHEN TrangThai = N'Thất bại' THEN 1 ELSE 0 END),
    @OrderWithCOD = SUM(CASE WHEN TrangThai = N'Đã giao' AND TienThuHo > 0 THEN 1 ELSE 0 END)
FROM DonVanChuyen 
WHERE IdTaiXe = 1;

PRINT '✅ Tổng đơn hàng tài xế ID=1: ' + CAST(@OrderTotal AS VARCHAR);
PRINT '   - Đã giao: ' + CAST(@OrderDelivered AS VARCHAR);
PRINT '   - Thất bại: ' + CAST(@OrderFailed AS VARCHAR);
PRINT '   - Đã giao có COD: ' + CAST(@OrderWithCOD AS VARCHAR);

-- Kiểm tra giao dịch COD
DECLARE @CODTotal INT, @CODSubmitted INT, @CODPending INT;
DECLARE @TotalAmount MONEY, @SubmittedAmount MONEY, @PendingAmount MONEY;

SELECT 
    @CODTotal = COUNT(*),
    @CODSubmitted = SUM(CASE WHEN TrangThai = N'Đã nộp' THEN 1 ELSE 0 END),
    @CODPending = SUM(CASE WHEN TrangThai = N'Chưa nộp' THEN 1 ELSE 0 END),
    @TotalAmount = SUM(SoTien),
    @SubmittedAmount = SUM(CASE WHEN TrangThai = N'Đã nộp' THEN SoTien ELSE 0 END),
    @PendingAmount = SUM(CASE WHEN TrangThai = N'Chưa nộp' THEN SoTien ELSE 0 END)
FROM GiaoDichCOD gc
INNER JOIN DonVanChuyen dvc ON gc.IdDonVanChuyen = dvc.Id
WHERE dvc.IdTaiXe = 1;

PRINT '✅ Tổng giao dịch COD: ' + CAST(@CODTotal AS VARCHAR);
PRINT '   - Đã nộp: ' + CAST(@CODSubmitted AS VARCHAR) + ' (' + FORMAT(@SubmittedAmount, 'N0') + ' đ)';
PRINT '   - Chưa nộp: ' + CAST(@CODPending AS VARCHAR) + ' (' + FORMAT(@PendingAmount, 'N0') + ' đ)';

PRINT '';
PRINT '========================================';
PRINT 'CHI TIẾT ĐƠN HÀNG VÀ COD:';
PRINT '========================================';

-- Hiển thị chi tiết
SELECT 
    dvc.Id,
    dvc.MaVanDon,
    dvc.TenNguoiNhan,
    dvc.TrangThai as TrangThaiDonHang,
    dvc.TienThuHo,
    gc.TrangThai as TrangThaiCOD,
    gc.ThoiGianThu,
    gc.ThoiGianNop
FROM DonVanChuyen dvc
LEFT JOIN GiaoDichCOD gc ON dvc.Id = gc.IdDonVanChuyen
WHERE dvc.IdTaiXe = 1
ORDER BY dvc.ThoiGianTao DESC;

PRINT '';
PRINT '========================================';
PRINT '🎉 HOÀN TẤT! DỮ LIỆU TEST ĐÃ SẴN SÀNG!';
PRINT '========================================';
PRINT '';
PRINT 'BẠN CÓ THỂ:';
PRINT '1. Test API tại: http://localhost:5257';
PRINT '2. Mở test-database-data.html để test endpoints';
PRINT '3. Đăng nhập vào driver portal với tài khoản tài xế';
PRINT '4. Test 3 chức năng: COD, Lịch sử, Thông tin cá nhân';
PRINT '';

GO
