using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class GiaoDichCODModel
    {
        public long Id { get; set; }
        public long IdDonVanChuyen { get; set; }
        public decimal SoTienDuKien { get; set; }
        public decimal? SoTienThucTe { get; set; }
        public DateTime? ThoiGianThuTien { get; set; }
        public bool DaDoiSoat { get; set; }
        public string TrangThaiThanhToan { get; set; }
    }
}
