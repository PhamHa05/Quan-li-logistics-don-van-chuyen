using Models;
using System.Collections.Generic;

namespace DAL.Interfaces
{
    public interface IDiemGiaoHangRepository
    {
        /// <summary>
        /// Tạo mới một điểm giao hàng.
        /// </summary>
        bool Create(DiemGiaoHangModel model);

        /// <summary>
        /// Cập nhật thông tin một điểm giao hàng.
        /// </summary>
        bool Update(DiemGiaoHangModel model);

        /// <summary>
        /// Xóa một điểm giao hàng theo ID.
        /// </summary>
        bool Delete(long id);

        /// <summary>
        /// Lấy danh sách tất cả điểm giao hàng theo tuyến đường.
        /// </summary>
        List<DiemGiaoHangModel> GetByTuyenDuongId(long tuyenDuongId);
    }
}
