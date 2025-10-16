using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models;  

namespace BLL.Interfaces
{
    public interface ISuKienTrangThaiBusiness
    {
        /// <summary>
        /// Creates a new status event log for a shipping order.
        /// </summary>
        bool Create(SuKienTrangThaiModel model);

        /// <summary>
        /// Retrieves the complete status history for a specific shipping order.
        /// </summary>
        List<SuKienTrangThaiModel> GetHistoryByDonVanChuyenID(long donVanChuyenId);
    }
}
