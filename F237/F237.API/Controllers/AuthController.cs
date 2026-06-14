// F237.API/Controllers/AuthController.cs

using F237.API.DTOs;
using F237.DAL.Data;
using F237.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace F237.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly F237DbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(F237DbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST /api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
        {
            // Vérifier si email déjà utilisé
            if (await _context.Utilisateurs.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new { message = "Cet email est déjà utilisé." });

            // Hasher le mot de passe
            var hash = HashMotDePasse(dto.MotDePasse);

            // Créer l'utilisateur
            var utilisateur = new Utilisateur
            {
                Nom = dto.Nom,
                Prenom = dto.Prenom,
                Email = dto.Email,
                MotDePasseHash = hash,
                SoldePoints = 1000, // Bonus de bienvenue !
                DateInscription = DateTime.UtcNow,
                EstActif = true
            };

            _context.Utilisateurs.Add(utilisateur);
            await _context.SaveChangesAsync();

            // Créer transaction bonus bienvenue
            var transaction = new Transaction
            {
                UtilisateurId = utilisateur.Id,
                Montant = 1000,
                Type = "Bonus",
                Description = "Bonus de bienvenue",
                DateTransaction = DateTime.UtcNow
            };
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            // Générer token JWT
            var token = GenererToken(utilisateur);
            var expiration = DateTime.UtcNow.AddHours(
                _configuration.GetValue<int>("Jwt:ExpirationHours"));

            return Ok(new AuthResponseDto
            {
                Token = token,
                Nom = utilisateur.Nom,
                Prenom = utilisateur.Prenom,
                Email = utilisateur.Email,
                SoldePoints = utilisateur.SoldePoints,
                Expiration = expiration
            });
        }

        // POST /api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
        {
            var utilisateur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Email == dto.Email && u.EstActif);

            if (utilisateur == null)
                return Unauthorized(new { message = "Email ou mot de passe incorrect." });

            if (!VerifierMotDePasse(dto.MotDePasse, utilisateur.MotDePasseHash))
                return Unauthorized(new { message = "Email ou mot de passe incorrect." });

            var token = GenererToken(utilisateur);
            var expiration = DateTime.UtcNow.AddHours(
                _configuration.GetValue<int>("Jwt:ExpirationHours"));

            return Ok(new AuthResponseDto
            {
                Token = token,
                Nom = utilisateur.Nom,
                Prenom = utilisateur.Prenom,
                Email = utilisateur.Email,
                SoldePoints = utilisateur.SoldePoints,
                Expiration = expiration
            });
        }

        // GET /api/auth/profil
        [HttpGet("profil")]
        [Authorize]
        public async Task<ActionResult<UtilisateurProfilDto>> GetProfil()
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var utilisateur = await _context.Utilisateurs
                .Include(u => u.Paris)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (utilisateur == null) return NotFound();

            // Calcul stats
            var nbParis = utilisateur.Paris.Count;
            var nbGagnes = utilisateur.Paris.Count(p =>
                p.Statut == F237.Domain.Enums.StatutPariEnum.Gagné);
            var taux = nbParis > 0 ? (nbGagnes * 100 / nbParis) : 0;

            // Classement général
            var classement = await _context.Utilisateurs
                .CountAsync(u => u.SoldePoints > utilisateur.SoldePoints) + 1;

            return Ok(new UtilisateurProfilDto
            {
                Id = utilisateur.Id,
                Nom = utilisateur.Nom,
                Prenom = utilisateur.Prenom,
                Email = utilisateur.Email,
                SoldePoints = utilisateur.SoldePoints,
                DateInscription = utilisateur.DateInscription,
                NbParis = nbParis,
                NbParisGagnes = nbGagnes,
                TauxReussite = taux,
                ClassementGeneral = classement
            });
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private string GenererToken(Utilisateur utilisateur)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, utilisateur.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, utilisateur.Email),
                new Claim("nom", utilisateur.Nom),
                new Claim("prenom", utilisateur.Prenom),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var expiration = DateTime.UtcNow.AddHours(
                _configuration.GetValue<int>("Jwt:ExpirationHours"));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expiration,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string HashMotDePasse(string motDePasse)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(motDePasse));
            return Convert.ToBase64String(bytes);
        }

        private static bool VerifierMotDePasse(string motDePasse, string hash)
        {
            return HashMotDePasse(motDePasse) == hash;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
            return claim != null ? int.Parse(claim.Value) : 0;
        }
    }
}