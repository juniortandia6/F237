using F237.API.DTOs;
using F237.BLL.Services.Interfaces;
using F237.Domain.Entities;
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

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var matchs = await _matchService.GetAllMatchsAsync();
            var dto = matchs.Select(m => new MatchDto
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
                }
            });
            return Ok(dto);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var match = await _matchService.GetMatchParIdAsync(id);
            if (match == null) return NotFound();
            var dto = new MatchDto
            {
                Id = match.Id,
                ApiFootballId = match.ApiFootballId,
                DateMatch = match.DateMatch,
                Statut = (int)match.Statut,
                ScoreDomicile = match.ScoreDomicile,
                ScoreExterieur = match.ScoreExterieur,
                SaisonId = match.SaisonId,
                EquipeDomicile = match.EquipeDomicile == null ? null : new EquipeSimpleDto
                {
                    Id = match.EquipeDomicile.Id,
                    Nom = match.EquipeDomicile.Nom,
                    LogoUrl = match.EquipeDomicile.LogoUrl,
                    Division = (int)match.EquipeDomicile.Division
                },
                EquipeExterieur = match.EquipeExterieur == null ? null : new EquipeSimpleDto
                {
                    Id = match.EquipeExterieur.Id,
                    Nom = match.EquipeExterieur.Nom,
                    LogoUrl = match.EquipeExterieur.LogoUrl,
                    Division = (int)match.EquipeExterieur.Division
                }
            };
            return Ok(dto);
        }

        [HttpGet("live")]
        public async Task<IActionResult> GetLive()
        {
            var matchs = await _matchService.GetMatchsEnCoursAsync();
            var dto = matchs.Select(m => new MatchDto
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
                }
            });
            return Ok(dto);
        }

        [HttpGet("date/{date}")]
        public async Task<IActionResult> GetByDate(DateTime date)
        {
            var matchs = await _matchService.GetMatchsParDateAsync(date);
            var dto = matchs.Select(m => new MatchDto
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
                }
            });
            return Ok(dto);
        }

        [HttpGet("saison/{saisonId}")]
        public async Task<IActionResult> GetBySaison(int saisonId)
        {
            var matchs = await _matchService.GetMatchsParSaisonAsync(saisonId);
            var dto = matchs.Select(m => new MatchDto
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
                }
            });
            return Ok(dto);
        }

        [HttpGet("equipe/{equipeId}")]
        public async Task<IActionResult> GetByEquipe(int equipeId)
        {
            var matchs = await _matchService.GetMatchsParEquipeAsync(equipeId);
            var dto = matchs.Select(m => new MatchDto
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
                }
            });
            return Ok(dto);
        }

        [HttpGet("{id}/buts")]
        public async Task<IActionResult> GetWithButs(int id)
        {
            var match = await _matchService.GetMatchAvecButsAsync(id);
            if (match == null) return NotFound();
            var dto = new MatchDto
            {
                Id = match.Id,
                ApiFootballId = match.ApiFootballId,
                DateMatch = match.DateMatch,
                Statut = (int)match.Statut,
                ScoreDomicile = match.ScoreDomicile,
                ScoreExterieur = match.ScoreExterieur,
                SaisonId = match.SaisonId,
                EquipeDomicile = match.EquipeDomicile == null ? null : new EquipeSimpleDto
                {
                    Id = match.EquipeDomicile.Id,
                    Nom = match.EquipeDomicile.Nom,
                    LogoUrl = match.EquipeDomicile.LogoUrl,
                    Division = (int)match.EquipeDomicile.Division
                },
                EquipeExterieur = match.EquipeExterieur == null ? null : new EquipeSimpleDto
                {
                    Id = match.EquipeExterieur.Id,
                    Nom = match.EquipeExterieur.Nom,
                    LogoUrl = match.EquipeExterieur.LogoUrl,
                    Division = (int)match.EquipeExterieur.Division
                }
            };
            return Ok(dto);
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