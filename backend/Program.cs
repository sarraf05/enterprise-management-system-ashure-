using Microsoft.EntityFrameworkCore;
using Ashure.Backend.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Controller Servisleri
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. CORS Yapılandırması: Frontend bağlantısına tam izin
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://localhost:4173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// 3. Veritabanı Yolu ve EF Core SQLite Yapılandırması
// Veritabanı dosyası: /database/azure_clone.db
var rootDirectory = Directory.GetParent(builder.Environment.ContentRootPath)?.FullName
                    ?? builder.Environment.ContentRootPath;
var databaseFolder = Path.Combine(rootDirectory, "database");

if (!Directory.Exists(databaseFolder))
{
    Directory.CreateDirectory(databaseFolder);
}

var dbPath = Path.Combine(databaseFolder, "azure_clone.db");
var connectionString = $"Data Source={dbPath}";

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlite(connectionString);
});

var app = builder.Build();

// 4. Veritabanını Başlat ve Seed Verilerini Ekle
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    DbInitializer.Initialize(context);
}

// 5. HTTP Pipeline
if (app.Environment.IsDevelopment() || true) // Geliştirme kolaylığı için Swagger her zaman aktif
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ASHURE API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
