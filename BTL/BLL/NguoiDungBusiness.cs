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
            // **Nghiệp vụ có thể thêm ở đây:**
            // Ví dụ: Kiểm tra định dạng tenDangNhap, matKhau trước khi gọi DAL
            // Mã hóa mật khẩu nếu cần
            return _res.Login(tenDangNhap, matKhau);
        }

        public bool Create(NguoiDungModel model)
        {
            // **Nghiệp vụ có thể thêm ở đây:**
            // Ví dụ: Kiểm tra xem TenDangNhap hoặc Email đã tồn tại chưa
            // Validate các trường dữ liệu (không được rỗng, đúng định dạng,...)
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

        public List<NguoiDungModel> Search(int pageIndex, int pageSize, out long total, string hoTen, string tenDangNhap)
        {
            return _res.Search(pageIndex, pageSize, out total, hoTen, tenDangNhap);
        }
    }
}
