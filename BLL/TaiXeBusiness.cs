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
    public class TaiXeBusiness : ITaiXeBusiness
    {
        private ITaiXeRepository _res;

        public TaiXeBusiness(ITaiXeRepository res)
        {
            _res = res;
        }

        public bool Create(TaiXeModel model)
        {
            // **Nghiệp vụ có thể thêm ở đây:**
            // Ví dụ: Kiểm tra số điện thoại hoặc biển số xe đã tồn tại chưa
            return _res.Create(model);
        }

        public bool Update(TaiXeModel model)
        {
            return _res.Update(model);
        }

        public bool Delete(long id)
        {
            return _res.Delete(id);
        }

        public TaiXeModel GetDatabyID(long id)
        {
            return _res.GetDatabyID(id);
        }

        public List<TaiXeModel> Search(int pageIndex, int pageSize, out long total, string ho_ten, string so_dien_thoai)
        {
            return _res.Search(pageIndex, pageSize, out total, ho_ten, so_dien_thoai);
        }
    }
}
