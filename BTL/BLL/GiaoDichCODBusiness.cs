using BLL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models;
using DAL.Interfaces;


namespace BLL
{
    public class GiaoDichCODBusiness : IGiaoDichCODBusiness
    {
        private IGiaoDichCODRepository _res;

        public GiaoDichCODBusiness(IGiaoDichCODRepository res)
        {
            _res = res;
        }

        public bool Create(GiaoDichCODModel model)
        {
            // **Nghiệp vụ có thể thêm ở đây:**
            // Gán trạng thái thanh toán mặc định
            model.trang_thai_thanh_toan = "CHO_THANH_TOAN";
            return _res.Create(model);
        }

        public bool Update(GiaoDichCODModel model)
        {
            // **Nghiệp vụ có thể thêm ở đây:**
            // Ví dụ: Kiểm tra logic đối soát, xác nhận thanh toán
            return _res.Update(model);
        }

        public GiaoDichCODModel GetByDonVanChuyenID(long donVanChuyenId)
        {
            return _res.GetByDonVanChuyenID(donVanChuyenId);
        }
    }
}
