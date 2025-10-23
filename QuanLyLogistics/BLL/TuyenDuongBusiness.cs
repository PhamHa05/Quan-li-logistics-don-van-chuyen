using BLL.Interfaces;
using DAL.Interfaces;
using Models;
using System;
using System.Collections.Generic;

namespace BLL
{
    public class TuyenDuongBusiness : ITuyenDuongBusiness
    {
        private readonly ITuyenDuongRepository _repository;

        public TuyenDuongBusiness(ITuyenDuongRepository repository)
        {
            _repository = repository;
        }

        public bool Create(TuyenDuongModel model)
        {
            string[] allowedStatus = { "DA_LAP_KE_HOACH", "DANG_GIAO", "HOAN_THANH" };


            if (!allowedStatus.Contains(model.TrangThai))
            {
                throw new Exception($"TrangThai không hợp lệ. Chỉ được phép: {string.Join(", ", allowedStatus)}");
            }

            // Logic nghiệp vụ ví dụ: nếu MaTuyen rỗng, tự sinh mã
            if (string.IsNullOrEmpty(model.MaTuyen))
            {
                model.MaTuyen = $"TD-{DateTime.Now:yyyyMMddHHmmssfff}";
            }

            // Gán trạng thái mặc định
            model.TrangThai = "DA_LAP_KE_HOACH";

            return _repository.Create(model);
        }

        public bool Update(TuyenDuongModel model)
        {
            // Có thể thêm logic kiểm tra trạng thái hợp lệ trước khi update
            return _repository.Update(model);
        }

        public bool Delete(long id)
        {
            // Có thể thêm logic không cho xóa nếu trạng thái đang giao
            return _repository.Delete(id);
        }

        public TuyenDuongModel GetDatabyID(long id)
        {
            return _repository.GetDatabyID(id);
        }

        public List<TuyenDuongModel> Search(int pageIndex, int pageSize, out long total, string maTuyen, long? idTaiXe)
        {
            return _repository.Search(pageIndex, pageSize, out total, maTuyen, idTaiXe);
        }
    }
}
    