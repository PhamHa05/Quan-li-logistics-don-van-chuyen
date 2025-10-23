using BLL.Interfaces;
using DAL.Interfaces;
using Models;
using System.Collections.Generic;

namespace BLL
{
    public class DiemGiaoHangBusiness : IDiemGiaoHangBusiness
    {
        private readonly IDiemGiaoHangRepository _repository;

        public DiemGiaoHangBusiness(IDiemGiaoHangRepository repository)
        {
            _repository = repository;
        }

        public bool Create(DiemGiaoHangModel model)
        {
            return _repository.Create(model);
        }

        public bool Update(DiemGiaoHangModel model)
        {
            return _repository.Update(model);
        }

        public bool Delete(long id)
        {
            return _repository.Delete(id);
        }

        public List<DiemGiaoHangModel> GetByTuyenDuongId(long tuyenDuongId)
        {
            return _repository.GetByTuyenDuongId(tuyenDuongId);
        }
    }
}
