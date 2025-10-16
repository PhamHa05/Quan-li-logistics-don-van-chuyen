// DAL/GiaoDichCODRepository.cs
using DAL.Helper.Interfaces;
using DAL.Helper;
using DAL.Interfaces;
using Models;
using System;
using System.Linq;

namespace DAL
{
    public class GiaoDichCODRepository : IGiaoDichCODRepository
    {
        private readonly IDatabaseHelper _dbHelper;

        public GiaoDichCODRepository(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public bool Create(GiaoDichCODModel model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_giaodichcod_create",
                "@id_don_van_chuyen", model.id_don_van_chuyen,
                "@so_tien_du_kien", model.so_tien_du_kien,
                "@trang_thai_thanh_toan", model.trang_thai_thanh_toan);

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

        public bool Update(GiaoDichCODModel model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_giaodichcod_update",
                "@id", model.id,
                "@so_tien_thuc_te", model.so_tien_thuc_te,
                "@thoi_gian_thu_tien", model.thoi_gian_thu_tien,
                "@da_doi_soat", model.da_doi_soat,
                "@trang_thai_thanh_toan", model.trang_thai_thanh_toan);

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

        public GiaoDichCODModel GetByDonVanChuyenID(long donVanChuyenId)
        {
            string msgError = "";
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_giaodichcod_get_by_donvanchuyen_id", "@id_don_van_chuyen", donVanChuyenId);
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                return dt.ConvertTo<GiaoDichCODModel>().FirstOrDefault();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}