// DAL/TuyenDuongRepository.cs
using DAL.Helper.Interfaces;
using DAL.Helper;
using DAL.Interfaces;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DAL
{
    public class TuyenDuongRepository : ITuyenDuongRepository
    {
        private IDatabaseHelper _dbHelper;
        public TuyenDuongRepository(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public bool Create(TuyenDuongModel model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_tuyenduong_create",
                "@ma_tuyen", model.ma_tuyen,
                "@id_tai_xe", model.id_tai_xe,
                "@ngay_giao_hang", model.ngay_giao_hang,
                "@trang_thai", model.trang_thai,
                "@tong_so_don", model.tong_so_don);

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

        public bool Update(TuyenDuongModel model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_tuyenduong_update",
                "@id", model.id,
                "@ma_tuyen", model.ma_tuyen,
                "@id_tai_xe", model.id_tai_xe,
                "@ngay_giao_hang", model.ngay_giao_hang,
                "@trang_thai", model.trang_thai,
                "@tong_so_don", model.tong_so_don,
                "@so_don_hoan_thanh", model.so_don_hoan_thanh);

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
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_tuyenduong_delete", "@id", id);
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

        public TuyenDuongModel GetDatabyID(long id)
        {
            string msgError = "";
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_tuyenduong_get_by_id", "@id", id);
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                return dt.ConvertTo<TuyenDuongModel>().FirstOrDefault();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<TuyenDuongModel> Search(int pageIndex, int pageSize, out long total, string ma_tuyen, long? id_tai_xe)
        {
            string msgError = "";
            total = 0;
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_tuyenduong_search",
                    "@page_index", pageIndex,
                    "@page_size", pageSize,
                    "@ma_tuyen", ma_tuyen,
                    "@id_tai_xe", id_tai_xe);
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                if (dt.Rows.Count > 0) total = (long)dt.Rows[0]["RecordCount"];
                return dt.ConvertTo<TuyenDuongModel>().ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}