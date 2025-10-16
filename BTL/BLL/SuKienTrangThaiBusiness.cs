// BLL/SuKienTrangThaiBusiness.cs
using BLL.Interfaces;
using DAL.Interfaces;
using Models;
using System.Collections.Generic;

namespace BLL
{
    public class SuKienTrangThaiBusiness : ISuKienTrangThaiBusiness
    {
        private readonly ISuKienTrangThaiRepository _res;

        public SuKienTrangThaiBusiness(ISuKienTrangThaiRepository res)
        {
            _res = res;
        }

        public bool Create(SuKienTrangThaiModel model)
        {
            // Business logic can be added here, for example:
            // - Validate if the status transition is logical.
            // - Prevent duplicate status entries.
            return _res.Create(model);
        }

        public List<SuKienTrangThaiModel> GetHistoryByDonVanChuyenID(long donVanChuyenId)
        {
            // The list could be sorted or filtered here if needed.
            return _res.GetHistoryByDonVanChuyenID(donVanChuyenId);
        }
    }
}