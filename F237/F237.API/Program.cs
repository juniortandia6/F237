using F237.API.Hubs;
using F237.API.Services;
using F237.BLL.Services.Implementations;
using F237.BLL.Services.Interfaces;
using F237.DAL.Data;
using F237.DAL.Repositories.Implementations;
using F237.DAL.Repositories.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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
        policy.WithOrigins(
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:5176",
            "http://localhost:5177",
            "http://localhost:5178",
            "http://localhost:5179",
            "http://localhost:5180",
            "http://localhost:5181"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// ── JWT Authentication 
// La clé de signature vient des user-secrets (local) ou des variables d'environnement (production)
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 32)
    throw new InvalidOperationException(
        "Jwt:Key manquante ou trop courte (32 octets minimum) : ajoute-la avec dotnet user-secrets.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;
var jwtAudience = builder.Configuration["Jwt:Audience"]!;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

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
// La clé vient de la configuration (user-secrets en local, variables d'environnement en production)
var apiFootballKey = builder.Configuration["ApiFootball:ApiKey"]
    ?? throw new InvalidOperationException("ApiFootball:ApiKey manquante : ajoute-la avec dotnet user-secrets.");
var apiFootballUrl = builder.Configuration["ApiFootball:BaseUrl"] ?? "https://v3.football.api-sports.io/";

builder.Services.AddHttpClient("ApiFootball", client =>
{
    client.BaseAddress = new Uri(apiFootballUrl);
    client.DefaultRequestHeaders.Add("x-apisports-key", apiFootballKey);
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

//  Authentication AVANT Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Hub SignalR
app.MapHub<ScoresHub>("/hubs/scores");

app.Run();