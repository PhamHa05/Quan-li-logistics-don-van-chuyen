using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class SuKienTrangThaiModel
    {
        public long Id { get; set; }
        public long IdDonVanChuyen { get; set; }
        public string? TrangThaiCu { get; set; }
        public string? TrangThaiMoi { get; set; }
        public DateTime? ThoiGianSuKien { get; set; }
        public string? GhiChu { get; set; }
        public string? UrlAnhKyNhan { get; set; }
        public string? UrlChuKy { get; set; }
        public string? MaYeuCau { get; set; }
    }
}
