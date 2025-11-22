9CREATE DATABASE LogisticsDB;
GO

USE LogisticsDB;
GO

-- Bảng NguoiDung (Thêm mới)
CREATE TABLE NguoiDung (
    MaNguoiDung INT IDENTITY(1,1) PRIMARY KEY,
    HoTen NVARCHAR(100),
    TenDangNhap VARCHAR(50) UNIQUE,
    MatKhau NVARCHAR(255),
    VaiTro NVARCHAR(50),
    Email VARCHAR(100),
    SoDienThoai VARCHAR(15),
    DiaChi NVARCHAR(MAX),
    NgayTao DATETIME DEFAULT GETDATE()
);

-- Bảng TaiXe
CREATE TABLE TaiXe (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    HoTen NVARCHAR(100),
    SoDienThoai VARCHAR(15),
    LoaiPhuongTien NVARCHAR(50),
    BienSoXe VARCHAR(20),
    DangSanSang BIT DEFAULT 1
);

-- Bảng TuyenDuong
CREATE TABLE TuyenDuong (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    MaTuyen VARCHAR(20) UNIQUE,
    IdTaiXe BIGINT NOT NULL,
    NgayGiaoHang DATE,
    TrangThai NVARCHAR(50) CHECK (TrangThai IN (N'DA_LAP_KE_HOACH', N'DANG_GIAO', N'HOAN_THANH')),
    TongSoDon INT,
    SoDonHoanThanh INT DEFAULT 0,
    FOREIGN KEY (IdTaiXe) REFERENCES TaiXe(Id)
);

-- Bảng DonVanChuyen
CREATE TABLE DonVanChuyen (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    MaVanDon VARCHAR(20) UNIQUE,
    TenNguoiGui NVARCHAR(100),
    SdtNguoiGui VARCHAR(15),
    DiaChiLayHang NVARCHAR(MAX),
    TenNguoiNhan NVARCHAR(100),
    SdtNguoiNhan VARCHAR(15),
    DiaChiGiaoHang NVARCHAR(MAX),
    LoaiHang NVARCHAR(50),
    KhoiLuong DECIMAL(10,2),
    TienThuHo DECIMAL(15,2),
    LoaiDichVu NVARCHAR(20) CHECK (LoaiDichVu IN (N'THONG_THUONG', N'NHANH')),
    TrangThai NVARCHAR(50) CHECK (TrangThai IN (N'CHO_LAY_HANG', N'DA_LAY_HANG', N'DANG_GIAO', N'GIAO_THANH_CONG', N'THAT_BAI')),
    IdTaiXe BIGINT NULL,
    IdTuyenDuong BIGINT NULL,
    ThoiGianTao DATETIME DEFAULT GETDATE(),
    ThoiGianCapNhat DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (IdTaiXe) REFERENCES TaiXe(Id),
    FOREIGN KEY (IdTuyenDuong) REFERENCES TuyenDuong(Id)
);

-- Bảng DiemGiaoHang
CREATE TABLE DiemGiaoHang (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    IdTuyenDuong BIGINT NOT NULL,
    IdDonVanChuyen BIGINT NOT NULL,
    ThuTuDung INT,
    ThoiGianDuKien TIME,
    ThoiGianThucTe TIME NULL,
    TrangThai NVARCHAR(50) CHECK (TrangThai IN (N'CHO_XU_LY', N'DA_DEN', N'DA_BO_QUA')),
    FOREIGN KEY (IdTuyenDuong) REFERENCES TuyenDuong(Id),
    FOREIGN KEY (IdDonVanChuyen) REFERENCES DonVanChuyen(Id)
);

-- Bảng SuKienTrangThai
CREATE TABLE SuKienTrangThai (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    IdDonVanChuyen BIGINT NOT NULL,
    TrangThaiCu NVARCHAR(50),
    TrangThaiMoi NVARCHAR(50) NOT NULL,
    ThoiGianSuKien DATETIME DEFAULT GETDATE(),
    GhiChu NVARCHAR(MAX),
    UrlAnhKyNhan NVARCHAR(MAX),
    UrlChuKy NVARCHAR(MAX),
    MaYeuCau VARCHAR(36) UNIQUE,
    FOREIGN KEY (IdDonVanChuyen) REFERENCES DonVanChuyen(Id)
);

-- Bảng GiaoDichCOD
CREATE TABLE GiaoDichCOD (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    IdDonVanChuyen BIGINT UNIQUE NOT NULL,
    SoTienDuKien DECIMAL(15,2),
    SoTienThucTe DECIMAL(15,2),
    ThoiGianThuTien DATETIME,
    DaDoiSoat BIT DEFAULT 0,
    TrangThaiThanhToan NVARCHAR(50) CHECK (TrangThaiThanhToan IN (N'CHO_THANH_TOAN', N'DA_THANH_TOAN')),
    FOREIGN KEY (IdDonVanChuyen) REFERENCES DonVanChuyen(Id)
);

Go
ALTER TABLE TuyenDuong
DROP CONSTRAINT CK__TuyenDuon__Trang__6477ECF3;

Go
ALTER TABLE TuyenDuong
ALTER COLUMN TrangThai VARCHAR(50) COLLATE SQL_Latin1_General_CP1_CI_AS;

Go
ALTER TABLE TuyenDuong
ADD CONSTRAINT CK_TuyenDuong_TrangThai
CHECK (TrangThai IN ('DA_LAP_KE_HOACH', 'DANG_GIAO', 'HOAN_THANH'));

GO

-- Thêm tài xế
INSERT INTO TaiXe (HoTen, SoDienThoai, LoaiPhuongTien, BienSoXe, DangSanSang) VALUES
(N'Nguyễn Văn Tài', '0912345678', N'Xe máy', '51A-123.45', 1),
(N'Trần Thị Lái', '0923456789', N'Xe tay ga', '51B-678.90', 1),
(N'Lê Văn Đường', '0934567890', N'Xe ba gác', '51C-246.80', 0),
(N'Phạm Hồng Chuyển', '0945678901', N'Xe tải nhỏ', '51D-135.79', 1);

-- Thêm tuyến đường
INSERT INTO TuyenDuong (MaTuyen, IdTaiXe, NgayGiaoHang, TrangThai, TongSoDon, SoDonHoanThanh) VALUES
('TD-Q1-3010', 1, '2023-10-30', N'DANG_GIAO', 3, 1),
('TD-Q2-3010', 2, '2023-10-30', N'DA_LAP_KE_HOACH', 2, 0),
('TD-Q1-3110', 3, '2023-10-31', N'HOAN_THANH', 4, 4);

INSERT INTO DonVanChuyen (MaVanDon, TenNguoiGui, SdtNguoiGui, DiaChiLayHang,
    TenNguoiNhan, SdtNguoiNhan, DiaChiGiaoHang, LoaiHang, KhoiLuong, TienThuHo,
    LoaiDichVu, TrangThai, IdTaiXe, IdTuyenDuong) VALUES
('WB001', N'Cửa Hàng Điện Thoại A', '0909123456', N'123 Nguyễn Văn Linh, Q.7',
 N'Anh Bình', '0911122334', N'45 Lê Lợi, Q.1', N'Điện thoại', 0.5, 7500000, N'NHANH', N'DANG_GIAO', 1, 1),
('WB002', N'Chị Hoa', '0987654321', N'78 Hoàng Văn Thụ, Q.Phú Nhuận',
 N'Chị Liên', '0978965432', N'102 Pasteur, Q.3', N'Mỹ phẩm', 1.2, 0, N'THONG_THUONG', N'CHO_LAY_HANG', NULL, NULL),
('WB003', N'Công Ty Máy Tính XYZ', '02838250123', N'Lô A1, Khu Công Nghệ Cao',
 N'Anh Tuấn', '0933344556', N'11 Nguyễn Huệ, Q.1', N'Laptop', 2.0, 22500000, N'NHANH', N'DA_LAY_HANG', 1, 1),
('WB004', N'Shop Quần Áo Online', '0909555666', N'Số 5, đường 12, Q.Gò Vấp',
 N'Chị Ngọc', '0899888777', N'300 Lý Thường Kiệt, Q.Tân Bình', N'Quần áo', 3.5, 1200000, N'THONG_THUONG', N'GIAO_THANH_CONG', 3, 3),
('WB005', N'Nhà Sách Sư Phạm', '02838365432', N'366 Phan Văn Trị, Q.5',
 N'Thư viện ĐH B', '02838667788', N'Ký túc xá Khu A, Đại học B', N'Sách giáo trình', 15.0, 0, N'THONG_THUONG', N'THAT_BAI', 3, 3);

-- Thêm điểm giao hàng
-- Thêm điểm giao hàng
INSERT INTO DiemGiaoHang (IdTuyenDuong, IdDonVanChuyen, ThuTuDung, ThoiGianDuKien, ThoiGianThucTe, TrangThai) VALUES
(1, 1, 1, '08:30:00', '08:45:00', N'DA_DEN'),
(1, 3, 2, '09:15:00', NULL, N'CHO_XU_LY'),
(3, 4, 1, '07:45:00', '07:50:00', N'DA_DEN'),
(3, 5, 2, '08:30:00', '09:00:00', N'DA_DEN');

-- Thêm sự kiện trạng thái
INSERT INTO SuKienTrangThai (IdDonVanChuyen, TrangThaiCu, TrangThaiMoi, ThoiGianSuKien, GhiChu, UrlAnhKyNhan, MaYeuCau) VALUES
(3, NULL, N'CHO_LAY_HANG', '2023-10-29 14:00:00', N'Đơn mới được tạo', NULL, 'req-1a2b3c-cho-lay'),
(3, N'CHO_LAY_HANG', N'DA_LAY_HANG', '2023-10-30 08:00:00', N'Đã lấy hàng từ người gửi', NULL, 'req-1a2b3c-da-lay'),
(4, NULL, N'CHO_LAY_HANG', '2023-10-30 15:20:00', N'Đơn mới được tạo', NULL, 'req-4d5e6f-cho-lay'),
(4, N'CHO_LAY_HANG', N'DA_LAY_HANG', '2023-10-31 07:30:00', N'Hàng đã được kho nhận', NULL, 'req-4d5e6f-da-lay'),
(4, N'DA_LAY_HANG', N'DANG_GIAO', '2023-10-31 07:45:00', N'Đã ra khỏi kho', NULL, 'req-4d5e6f-dang-giao'),
(4, N'DANG_GIAO', N'GIAO_THANH_CONG', '2023-10-31 07:55:00', N'Khách đã nhận hàng và ký xác nhận', N'https://storage.cloud.com/ky_nhan/wb004_311023.jpg', 'req-4d5e6f-thanh-cong'),
(5, N'DANG_GIAO', N'THAT_BAI', '2023-10-31 09:05:00', N'Khách không nghe máy, đã thử liên hệ 3 lần', NULL, 'req-7g8h9i-that-bai');

-- Thêm giao dịch COD
INSERT INTO GiaoDichCOD (IdDonVanChuyen, SoTienDuKien, SoTienThucTe, ThoiGianThuTien, DaDoiSoat, TrangThaiThanhToan) VALUES
(1, 7500000, 7500000, '2023-10-30 10:00:00', 1, N'DA_THANH_TOAN'),
(3, 22500000, NULL, NULL, 0	, N'CHO_THANH_TOAN'),
(4, 1200000, 1200000, '2023-10-31 08:00:00', 1, N'DA_THANH_TOAN');

-- Thêm người dùng (Admin, Khách hàng, Tài xế) - Mật khẩu plain text
INSERT INTO NguoiDung (HoTen, TenDangNhap, MatKhau, VaiTro, Email, SoDienThoai, DiaChi)
VALUES
(N'Quản Trị Viên', 'admin', '123456', 'ADMIN', 'admin@logistics.com', '0909000000', N'TP. Hồ Chí Minh'),
(N'Nguyễn Văn A', 'nguyenvana', '123456', 'KHACH', 'vana@gmail.com', '0911222333', N'Quận 1, TP.HCM'),
(N'Trần Thị B', 'nguyenthib', '123456', 'KHACH', 'thib@gmail.com', '0922333444', N'Quận 5, TP.HCM'),
(N'Phạm Văn Tài', 'taixe01', '123456', 'TAIXE', 'taixe01@gmail.com', '0933444555', N'Gò Vấp, TP.HCM'),
(N'Lê Hữu Đường', 'taixe02', '123456', 'TAIXE', 'taixe02@gmail.com', '0944555666', N'Tân Bình, TP.HCM');


Select*from TaiXe
Select*from TuyenDuong
Select*from DonVanChuyen
Select*from DiemGiaoHang
Select*from DiemGiaoHang
Select*from SuKienTrangThai
Select*from GiaoDichCOD



-- 1. Xóa bản ghi trong các bảng chi tiết trước (có FK)
DELETE FROM GiaoDichCOD;
DELETE FROM SuKienTrangThai;
DELETE FROM DiemGiaoHang;
DELETE FROM DonVanChuyen;
DELETE FROM TuyenDuong;

-- 2. Xóa bảng TaiXe, NguoiDung (bảng cha)
DELETE FROM TaiXe;
DELETE FROM NguoiDung;

-- Xóa bảng theo đúng thứ tự để không lỗi
DROP TABLE GiaoDichCOD;
DROP TABLE SuKienTrangThai;
DROP TABLE DiemGiaoHang;
DROP TABLE DonVanChuyen;
DROP TABLE TuyenDuong;
DROP TABLE TaiXe;
DROP TABLE NguoiDung;


Go

