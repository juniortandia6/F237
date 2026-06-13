using F237.API.DTOs;
using F237.BLL.Services.Interfaces;
using F237.Domain.Entities;
using F237.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace F237.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MatchsController : ControllerBase
    {
        private readonly IMatchService _matchService;
        public MatchsController(IMatchService matchService)
        {
            _matchService = matchService;
        }

        private MatchDto ToDto(Match m) => new MatchDto
        {
            Id = m.Id,
            ApiFootballId = m.ApiFootballId,
            DateMatch = m.DateMatch,
            Statut = (int)m.Statut,
            ScoreDomicile = m.ScoreDomicile,
            ScoreExterieur = m.ScoreExterieur,
            SaisonId = m.SaisonId,
            EquipeDomicile = m.EquipeDomicile == null ? null : new EquipeSimpleDto
            {
                Id = m.EquipeDomicile.Id,
                Nom = m.EquipeDomicile.Nom,
                LogoUrl = m.EquipeDomicile.LogoUrl,
                Division = (int)m.EquipeDomicile.Division
            },
            EquipeExterieur = m.EquipeExterieur == null ? null : new EquipeSimpleDto
            {
                Id = m.EquipeExterieur.Id,
                Nom = m.EquipeExterieur.Nom,
                LogoUrl = m.EquipeExterieur.LogoUrl,
                Division = (int)m.EquipeExterieur.Division
            },
            Buts = m.Buts.Select(b => new ButDto
            {
                Minute = b.Minute,
                NomJoueur = b.NomJoueur,
                NomEquipe = b.NomEquipe,
                EstButCSC = b.EstButCSC,
                EstPenalty = b.EstPenalty
            }).OrderBy(b => b.Minute).ToList()
        };

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var matchs = await _matchService.GetAllMatchsAsync();
            return Ok(matchs.Select(ToDto));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var match = await _matchService.GetMatchParIdAsync(id);
            if (match == null) return NotFound();
            return Ok(ToDto(match));
        }

        [HttpGet("live")]
        public async Task<IActionResult> GetLive()
        {
            var matchs = await _matchService.GetMatchsEnCoursAsync();
            return Ok(matchs.Select(ToDto));
        }

        [HttpGet("date/{date}")]
        public async Task<IActionResult> GetByDate(DateTime date)
        {
            var matchs = await _matchService.GetMatchsParDateAsync(date);
            return Ok(matchs.Select(ToDto));
        }

        [HttpGet("saison/{saisonId}")]
        public async Task<IActionResult> GetBySaison(int saisonId)
        {
            var matchs = await _matchService.GetMatchsParSaisonAsync(saisonId);
            return Ok(matchs.Select(ToDto));
        }

        [HttpGet("equipe/{equipeId}")]
        public async Task<IActionResult> GetByEquipe(int equipeId)
        {
            var matchs = await _matchService.GetMatchsParEquipeAsync(equipeId);
            return Ok(matchs.Select(ToDto));
        }

        [HttpGet("equipe/{equipeId}/saison/{saisonId}/forme")]
        public async Task<IActionResult> GetForme(int equipeId, int saisonId)
        {
            var matchs = await _matchService.GetMatchsParSaisonAsync(saisonId);

            var derniers = matchs
                .Where(m => m.Statut == StatutMatchEnum.Terminé &&
                       (m.EquipeDomicileId == equipeId || m.EquipeExterieurId == equipeId))
                .OrderByDescending(m => m.DateMatch)
                .Take(5)
                .OrderBy(m => m.DateMatch) // inverser pour afficher du plus ancien au plus récent
                .ToList();

            var forme = derniers.Select(m =>
            {
                bool estDomicile = m.EquipeDomicileId == equipeId;
                int? mesPoints = estDomicile ? m.ScoreDomicile : m.ScoreExterieur;
                int? pointsAdversaire = estDomicile ? m.ScoreExterieur : m.ScoreDomicile;

                if (mesPoints == null || pointsAdversaire == null) return "D";
                if (mesPoints > pointsAdversaire) return "W";
                if (mesPoints < pointsAdversaire) return "L";
                return "D";
            }).ToList();

            return Ok(forme);
        }

        [HttpGet("{id}/buts")]
        public async Task<IActionResult> GetWithButs(int id)
        {
            var match = await _matchService.GetMatchAvecButsAsync(id);
            if (match == null) return NotFound();
            return Ok(ToDto(match));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Match match)
        {
            var created = await _matchService.CreerMatchAsync(match);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}/score")]
        public async Task<IActionResult> UpdateScore(int id, [FromBody] ScoreUpdateDto dto)
        {
            await _matchService.UpdateScoreAsync(id, dto.ScoreDomicile, dto.ScoreExterieur);
            return NoContent();
        }

        [HttpPut("{id}/terminer")]
        public async Task<IActionResult> Terminer(int id)
        {
            await _matchService.TerminerMatchAsync(id);
            return NoContent();
        }
    }

    public class ScoreUpdateDto
    {
        public int ScoreDomicile { get; set; }
        public int ScoreExterieur { get; set; }
    }
}