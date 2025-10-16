// DAL/NguoiDungRepository.cs
using DAL.Helper.Interfaces;
using DAL.Interfaces;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using DAL.Helper;

namespace DAL
{
    public class NguoiDungRepository : INguoiDungRepository
    {
        private IDatabaseHelper _dbHelper;
        public NguoiDungRepository(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public NguoiDungModel Login(string tenDangNhap, string matKhau)
        {
            string msgError = "";
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_nguoidung_login",
                     "@TenDangNhap", tenDangNhap,
                     "@MatKhau", matKhau);
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                return dt.ConvertTo<NguoiDungModel>().FirstOrDefault();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public bool Create(NguoiDungModel model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_nguoidung_create",
                    "@HoTen", model.HoTen,
                    "@TenDangNhap", model.TenDangNhap,
                    "@MatKhau", model.MatKhau,
                    "@VaiTro", model.VaiTro,
                    "@Email", model.Email,
                    "@SoDienThoai", model.SoDienThoai,
                    "@DiaChi", model.DiaChi);
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

        // PHẦN CODE ĐƯỢC BỔ SUNG BẮT ĐẦU TỪ ĐÂY
        public bool Update(NguoiDungModel model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_nguoidung_update",
                "@MaNguoiDung", model.MaNguoiDung,
                "@HoTen", model.HoTen,
                "@MatKhau", model.MatKhau,
                "@VaiTro", model.VaiTro,
                "@Email", model.Email,
                "@SoDienThoai", model.SoDienThoai,
                "@DiaChi", model.DiaChi);
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

        public bool Delete(int id)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_nguoidung_delete", "@MaNguoiDung", id);
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

        public NguoiDungModel GetDatabyID(int id)
        {
            string msgError = "";
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_nguoidung_get_by_id",
                     "@MaNguoiDung", id);
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                return dt.ConvertTo<NguoiDungModel>().FirstOrDefault();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<NguoiDungModel> Search(int pageIndex, int pageSize, out long total, string hoTen, string tenDangNhap)
        {
            string msgError = "";
            total = 0;
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_nguoidung_search",
                    "@page_index", pageIndex,
                    "@page_size", pageSize,
                    "@HoTen", hoTen,
                    "@TenDangNhap", tenDangNhap);
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                if (dt.Rows.Count > 0) total = (long)dt.Rows[0]["RecordCount"];
                return dt.ConvertTo<NguoiDungModel>().ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}