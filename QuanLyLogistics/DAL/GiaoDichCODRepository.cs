using DAL.Helper.Interfaces;
using DAL.Interfaces;
using Microsoft.Data.SqlClient;
using Models;
using System;
using System.Data;

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
            try
            {
                string sql = @"
                    INSERT INTO GiaoDichCOD (IdDonVanChuyen, SoTienDuKien, TrangThaiThanhToan, DaDoiSoat)
                    VALUES (@IdDonVanChuyen, @SoTienDuKien, @TrangThaiThanhToan, @DaDoiSoat)";

                var parameters = new SqlParameter[]
                {
                    new SqlParameter("@IdDonVanChuyen", model.IdDonVanChuyen),
                    new SqlParameter("@SoTienDuKien", model.SoTienDuKien),
                    new SqlParameter("@TrangThaiThanhToan", (object?)model.TrangThaiThanhToan ?? DBNull.Value),
                    new SqlParameter("@DaDoiSoat", model.DaDoiSoat)
                };

                int result = _dbHelper.ExecuteNonQuery(sql, parameters);
                return result > 0;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in Create GiaoDichCOD", ex);
            }
        }

        public bool Update(GiaoDichCODModel model)
        {
            try
            {
                string sql = @"
                    UPDATE GiaoDichCOD
                    SET SoTienThucTe = @SoTienThucTe,
                        ThoiGianThuTien = @ThoiGianThuTien,
                        DaDoiSoat = @DaDoiSoat,
                        TrangThaiThanhToan = @TrangThaiThanhToan
                    WHERE Id = @Id";

                var parameters = new SqlParameter[]
                {
                    new SqlParameter("@Id", model.Id),
                    new SqlParameter("@SoTienThucTe", (object?)model.SoTienThucTe ?? DBNull.Value),
                    new SqlParameter("@ThoiGianThuTien", (object?)model.ThoiGianThuTien ?? DBNull.Value),
                    new SqlParameter("@DaDoiSoat", model.DaDoiSoat),
                    new SqlParameter("@TrangThaiThanhToan", (object?)model.TrangThaiThanhToan ?? DBNull.Value)
                };

                int result = _dbHelper.ExecuteNonQuery(sql, parameters);
                return result > 0;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in Update GiaoDichCOD", ex);
            }
        }

        public GiaoDichCODModel GetByDonVanChuyenId(long donVanChuyenId)
        {
            try
            {
                string sql = "SELECT * FROM GiaoDichCOD WHERE IdDonVanChuyen = @IdDonVanChuyen";
                var parameters = new SqlParameter[]
                {
                    new SqlParameter("@IdDonVanChuyen", donVanChuyenId)
                };

                var dt = _dbHelper.ExecuteQuery(sql, parameters);

                if (dt.Rows.Count == 0) return null;

                var row = dt.Rows[0];
                return new GiaoDichCODModel
                {
                    Id = Convert.ToInt64(row["Id"]),
                    IdDonVanChuyen = Convert.ToInt64(row["IdDonVanChuyen"]),
                    SoTienDuKien = Convert.ToDecimal(row["SoTienDuKien"]),
                    SoTienThucTe = row["SoTienThucTe"] != DBNull.Value ? Convert.ToDecimal(row["SoTienThucTe"]) : (decimal?)null,
                    ThoiGianThuTien = row["ThoiGianThuTien"] != DBNull.Value ? Convert.ToDateTime(row["ThoiGianThuTien"]) : (DateTime?)null,
                    DaDoiSoat = Convert.ToBoolean(row["DaDoiSoat"]),
                    TrangThaiThanhToan = row["TrangThaiThanhToan"].ToString()
                };
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetByDonVanChuyenId GiaoDichCOD", ex);
            }
        }
    }
}
