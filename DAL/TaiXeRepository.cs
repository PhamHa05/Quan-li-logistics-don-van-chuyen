using DAL.Interfaces;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Helper;
using DAL.Helper.Interfaces;

namespace DAL
{
    public class TaiXeRepository : ITaiXeRepository
    {
        private IDatabaseHelper _dbHelper;

        public TaiXeRepository(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public bool Create(TaiXeModel model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_taixe_create",
                "@ho_ten", model.ho_ten,
                "@so_dien_thoai", model.so_dien_thoai,
                "@loai_phuong_tien", model.loai_phuong_tien,
                "@bien_so_xe", model.bien_so_xe,
                "@dang_san_sang", model.dang_san_sang);

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

        public bool Update(TaiXeModel model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_taixe_update",
                "@id", model.id,
                "@ho_ten", model.ho_ten,
                "@so_dien_thoai", model.so_dien_thoai,
                "@loai_phuong_tien", model.loai_phuong_tien,
                "@bien_so_xe", model.bien_so_xe,
                "@dang_san_sang", model.dang_san_sang);

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
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_taixe_delete", "@id", id);
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

        public TaiXeModel GetDatabyID(long id)
        {
            string msgError = "";
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_taixe_get_by_id", "@id", id);
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                return dt.ConvertTo<TaiXeModel>().FirstOrDefault();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<TaiXeModel> Search(int pageIndex, int pageSize, out long total, string ho_ten, string so_dien_thoai)
        {
            string msgError = "";
            total = 0;
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_taixe_search",
                    "@page_index", pageIndex,
                    "@page_size", pageSize,
                    "@ho_ten", ho_ten,
                    "@so_dien_thoai", so_dien_thoai);
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                if (dt.Rows.Count > 0) total = (long)dt.Rows[0]["RecordCount"];
                return dt.ConvertTo<TaiXeModel>().ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
