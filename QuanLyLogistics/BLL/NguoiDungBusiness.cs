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
    public class NguoiDungBusiness : INguoiDungBusiness
    {
        private INguoiDungRepository _res;

        public NguoiDungBusiness(INguoiDungRepository res)
        {
            _res = res;
        }

        public NguoiDungModel Login(string tenDangNhap, string matKhau)
        {
            return _res.Login(tenDangNhap, matKhau);
        }

        public bool Create(NguoiDungModel model)
        {
            return _res.Create(model);
        }

        public bool Update(NguoiDungModel model)
        {
            return _res.Update(model);
        }

        public bool Delete(int id)
        {
            return _res.Delete(id);
        }

        public NguoiDungModel GetDatabyID(int id)
        {
            return _res.GetDatabyID(id);
        }

        public List<NguoiDungModel> GetAll(string hoTen, string tenDangNhap)
        {
            return _res.GetAll(hoTen, tenDangNhap);
        }
    }
}
