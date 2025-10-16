using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class GiaoDichCODModel
    {
        public long id { get; set; }
        public long id_don_van_chuyen { get; set; }
        public decimal so_tien_du_kien { get; set; }
        public decimal? so_tien_thuc_te { get; set; }
        public DateTime? thoi_gian_thu_tien { get; set; }
        public bool da_doi_soat { get; set; }
        public string trang_thai_thanh_toan { get; set; }
    }
}
