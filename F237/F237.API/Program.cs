using F237.API.Hubs;
using F237.API.Services;
using F237.BLL.Services.Implementations;
using F237.BLL.Services.Interfaces;
using F237.DAL.Data;
using F237.DAL.Repositories.Implementations;
using F237.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

// EF Core + SQL Server
builder.Services.AddDbContext<F237DbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS pour React — AllowCredentials() requis pour SignalR WebSocket
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5178", "http://localhost:5179")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
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

// ApiFootball Service (existant)
builder.Services.AddHttpClient<IApiFootballService, ApiFootballService>();

// HttpClient nommé pour EquipesController + LiveScoreService
builder.Services.AddHttpClient("ApiFootball", client =>
{
    client.BaseAddress = new Uri("https://v3.football.api-sports.io/");
    client.DefaultRequestHeaders.Add(
        "x-apisports-key", "e728d2eec6983f078956a4d692a77d26");
    client.Timeout = TimeSpan.FromSeconds(15);
});

// SignalR
builder.Services.AddSignalR();

// Background Service scores live
builder.Services.AddHostedService<LiveScoreService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // app.UseSwagger();
    // app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseCors("AllowReact");
app.UseAuthorization();
app.MapControllers();

// Hub SignalR
app.MapHub<ScoresHub>("/hubs/scores");

app.Run();