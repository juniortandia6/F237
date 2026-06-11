using F237.BLL.Services.Interfaces;
using F237.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace F237.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JoueursController : ControllerBase
    {
        private readonly IJoueurService _joueurService;

        public JoueursController(IJoueurService joueurService)
        {
            _joueurService = joueurService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var joueurs = await _joueurService.GetAllJoueursAsync();
            return Ok(joueurs);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var joueur = await _joueurService.GetJoueurParIdAsync(id);
            if (joueur == null) return NotFound();
            return Ok(joueur);
        }

        [HttpGet("equipe/{equipeId}")]
        public async Task<IActionResult> GetByEquipe(int equipeId)
        {
            var joueurs = await _joueurService.GetJoueursParEquipeAsync(equipeId);
            return Ok(joueurs);
        }

        [HttpGet("top-buteurs")]
        public async Task<IActionResult> GetTopButeurs([FromQuery] int limit = 10)
        {
            var joueurs = await _joueurService.GetTopButeursAsync(limit);
            return Ok(joueurs);
        }

        [HttpGet("top-passeurs")]
        public async Task<IActionResult> GetTopPasseurs([FromQuery] int limit = 10)
        {
            var joueurs = await _joueurService.GetTopPasseursAsync(limit);
            return Ok(joueurs);
        }

        [HttpGet("{id}/stats")]
        public async Task<IActionResult> GetWithStats(int id)
        {
            var joueur = await _joueurService.GetJoueurAvecStatsAsync(id);
            if (joueur == null) return NotFound();
            return Ok(joueur);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Joueur joueur)
        {
            var created = await _joueurService.CreerJoueurAsync(joueur);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Joueur joueur)
        {
            if (id != joueur.Id) return BadRequest();
            await _joueurService.UpdateJoueurAsync(joueur);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _joueurService.DeleteJoueurAsync(id);
            return NoContent();
        }
    }
}