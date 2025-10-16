using Microsoft.EntityFrameworkCore;
using Models;

namespace DAL
{
    internal class LogisticsDbContext : DbContext
    {
        public LogisticsDbContext(DbContextOptions<LogisticsDbContext> options)
            : base(options)
        { }

        public DbSet<NguoiDungModel> NguoiDung { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<NguoiDungModel>(entity =>
            {
                entity.ToTable("NguoiDung");
                entity.HasKey(e => e.MaNguoiDung);
                entity.Property(e => e.MaNguoiDung).HasColumnName("MaNguoiDung");
                entity.Property(e => e.HoTen).HasColumnName("HoTen").HasMaxLength(100).IsRequired();
                entity.Property(e => e.TenDangNhap).HasColumnName("TenDangNhap").HasMaxLength(50).IsRequired();
                entity.Property(e => e.MatKhau).HasColumnName("MatKhau").HasMaxLength(255).IsRequired();
                entity.Property(e => e.VaiTro).HasColumnName("VaiTro").HasMaxLength(50);
                entity.Property(e => e.Email).HasColumnName("Email").HasMaxLength(100);
                entity.Property(e => e.SoDienThoai).HasColumnName("SoDienThoai").HasMaxLength(20);
                entity.Property(e => e.DiaChi).HasColumnName("DiaChi").HasMaxLength(255);
                entity.Property(e => e.NgayTao).HasColumnName("NgayTao").HasDefaultValueSql("GETDATE()");
                entity.HasIndex(e => e.TenDangNhap).IsUnique();
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}