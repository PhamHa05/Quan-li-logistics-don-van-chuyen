using DAL;
using DAL.Helper;
using DAL.Interfaces;
using BLL;
using BLL.Interfaces;
using DAL.Helper.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IDiemGiaoHangRepository, DiemGiaoHangRepository>();
builder.Services.AddScoped<IDiemGiaoHangBusiness, DiemGiaoHangBusiness>();
builder.Services.AddScoped<IDatabaseHelper, DatabaseHelper>();
builder.Services.AddScoped<IDonVanChuyenRepository, DonVanChuyenRepository>();
builder.Services.AddScoped<IDonVanChuyenBusiness, DonVanChuyenBusiness>();
builder.Services.AddScoped<ITuyenDuongRepository, TuyenDuongRepository>();
builder.Services.AddScoped<IGiaoDichCODRepository, GiaoDichCODRepository>();
builder.Services.AddScoped<ITaiXeRepository, TaiXeRepository>();
builder.Services.AddScoped<ISuKienTrangThaiRepository, SuKienTrangThaiRepository>();
builder.Services.AddScoped<INguoiDungRepository, NguoiDungRepository>();
// ... đăng ký thêm các service khác nếu có

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();

app.Run();
