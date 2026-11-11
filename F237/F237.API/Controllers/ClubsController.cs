// F237.API/Controllers/ClubsController.cs
// Données publiques et légères sur les clubs, pour l'affichage du site.

using F237.DAL.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace F237.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClubsController : ControllerBase
    {
        private readonly F237DbContext _context;

        public ClubsController(F237DbContext context)
        {
            _context = context;
        }

        // GET /api/clubs/couleurs
        // Couleurs de maillot saisies dans l'admin : [{ nom, principale, secondaire }].
        // Les clubs sans couleurs saisies n'apparaissent pas (le site garde ses couleurs par défaut).
        [HttpGet("couleurs")]
        [ResponseCache(Duration = 300)]
        public async Task<IActionResult> Couleurs()
        {
            var couleurs = await _context.Equipes
                .AsNoTracking()
                .Where(e => e.CouleurPrincipale != null && e.CouleurSecondaire != null)
                .Select(e => new { nom = e.Nom, principale = e.CouleurPrincipale, secondaire = e.CouleurSecondaire })
                .ToListAsync();
            return Ok(couleurs);
        }

        // GET /api/clubs/37/effectif
        // Effectif saisi dans l'admin (joueurs actifs). Liste vide si rien n'a été saisi :
        // le site utilise alors l'effectif de l'API-Football, s'il existe.
        [HttpGet("{equipeId:int}/effectif")]
        public async Task<IActionResult> Effectif(int equipeId)
        {
            var joueurs = await _context.Joueurs
                .AsNoTracking()
                .Where(j => j.EquipeId == equipeId && j.EstActif)
                .OrderBy(j => j.Numero == null).ThenBy(j => j.Numero).ThenBy(j => j.Nom)
                .Select(j => new { j.Id, j.Prenom, j.Nom, j.Numero, j.Poste, j.Nationalite, j.DateNaissance })
                .ToListAsync();
            return Ok(joueurs);
        }
    }
}