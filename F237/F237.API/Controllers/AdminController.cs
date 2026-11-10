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