using F237.BLL.Services.Implementations;
using F237.BLL.Services.Interfaces;
using F237.DAL.Data;
using F237.DAL.Repositories.Implementations;
using F237.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

// EF Core + SQL Server
builder.Services.AddDbContext<F237DbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS pour React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Repositories
builder.Services.AddScoped<IEquipeRepository, EquipeRepository>();
builder.Services.AddScoped<IMatchRepository, MatchRepository>();
builder.Services.AddScoped<IJoueurRepository, JoueurRepository>();
builder.Services.AddScoped<IClassementRepository, ClassementRepository>();
builder.Services.AddScoped<IPariRepository, PariRepository>();

// Services
builder.Services.AddScoped<IEquipeService, EquipeService>();
builder.Services.AddScoped<IMatchService, MatchService>();
builder.Services.AddScoped<IJoueurService, JoueurService>();
builder.Services.AddScoped<IClassementService, ClassementService>();
builder.Services.AddScoped<IPariService, PariService>();

// ApiFootball Service
builder.Services.AddHttpClient<IApiFootballService, ApiFootballService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    //app.UseSwagger();
    //app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReact");
app.UseAuthorization();
app.MapControllers();

app.Run();