using System;
using System.Collections.Generic;

namespace Models
{
    public class DonVanChuyenModel
    {
        public long Id { get; set; }
        public string MaVanDon { get; set; }
        public string TenNguoiGui { get; set; }
        public string SdtNguoiGui { get; set; }
        public string DiaChiLayHang { get; set; }
        public string TenNguoiNhan { get; set; }
        public string SdtNguoiNhan { get; set; }
        public string DiaChiGiaoHang { get; set; }
        public string LoaiHang { get; set; }
        public decimal KhoiLuong { get; set; }
        public decimal TienThuHo { get; set; }
        public string LoaiDichVu { get; set; }
        public string TrangThai { get; set; }
        public long? IdTaiXe { get; set; }
        public long? IdTuyenDuong { get; set; }
        public DateTime ThoiGianTao { get; set; }
        public DateTime ThoiGianCapNhat { get; set; }
    }
}
