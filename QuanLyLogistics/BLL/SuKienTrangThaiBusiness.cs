using BLL.Interfaces;
using DAL.Interfaces;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class SuKienTrangThaiBusiness : ISuKienTrangThaiBusiness
    {
        private readonly ISuKienTrangThaiRepository _repo;

        public SuKienTrangThaiBusiness(ISuKienTrangThaiRepository repo)
        {
            _repo = repo;
        }

        public bool Create(SuKienTrangThaiModel model)
        {
            return _repo.Create(model);
        }

        public List<SuKienTrangThaiModel> GetHistoryByDonVanChuyenID(long donVanChuyenId)
        {
            return _repo.GetHistoryByDonVanChuyenID(donVanChuyenId);
        }
    }
}
