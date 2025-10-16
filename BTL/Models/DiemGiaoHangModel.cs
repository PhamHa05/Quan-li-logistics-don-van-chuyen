using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class DiemGiaoHangModel
    {
        public long id { get; set; }
        public long id_tuyen_duong { get; set; }
        public long id_don_van_chuyen { get; set; }
        public int? thu_tu_dung { get; set; }
        public TimeSpan? thoi_gian_du_kien { get; set; }
        public TimeSpan? thoi_gian_thuc_te { get; set; }
        public string trang_thai { get; set; }
    }
}
