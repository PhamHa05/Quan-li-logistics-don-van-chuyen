CREATE DATABASE LogisticsDB;
GO

USE LogisticsDB;
GO

-- Bảng Tài xế
CREATE TABLE TaiXe (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ho_ten NVARCHAR(100),
    so_dien_thoai VARCHAR(15),
    loai_phuong_tien NVARCHAR(50),
    bien_so_xe VARCHAR(20),
    dang_san_sang BIT DEFAULT 1
);

-- Bảng Tuyến đường
CREATE TABLE TuyenDuong (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_tuyen VARCHAR(20) UNIQUE,
    id_tai_xe BIGINT NOT NULL,
    ngay_giao_hang DATE,
    trang_thai NVARCHAR(50) CHECK (trang_thai IN (N'DA_LAP_KE_HOACH', N'DANG_GIAO', N'HOAN_THANH')),
    tong_so_don INT,
    so_don_hoan_thanh INT DEFAULT 0,
    FOREIGN KEY (id_tai_xe) REFERENCES TaiXe(id)
);

-- Bảng Đơn vận chuyển
CREATE TABLE DonVanChuyen (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_van_don VARCHAR(20) UNIQUE,
    ten_nguoi_gui NVARCHAR(100),
    sdt_nguoi_gui VARCHAR(15),
    dia_chi_lay_hang NVARCHAR(MAX),
    ten_nguoi_nhan NVARCHAR(100),
    sdt_nguoi_nhan VARCHAR(15),
    dia_chi_giao_hang NVARCHAR(MAX),
    loai_hang NVARCHAR(50),
    khoi_luong DECIMAL(10,2),
    tien_thu_ho DECIMAL(15,2),
    loai_dich_vu NVARCHAR(20) CHECK (loai_dich_vu IN (N'THONG_THUONG', N'NHANH')),
    trang_thai NVARCHAR(50) CHECK (trang_thai IN (N'CHO_LAY_HANG', N'DA_LAY_HANG', N'DANG_GIAO', N'GIAO_THANH_CONG', N'THAT_BAI')),
    id_tai_xe BIGINT NULL,
    id_tuyen_duong BIGINT NULL,
    thoi_gian_tao DATETIME DEFAULT GETDATE(),
    thoi_gian_cap_nhat DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (id_tai_xe) REFERENCES TaiXe(id),
    FOREIGN KEY (id_tuyen_duong) REFERENCES TuyenDuong(id)
);

-- Bảng Điểm giao hàng (một tuyến có nhiều điểm dừng)
CREATE TABLE DiemGiaoHang (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_tuyen_duong BIGINT NOT NULL,
    id_don_van_chuyen BIGINT NOT NULL,
    thu_tu_dung INT,
    thoi_gian_du_kien TIME,
    thoi_gian_thuc_te TIME NULL,
    trang_thai NVARCHAR(50) CHECK (trang_thai IN (N'CHO_XU_LY', N'DA_DEN', N'DA_BO_QUA')),
    FOREIGN KEY (id_tuyen_duong) REFERENCES TuyenDuong(id),
    FOREIGN KEY (id_don_van_chuyen) REFERENCES DonVanChuyen(id)
);

-- Bảng Sự kiện trạng thái (lịch sử thay đổi trạng thái đơn)
CREATE TABLE SuKienTrangThai (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_don_van_chuyen BIGINT NOT NULL,
    trang_thai_cu NVARCHAR(50),
    trang_thai_moi NVARCHAR(50) NOT NULL,
    thoi_gian_su_kien DATETIME DEFAULT GETDATE(),
    ghi_chu NVARCHAR(MAX),
    url_anh_ky_nhan NVARCHAR(MAX),
    url_chu_ky NVARCHAR(MAX),
    ma_yeu_cau VARCHAR(36) UNIQUE,
    FOREIGN KEY (id_don_van_chuyen) REFERENCES DonVanChuyen(id)
);

-- Bảng Giao dịch COD
CREATE TABLE GiaoDichCOD (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_don_van_chuyen BIGINT UNIQUE NOT NULL,
    so_tien_du_kien DECIMAL(15,2),
    so_tien_thuc_te DECIMAL(15,2),
    thoi_gian_thu_tien DATETIME,
    da_doi_soat BIT DEFAULT 0,
    trang_thai_thanh_toan NVARCHAR(50) CHECK (trang_thai_thanh_toan IN (N'CHO_THANH_TOAN', N'DA_THANH_TOAN')),
    FOREIGN KEY (id_don_van_chuyen) REFERENCES DonVanChuyen(id)
);

-- Một vài chỉ mục hỗ trợ tìm kiếm
CREATE INDEX idx_mavandon ON DonVanChuyen(ma_van_don);
CREATE INDEX idx_trangthai_don ON DonVanChuyen(trang_thai);
CREATE INDEX idx_ngaygiaohang_tuyen ON TuyenDuong(ngay_giao_hang);


-- Thêm tài xế
INSERT INTO TaiXe (ho_ten, so_dien_thoai, loai_phuong_tien, bien_so_xe, dang_san_sang) VALUES
(N'Nguyễn Văn Tài', '0912345678', N'Xe máy', '51A-123.45', 1),
(N'Trần Thị Lái', '0923456789', N'Xe tay ga', '51B-678.90', 1),
(N'Lê Văn Đường', '0934567890', N'Xe ba gác', '51C-246.80', 0),
(N'Phạm Hồng Chuyển', '0945678901', N'Xe tải nhỏ', '51D-135.79', 1);

-- Thêm tuyến đường
INSERT INTO TuyenDuong (ma_tuyen, id_tai_xe, ngay_giao_hang, trang_thai, tong_so_don, so_don_hoan_thanh) VALUES
('TD-Q1-3010', 1, '2023-10-30', N'DANG_GIAO', 3, 1),
('TD-Q2-3010', 2, '2023-10-30', N'DA_LAP_KE_HOACH', 2, 0),
('TD-Q1-3110', 3, '2023-10-31', N'HOAN_THANH', 4, 4);

-- Thêm đơn vận chuyển
INSERT INTO DonVanChuyen (ma_van_don, ten_nguoi_gui, sdt_nguoi_gui, dia_chi_lay_hang,
    ten_nguoi_nhan, sdt_nguoi_nhan, dia_chi_giao_hang, loai_hang, khoi_luong, tien_thu_ho,
    loai_dich_vu, trang_thai, id_tai_xe, id_tuyen_duong) VALUES
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
INSERT INTO DiemGiaoHang (id_tuyen_duong, id_don_van_chuyen, thu_tu_dung, thoi_gian_du_kien, thoi_gian_thuc_te, trang_thai) VALUES
(1, 1, 1, '08:30:00', '08:45:00', N'DA_DEN'),
(1, 3, 2, '09:15:00', NULL, N'CHO_XU_LY'),
(3, 4, 1, '07:45:00', '07:50:00', N'DA_DEN'),
(3, 5, 2, '08:30:00', '09:00:00', N'DA_DEN');

-- Thêm sự kiện trạng thái
INSERT INTO SuKienTrangThai (id_don_van_chuyen, trang_thai_cu, trang_thai_moi, thoi_gian_su_kien, ghi_chu, url_anh_ky_nhan, ma_yeu_cau) VALUES
(3, NULL, N'CHO_LAY_HANG', '2023-10-29 14:00:00', N'Đơn mới được tạo', NULL, 'req-1a2b3c-cho-lay'),
(3, N'CHO_LAY_HANG', N'DA_LAY_HANG', '2023-10-30 08:00:00', N'Đã lấy hàng từ người gửi', NULL, 'req-1a2b3c-da-lay'),
(4, NULL, N'CHO_LAY_HANG', '2023-10-30 15:20:00', N'Đơn mới được tạo', NULL, 'req-4d5e6f-cho-lay'),
(4, N'CHO_LAY_HANG', N'DA_LAY_HANG', '2023-10-31 07:30:00', N'Hàng đã được kho nhận', NULL, 'req-4d5e6f-da-lay'),
(4, N'DA_LAY_HANG', N'DANG_GIAO', '2023-10-31 07:45:00', N'Đã ra khỏi kho', NULL, 'req-4d5e6f-dang-giao'),
(4, N'DANG_GIAO', N'GIAO_THANH_CONG', '2023-10-31 07:55:00', N'Khách đã nhận hàng và ký xác nhận', N'https://storage.cloud.com/ky_nhan/wb004_311023.jpg', 'req-4d5e6f-thanh-cong'),
(5, N'DANG_GIAO', N'THAT_BAI', '2023-10-31 09:05:00', N'Khách không nghe máy, đã thử liên hệ 3 lần', NULL, 'req-7g8h9i-that-bai');

-- Thêm giao dịch COD
INSERT INTO GiaoDichCOD (id_don_van_chuyen, so_tien_du_kien, so_tien_thuc_te, thoi_gian_thu_tien, da_doi_soat, trang_thai_thanh_toan) VALUES
(1, 7500000, 7500000, '2023-10-30 10:00:00', 1, N'DA_THANH_TOAN'),
(3, 22500000, NULL, NULL, 0, N'CHO_THANH_TOAN'),
(4, 1200000, 1200000, '2023-10-31 08:00:00', 1, N'DA_THANH_TOAN');


Select*from TaiXe
Select*from TuyenDuong
Select*from DonVanChuyen
Select*from DiemGiaoHang
Select*from DiemGiaoHang
Select*from SuKienTrangThai
Select*from GiaoDichCOD


Select*from 