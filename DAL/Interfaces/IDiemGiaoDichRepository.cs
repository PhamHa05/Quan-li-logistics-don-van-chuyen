using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface IDiemGiaoHangRepository
    {
        /// <summary>
        /// Tạo mới một điểm giao hàng cho một tuyến đường.
        /// </summary>
        bool Create(DiemGiaoHangModel model);

        /// <summary>
        /// Cập nhật thông tin/trạng thái của một điểm giao hàng.
        /// </summary>
        bool Update(DiemGiaoHangModel model);

        /// <summary>
        /// Xóa một điểm giao hàng theo ID.
        /// </summary>
        bool Delete(long id);

        /// <summary>
        /// Lấy danh sách tất cả các điểm giao hàng thuộc về một tuyến đường.
        /// </summary>
        List<DiemGiaoHangModel> GetByTuyenDuongID(long tuyenDuongId);
    }
}
