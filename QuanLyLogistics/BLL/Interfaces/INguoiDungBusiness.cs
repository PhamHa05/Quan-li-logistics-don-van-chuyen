using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface INguoiDungBusiness
    {
        NguoiDungModel Login(string tenDangNhap, string matKhau);
        bool Create(NguoiDungModel model);
        bool Update(NguoiDungModel model);
        bool Delete(int id);
        NguoiDungModel GetDatabyID(int id);
        List<NguoiDungModel> GetAll(string hoTen, string tenDangNhap);

    }
}
