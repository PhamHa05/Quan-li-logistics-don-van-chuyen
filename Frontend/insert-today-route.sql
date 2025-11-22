-- Insert sample route for today
DECLARE @Today DATE = GETDATE();

-- Check if route exists for today
IF NOT EXISTS (SELECT 1 FROM TuyenDuong WHERE NgayGiaoHang = @Today AND IdTaiXe IN (1, 3))
BEGIN
    -- Insert today's route
    INSERT INTO TuyenDuong (MaTuyen, IdTaiXe, NgayGiaoHang, TrangThai, TongSoDon, SoDonHoanThanh)
    VALUES 
    ('TD-Q1-' + FORMAT(@Today, 'ddMMyy'), 1, @Today, 'DANG_GIAO', 4, 2);
    
    DECLARE @RouteId BIGINT = SCOPE_IDENTITY();
    
    -- Insert delivery points for the route
    INSERT INTO DiemGiaoHang (IdTuyenDuong, IdDonVanChuyen, ThuTuDung, ThoiGianDuKien, ThoiGianThucTe, TrangThai)
    VALUES
    (@RouteId, 1, 1, '08:30:00', '08:45:00', N'DA_DEN'),
    (@RouteId, 3, 2, '09:15:00', '09:10:00', N'DA_DEN'),
    (@RouteId, 6, 3, '10:00:00', NULL, N'CHO_XU_LY'),
    (@RouteId, 2, 4, '10:45:00', NULL, N'CHO_XU_LY');
    
    PRINT 'Sample route data inserted successfully!';
END
ELSE
BEGIN
    PRINT 'Route for today already exists!';
END

-- View results
SELECT * FROM TuyenDuong WHERE NgayGiaoHang = @Today;
SELECT dg.*, dvc.MaVanDon, dvc.DiaChiGiaoHang 
FROM DiemGiaoHang dg
INNER JOIN TuyenDuong td ON dg.IdTuyenDuong = td.Id
INNER JOIN DonVanChuyen dvc ON dg.IdDonVanChuyen = dvc.Id
WHERE td.NgayGiaoHang = @Today
ORDER BY dg.ThuTuDung;
