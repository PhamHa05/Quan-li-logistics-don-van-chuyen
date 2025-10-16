using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface ITaiXeBusiness
    {
        bool Create(TaiXeModel model);
        bool Update(TaiXeModel model);
        bool Delete(long id);
        TaiXeModel GetDatabyID(long id);
        List<TaiXeModel> Search(int pageIndex, int pageSize, out long total, string ho_ten, string so_dien_thoai);
    }
}
