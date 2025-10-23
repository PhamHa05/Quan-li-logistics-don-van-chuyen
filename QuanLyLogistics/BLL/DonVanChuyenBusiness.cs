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
        private readonly string[] allowedStatus = { "CHO_LAY_HANG", "DANG_GIAO", "HOAN_THANH" };

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

        public List<DonVanChuyenModel> Search(int pageIndex, int pageSize, out long total, string maVanDon, string trangThai)
        {
            return _res.Search(pageIndex, pageSize, out total, maVanDon, trangThai);
        }
    }
}
