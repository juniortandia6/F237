// F237.API/Controllers/AdminController.cs
// Routes de l'espace admin (/admin côté site). Toutes réservées au rôle Admin.
// Les imports, le quota, les logos et les heures restent dans SyncController ;
// ici : ce qui sert à l'affichage de l'espace admin (tableau de bord...).

using F237.DAL.Data;
using F237.Domain.Entities;
using F237.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace F237.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Roles.Admin)]
    public class AdminController : ControllerBase
    {
        private const string BUTEUR_INCONNU = "Inconnu";
        private readonly F237DbContext _context;

        public AdminController(F237DbContext context)
        {
            _context = context;
        }

        // GET /api/admin/tableau-de-bord?saisons=8,9
        // Chiffres clés pour les saisons demandées (en général la saison en cours,
        // Elite One + Elite Two) et quelques totaux du site.
        [HttpGet("tableau-de-bord")]
        public async Task<ActionResult<TableauDeBordDto>> TableauDeBord([FromQuery] string? saisons)
        {
            var ids = (saisons ?? string.Empty)
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(s => int.TryParse(s, out var id) ? id : (int?)null)
                .Where(id => id != null)
                .Select(id => id!.Value)
                .Distinct()
                .ToList();

            var maintenant = DateTime.UtcNow;
            var parSaison = new List<StatsSaisonDto>();

            foreach (var id in ids)
            {
                var saison = await _context.Saisons.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
                if (saison == null) continue;

                var matchs = _context.Matchs.AsNoTracking().Where(m => m.SaisonId == id);
                var buts = _context.ButsMatch.AsNoTracking().Where(b => matchs.Any(m => m.Id == b.MatchId));

                parSaison.Add(new StatsSaisonDto
                {
                    SaisonId = id,
                    Nom = saison.Nom,
                    Matchs = await matchs.CountAsync(),
                    Termines = await matchs.CountAsync(m => m.Statut == StatutMatchEnum.Terminé),
                    AVenir = await matchs.CountAsync(m => m.Statut == StatutMatchEnum.Planifié && m.DateMatch >= maintenant),
                    Reportes = await matchs.CountAsync(m => m.Statut == StatutMatchEnum.Reporté),
                    Annules = await matchs.CountAsync(m => m.Statut == StatutMatchEnum.Annulé),
                    // Planifiés mais date dépassée de plus d'un jour : à réimporter
                    EnRetard = await matchs.CountAsync(m => m.Statut == StatutMatchEnum.Planifié && m.DateMatch < maintenant.AddDays(-1)),
                    Buts = await buts.CountAsync(),
                    ButsInconnus = await buts.CountAsync(b => b.NomJoueur == BUTEUR_INCONNU || b.NomJoueur == ""),
                    ProchainMatch = await matchs
                        .Where(m => m.Statut == StatutMatchEnum.Planifié && m.DateMatch >= maintenant)
                        .OrderBy(m => m.DateMatch)
                        .Select(m => (DateTime?)m.DateMatch)
                        .FirstOrDefaultAsync(),
                });
            }

            return Ok(new TableauDeBordDto
            {
                Saisons = parSaison,
                ArticlesPublies = await _context.Articles.CountAsync(a => a.EstPublie),
                ArticlesBrouillons = await _context.Articles.CountAsync(a => !a.EstPublie),
                Utilisateurs = await _context.Utilisateurs.CountAsync(),
                Equipes = await _context.Equipes.CountAsync(),
            });
        }

        // ── Matchs : buteurs et score à la mi-temps ───────────────────────────
        // La lecture se fait avec les routes publiques (/api/matchs/saison/{id}, /api/matchs/{id}),
        // qui renvoient maintenant l'Id de chaque but.
        // Protection face à l'import : les buts d'un match ne sont remplacés par ceux de l'API
        // que si elle en connaît plus (plus de buts, ou plus de buteurs identifiés).

        // POST /api/admin/matchs/1444/buts   { "nomJoueur": "...", "nomEquipe": "...", "minute": 37, "estPenalty": false, "estButCSC": false }
        [HttpPost("matchs/{matchId:int}/buts")]
        public async Task<IActionResult> AjouterBut(int matchId, [FromBody] SaisieButDto saisie)
        {
            var match = await MatchAvecEquipesAsync(matchId);
            if (match == null) return NotFound(new { message = "Match introuvable." });

            var erreur = ValiderBut(saisie, match);
            if (erreur != null) return BadRequest(new { message = erreur });

            var but = new ButMatch { MatchId = matchId };
            Appliquer(but, saisie);
            await _context.ButsMatch.AddAsync(but);
            await _context.SaveChangesAsync();
            return Ok(VersDto(but));
        }

        // PUT /api/admin/buts/512   (même corps)
        [HttpPut("buts/{id:int}")]
        public async Task<IActionResult> ModifierBut(int id, [FromBody] SaisieButDto saisie)
        {
            var but = await _context.ButsMatch.FirstOrDefaultAsync(b => b.Id == id);
            if (but == null) return NotFound(new { message = "But introuvable." });

            var match = await MatchAvecEquipesAsync(but.MatchId);
            if (match == null) return NotFound(new { message = "Match introuvable." });

            var erreur = ValiderBut(saisie, match);
            if (erreur != null) return BadRequest(new { message = erreur });

            Appliquer(but, saisie);
            await _context.SaveChangesAsync();
            return Ok(VersDto(but));
        }

        // DELETE /api/admin/buts/512
        [HttpDelete("buts/{id:int}")]
        public async Task<IActionResult> SupprimerBut(int id)
        {
            var but = await _context.ButsMatch.FirstOrDefaultAsync(b => b.Id == id);
            if (but == null) return NotFound(new { message = "But introuvable." });
            _context.ButsMatch.Remove(but);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT /api/admin/matchs/1444/mi-temps   { "domicile": 1, "exterieur": 0 }   (null + null = effacer)
        // Gardé lors des imports tant que l'API ne fournit pas elle-même ce score.
        [HttpPut("matchs/{matchId:int}/mi-temps")]
        public async Task<IActionResult> DefinirMiTemps(int matchId, [FromBody] SaisieMiTempsDto saisie)
        {
            var match = await _context.Matchs.FirstOrDefaultAsync(m => m.Id == matchId);
            if (match == null) return NotFound(new { message = "Match introuvable." });

            if ((saisie.Domicile == null) != (saisie.Exterieur == null))
                return BadRequest(new { message = "Donne les deux scores, ou aucun pour effacer." });
            if (saisie.Domicile is < 0 or > 30 || saisie.Exterieur is < 0 or > 30)
                return BadRequest(new { message = "Score à la mi-temps invalide." });
            if (match.ScoreDomicile != null && match.ScoreExterieur != null
                && (saisie.Domicile > match.ScoreDomicile || saisie.Exterieur > match.ScoreExterieur))
                return BadRequest(new { message = "Le score à la mi-temps ne peut pas dépasser le score final." });

            match.ScoreMiTempsDomicile = saisie.Domicile;
            match.ScoreMiTempsExterieur = saisie.Exterieur;
            await _context.SaveChangesAsync();
            return Ok(new { match.Id, match.ScoreMiTempsDomicile, match.ScoreMiTempsExterieur });
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private Task<Match?> MatchAvecEquipesAsync(int matchId) =>
            _context.Matchs
                .Include(m => m.EquipeDomicile)
                .Include(m => m.EquipeExterieur)
                .FirstOrDefaultAsync(m => m.Id == matchId);

        // nomEquipe = équipe CRÉDITÉE du but (pour un CSC : l'équipe qui en profite),
        // comme les buts venant de l'API.
        private static string? ValiderBut(SaisieButDto s, Match match)
        {
            var nom = s.NomJoueur?.Trim() ?? string.Empty;
            if (nom.Length == 0) return "Le nom du buteur est obligatoire.";
            if (nom.Length > 200) return "Le nom du buteur dépasse 200 caractères.";
            // 0 = minute inconnue (le but compte, sans minute affichée sur le site)
            if (s.Minute is < 0 or > 130) return "La minute doit être entre 1 et 130 (ou 0 si elle est inconnue).";
            var equipes = new[] { match.EquipeDomicile?.Nom, match.EquipeExterieur?.Nom };
            if (!equipes.Contains(s.NomEquipe)) return "L'équipe doit être l'une des deux équipes du match.";
            return null;
        }

        private static void Appliquer(ButMatch but, SaisieButDto s)
        {
            but.NomJoueur = s.NomJoueur!.Trim();
            but.NomEquipe = s.NomEquipe!;
            but.Minute = s.Minute;
            but.EstPenalty = s.EstPenalty && !s.EstButCSC; // un CSC n'est jamais un penalty
            but.EstButCSC = s.EstButCSC;
        }

        private static object VersDto(ButMatch b) => new
        {
            b.Id,
            b.MatchId,
            b.Minute,
            b.NomJoueur,
            b.NomEquipe,
            b.EstPenalty,
            b.EstButCSC,
        };
    }

    public class SaisieButDto
    {
        public string? NomJoueur { get; set; }
        public string? NomEquipe { get; set; }
        public int Minute { get; set; }
        public bool EstPenalty { get; set; }
        public bool EstButCSC { get; set; }
    }

    public class SaisieMiTempsDto
    {
        public int? Domicile { get; set; }
        public int? Exterieur { get; set; }
    }

    public class TableauDeBordDto
    {
        public List<StatsSaisonDto> Saisons { get; set; } = new();
        public int ArticlesPublies { get; set; }
        public int ArticlesBrouillons { get; set; }
        public int Utilisateurs { get; set; }
        public int Equipes { get; set; }
    }

    public class StatsSaisonDto
    {
        public int SaisonId { get; set; }
        public string Nom { get; set; } = string.Empty;
        public int Matchs { get; set; }
        public int Termines { get; set; }
        public int AVenir { get; set; }
        public int Reportes { get; set; }
        public int Annules { get; set; }
        public int EnRetard { get; set; }
        public int Buts { get; set; }
        public int ButsInconnus { get; set; }
        public DateTime? ProchainMatch { get; set; }
    }
}