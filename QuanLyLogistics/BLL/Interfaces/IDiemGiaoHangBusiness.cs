using Models;
using System.Collections.Generic;

namespace BLL.Interfaces
{
    public interface IDiemGiaoHangBusiness
    {
        bool Create(DiemGiaoHangModel model);
        bool Update(DiemGiaoHangModel model);
        bool Delete(long id);
        List<DiemGiaoHangModel> GetByTuyenDuongId(long tuyenDuongId);
    }
}
