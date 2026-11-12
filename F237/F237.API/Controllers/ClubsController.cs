// F237.API/Controllers/ClubsController.cs
// Données publiques et légères sur les clubs, pour l'affichage du site.

using F237.DAL.Data;
using F237.Domain.Enums;
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
            // Âge seulement : la date de naissance exacte ne sort pas de l'API publique
            return Ok(joueurs.Select(j => new { j.Id, j.Prenom, j.Nom, j.Numero, j.Poste, j.Nationalite, Age = AgeDepuis(j.DateNaissance) }));
        }

        // GET /api/clubs/joueurs/219
        // Fiche publique d'un joueur : identité, club, et tous ses buts reliés (ButMatch.JoueurId),
        // du plus récent au plus ancien. Les CSC ne sont pas comptés pour le joueur.
        // La date de naissance n'est jamais renvoyée : seulement l'âge, s'il est connu.
        [HttpGet("joueurs/{joueurId:int}")]
        public async Task<IActionResult> FicheJoueur(int joueurId)
        {
            var joueur = await _context.Joueurs
                .AsNoTracking()
                .Where(j => j.Id == joueurId)
                .Select(j => new
                {
                    j.Id,
                    j.Prenom,
                    j.Nom,
                    j.Numero,
                    j.Poste,
                    j.Nationalite,
                    j.DateNaissance,
                    j.EstActif,
                    Equipe = new { j.Equipe.Id, j.Equipe.Nom, j.Equipe.LogoUrl, Division = (int)j.Equipe.Division },
                })
                .FirstOrDefaultAsync();
            if (joueur == null) return NotFound(new { message = "Joueur introuvable." });

            var buts = await _context.ButsMatch
                .AsNoTracking()
                .Where(b => b.JoueurId == joueurId && !b.EstButCSC)
                .OrderByDescending(b => b.Match.DateMatch).ThenByDescending(b => b.Minute)
                .Select(b => new
                {
                    b.Id,
                    b.MatchId,
                    b.Minute,
                    b.EstPenalty,
                    b.NomEquipe,
                    b.Match.DateMatch,
                    b.Match.SaisonId,
                    b.Match.ScoreDomicile,
                    b.Match.ScoreExterieur,
                    EquipeDomicile = new { b.Match.EquipeDomicile.Id, b.Match.EquipeDomicile.Nom, b.Match.EquipeDomicile.LogoUrl },
                    EquipeExterieur = new { b.Match.EquipeExterieur.Id, b.Match.EquipeExterieur.Nom, b.Match.EquipeExterieur.LogoUrl },
                })
                .ToListAsync();

            // Matchs joués (terminés) par son club actuel, saison par saison.
            // On ne connaît pas les présences du joueur : c'est le nombre de matchs DU CLUB.
            // Une saison dont aucun match n'est encore joué apparaît avec 0 (début de saison).
            var equipeId = joueur.Equipe.Id;
            var saisonsClub = await _context.Matchs
                .AsNoTracking()
                .Where(m => m.EquipeDomicileId == equipeId || m.EquipeExterieurId == equipeId)
                .GroupBy(m => m.SaisonId)
                .Select(g => new
                {
                    SaisonId = g.Key,
                    MatchsJoues = g.Count(m => m.Statut == StatutMatchEnum.Terminé),
                    DernierMatch = g.Max(m => m.DateMatch),
                })
                .OrderByDescending(x => x.DernierMatch)
                .ToListAsync();

            return Ok(new
            {
                joueur.Id,
                joueur.Prenom,
                joueur.Nom,
                joueur.Numero,
                joueur.Poste,
                joueur.Nationalite,
                joueur.EstActif,
                Age = AgeDepuis(joueur.DateNaissance),
                joueur.Equipe,
                Buts = buts,
                SaisonsClub = saisonsClub,
            });
        }

        // Âge en années révolues (null si inconnu ou incohérent)
        private static int? AgeDepuis(DateTime? naissance)
        {
            if (naissance is not DateTime n) return null;
            var aujourdHui = DateTime.UtcNow.Date;
            var age = aujourdHui.Year - n.Year;
            if (n.Date > aujourdHui.AddYears(-age)) age--;
            return age is > 0 and < 60 ? age : null;
        }
    }
}