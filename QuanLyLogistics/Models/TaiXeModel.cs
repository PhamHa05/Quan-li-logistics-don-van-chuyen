using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class TaiXeModel
    {
        public long Id { get; set; }
        public string HoTen { get; set; }
        public string SoDienThoai { get; set; }
        public string LoaiPhuongTien { get; set; }
        public string BienSoXe { get; set; }
        public bool DangSanSang { get; set; }
    }
}
