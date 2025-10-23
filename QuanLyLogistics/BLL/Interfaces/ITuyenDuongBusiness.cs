using Models;
using System.Collections.Generic;

namespace BLL.Interfaces
{
    public interface ITuyenDuongBusiness
    {
        /// <summary>
        /// Tạo mới một tuyến đường.
        /// </summary>
        bool Create(TuyenDuongModel model);

        /// <summary>
        /// Cập nhật thông tin một tuyến đường.
        /// </summary>
        bool Update(TuyenDuongModel model);

        /// <summary>
        /// Xóa một tuyến đường dựa trên ID.
        /// </summary>
        bool Delete(long id);

        /// <summary>
        /// Lấy thông tin chi tiết một tuyến đường theo ID.
        /// </summary>
        TuyenDuongModel GetDatabyID(long id);

        /// <summary>
        /// Tìm kiếm và phân trang danh sách các tuyến đường.
        /// </summary>
        List<TuyenDuongModel> Search(int pageIndex, int pageSize, out long total, string ma_tuyen, long? id_tai_xe);
    }
}