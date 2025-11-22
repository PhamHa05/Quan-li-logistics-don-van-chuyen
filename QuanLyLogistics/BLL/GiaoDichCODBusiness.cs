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
    public class GiaoDichCODBusiness : IGiaoDichCODBusiness
    {
        private readonly IGiaoDichCODRepository _repository;

        public GiaoDichCODBusiness(IGiaoDichCODRepository repository)
        {
            _repository = repository;
        }

        public bool Create(GiaoDichCODModel model)
        {
            if (string.IsNullOrEmpty(model.TrangThaiThanhToan))
                model.TrangThaiThanhToan = "CHO_THANH_TOAN";

            model.DaDoiSoat = false;
            return _repository.Create(model);
        }

        public bool Update(GiaoDichCODModel model)
        {
            return _repository.Update(model);
        }

        public GiaoDichCODModel GetByDonVanChuyenId(long donVanChuyenId)
        {
            return _repository.GetByDonVanChuyenId(donVanChuyenId);
        }

        public List<GiaoDichCODModel> GetAll()
        {
            return _repository.GetAll();
        }
    }
}