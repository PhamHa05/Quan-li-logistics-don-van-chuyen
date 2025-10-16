using BLL.Interfaces;
using DAL.Interfaces;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class DonVanChuyenBusiness : IDonVanChuyenBusiness
    {
        private IDonVanChuyenRepository _res;

        public DonVanChuyenBusiness(IDonVanChuyenRepository res)
        {
            _res = res;
        }

        public bool Create(DonVanChuyenModel model)
        {
            // **Nghiệp vụ có thể thêm ở đây:**
            // Ví dụ: Tự động sinh mã vận đơn nếu người dùng không nhập
            // Gán trạng thái mặc định là "CHO_LAY_HANG"
            if (string.IsNullOrEmpty(model.ma_van_don))
            {
                model.ma_van_don = "DVC" + System.Guid.NewGuid().ToString("N").ToUpper().Substring(0, 10);
            }
            model.trang_thai = "CHO_LAY_HANG";

            return _res.Create(model);
        }

        public bool Update(DonVanChuyenModel model)
        {
            // **Nghiệp vụ có thể thêm ở đây:**
            // Ví dụ: Khi cập nhật trạng thái, tự động tạo một bản ghi trong bảng SuKienTrangThai
            return _res.Update(model);
        }

        public bool Delete(long id)
        {
            return _res.Delete(id);
        }

        public DonVanChuyenModel GetDatabyID(long id)
        {
            return _res.GetDatabyID(id);
        }

        public List<DonVanChuyenModel> Search(int pageIndex, int pageSize, out long total, string ma_van_don, string trang_thai)
        {
            return _res.Search(pageIndex, pageSize, out total, ma_van_don, trang_thai);
        }
    }
}
