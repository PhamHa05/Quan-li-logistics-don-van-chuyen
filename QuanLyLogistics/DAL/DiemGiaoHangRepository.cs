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
    public class DiemGiaoHangRepository : IDiemGiaoHangRepository
    {
        private readonly IDatabaseHelper _dbHelper;

        public DiemGiaoHangRepository(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public bool Create(DiemGiaoHangModel model)
        {
            try
            {
                var sql = @"
                INSERT INTO DiemGiaoHang (IdTuyenDuong, IdDonVanChuyen, ThuTuDung, ThoiGianDuKien, TrangThai)
                VALUES (@IdTuyenDuong, @IdDonVanChuyen, @ThuTuDung, @ThoiGianDuKien, @TrangThai);";

                var result = _dbHelper.ExecuteNonQuery(sql, new SqlParameter[]
                {
                    new SqlParameter("@IdTuyenDuong", model.IdTuyenDuong),
                    new SqlParameter("@IdDonVanChuyen", model.IdDonVanChuyen),
                    new SqlParameter("@ThuTuDung", (object?)model.ThuTuDung ?? DBNull.Value),
                    new SqlParameter("@ThoiGianDuKien", (object?)model.ThoiGianDuKien ?? DBNull.Value),
                    new SqlParameter("@TrangThai", (object?)model.TrangThai ?? DBNull.Value)
                });

                return result > 0;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in Create DiemGiaoHang", ex);
            }
        }

        public bool Delete(long id)
        {
            try
            {
                var sql = "DELETE FROM DiemGiaoHang WHERE id = @id";

                var result = _dbHelper.ExecuteNonQuery(sql, new SqlParameter[]
                {
            new SqlParameter("@id", id)
                });

                return result > 0;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in Delete DiemGiaoHang", ex);
            }
        }

        public bool Update(DiemGiaoHangModel model)
        {
            try
            {
                var sql = @"
                UPDATE DiemGiaoHang
                SET ThuTuDung = @ThuTuDung,
                    ThoiGianDuKien = @ThoiGianDuKien,
                    ThoiGianThucTe = @ThoiGianThucTe,
                    TrangThai = @TrangThai
                WHERE Id = @Id;";

                var result = _dbHelper.ExecuteNonQuery(sql, new SqlParameter[]
                {
                    new SqlParameter("@Id", model.Id),
                    new SqlParameter("@ThuTuDung", (object?)model.ThuTuDung ?? DBNull.Value),
                    new SqlParameter("@ThoiGianDuKien", (object?)model.ThoiGianDuKien ?? DBNull.Value),
                    new SqlParameter("@ThoiGianThucTe", (object?)model.ThoiGianThucTe ?? DBNull.Value),
                    new SqlParameter("@TrangThai", (object?)model.TrangThai ?? DBNull.Value)
                });

                return result > 0;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in Update DiemGiaoHang", ex);
            }
        }

        public List<DiemGiaoHangModel> GetByTuyenDuongId(long tuyenDuongId)
        {
            try
            {
                var sql = "SELECT * FROM DiemGiaoHang WHERE IdTuyenDuong = @IdTuyenDuong ORDER BY ThuTuDung ASC";
                var param = new SqlParameter[]
                {
                    new SqlParameter("@IdTuyenDuong", SqlDbType.BigInt) { Value = tuyenDuongId }
                };

                var dt = _dbHelper.ExecuteQuery(sql, param);
                //return dt.ConvertTo<DiemGiaoHangModel>().ToList();
                var list = new List<DiemGiaoHangModel>();
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new DiemGiaoHangModel
                    {
                        Id = Convert.ToInt64(row["Id"]),
                        IdTuyenDuong = Convert.ToInt64(row["IdTuyenDuong"]),
                        IdDonVanChuyen = Convert.ToInt64(row["IdDonVanChuyen"]),
                        ThuTuDung = row["ThuTuDung"] != DBNull.Value ? Convert.ToInt32(row["ThuTuDung"]) : (int?)null,
                        ThoiGianDuKien = row["ThoiGianDuKien"] != DBNull.Value ? (TimeSpan?)row["ThoiGianDuKien"] : null,
                        ThoiGianThucTe = row["ThoiGianThucTe"] != DBNull.Value ? (TimeSpan?)row["ThoiGianThucTe"] : null,
                        TrangThai = row["TrangThai"].ToString()
                    });
                }
                return list;

            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetByTuyenDuongId DiemGiaoHang", ex);
            }
        }



    }
}
