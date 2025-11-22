using DAL.Helper;
using DAL.Helper.Interfaces;
using DAL.Interfaces;
using Microsoft.Data.SqlClient;
using Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

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
            string sql = @"
                    INSERT INTO TaiXe (HoTen, SoDienThoai, LoaiPhuongTien, BienSoXe, DangSanSang)
                    VALUES (@HoTen, @SoDienThoai, @LoaiPhuongTien, @BienSoXe, @DangSanSang);";

            int result = _dbHelper.ExecuteNonQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@HoTen", model.HoTen ?? (object)DBNull.Value),
                new SqlParameter("@SoDienThoai", model.SoDienThoai ?? (object)DBNull.Value),
                new SqlParameter("@LoaiPhuongTien", model.LoaiPhuongTien ?? (object)DBNull.Value),
                new SqlParameter("@BienSoXe", model.BienSoXe ?? (object)DBNull.Value),
                new SqlParameter("@DangSanSang", model.DangSanSang)
            });

            return result > 0;
        }

        public bool Update(TaiXeModel model)
        {
            string sql = @"
                        UPDATE TaiXe SET
                            HoTen = @HoTen,
                            SoDienThoai = @SoDienThoai,
                            LoaiPhuongTien = @LoaiPhuongTien,
                            BienSoXe = @BienSoXe,
                            DangSanSang = @DangSanSang
                        WHERE Id = @Id;";

            int result = _dbHelper.ExecuteNonQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@Id", model.Id),
                new SqlParameter("@HoTen", model.HoTen ?? (object)DBNull.Value),
                new SqlParameter("@SoDienThoai", model.SoDienThoai ?? (object)DBNull.Value),
                new SqlParameter("@LoaiPhuongTien", model.LoaiPhuongTien ?? (object)DBNull.Value),
                new SqlParameter("@BienSoXe", model.BienSoXe ?? (object)DBNull.Value),
                new SqlParameter("@DangSanSang", model.DangSanSang)
            });

            return result > 0;
        }

        public bool Delete(long id)
        {
            string sql = "DELETE FROM TaiXe WHERE Id = @Id";
            int result = _dbHelper.ExecuteNonQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@Id", id)
            });
            return result > 0;
        }

        public TaiXeModel GetDatabyID(long id)
        {
            string sql = "SELECT * FROM TaiXe WHERE Id = @Id";
            var dt = _dbHelper.ExecuteQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@Id", id)
            });
            return dt.ConvertTo<TaiXeModel>().FirstOrDefault();
        }

        public List<TaiXeModel> Search(int pageIndex, int pageSize, out long total, string hoTen, string soDienThoai)
        {
            total = 0;
            int offset = (pageIndex - 1) * pageSize;

            // Convert empty string to null for proper SQL query
            hoTen = string.IsNullOrWhiteSpace(hoTen) ? null : hoTen;
            soDienThoai = string.IsNullOrWhiteSpace(soDienThoai) ? null : soDienThoai;

            string sql = @"
                        SELECT *, COUNT(*) OVER() AS RecordCount
                        FROM TaiXe
                        WHERE (@HoTen IS NULL OR HoTen LIKE '%' + @HoTen + '%')
                          AND (@SoDienThoai IS NULL OR SoDienThoai LIKE '%' + @SoDienThoai + '%')
                        ORDER BY Id DESC
                        OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;";

            var dt = _dbHelper.ExecuteQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@HoTen", (object)hoTen ?? DBNull.Value),
                new SqlParameter("@SoDienThoai", (object)soDienThoai ?? DBNull.Value),
                new SqlParameter("@Offset", offset),
                new SqlParameter("@PageSize", pageSize)
            });

            if (dt.Rows.Count > 0) total = Convert.ToInt64(dt.Rows[0]["RecordCount"]);
            return dt.ConvertTo<TaiXeModel>().ToList();
        }
    }
}
