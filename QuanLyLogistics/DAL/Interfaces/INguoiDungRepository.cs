using System.Collections.Generic;
using System.Threading.Tasks;
using Models;
namespace DAL.Interfaces
{
    public interface INguoiDungRepository
    {
        NguoiDungModel Login(string tenDangNhap, string matKhau);
        bool Create(NguoiDungModel model);
        bool Update(NguoiDungModel model);
        bool Delete(int id);
        NguoiDungModel GetDatabyID(int id);
        List<NguoiDungModel> GetAll(string hoTen, string tenDangNhap);
    }
}
