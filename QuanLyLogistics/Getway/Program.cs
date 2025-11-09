using Microsoft.AspNetCore.Http;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

// load ocelot configuration early
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register Ocelot services
builder.Services.AddOcelot();

// Common helpers Ocelot / middleware might need
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

// optional: open CORS for development (remove or tighten rules for production)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline (dev)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

// Start Ocelot pipeline and then run the app
await app.UseOcelot();

await app.RunAsync();
