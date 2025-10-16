using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class DonVanChuyenModel
    {
        public long id { get; set; }
        public string ma_van_don { get; set; }
        public string ten_nguoi_gui { get; set; }
        public string sdt_nguoi_gui { get; set; }
        public string dia_chi_lay_hang { get; set; }
        public string ten_nguoi_nhan { get; set; }
        public string sdt_nguoi_nhan { get; set; }
        public string dia_chi_giao_hang { get; set; }
        public string loai_hang { get; set; }
        public decimal khoi_luong { get; set; }
        public decimal tien_thu_ho { get; set; }
        public string loai_dich_vu { get; set; }
        public string trang_thai { get; set; }
        public long? id_tai_xe { get; set; }
        public long? id_tuyen_duong { get; set; }
        public DateTime thoi_gian_tao { get; set; }
        public DateTime thoi_gian_cap_nhat { get; set; }
        public int? MaKhachHang { get; set; }
        public int? MaTaiXe { get; set; }
        public int? MaDieuPhoi { get; set; }
    }
}
