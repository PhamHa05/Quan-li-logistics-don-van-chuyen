// DAL/SuKienTrangThaiRepository.cs
using DAL.Helper.Interfaces;
using DAL.Helper;
using DAL.Interfaces;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DAL
{
    public class SuKienTrangThaiRepository : ISuKienTrangThaiRepository
    {
        private readonly IDatabaseHelper _dbHelper;

        public SuKienTrangThaiRepository(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public bool Create(SuKienTrangThaiModel model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_sukientrangthai_create",
                "@id_don_van_chuyen", model.id_don_van_chuyen,
                "@trang_thai_cu", model.trang_thai_cu,
                "@trang_thai_moi", model.trang_thai_moi,
                "@ghi_chu", model.ghi_chu,
                "@url_anh_ky_nhan", model.url_anh_ky_nhan,
                "@url_chu_ky", model.url_chu_ky,
                "@ma_yeu_cau", model.ma_yeu_cau);

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

        public List<SuKienTrangThaiModel> GetHistoryByDonVanChuyenID(long donVanChuyenId)
        {
            string msgError = "";
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_sukientrangthai_get_by_donvanchuyen_id", "@id_don_van_chuyen", donVanChuyenId);
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                return dt.ConvertTo<SuKienTrangThaiModel>().ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}