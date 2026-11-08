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

        // PUT /api/sync/match/1645866/heure   corps : { "heure": "2026-11-04T15:30:00+01:00" }
        // Corrige l'heure d'un match quand l'API a une heure provisoire fausse.
        // L'heure peut être donnée avec n'importe quel fuseau (+01:00 = heure du Cameroun).
        [HttpPut("match/{apiFootballId:int}/heure")]
        public async Task<IActionResult> CorrigerHeure(int apiFootballId, [FromBody] CorrectionHeureDto dto)
        {
            var match = await _apiFootballService.CorrigerHeureMatchAsync(apiFootballId, dto.Heure);
            return match == null
                ? NotFound($"Aucun match avec l'id API {apiFootballId}.")
                : Ok(new { match.Id, match.ApiFootballId, match.DateMatch, match.HeureManuelle });
        }

        // DELETE /api/sync/match/1645866/heure — revient à l'heure donnée par l'API
        [HttpDelete("match/{apiFootballId:int}/heure")]
        public async Task<IActionResult> AnnulerCorrectionHeure(int apiFootballId)
        {
            var match = await _apiFootballService.AnnulerCorrectionHeureAsync(apiFootballId);
            return match == null
                ? NotFound($"Aucun match avec l'id API {apiFootballId}.")
                : Ok(new { match.Id, match.ApiFootballId, match.DateMatch, match.HeureManuelle });
        }

        // PUT /api/sync/equipe/12/logo   corps : { "logoUrl": "/logos/victoria-united.png" }
        // Remplace le logo d'un club (image du dossier public/logos du frontend, ou une adresse https).
        [HttpPut("equipe/{equipeId:int}/logo")]
        public async Task<IActionResult> DefinirLogo(int equipeId, [FromBody] LogoEquipeDto dto)
        {
            var url = dto.LogoUrl?.Trim() ?? string.Empty;
            var valide = (url.StartsWith("/logos/") && !url.Contains(".."))
                         || (Uri.TryCreate(url, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps);
            if (!valide || url.Length > 300)
                return BadRequest(new { message = "logoUrl doit commencer par /logos/ ou être une adresse https (300 caractères max)." });

            var equipe = await _apiFootballService.DefinirLogoEquipeAsync(equipeId, url);
            return equipe == null
                ? NotFound($"Aucune équipe avec l'id {equipeId}.")
                : Ok(new { equipe.Id, equipe.Nom, equipe.LogoUrl, equipe.LogoManuel, equipe.LogoApi });
        }

        // DELETE /api/sync/equipe/12/logo — revient au logo de l'API-Football
        [HttpDelete("equipe/{equipeId:int}/logo")]
        public async Task<IActionResult> AnnulerLogo(int equipeId)
        {
            var equipe = await _apiFootballService.AnnulerLogoEquipeAsync(equipeId);
            return equipe == null
                ? NotFound($"Aucune équipe avec l'id {equipeId}.")
                : Ok(new { equipe.Id, equipe.Nom, equipe.LogoUrl, equipe.LogoManuel });
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

    // Corps de PUT /api/sync/match/{id}/heure
    public class CorrectionHeureDto
    {
        public DateTimeOffset Heure { get; set; }
    }

    public class LogoEquipeDto
    {
        public string? LogoUrl { get; set; }
    }
}