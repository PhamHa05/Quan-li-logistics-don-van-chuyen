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
    public class DonVanChuyenRepository : IDonVanChuyenRepository
    {
        private IDatabaseHelper _dbHelper;
        public DonVanChuyenRepository(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public bool Create(DonVanChuyenModel model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_donvanchuyen_create",
                "@ma_van_don", model.ma_van_don,
                "@ten_nguoi_gui", model.ten_nguoi_gui,
                "@sdt_nguoi_gui", model.sdt_nguoi_gui,
                "@dia_chi_lay_hang", model.dia_chi_lay_hang,
                "@ten_nguoi_nhan", model.ten_nguoi_nhan,
                "@sdt_nguoi_nhan", model.sdt_nguoi_nhan,
                "@dia_chi_giao_hang", model.dia_chi_giao_hang,
                "@loai_hang", model.loai_hang,
                "@khoi_luong", model.khoi_luong,
                "@tien_thu_ho", model.tien_thu_ho,
                "@loai_dich_vu", model.loai_dich_vu,
                "@trang_thai", model.trang_thai,
                "@id_tai_xe", model.id_tai_xe,
                "@id_tuyen_duong", model.id_tuyen_duong,
                "@MaKhachHang", model.MaKhachHang);

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

        public bool Update(DonVanChuyenModel model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_donvanchuyen_update",
                "@id", model.id,
                "@ma_van_don", model.ma_van_don,
                "@ten_nguoi_gui", model.ten_nguoi_gui,
                "@sdt_nguoi_gui", model.sdt_nguoi_gui,
                "@dia_chi_lay_hang", model.dia_chi_lay_hang,
                "@ten_nguoi_nhan", model.ten_nguoi_nhan,
                "@sdt_nguoi_nhan", model.sdt_nguoi_nhan,
                "@dia_chi_giao_hang", model.dia_chi_giao_hang,
                "@loai_hang", model.loai_hang,
                "@khoi_luong", model.khoi_luong,
                "@tien_thu_ho", model.tien_thu_ho,
                "@loai_dich_vu", model.loai_dich_vu,
                "@trang_thai", model.trang_thai,
                "@id_tai_xe", model.id_tai_xe,
                "@id_tuyen_duong", model.id_tuyen_duong,
                "@MaKhachHang", model.MaKhachHang,
                "@MaTaiXe", model.MaTaiXe,
                "@MaDieuPhoi", model.MaDieuPhoi);

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
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_donvanchuyen_delete", "@id", id);
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

        public DonVanChuyenModel GetDatabyID(long id)
        {
            string msgError = "";
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_donvanchuyen_get_by_id", "@id", id);
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                return dt.ConvertTo<DonVanChuyenModel>().FirstOrDefault();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<DonVanChuyenModel> Search(int pageIndex, int pageSize, out long total, string ma_van_don, string trang_thai)
        {
            string msgError = "";
            total = 0;
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_donvanchuyen_search",
                    "@page_index", pageIndex,
                    "@page_size", pageSize,
                    "@ma_van_don", ma_van_don,
                    "@trang_thai", trang_thai);
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                if (dt.Rows.Count > 0) total = (long)dt.Rows[0]["RecordCount"];
                return dt.ConvertTo<DonVanChuyenModel>().ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
