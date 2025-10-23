using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface ITuyenDuongRepository
    {
        /// <summary>
        /// Tạo mới một tuyến đường
        /// </summary>
        /// <param name="model">Đối tượng TuyenDuongModel chứa thông tin cần tạo</param>
        /// <returns>True nếu tạo thành công, ngược lại là false</returns>
        bool Create(TuyenDuongModel model);

        /// <summary>
        /// Cập nhật thông tin một tuyến đường
        /// </summary>
        /// <param name="model">Đối tượng TuyenDuongModel chứa thông tin cần cập nhật</param>
        /// <returns>True nếu cập nhật thành công, ngược lại là false</returns>
        bool Update(TuyenDuongModel model);

        /// <summary>
        /// Xóa một tuyến đường dựa trên ID
        /// </summary>
        /// <param name="id">ID của tuyến đường cần xóa</param>
        /// <returns>True nếu xóa thành công, ngược lại là false</returns>
        bool Delete(long id);

        /// <summary>
        /// Lấy thông tin một tuyến đường dựa trên ID
        /// </summary>
        /// <param name="id">ID của tuyến đường cần lấy</param>
        /// <returns>Đối tượng TuyenDuongModel hoặc null nếu không tìm thấy</returns>
        TuyenDuongModel GetDatabyID(long id);

        /// <summary>
        /// Tìm kiếm và phân trang danh sách tuyến đường
        /// </summary>
        /// <param name="pageIndex">Chỉ số trang bắt đầu từ 1</param>
        /// <param name="pageSize">Số lượng bản ghi trên mỗi trang</param>
        /// <param name="total">Tổng số bản ghi tìm thấy</param>
        /// <param name="ma_tuyen">Mã tuyến cần tìm</param>
        /// <param name="id_tai_xe">ID tài xế cần tìm</param>
        /// <returns>Danh sách các tuyến đường thỏa mãn điều kiện</returns>
        List<TuyenDuongModel> Search(int pageIndex, int pageSize, out long total, string ma_tuyen, long? id_tai_xe);
    }
}
