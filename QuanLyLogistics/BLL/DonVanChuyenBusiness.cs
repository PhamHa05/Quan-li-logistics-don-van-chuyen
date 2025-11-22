using BLL.Interfaces;
using DAL.Interfaces;
using Models;
using System;
using System.Collections.Generic;

namespace BLL
{
    public class DonVanChuyenBusiness : IDonVanChuyenBusiness
    {
        private readonly IDonVanChuyenRepository _res;
        // Các trạng thái hợp lệ theo constraint trong database
        private readonly string[] allowedStatus = { "CHO_LAY_HANG", "DA_LAY_HANG", "DANG_GIAO", "GIAO_THANH_CONG", "THAT_BAI" };

        public DonVanChuyenBusiness(IDonVanChuyenRepository res)
        {
            _res = res ?? throw new ArgumentNullException(nameof(res));
        }

        public bool Create(DonVanChuyenModel model)
        {
            if (string.IsNullOrEmpty(model.MaVanDon))
            {
                model.MaVanDon = "DVC" + Guid.NewGuid().ToString("N").ToUpper().Substring(0, 10);
            }

            if (string.IsNullOrEmpty(model.TrangThai) || !allowedStatus.Contains(model.TrangThai))
            {
                model.TrangThai = "CHO_LAY_HANG";
            }

            model.ThoiGianTao = DateTime.Now;
            model.ThoiGianCapNhat = DateTime.Now;

            return _res.Create(model);
        }

        public bool Update(DonVanChuyenModel model)
        {
            // Validate trạng thái theo constraint trong database
            if (!string.IsNullOrEmpty(model.TrangThai) && !allowedStatus.Contains(model.TrangThai))
                throw new Exception($"TrangThai không hợp lệ. Chỉ được phép: {string.Join(", ", allowedStatus)}");

            model.ThoiGianCapNhat = DateTime.Now;
            return _res.Update(model);
        }

        public bool Delete(long id)
        {
            return _res.Delete(id);
        }

        public DonVanChuyenModel GetDatabyID(long id)
        {
            return _res.GetDatabyID(id);
        }

        public List<DonVanChuyenModel> GetAll()
        {
            return _res.GetAll();
        }

        public List<DonVanChuyenModel> GetByIdTaiXe(long idTaiXe)
        {
            return _res.GetByIdTaiXe(idTaiXe);
        }

        public List<DonVanChuyenModel> Search(int pageIndex, int pageSize, out long total, string maVanDon, string trangThai)
        {
            return _res.Search(pageIndex, pageSize, out total, maVanDon, trangThai);
        }
    }
}
