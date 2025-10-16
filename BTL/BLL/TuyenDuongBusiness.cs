// BLL/TuyenDuongBusiness.cs
using BLL.Interfaces;
using DAL.Interfaces;
using Models;
using System;
using System.Collections.Generic;

namespace BLL
{
    public class TuyenDuongBusiness : ITuyenDuongBusiness
    {
        private readonly ITuyenDuongRepository _res;

        // "Tiêm" repository vào thông qua constructor (Dependency Injection)
        public TuyenDuongBusiness(ITuyenDuongRepository res)
        {
            _res = res;
        }

        public bool Create(TuyenDuongModel model)
        {
            // **Ví dụ về logic nghiệp vụ (Business Logic):**
            // Nếu người dùng không nhập mã tuyến, hệ thống sẽ tự động sinh một mã duy nhất.
            if (string.IsNullOrEmpty(model.ma_tuyen))
            {
                model.ma_tuyen = $"TD-{DateTime.Now:yyyyMMddHHmmssfff}";
            }

            // Gán trạng thái mặc định khi tạo mới
            model.trang_thai = "DA_LAP_KE_HOACH";

            // Sau khi xử lý nghiệp vụ, gọi xuống tầng DAL để lưu vào CSDL
            return _res.Create(model);
        }

        public bool Update(TuyenDuongModel model)
        {
            // **Logic nghiệp vụ có thể thêm ở đây:**
            // Ví dụ: Kiểm tra xem trạng thái cập nhật có hợp lệ không.
            return _res.Update(model);
        }

        public bool Delete(long id)
        {
            // **Logic nghiệp vụ có thể thêm ở đây:**
            // Ví dụ: Kiểm tra xem tuyến đường có đang ở trạng thái "DANG_GIAO" không,
            // nếu có thì không cho xóa.
            return _res.Delete(id);
        }

        public TuyenDuongModel GetDatabyID(long id)
        {
            return _res.GetDatabyID(id);
        }

        public List<TuyenDuongModel> Search(int pageIndex, int pageSize, out long total, string ma_tuyen, long? id_tai_xe)
        {
            return _res.Search(pageIndex, pageSize, out total, ma_tuyen, id_tai_xe);
        }
    }
}