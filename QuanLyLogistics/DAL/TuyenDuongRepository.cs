using DAL.Helper.Interfaces;
using DAL.Interfaces;
using Microsoft.Data.SqlClient;
using Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace DAL
{
    public class TuyenDuongRepository : ITuyenDuongRepository
    {
        private readonly IDatabaseHelper _dbHelper;

        public TuyenDuongRepository(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public bool Create(TuyenDuongModel model)
        {
            string sql = @"
                    INSERT INTO TuyenDuong (MaTuyen, IdTaiXe, NgayGiaoHang, TrangThai, TongSoDon, SoDonHoanThanh)
                    VALUES (@MaTuyen, @IdTaiXe, @NgayGiaoHang, @TrangThai, @TongSoDon, @SoDonHoanThanh)";

            int result = _dbHelper.ExecuteNonQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@MaTuyen", model.MaTuyen ?? (object)DBNull.Value),
                new SqlParameter("@IdTaiXe", (object?)model.IdTaiXe ?? DBNull.Value),
                new SqlParameter("@NgayGiaoHang", (object?)model.NgayGiaoHang ?? DBNull.Value),
                new SqlParameter("@TrangThai", model.TrangThai ?? (object)DBNull.Value),
                new SqlParameter("@TongSoDon", (object?)model.TongSoDon ?? DBNull.Value),
                new SqlParameter("@SoDonHoanThanh", model.SoDonHoanThanh)
            });

            return result > 0;
        }

        public bool Update(TuyenDuongModel model)
        {
            string sql = @"
                        UPDATE TuyenDuong
                        SET MaTuyen = @MaTuyen,
                            IdTaiXe = @IdTaiXe,
                            NgayGiaoHang = @NgayGiaoHang,
                            TrangThai = @TrangThai,
                            TongSoDon = @TongSoDon,
                            SoDonHoanThanh = @SoDonHoanThanh
                        WHERE Id = @Id";

            int result = _dbHelper.ExecuteNonQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@Id", model.Id),
                new SqlParameter("@MaTuyen", model.MaTuyen ?? (object)DBNull.Value),
                new SqlParameter("@IdTaiXe", (object?)model.IdTaiXe ?? DBNull.Value),
                new SqlParameter("@NgayGiaoHang", (object?)model.NgayGiaoHang ?? DBNull.Value),
                new SqlParameter("@TrangThai", model.TrangThai ?? (object)DBNull.Value),
                new SqlParameter("@TongSoDon", (object?)model.TongSoDon ?? DBNull.Value),
                new SqlParameter("@SoDonHoanThanh", model.SoDonHoanThanh)
            });

            return result > 0;
        }

        public bool Delete(long id)
        {
            string sql = "DELETE FROM TuyenDuong WHERE Id = @Id";
            int result = _dbHelper.ExecuteNonQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@Id", id)
            });

            return result > 0;
        }

        public TuyenDuongModel GetDatabyID(long id)
        {
            string sql = "SELECT * FROM TuyenDuong WHERE Id = @Id";
            var dt = _dbHelper.ExecuteQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@Id", id)
            });

            if (dt.Rows.Count == 0) return null;

            var row = dt.Rows[0];
            return new TuyenDuongModel
            {
                Id = Convert.ToInt64(row["Id"]),
                MaTuyen = row["MaTuyen"] != DBNull.Value ? row["MaTuyen"].ToString() : null,
                IdTaiXe = row["IdTaiXe"] != DBNull.Value ? Convert.ToInt64(row["IdTaiXe"]) : 0,
                NgayGiaoHang = row["NgayGiaoHang"] != DBNull.Value ? Convert.ToDateTime(row["NgayGiaoHang"]) : DateTime.MinValue,
                TrangThai = row["TrangThai"] != DBNull.Value ? row["TrangThai"].ToString() : null,
                TongSoDon = row["TongSoDon"] != DBNull.Value ? Convert.ToInt32(row["TongSoDon"]) : (int?)null,
                SoDonHoanThanh = row["SoDonHoanThanh"] != DBNull.Value ? Convert.ToInt32(row["SoDonHoanThanh"]) : 0
            };
        }

        public List<TuyenDuongModel> Search(int pageIndex, int pageSize, out long total, string maTuyen, long? idTaiXe)
        {
            total = 0;
            int offset = (pageIndex - 1) * pageSize;

            // Convert empty string to null for proper SQL query
            maTuyen = string.IsNullOrWhiteSpace(maTuyen) ? null : maTuyen;

            string sql = @"
                        SELECT *, COUNT(*) OVER() AS RecordCount
                        FROM TuyenDuong
                        WHERE (@MaTuyen IS NULL OR MaTuyen LIKE '%' + @MaTuyen + '%')
                          AND (@IdTaiXe IS NULL OR IdTaiXe = @IdTaiXe)
                        ORDER BY Id DESC
                        OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

            var dt = _dbHelper.ExecuteQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@MaTuyen", (object)maTuyen ?? DBNull.Value),
                new SqlParameter("@IdTaiXe", (object?)idTaiXe ?? DBNull.Value),
                new SqlParameter("@Offset", offset),
                new SqlParameter("@PageSize", pageSize)
            });

            if (dt.Rows.Count > 0) total = Convert.ToInt64(dt.Rows[0]["RecordCount"]);

            var list = new List<TuyenDuongModel>();
            foreach (DataRow row in dt.Rows)
            {
                list.Add(new TuyenDuongModel
                {
                    Id = Convert.ToInt64(row["Id"]),
                    MaTuyen = row["MaTuyen"] != DBNull.Value ? row["MaTuyen"].ToString() : null,
                    IdTaiXe = row["IdTaiXe"] != DBNull.Value ? Convert.ToInt64(row["IdTaiXe"]) : 0,
                    NgayGiaoHang = row["NgayGiaoHang"] != DBNull.Value ? Convert.ToDateTime(row["NgayGiaoHang"]) : DateTime.MinValue,
                    TrangThai = row["TrangThai"] != DBNull.Value ? row["TrangThai"].ToString() : null,
                    TongSoDon = row["TongSoDon"] != DBNull.Value ? Convert.ToInt32(row["TongSoDon"]) : (int?)null,
                    SoDonHoanThanh = row["SoDonHoanThanh"] != DBNull.Value ? Convert.ToInt32(row["SoDonHoanThanh"]) : 0
                });
            }

            return list;
        }
    }
}
