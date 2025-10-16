using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class TaiXeModel
    {
        public long id { get; set; }
        public string ho_ten { get; set; }
        public string so_dien_thoai { get; set; }
        public string loai_phuong_tien { get; set; }
        public string bien_so_xe { get; set; }
        public bool dang_san_sang { get; set; }
    }
}
