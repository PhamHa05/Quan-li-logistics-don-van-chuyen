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
    public class NguoiDungRepository : INguoiDungRepository
    {
        private readonly IDatabaseHelper _dbHelper;

        public NguoiDungRepository(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public NguoiDungModel Login(string tenDangNhap, string matKhau)
        {
            string sql = @"SELECT * FROM NguoiDung 
                           WHERE TenDangNhap = @TenDangNhap AND MatKhau = @MatKhau";

            var dt = _dbHelper.ExecuteQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@TenDangNhap", tenDangNhap),
                new SqlParameter("@MatKhau", matKhau)
            });

            return dt.ConvertTo<NguoiDungModel>().FirstOrDefault();
        }

        public bool Create(NguoiDungModel model)
        {
            string sql = @"INSERT INTO NguoiDung
                          (HoTen, TenDangNhap, MatKhau, VaiTro, Email, SoDienThoai, DiaChi, TrangThai, NgayTao)
                          VALUES (@HoTen, @TenDangNhap, @MatKhau, @VaiTro, @Email, @SoDienThoai, @DiaChi, @TrangThai, @NgayTao)";

            int result = _dbHelper.ExecuteNonQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@HoTen", model.HoTen),
                new SqlParameter("@TenDangNhap", model.TenDangNhap),
                new SqlParameter("@MatKhau", model.MatKhau),
                new SqlParameter("@VaiTro", model.VaiTro),
                new SqlParameter("@Email", model.Email),
                new SqlParameter("@SoDienThoai", model.SoDienThoai ?? ""),
                new SqlParameter("@DiaChi", model.DiaChi ?? ""),
                new SqlParameter("@TrangThai", model.TrangThai ?? "HOAT_DONG"),
                new SqlParameter("@NgayTao", model.NgayTao)
            });

            return result > 0;
        }

        public bool Update(NguoiDungModel model)
        {
            string sql = @"UPDATE NguoiDung SET
                          HoTen = @HoTen,
                          MatKhau = @MatKhau,
                          VaiTro = @VaiTro,
                          Email = @Email,
                          SoDienThoai = @SoDienThoai,
                          DiaChi = @DiaChi,
                          TrangThai = @TrangThai
                          WHERE MaNguoiDung = @MaNguoiDung";

            int result = _dbHelper.ExecuteNonQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@MaNguoiDung", model.MaNguoiDung),
                new SqlParameter("@HoTen", model.HoTen),
                new SqlParameter("@MatKhau", model.MatKhau),
                new SqlParameter("@VaiTro", model.VaiTro),
                new SqlParameter("@Email", model.Email),
                new SqlParameter("@SoDienThoai", model.SoDienThoai ?? ""),
                new SqlParameter("@DiaChi", model.DiaChi ?? ""),
                new SqlParameter("@TrangThai", model.TrangThai ?? "HOAT_DONG")
            });

            return result > 0;
        }

        public bool Delete(int id)
        {
            string sql = "DELETE FROM NguoiDung WHERE MaNguoiDung = @MaNguoiDung";

            int result = _dbHelper.ExecuteNonQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@MaNguoiDung", id)
            });

            return result > 0;
        }

        public NguoiDungModel GetDatabyID(int id)
        {
            string sql = "SELECT * FROM NguoiDung WHERE MaNguoiDung = @MaNguoiDung";

            var dt = _dbHelper.ExecuteQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@MaNguoiDung", id)
            });

            return dt.ConvertTo<NguoiDungModel>().FirstOrDefault();
        }

        public List<NguoiDungModel> GetAll(string hoTen, string tenDangNhap)
        {
            string sql = @"SELECT * FROM NguoiDung
                           WHERE (@HoTen IS NULL OR HoTen LIKE '%' + @HoTen + '%')
                           AND (@TenDangNhap IS NULL OR TenDangNhap LIKE '%' + @TenDangNhap + '%')";

            var dt = _dbHelper.ExecuteQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@HoTen", (object)hoTen ?? DBNull.Value),
                new SqlParameter("@TenDangNhap", (object)tenDangNhap ?? DBNull.Value)
            });

            return dt.ConvertTo<NguoiDungModel>().ToList();
        }

        public bool UpdatePassword(int maNguoiDung, string matKhauMoi)
        {
            string sql = "UPDATE NguoiDung SET MatKhau = @MatKhau WHERE MaNguoiDung = @MaNguoiDung";

            int result = _dbHelper.ExecuteNonQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@MaNguoiDung", maNguoiDung),
                new SqlParameter("@MatKhau", matKhauMoi)
            });

            return result > 0;
        }

        public bool UpdateStatus(int maNguoiDung, string trangThai)
        {
            string sql = "UPDATE NguoiDung SET TrangThai = @TrangThai WHERE MaNguoiDung = @MaNguoiDung";

            int result = _dbHelper.ExecuteNonQuery(sql, new SqlParameter[]
            {
                new SqlParameter("@MaNguoiDung", maNguoiDung),
                new SqlParameter("@TrangThai", trangThai)
            });

            return result > 0;
        }
    }
}
