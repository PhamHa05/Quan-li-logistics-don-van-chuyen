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
    public class DonVanChuyenRepository : IDonVanChuyenRepository
    {
        private readonly IDatabaseHelper _dbHelper;

        public DonVanChuyenRepository(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        private readonly string[] allowedStatus = { "CHO_LAY_HANG", "DANG_GIAO", "HOAN_THANH" };

        public bool Create(DonVanChuyenModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));

            if (string.IsNullOrEmpty(model.TrangThai) || !allowedStatus.Contains(model.TrangThai))
                model.TrangThai = "CHO_LAY_HANG";

            model.ThoiGianTao = DateTime.Now;
            model.ThoiGianCapNhat = DateTime.Now;

            string sql = @"
                INSERT INTO DonVanChuyen
                (MaVanDon, TenNguoiGui, SdtNguoiGui, DiaChiLayHang,
                 TenNguoiNhan, SdtNguoiNhan, DiaChiGiaoHang, LoaiHang,
                 KhoiLuong, TienThuHo, LoaiDichVu, TrangThai,
                 IdTaiXe, IdTuyenDuong, ThoiGianTao, ThoiGianCapNhat)
                VALUES
                (@MaVanDon, @TenNguoiGui, @SdtNguoiGui, @DiaChiLayHang,
                 @TenNguoiNhan, @SdtNguoiNhan, @DiaChiGiaoHang, @LoaiHang,
                 @KhoiLuong, @TienThuHo, @LoaiDichVu, @TrangThai,
                 @IdTaiXe, @IdTuyenDuong, @ThoiGianTao, @ThoiGianCapNhat)";

            var result = _dbHelper.ExecuteNonQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@MaVanDon", model.MaVanDon ?? (object)DBNull.Value),
                new SqlParameter("@TenNguoiGui", model.TenNguoiGui ?? (object)DBNull.Value),
                new SqlParameter("@SdtNguoiGui", model.SdtNguoiGui ?? (object)DBNull.Value),
                new SqlParameter("@DiaChiLayHang", model.DiaChiLayHang ?? (object)DBNull.Value),
                new SqlParameter("@TenNguoiNhan", model.TenNguoiNhan ?? (object)DBNull.Value),
                new SqlParameter("@SdtNguoiNhan", model.SdtNguoiNhan ?? (object)DBNull.Value),
                new SqlParameter("@DiaChiGiaoHang", model.DiaChiGiaoHang ?? (object)DBNull.Value),
                new SqlParameter("@LoaiHang", model.LoaiHang ?? (object)DBNull.Value),
                new SqlParameter("@KhoiLuong", model.KhoiLuong),
                new SqlParameter("@TienThuHo", model.TienThuHo),
                new SqlParameter("@LoaiDichVu", model.LoaiDichVu ?? (object)DBNull.Value),
                new SqlParameter("@TrangThai", model.TrangThai),
                new SqlParameter("@IdTaiXe", model.IdTaiXe.HasValue ? (object)model.IdTaiXe.Value : DBNull.Value),
                new SqlParameter("@IdTuyenDuong", model.IdTuyenDuong.HasValue ? (object)model.IdTuyenDuong.Value : DBNull.Value),
                new SqlParameter("@ThoiGianTao", model.ThoiGianTao),
                new SqlParameter("@ThoiGianCapNhat", model.ThoiGianCapNhat)
            });

            return result > 0;
        }

        public bool Update(DonVanChuyenModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));

            if (string.IsNullOrEmpty(model.TrangThai) || !allowedStatus.Contains(model.TrangThai))
                throw new Exception($"TrangThai không hợp lệ. Chỉ được phép: {string.Join(", ", allowedStatus)}");

            model.ThoiGianCapNhat = DateTime.Now;

            string sql = @"
                UPDATE DonVanChuyen
                SET MaVanDon = @MaVanDon,
                    TenNguoiGui = @TenNguoiGui,
                    SdtNguoiGui = @SdtNguoiGui,
                    DiaChiLayHang = @DiaChiLayHang,
                    TenNguoiNhan = @TenNguoiNhan,
                    SdtNguoiNhan = @SdtNguoiNhan,
                    DiaChiGiaoHang = @DiaChiGiaoHang,
                    LoaiHang = @LoaiHang,
                    KhoiLuong = @KhoiLuong,
                    TienThuHo = @TienThuHo,
                    LoaiDichVu = @LoaiDichVu,
                    TrangThai = @TrangThai,
                    IdTaiXe = @IdTaiXe,
                    IdTuyenDuong = @IdTuyenDuong,
                    ThoiGianCapNhat = @ThoiGianCapNhat
                WHERE Id = @Id";

            var result = _dbHelper.ExecuteNonQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@Id", model.Id),
                new SqlParameter("@MaVanDon", model.MaVanDon ?? (object)DBNull.Value),
                new SqlParameter("@TenNguoiGui", model.TenNguoiGui ?? (object)DBNull.Value),
                new SqlParameter("@SdtNguoiGui", model.SdtNguoiGui ?? (object)DBNull.Value),
                new SqlParameter("@DiaChiLayHang", model.DiaChiLayHang ?? (object)DBNull.Value),
                new SqlParameter("@TenNguoiNhan", model.TenNguoiNhan ?? (object)DBNull.Value),
                new SqlParameter("@SdtNguoiNhan", model.SdtNguoiNhan ?? (object)DBNull.Value),
                new SqlParameter("@DiaChiGiaoHang", model.DiaChiGiaoHang ?? (object)DBNull.Value),
                new SqlParameter("@LoaiHang", model.LoaiHang ?? (object)DBNull.Value),
                new SqlParameter("@KhoiLuong", model.KhoiLuong),
                new SqlParameter("@TienThuHo", model.TienThuHo),
                new SqlParameter("@LoaiDichVu", model.LoaiDichVu ?? (object)DBNull.Value),
                new SqlParameter("@TrangThai", model.TrangThai),
                new SqlParameter("@IdTaiXe", model.IdTaiXe.HasValue ? (object)model.IdTaiXe.Value : DBNull.Value),
                new SqlParameter("@IdTuyenDuong", model.IdTuyenDuong.HasValue ? (object)model.IdTuyenDuong.Value : DBNull.Value),
                new SqlParameter("@ThoiGianCapNhat", model.ThoiGianCapNhat)
            });

            return result > 0;
        }

        public bool Delete(long id)
        {
            string sql = "DELETE FROM DonVanChuyen WHERE Id = @Id";
            var result = _dbHelper.ExecuteNonQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@Id", id)
            });
            return result > 0;
        }

        public DonVanChuyenModel GetDatabyID(long id)
        {
            string sql = "SELECT * FROM DonVanChuyen WHERE Id = @Id";
            var dt = _dbHelper.ExecuteQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@Id", id)
            });
            return dt.ConvertTo<DonVanChuyenModel>().FirstOrDefault();
        }

        public List<DonVanChuyenModel> Search(int pageIndex, int pageSize, out long total, string maVanDon, string trangThai)
        {
            total = 0;
            int offset = (pageIndex - 1) * pageSize;

            string sql = @"
                SELECT *, COUNT(*) OVER() AS RecordCount
                FROM DonVanChuyen
                WHERE (@maVanDon IS NULL OR MaVanDon LIKE '%' + @maVanDon + '%')
                  AND (@trangThai IS NULL OR TrangThai = @trangThai)
                ORDER BY Id DESC
                OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

            var dt = _dbHelper.ExecuteQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@maVanDon", (object)maVanDon ?? DBNull.Value),
                new SqlParameter("@trangThai", (object)trangThai ?? DBNull.Value),
                new SqlParameter("@Offset", offset),
                new SqlParameter("@PageSize", pageSize)
            });

            if (dt.Rows.Count > 0) total = Convert.ToInt64(dt.Rows[0]["RecordCount"]);
            return dt.ConvertTo<DonVanChuyenModel>().ToList();
        }
    }
}
