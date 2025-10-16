// DAL/Interfaces/ISuKienTrangThaiRepository.cs
using Models;
using System.Collections.Generic;

namespace DAL.Interfaces
{
    public interface ISuKienTrangThaiRepository
    {
        /// <summary>
        /// Tạo mới một bản ghi lịch sử trạng thái cho đơn hàng.
        /// </summary>
        bool Create(SuKienTrangThaiModel model);

        /// <summary>
        /// Lấy toàn bộ lịch sử trạng thái của một đơn vận chuyển.
        /// </summary>
        List<SuKienTrangThaiModel> GetHistoryByDonVanChuyenID(long donVanChuyenId);
    }
}