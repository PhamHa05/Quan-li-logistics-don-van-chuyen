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

// Đăng ký SuKienTrangThai
builder.Services.AddScoped<ISuKienTrangThaiRepository, SuKienTrangThaiRepository>();
builder.Services.AddScoped<ISuKienTrangThaiBusiness, SuKienTrangThaiBusiness>();

// Đăng ký GiaoDichCOD
builder.Services.AddScoped<IGiaoDichCODRepository, GiaoDichCODRepository>();
builder.Services.AddScoped<IGiaoDichCODBusiness, GiaoDichCODBusiness>();

builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    }
    
    );

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    options.JsonSerializerOptions.Converters.Add(
        new System.Text.Json.Serialization.JsonStringEnumConverter());
});


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Logistics API", Version = "v1" });
    c.DocInclusionPredicate((docName, apiDesc) =>
        apiDesc.ActionDescriptor.DisplayName?.Contains("Controllers") == true);
});   

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
