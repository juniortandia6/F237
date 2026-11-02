using F237.BLL.Services.Interfaces;
using F237.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace F237.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Roles.Admin)] // toutes les routes /api/sync/* sont réservées aux admins
    public class SyncController : ControllerBase
    {
        private readonly IApiFootballService _apiFootballService;
        private const int ELITE_ONE_ID = 411;
        private const int ELITE_TWO_ID = 813;
        private const int SAISON = 2026;
        private const int ELITE_ONE_SAISONID = 3;
        private const int ELITE_TWO_SAISONID = 4;

        public SyncController(IApiFootballService apiFootballService)
        {
            _apiFootballService = apiFootballService;
        }

        [HttpGet("test")]
        public async Task<IActionResult> TestConnection()
        {
            var result = await _apiFootballService.TestConnectionAsync();
            return Ok(new { connected = result });
        }

        // GET /api/sync/quota — requêtes restantes aujourd'hui (ne consomme pas de quota)
        [HttpGet("quota")]
        public async Task<IActionResult> Quota()
        {
            var quota = await _apiFootballService.GetQuotaAsync();
            return quota == null ? StatusCode(502, "Impossible de lire le quota") : Ok(quota);
        }

        // POST /api/sync/saison?league=411&season=2022
        // Importe une saison complète (saison, équipes, matchs, classement, buts).
        // Relançable sans risque : reprend là où il s'est arrêté.
        [HttpPost("saison")]
        public async Task<IActionResult> ImporterSaison([FromQuery] int league, [FromQuery] int season)
        {
            if (league != ELITE_ONE_ID && league != ELITE_TWO_ID)
                return BadRequest($"Ligue inconnue : utilise {ELITE_ONE_ID} (Elite One) ou {ELITE_TWO_ID} (Elite Two).");

            var resultat = await _apiFootballService.ImporterSaisonAsync(league, season);
            return resultat.Erreur == null ? Ok(resultat) : StatusCode(207, resultat);
        }

        [HttpPost("equipes")]
        public async Task<IActionResult> SyncEquipes()
        {
            await _apiFootballService.SyncEquipesAsync(ELITE_ONE_ID, SAISON);
            await _apiFootballService.SyncEquipesAsync(ELITE_TWO_ID, SAISON);
            return Ok("Équipes synchronisées avec succès");
        }

        [HttpPost("matchs")]
        public async Task<IActionResult> SyncMatchs()
        {
            await _apiFootballService.SyncMatchsJourneeAsync(ELITE_ONE_ID, SAISON, ELITE_ONE_SAISONID);
            await _apiFootballService.SyncMatchsJourneeAsync(ELITE_TWO_ID, SAISON, ELITE_TWO_SAISONID);
            return Ok("Matchs synchronisés avec succès");
        }

        [HttpPost("scores-live")]
        public async Task<IActionResult> SyncScoresLive()
        {
            await _apiFootballService.SyncScoresLiveAsync(ELITE_ONE_ID);
            await _apiFootballService.SyncScoresLiveAsync(ELITE_TWO_ID);
            return Ok("Scores live synchronisés avec succès");
        }

        [HttpPost("classement")]
        public async Task<IActionResult> SyncClassement()
        {
            await _apiFootballService.SyncClassementAsync(ELITE_ONE_ID, SAISON, ELITE_ONE_SAISONID);
            await _apiFootballService.SyncClassementAsync(ELITE_TWO_ID, SAISON, ELITE_TWO_SAISONID);
            return Ok("Classement synchronisé avec succès");
        }

        [HttpPost("joueurs")]
        public async Task<IActionResult> SyncJoueurs()
        {
            await _apiFootballService.SyncJoueursAsync(ELITE_ONE_ID, SAISON);
            await _apiFootballService.SyncJoueursAsync(ELITE_TWO_ID, SAISON);
            return Ok("Joueurs synchronisés avec succès");
        }

        [HttpPost("evenements")]
        public async Task<IActionResult> SyncEvenements()
        {
            await _apiFootballService.SyncEvenementsAsync(ELITE_ONE_ID, SAISON, ELITE_ONE_SAISONID);
            await _apiFootballService.SyncEvenementsAsync(ELITE_TWO_ID, SAISON, ELITE_TWO_SAISONID);
            return Ok("Événements synchronisés avec succès");
        }

        [HttpPost("tout")]
        public async Task<IActionResult> SyncTout()
        {
            await _apiFootballService.SyncEquipesAsync(ELITE_ONE_ID, SAISON);
            await _apiFootballService.SyncEquipesAsync(ELITE_TWO_ID, SAISON);
            await _apiFootballService.SyncMatchsJourneeAsync(ELITE_ONE_ID, SAISON, ELITE_ONE_SAISONID);
            await _apiFootballService.SyncMatchsJourneeAsync(ELITE_TWO_ID, SAISON, ELITE_TWO_SAISONID);
            await _apiFootballService.SyncClassementAsync(ELITE_ONE_ID, SAISON, ELITE_ONE_SAISONID);
            await _apiFootballService.SyncClassementAsync(ELITE_TWO_ID, SAISON, ELITE_TWO_SAISONID);
            await _apiFootballService.SyncJoueursAsync(ELITE_ONE_ID, SAISON);
            await _apiFootballService.SyncJoueursAsync(ELITE_TWO_ID, SAISON);
            await _apiFootballService.SyncEvenementsAsync(ELITE_ONE_ID, SAISON, ELITE_ONE_SAISONID);
            await _apiFootballService.SyncEvenementsAsync(ELITE_TWO_ID, SAISON, ELITE_TWO_SAISONID);
            return Ok("Synchronisation complète effectuée avec succès");
        }
    }
}