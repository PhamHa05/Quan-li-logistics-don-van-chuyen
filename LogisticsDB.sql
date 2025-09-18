CREATE DATABASE LogisticsDB;
GO

USE LogisticsDB;
GO

CREATE TABLE don_van_chuyen (
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
    loai_dich_vu NVARCHAR(20) CHECK (loai_dich_vu IN (N'THÔNG_THƯỜNG', N'NHANH')),
    trang_thai NVARCHAR(50) CHECK (trang_thai IN (N'CHỜ_LẤY_HÀNG', N'ĐÃ_LẤY_HÀNG', N'ĐANG_GIAO', N'GIAO_THÀNH_CÔNG', N'THẤT_BẠI')),
    id_tai_xe BIGINT,
    id_tuyen_duong BIGINT,
    thoi_gian_tao DATETIME DEFAULT GETDATE(),
    thoi_gian_cap_nhat DATETIME DEFAULT GETDATE()
);

CREATE TABLE tai_xe (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ho_ten NVARCHAR(100),
    so_dien_thoai VARCHAR(15),
    loai_phuong_tien NVARCHAR(50),
    bien_so_xe VARCHAR(20),
    dang_san_sang BIT DEFAULT 1
);

CREATE TABLE tuyen_duong (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_tuyen VARCHAR(20),
    id_tai_xe BIGINT NOT NULL,
    ngay_giao_hang DATE,
    trang_thai NVARCHAR(50) CHECK (trang_thai IN (N'ĐÃ_LẬP_KẾ_HOẠCH', N'ĐANG_GIAO', N'HOÀN_THÀNH')),
    tong_so_don INT,
    so_don_hoan_thanh INT DEFAULT 0
);	

CREATE TABLE diem_giao_hang (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_tuyen_duong BIGINT NOT NULL,
    id_don_van_chuyen BIGINT NOT NULL,
    thu_tu_dung INT,
    thoi_gian_du_kien TIME,
    thoi_gian_thuc_te TIME,
    trang_thai NVARCHAR(50) CHECK (trang_thai IN (N'CHỜ_XỬ_LÝ', N'ĐÃ_ĐẾN', N'ĐÃ_BỎ_QUA'))
);



CREATE TABLE su_kien_trang_thai (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_don_van_chuyen BIGINT NOT NULL,
    trang_thai_cu NVARCHAR(50),
    trang_thai_moi NVARCHAR(50) NOT NULL,
    thoi_gian_su_kien DATETIME DEFAULT GETDATE(),
    ghi_chu NVARCHAR(MAX),
    url_anh_ky_nhan NVARCHAR(MAX),
    url_chu_ky NVARCHAR(MAX),
    ma_yeu_cau VARCHAR(36) UNIQUE
);

CREATE TABLE giao_dich_cod (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_don_van_chuyen BIGINT UNIQUE NOT NULL,
    so_tien_du_kien DECIMAL(15,2),
    so_tien_thuc_te DECIMAL(15,2),
    thoi_gian_thu_tien DATETIME,
    da_doi_soat BIT DEFAULT 0,
    trang_thai_thanh_toan NVARCHAR(50) CHECK (trang_thai_thanh_toan IN (N'CHỜ_THANH_TOÁN', N'ĐÃ_THANH_TOÁN'))
);

-- Khóa ngoại cho bảng tuyen_duong
ALTER TABLE tuyen_duong 
ADD CONSTRAINT FK_tuyenduong_taixe 
FOREIGN KEY (id_tai_xe) REFERENCES tai_xe(id);

-- Khóa ngoại cho bảng don_van_chuyen
ALTER TABLE don_van_chuyen 
ADD CONSTRAINT FK_donvanchuyen_taixe 
FOREIGN KEY (id_tai_xe) REFERENCES tai_xe(id);

ALTER TABLE don_van_chuyen 
ADD CONSTRAINT FK_donvanchuyen_tuyenduong 
FOREIGN KEY (id_tuyen_duong) REFERENCES tuyen_duong(id);

-- Khóa ngoại cho bảng diem_giao_hang
ALTER TABLE diem_giao_hang 
ADD CONSTRAINT FK_diemgiaohang_tuyenduong 
FOREIGN KEY (id_tuyen_duong) REFERENCES tuyen_duong(id);

ALTER TABLE diem_giao_hang 
ADD CONSTRAINT FK_diemgiaohang_donvanchuyen 
FOREIGN KEY (id_don_van_chuyen) REFERENCES don_van_chuyen(id);

-- Khóa ngoại cho bảng su_kien_trang_thai
ALTER TABLE su_kien_trang_thai 
ADD CONSTRAINT FK_sukientrangthai_donvanchuyen 
FOREIGN KEY (id_don_van_chuyen) REFERENCES don_van_chuyen(id);

-- Khóa ngoại cho bảng giao_dich_cod
ALTER TABLE giao_dich_cod 
ADD CONSTRAINT FK_giaodichcod_donvanchuyen 
FOREIGN KEY (id_don_van_chuyen) REFERENCES don_van_chuyen(id);


CREATE INDEX idx_mavandon ON don_van_chuyen(ma_van_don);
CREATE INDEX idx_trangthai_don ON don_van_chuyen(trang_thai);
CREATE INDEX idx_ngaygiaohang_tuyen ON tuyen_duong(ngay_giao_hang);


INSERT INTO tai_xe (ho_ten, so_dien_thoai, loai_phuong_tien, bien_so_xe, dang_san_sang) VALUES
('Nguyễn Văn Tài', '0912345678', 'Xe máy', '51A-123.45', TRUE),
('Trần Thị Lái', '0923456789', 'Xe tay ga', '51B-678.90', TRUE),
('Lê Văn Đường', '0934567890', 'Xe ba gác', '51C-246.80', FALSE),
('Phạm Hồng Chuyển', '0945678901', 'Xe tải nhỏ', '51D-135.79', TRUE);

INSERT INTO tuyen_duong (ma_tuyen, id_tai_xe, ngay_giao_hang, trang_thai, tong_so_don, so_don_hoan_thanh) VALUES
('T-Q1-3010', 1, '2023-10-30', 'DANG_GIAO', 4, 1),
('T-Q2-3010', 2, '2023-10-30', 'DA_LAP_KE_HOACH', 3, 0),
('T-Q1-3110', 3, '2023-10-31', 'HOAN_THANH', 5, 5);

INSERT INTO don_van_chuyen (ma_van_don, ten_nguoi_gui, sdt_nguoi_gui, dia_chi_lay_hang, ten_nguoi_nhan, sdt_nguoi_nhan, dia_chi_giao_hang, loai_hang, khoi_luong, tien_thu_ho, loai_dich_vu, trang_thai, id_tai_xe, id_tuyen_duong) VALUES
('WB001', 'Cửa Hàng Điện Thoại A', '0909123456', '123 Nguyễn Văn Linh, Q.7', 'Anh Bình', '0911122334', '45 Lê Lợi, Q.1', 'Điện thoại', 0.5, 7500000, 'NHANH', 'DANG_GIAO', 1, 1),
('WB002', 'Chị Hoa', '0987654321', '78 Hoàng Văn Thụ, Q.Phú Nhuận', 'Chị Liên', '0978965432', '102 Pasteur, Q.3', 'Mỹ phẩm', 1.2, 0, 'THONG_THUONG', 'CHO_LAY_HANG', NULL, NULL),
('WB003', 'Công Ty Máy Tính XYZ', '02838250123', 'Lô A1, Khu Công Nghệ Cao', 'Anh Tuấn', '0933344556', '11 Nguyễn Huệ, Q.1', 'Laptop', 2.0, 22500000, 'NHANH', 'DA_LAY_HANG', 1, 1),
('WB004', 'Shop Quần Áo Online', '0909555666', 'Số 5, đường 12, Q.Gò Vấp', 'Chị Ngọc', '0899888777', '300 Lý Thường Kiệt, Q.Tân Bình', 'Quần áo', 3.5, 1200000, 'THONG_THUONG', 'GIAO_THANH_CONG', 3, 3),
('WB005', 'Nhà Sách Sư Phạm', '02838365432', '366 Phan Văn Trị, Q.5', 'Thư viện ĐH B', '02838667788', 'Ký túc xá Khu A, Đại học B', 'Sách giáo trình', 15.0, 0, 'THONG_THUONG', 'THAT_BAI', 3, 3);

INSERT INTO diem_giao_hang (id_tuyen_duong, id_don_van_chuyen, thu_tu_dung, thoi_gian_du_kien, thoi_gian_thuc_te, trang_thai) VALUES
(1, 1, 1, '08:30:00', '08:45:00', 'DA_DEN'),
(1, 3, 2, '09:15:00', NULL, 'CHO_XU_LY'),
(3, 4, 1, '07:45:00', '07:50:00', 'DA_DEN'),
(3, 5, 2, '08:30:00', '09:00:00', 'DA_DEN'); -- Giao thất bại nhưng vẫn đã đến điểm hẹn

INSERT INTO su_kien_trang_thai (id_don_van_chuyen, trang_thai_cu, trang_thai_moi, thoi_gian_su_kien, ghi_chu, url_anh_ky_nhan, ma_yeu_cau) VALUES
(3, NULL, 'CHO_LAY_HANG', '2023-10-29 14:00:00', 'Đơn mới được tạo', NULL, 'req-1a2b3c-cho-lay'),
(3, 'CHO_LAY_HANG', 'DA_LAY_HANG', '2023-10-30 08:00:00', 'Đã lấy hàng từ người gửi', NULL, 'req-1a2b3c-da-lay'),
(4, NULL, 'CHO_LAY_HANG', '2023-10-30 15:20:00', 'Đơn mới được tạo', NULL, 'req-4d5e6f-cho-lay'),
(4, 'CHO_LAY_HANG', 'DA_LAY_HANG', '2023-10-31 07:30:00', 'Hàng đã được kho nhận', NULL, 'req-4d5e6f-da-lay'),
(4, 'DA_LAY_HANG', 'DANG_GIAO', '2023-10-31 07:45:00', 'Đã ra khỏi kho', NULL, 'req-4d5e6f-dang-giao'),
(4, 'DANG_GIAO', 'GIAO_THANH_CONG', '2023-10-31 07:55:00', 'Khách đã nhận hàng và ký xác nhận', 'https://storage.cloud.com/ky_nhan/wb004_311023.jpg', 'req-4d5e6f-thanh-cong'),
(5, 'DANG_GIAO', 'THAT_BAI', '2023-10-31 09:05:00', 'Khách không nghe máy, đã thử liên hệ 3 lần', NULL, 'req-7g8h9i-that-bai');