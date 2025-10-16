using BLL;
using BLL.Interfaces;
using DAL;
using DAL.Helper;
using DAL.Helper.Interfaces;
using DAL.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Đăng ký các dịch vụ DAL (phải có trước)
builder.Services.AddTransient<IDatabaseHelper, DatabaseHelper>();
builder.Services.AddTransient<INguoiDungRepository, NguoiDungRepository>();
builder.Services.AddTransient<ITaiXeRepository, TaiXeRepository>();
builder.Services.AddTransient<IDonVanChuyenRepository, DonVanChuyenRepository>();
builder.Services.AddTransient<ITuyenDuongRepository, TuyenDuongRepository>();
builder.Services.AddTransient<IDiemGiaoHangRepository, DiemGiaoHangRepository>();
builder.Services.AddTransient<ISuKienTrangThaiRepository, SuKienTrangThaiRepository>();
builder.Services.AddTransient<IGiaoDichCODRepository, GiaoDichCODRepository>();


// Đăng ký các dịch vụ BLL
builder.Services.AddTransient<INguoiDungBusiness, NguoiDungBusiness>();
builder.Services.AddTransient<ITaiXeBusiness, TaiXeBusiness>();
builder.Services.AddTransient<IDonVanChuyenBusiness, DonVanChuyenBusiness>();
builder.Services.AddTransient<ITuyenDuongBusiness, TuyenDuongBusiness>();
builder.Services.AddTransient<IDiemGiaoHangBusiness, DiemGiaoHangBusiness>();
builder.Services.AddTransient<ISuKienTrangThaiBusiness, SuKienTrangThaiBusiness>();
builder.Services.AddTransient<IGiaoDichCODBusiness, GiaoDichCODBusiness>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
