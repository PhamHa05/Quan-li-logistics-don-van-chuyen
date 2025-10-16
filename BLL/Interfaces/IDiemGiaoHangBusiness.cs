using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IDiemGiaoHangBusiness
    {
        /// <summary>
        /// Tạo mới một điểm giao hàng trên tuyến đường.
        /// </summary>
        bool Create(DiemGiaoHangModel model);

        /// <summary>
        /// Cập nhật thông tin/trạng thái một điểm giao hàng.
        /// </summary>
        bool Update(DiemGiaoHangModel model);

        /// <summary>
        /// Lấy tất cả các điểm giao hàng thuộc về một tuyến đường.
        /// </summary>
        List<DiemGiaoHangModel> GetByTuyenDuongID(long tuyenDuongId);
    }
}
