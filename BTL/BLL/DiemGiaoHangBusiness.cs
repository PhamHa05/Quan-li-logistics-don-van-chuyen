using BLL.Interfaces;
using DAL.Interfaces;
using Models;
using System.Collections.Generic;

namespace BLL
{
    public class DiemGiaoHangBusiness : IDiemGiaoHangBusiness
    {
        private readonly IDiemGiaoHangRepository _res;

        public DiemGiaoHangBusiness(IDiemGiaoHangRepository res)
        {
            _res = res;
        }

        public bool Create(DiemGiaoHangModel model)
        {
            // Thêm logic nghiệp vụ: Tự động gán trạng thái mặc định khi tạo mới.
            model.trang_thai = "CHO_XU_LY";
            return _res.Create(model);
        }

        public bool Update(DiemGiaoHangModel model)
        {
            // Logic nghiệp vụ có thể được thêm ở đây trước khi gọi DAL
            return _res.Update(model);
        }

        public List<DiemGiaoHangModel> GetByTuyenDuongID(long tuyenDuongId)
        {
            return _res.GetByTuyenDuongID(tuyenDuongId);
        }
    }
}
