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
            return Ok(matchs);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var match = await _matchService.GetMatchParIdAsync(id);
            if (match == null) return NotFound();
            return Ok(match);
        }

        [HttpGet("live")]
        public async Task<IActionResult> GetLive()
        {
            var matchs = await _matchService.GetMatchsEnCoursAsync();
            return Ok(matchs);
        }

        [HttpGet("date/{date}")]
        public async Task<IActionResult> GetByDate(DateTime date)
        {
            var matchs = await _matchService.GetMatchsParDateAsync(date);
            return Ok(matchs);
        }

        [HttpGet("saison/{saisonId}")]
        public async Task<IActionResult> GetBySaison(int saisonId)
        {
            var matchs = await _matchService.GetMatchsParSaisonAsync(saisonId);
            return Ok(matchs);
        }

        [HttpGet("equipe/{equipeId}")]
        public async Task<IActionResult> GetByEquipe(int equipeId)
        {
            var matchs = await _matchService.GetMatchsParEquipeAsync(equipeId);
            return Ok(matchs);
        }

        [HttpGet("{id}/buts")]
        public async Task<IActionResult> GetWithButs(int id)
        {
            var match = await _matchService.GetMatchAvecButsAsync(id);
            if (match == null) return NotFound();
            return Ok(match);
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