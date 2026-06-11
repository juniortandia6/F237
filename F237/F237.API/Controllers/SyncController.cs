using F237.BLL.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace F237.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SyncController : ControllerBase
    {
        private readonly IApiFootballService _apiFootballService;

        private const int ELITE_ONE_ID = 411;  
        private const int ELITE_TWO_ID = 813;
        private const int SAISON = 2024; 

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
            await _apiFootballService.SyncMatchsJourneeAsync(ELITE_ONE_ID, SAISON);
            await _apiFootballService.SyncMatchsJourneeAsync(ELITE_TWO_ID, SAISON);
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
            await _apiFootballService.SyncClassementAsync(ELITE_ONE_ID, SAISON);
            await _apiFootballService.SyncClassementAsync(ELITE_TWO_ID, SAISON);
            return Ok("Classement synchronisé avec succès");
        }

        [HttpPost("joueurs")]
        public async Task<IActionResult> SyncJoueurs()
        {
            await _apiFootballService.SyncJoueursAsync(ELITE_ONE_ID, SAISON);
            await _apiFootballService.SyncJoueursAsync(ELITE_TWO_ID, SAISON);
            return Ok("Joueurs synchronisés avec succès");
        }

        [HttpPost("tout")]
        public async Task<IActionResult> SyncTout()
        {
            await _apiFootballService.SyncEquipesAsync(ELITE_ONE_ID, SAISON);
            await _apiFootballService.SyncEquipesAsync(ELITE_TWO_ID, SAISON);
            await _apiFootballService.SyncMatchsJourneeAsync(ELITE_ONE_ID, SAISON);
            await _apiFootballService.SyncMatchsJourneeAsync(ELITE_TWO_ID, SAISON);
            await _apiFootballService.SyncClassementAsync(ELITE_ONE_ID, SAISON);
            await _apiFootballService.SyncClassementAsync(ELITE_TWO_ID, SAISON);
            await _apiFootballService.SyncJoueursAsync(ELITE_ONE_ID, SAISON);
            await _apiFootballService.SyncJoueursAsync(ELITE_TWO_ID, SAISON);
            return Ok("Synchronisation complète effectuée avec succès");
        }
    }
}