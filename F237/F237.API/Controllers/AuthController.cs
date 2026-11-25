// F237.API/Controllers/AuthController.cs

using F237.API.DTOs;
using F237.DAL.Data;
using F237.Domain.Entities;
using Google.Apis.Auth;
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
            // Mot de passe : 8 caractères minimum
            if (string.IsNullOrWhiteSpace(dto.MotDePasse) || dto.MotDePasse.Length < 8)
                return BadRequest(new { message = "Le mot de passe doit contenir au moins 8 caractères." });

            // Vérifier si email déjà utilisé
            if (await _context.Utilisateurs.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new { message = "Cet email est déjà utilisé." });

            // Hasher le mot de passe
            var hash = HashMotDePasse(dto.MotDePasse);

            var utilisateur = await CreerUtilisateurAsync(dto.Nom, dto.Prenom, dto.Email, hash, googleId: null);
            return Ok(Reponse(utilisateur));
        }

        // POST /api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
        {
            var utilisateur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Email == dto.Email && u.EstActif);

            if (utilisateur == null)
                return Unauthorized(new { message = "Email ou mot de passe incorrect." });

            // Compte créé avec Google : pas de mot de passe F237
            if (string.IsNullOrEmpty(utilisateur.MotDePasseHash) && utilisateur.GoogleId != null)
                return Unauthorized(new { message = "Ce compte utilise la connexion Google : clique sur « Continuer avec Google »." });

            if (!VerifierMotDePasse(dto.MotDePasse, utilisateur.MotDePasseHash))
                return Unauthorized(new { message = "Email ou mot de passe incorrect." });

            // Migration douce : un ancien hash SHA-256 est remplacé par un hash BCrypt
            // dès que l'utilisateur se connecte avec le bon mot de passe
            if (!EstHashBCrypt(utilisateur.MotDePasseHash))
            {
                utilisateur.MotDePasseHash = HashMotDePasse(dto.MotDePasse);
                await _context.SaveChangesAsync();
            }

            return Ok(Reponse(utilisateur));
        }

        // POST /api/auth/google   { "credential": "<jeton d'identité renvoyé par le bouton Google>" }
        // Connexion OU inscription en un seul geste :
        //  1. on vérifie le jeton auprès de Google (signature, expiration, et qu'il a bien été émis pour NOTRE Client ID) ;
        //  2. compte déjà relié à ce Google -> connexion ;
        //  3. sinon, compte existant avec le même email (vérifié par Google) -> on relie puis connexion ;
        //  4. sinon -> création du compte (+ 1 000 points de bienvenue, comme une inscription classique).
        [HttpPost("google")]
        public async Task<ActionResult<AuthResponseDto>> ConnexionGoogle([FromBody] GoogleConnexionDto dto)
        {
            var clientId = _configuration["Google:ClientId"];
            if (string.IsNullOrWhiteSpace(clientId))
                return StatusCode(503, new { message = "Connexion Google non configurée sur le serveur (Google:ClientId)." });
            if (string.IsNullOrWhiteSpace(dto.Credential))
                return BadRequest(new { message = "Jeton Google manquant." });

            GoogleJsonWebSignature.Payload infos;
            try
            {
                infos = await GoogleJsonWebSignature.ValidateAsync(dto.Credential,
                    new GoogleJsonWebSignature.ValidationSettings { Audience = new[] { clientId } });
            }
            catch (InvalidJwtException)
            {
                return Unauthorized(new { message = "Connexion Google refusée : jeton invalide ou expiré. Réessaie." });
            }

            // Sans email vérifié, impossible de savoir à qui appartient l'adresse : on refuse
            if (string.IsNullOrWhiteSpace(infos.Email) || !infos.EmailVerified)
                return Unauthorized(new { message = "Ton adresse Google n'est pas vérifiée : connecte-toi avec email et mot de passe." });

            var email = infos.Email.Trim();

            // 1. Déjà relié à ce compte Google
            var utilisateur = await _context.Utilisateurs.FirstOrDefaultAsync(u => u.GoogleId == infos.Subject);

            // 2. Compte classique avec le même email : on le relie (l'email est vérifié par Google)
            if (utilisateur == null)
            {
                utilisateur = await _context.Utilisateurs.FirstOrDefaultAsync(u => u.Email == email);
                if (utilisateur != null)
                {
                    if (utilisateur.GoogleId != null && utilisateur.GoogleId != infos.Subject)
                        return Conflict(new { message = "Cet email est déjà relié à un autre compte Google." });
                    utilisateur.GoogleId = infos.Subject;
                    await _context.SaveChangesAsync();
                }
            }

            if (utilisateur != null)
            {
                if (!utilisateur.EstActif)
                    return Unauthorized(new { message = "Ce compte est désactivé." });
                return Ok(Reponse(utilisateur));
            }

            // 3. Nouveau compte (sans mot de passe F237)
            var prenom = Limiter(infos.GivenName ?? infos.Name ?? email.Split('@')[0], 100);
            var nom = Limiter(infos.FamilyName ?? string.Empty, 100);
            utilisateur = await CreerUtilisateurAsync(nom, prenom, email, motDePasseHash: string.Empty, googleId: infos.Subject);
            return Ok(Reponse(utilisateur));
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

        /// <summary>Crée un utilisateur + la transaction du bonus de bienvenue (1 000 points).</summary>
        private async Task<Utilisateur> CreerUtilisateurAsync(string nom, string prenom, string email, string motDePasseHash, string? googleId)
        {
            var utilisateur = new Utilisateur
            {
                Nom = nom,
                Prenom = prenom,
                Email = email,
                MotDePasseHash = motDePasseHash,
                GoogleId = googleId,
                SoldePoints = BONUS_BIENVENUE,
                DateInscription = DateTime.UtcNow,
                EstActif = true,
                Role = Roles.Utilisateur // jamais Admin à l'inscription
            };
            _context.Utilisateurs.Add(utilisateur);
            await _context.SaveChangesAsync();

            _context.Transactions.Add(new Transaction
            {
                UtilisateurId = utilisateur.Id,
                Montant = BONUS_BIENVENUE,
                Type = "Bonus",
                Description = "Bonus de bienvenue",
                DateTransaction = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
            return utilisateur;
        }

        private const int BONUS_BIENVENUE = 1000;

        /// <summary>Réponse commune à l'inscription et aux connexions : token F237 + infos affichées.</summary>
        private AuthResponseDto Reponse(Utilisateur utilisateur) => new()
        {
            Token = GenererToken(utilisateur),
            Nom = utilisateur.Nom,
            Prenom = utilisateur.Prenom,
            Email = utilisateur.Email,
            SoldePoints = utilisateur.SoldePoints,
            Expiration = DateTime.UtcNow.AddHours(_configuration.GetValue<int>("Jwt:ExpirationHours"))
        };

        private static string Limiter(string texte, int max) =>
            texte.Length <= max ? texte.Trim() : texte[..max].Trim();

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
                // Rôle -> permet [Authorize(Roles = "Admin")] côté API
                new Claim(ClaimTypes.Role, string.IsNullOrEmpty(utilisateur.Role) ? Roles.Utilisateur : utilisateur.Role),
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

        // BCrypt : sel aléatoire inclus dans le hash + coût réglable (12 = ~250 ms par essai)
        private const int COUT_BCRYPT = 12;

        private static string HashMotDePasse(string motDePasse)
        {
            return BCrypt.Net.BCrypt.HashPassword(motDePasse, COUT_BCRYPT);
        }

        // Un hash BCrypt commence par "$2a$", "$2b$" ou "$2y$"
        private static bool EstHashBCrypt(string hash) =>
            hash.StartsWith("$2a$") || hash.StartsWith("$2b$") || hash.StartsWith("$2y$");

        private static bool VerifierMotDePasse(string motDePasse, string hash)
        {
            if (string.IsNullOrEmpty(hash)) return false;

            if (EstHashBCrypt(hash))
                return BCrypt.Net.BCrypt.Verify(motDePasse, hash);

            // Ancien format (SHA-256 sans sel) : accepté une dernière fois, puis converti au login
            using var sha256 = SHA256.Create();
            var ancien = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(motDePasse)));
            return CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(ancien), Encoding.UTF8.GetBytes(hash));
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
            return claim != null ? int.Parse(claim.Value) : 0;
        }
    }
}

namespace F237.API.Controllers
{
    /// <summary>Corps de POST /api/auth/google : le jeton d'identité renvoyé par le bouton Google.</summary>
    public class GoogleConnexionDto
    {
        public string Credential { get; set; } = string.Empty;
    }
}