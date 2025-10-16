// DAL/GiaoDichCODRepository.cs
using DAL.Helper.Interfaces;
using DAL.Helper;
using DAL.Interfaces;
using Models;
using System;
using System.Linq;

namespace DAL
{
    public class DiemGiaoHangRepository : IDiemGiaoHangRepository
    {
        private readonly IDatabaseHelper _dbHelper;

        public DiemGiaoHangRepository(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public bool Create(DiemGiaoHangModel model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_diemgiaohang_create",
                "@id_tuyen_duong", model.id_tuyen_duong,
                "@id_don_van_chuyen", model.id_don_van_chuyen,
                "@thu_tu_dung", model.thu_tu_dung,
                "@thoi_gian_du_kien", model.thoi_gian_du_kien,
                "@trang_thai", model.trang_thai);

                if ((result != null && !string.IsNullOrEmpty(result.ToString())) || !string.IsNullOrEmpty(msgError))
                {
                    throw new Exception(Convert.ToString(result) + msgError);
                }
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public bool Update(DiemGiaoHangModel model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_diemgiaohang_update",
                "@id", model.id,
                "@thu_tu_dung", model.thu_tu_dung,
                "@thoi_gian_du_kien", model.thoi_gian_du_kien,
                "@thoi_gian_thuc_te", model.thoi_gian_thuc_te,
                "@trang_thai", model.trang_thai);

                if ((result != null && !string.IsNullOrEmpty(result.ToString())) || !string.IsNullOrEmpty(msgError))
                {
                    throw new Exception(Convert.ToString(result) + msgError);
                }
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public bool Delete(long id)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_diemgiaohang_delete", "@id", id);
                if ((result != null && !string.IsNullOrEmpty(result.ToString())) || !string.IsNullOrEmpty(msgError))
                {
                    throw new Exception(Convert.ToString(result) + msgError);
                }
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<DiemGiaoHangModel> GetByTuyenDuongID(long tuyenDuongId)
        {
            string msgError = "";
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_diemgiaohang_get_by_tuyenduong_id", "@id_tuyen_duong", tuyenDuongId);
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                return dt.ConvertTo<DiemGiaoHangModel>().ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}