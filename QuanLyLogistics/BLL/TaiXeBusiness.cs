using BLL.Interfaces;
using DAL.Interfaces;
using Models;
using System.Collections.Generic;

namespace BLL
{
    public class TaiXeBusiness : ITaiXeBusiness
    {
        private ITaiXeRepository _res;

        public TaiXeBusiness(ITaiXeRepository res)
        {
            _res = res;
        }

        public bool Create(TaiXeModel model) => _res.Create(model);
        public bool Update(TaiXeModel model) => _res.Update(model);
        public bool Delete(long id) => _res.Delete(id);
        public TaiXeModel GetDatabyID(long id) => _res.GetDatabyID(id);
        public List<TaiXeModel> Search(int pageIndex, int pageSize, out long total, string hoTen, string soDienThoai)
            => _res.Search(pageIndex, pageSize, out total, hoTen, soDienThoai);
    }
}
