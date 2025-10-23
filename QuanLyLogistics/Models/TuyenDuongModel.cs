using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class TuyenDuongModel
    {
        public long Id { get; set; }
        public string MaTuyen { get; set; }
        public long IdTaiXe { get; set; }
        public DateTime NgayGiaoHang { get; set; }
        public string TrangThai { get; set; }
        public int? TongSoDon { get; set; }
        public int SoDonHoanThanh { get; set; }
    }
}