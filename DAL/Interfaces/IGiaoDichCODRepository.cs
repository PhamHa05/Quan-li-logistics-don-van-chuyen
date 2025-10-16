// DAL/Interfaces/IGiaoDichCODRepository.cs
using Models;

namespace DAL.Interfaces
{
    public interface IGiaoDichCODRepository
    {
        /// <summary>
        /// Tạo mới một giao dịch COD cho đơn vận chuyển.
        /// </summary>
        bool Create(GiaoDichCODModel model);

        /// <summary>
        /// Cập nhật thông tin một giao dịch (ví dụ: xác nhận đã thu tiền, đã đối soát).
        /// </summary>
        bool Update(GiaoDichCODModel model);

        /// <summary>
        /// Lấy thông tin giao dịch COD dựa trên ID của đơn vận chuyển.
        /// </summary>
        GiaoDichCODModel GetByDonVanChuyenID(long donVanChuyenId);
    }
}