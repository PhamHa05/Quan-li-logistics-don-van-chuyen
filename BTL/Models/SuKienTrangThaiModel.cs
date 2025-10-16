using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class SuKienTrangThaiModel
    {
        public long id { get; set; }
        public long id_don_van_chuyen { get; set; }
        public string trang_thai_cu { get; set; }
        public string trang_thai_moi { get; set; }
        public DateTime thoi_gian_su_kien { get; set; }
        public string ghi_chu { get; set; }
        public string url_anh_ky_nhan { get; set; }
        public string url_chu_ky { get; set; }
        public string ma_yeu_cau { get; set; }
    }
}
