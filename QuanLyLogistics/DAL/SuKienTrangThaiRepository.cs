using DAL.Helper.Interfaces;
using DAL.Interfaces;
using Models;
using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;

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
            try
            {
                string sql = @"
                    INSERT INTO SuKienTrangThai
                    (
                        IdDonVanChuyen,
                        TrangThaiCu,
                        TrangThaiMoi,
                        ThoiGianSuKien,
                        GhiChu,
                        UrlAnhKyNhan,
                        UrlChuKy,
                        MaYeuCau
                    )
                    VALUES
                    (
                        @IdDonVanChuyen,
                        @TrangThaiCu,
                        @TrangThaiMoi,
                        GETDATE(),
                        @GhiChu,
                        @UrlAnhKyNhan,
                        @UrlChuKy,
                        @MaYeuCau
                    )";

                var parameters = new SqlParameter[]
                {
                    new SqlParameter("@IdDonVanChuyen", model.IdDonVanChuyen),
                    new SqlParameter("@TrangThaiCu", (object?)model.TrangThaiCu ?? DBNull.Value),
                    new SqlParameter("@TrangThaiMoi", (object?)model.TrangThaiMoi ?? DBNull.Value),
                    new SqlParameter("@GhiChu", (object?)model.GhiChu ?? DBNull.Value),
                    new SqlParameter("@UrlAnhKyNhan", (object?)model.UrlAnhKyNhan ?? DBNull.Value),
                    new SqlParameter("@UrlChuKy", (object?)model.UrlChuKy ?? DBNull.Value),
                    new SqlParameter("@MaYeuCau", (object?)model.MaYeuCau ?? DBNull.Value)
                };

                int rows = _dbHelper.ExecuteNonQuery(sql, parameters);
                return rows > 0;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi tạo sự kiện trạng thái: " + ex.Message, ex);
            }
        }

        public List<SuKienTrangThaiModel> GetHistoryByDonVanChuyenID(long donVanChuyenId)
        {
            try
            {
                string sql = @"
                    SELECT 
                        Id,
                        IdDonVanChuyen,
                        TrangThaiCu,
                        TrangThaiMoi,
                        ThoiGianSuKien,
                        GhiChu,
                        UrlAnhKyNhan,
                        UrlChuKy,
                        MaYeuCau
                    FROM SuKienTrangThai
                    WHERE IdDonVanChuyen = @IdDonVanChuyen
                    ORDER BY ThoiGianSuKien DESC";

                var parameters = new SqlParameter[]
                {
                    new SqlParameter("@IdDonVanChuyen", donVanChuyenId)
                };

                DataTable dt = _dbHelper.ExecuteQuery(sql, parameters);

                var list = new List<SuKienTrangThaiModel>();
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new SuKienTrangThaiModel
                    {
                        Id = Convert.ToInt64(row["Id"]),
                        IdDonVanChuyen = Convert.ToInt64(row["IdDonVanChuyen"]),
                        TrangThaiCu = row["TrangThaiCu"]?.ToString(),
                        TrangThaiMoi = row["TrangThaiMoi"]?.ToString(),
                        ThoiGianSuKien = row["ThoiGianSuKien"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(row["ThoiGianSuKien"]),
                        GhiChu = row["GhiChu"]?.ToString(),
                        UrlAnhKyNhan = row["UrlAnhKyNhan"]?.ToString(),
                        UrlChuKy = row["UrlChuKy"]?.ToString(),
                        MaYeuCau = row["MaYeuCau"]?.ToString()
                    });
                }

                return list;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi lấy lịch sử sự kiện trạng thái: " + ex.Message, ex);
            }
        }
    }
}
