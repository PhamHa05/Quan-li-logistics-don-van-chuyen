using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class TuyenDuongModel
    {
        public long id { get; set; }
        public string ma_tuyen { get; set; }
        public long id_tai_xe { get; set; }
        public DateTime ngay_giao_hang { get; set; }
        public string trang_thai { get; set; }
        public int? tong_so_don { get; set; }
        public int so_don_hoan_thanh { get; set; }
    }
}
