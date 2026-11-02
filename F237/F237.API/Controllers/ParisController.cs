using F237.BLL.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace F237.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ParisController : ControllerBase
    {
        private readonly IPariService _pariService;

        public ParisController(IPariService pariService)
        {
            _pariService = pariService;
        }

        [HttpGet("utilisateur/{utilisateurId}")]
        public async Task<IActionResult> GetByUtilisateur(int utilisateurId)
        {
            var paris = await _pariService.GetParisParUtilisateurAsync(utilisateurId);
            return Ok(paris);
        }

        [HttpGet("match/{matchId}")]
        public async Task<IActionResult> GetByMatch(int matchId)
        {
            var paris = await _pariService.GetParisParMatchAsync(matchId);
            return Ok(paris);
        }

        [HttpGet("groupe/{groupeId}")]
        public async Task<IActionResult> GetByGroupe(int groupeId)
        {
            var paris = await _pariService.GetParisParGroupeAsync(groupeId);
            return Ok(paris);
        }

        [HttpGet("solde/{utilisateurId}")]
        public async Task<IActionResult> GetSolde(int utilisateurId)
        {
            var solde = await _pariService.GetSoldePointsAsync(utilisateurId);
            return Ok(new { solde });
        }

        [HttpPost]
        public async Task<IActionResult> PlacerPari([FromBody] PlacerPariDto dto)
        {
            var pari = await _pariService.PlacerPariAsync(
                dto.UtilisateurId,
                dto.MatchId,
                dto.Pronostic,
                dto.Mise);
            return Ok(pari);
        }

        [HttpPost("traiter/{matchId}")]
        public async Task<IActionResult> TraiterParis(int matchId)
        {
            await _pariService.TraiterParisApresMatchAsync(matchId);
            return Ok("Paris traités avec succès");
        }

        [HttpPost("retrait")]
        public async Task<IActionResult> DemanderRetrait([FromBody] RetraitDto dto)
        {
            var result = await _pariService.DemanderRetraitAsync(
                dto.UtilisateurId,
                dto.MontantPoints,
                dto.NumeroMobileMoney,
                dto.Operateur);
            if (!result) return BadRequest("Solde insuffisant");
            return Ok("Demande de retrait soumise avec succès");
        }
    }

    public class PlacerPariDto
    {
        public int UtilisateurId { get; set; }
        public int MatchId { get; set; }
        public string Pronostic { get; set; } = string.Empty;
        public int Mise { get; set; }
    }

    public class RetraitDto
    {
        public int UtilisateurId { get; set; }
        public int MontantPoints { get; set; }
        public string NumeroMobileMoney { get; set; } = string.Empty;
        public string Operateur { get; set; } = string.Empty;
    }
}