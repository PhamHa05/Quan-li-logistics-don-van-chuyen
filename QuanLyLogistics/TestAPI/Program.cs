using BLL;
using BLL.Interfaces;
using DAL;
using DAL.Helper;
using DAL.Helper.Interfaces;
using DAL.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// ??ng ký Database Helper
builder.Services.AddScoped<IDatabaseHelper, DatabaseHelper>();

// Đăng ký các dịch vụ tầng DAL
builder.Services.AddScoped<INguoiDungRepository, NguoiDungRepository>();

// Đăng ký các dịch vụ tầng BLL
builder.Services.AddScoped<INguoiDungBusiness, NguoiDungBusiness>();


// Đăng ký Repository & Business cho Tài Xế
builder.Services.AddTransient<ITaiXeRepository, TaiXeRepository>();
builder.Services.AddTransient<ITaiXeBusiness, TaiXeBusiness>();

// Đăng ký DiemGiaoHang
builder.Services.AddScoped<IDiemGiaoHangRepository, DiemGiaoHangRepository>();
builder.Services.AddScoped<IDiemGiaoHangBusiness, DiemGiaoHangBusiness>();

// Đăng ký TuyenDuong
builder.Services.AddScoped<ITuyenDuongRepository, TuyenDuongRepository>();
builder.Services.AddScoped<ITuyenDuongBusiness, TuyenDuongBusiness>();

// Đăng ký DonVanChuyen
builder.Services.AddScoped<IDonVanChuyenRepository, DonVanChuyenRepository>();
builder.Services.AddScoped<IDonVanChuyenBusiness, DonVanChuyenBusiness>();

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
