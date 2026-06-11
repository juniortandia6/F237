using F237.BLL.Services.Interfaces;
using F237.Domain.Entities;
using F237.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace F237.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EquipesController : ControllerBase
    {
        private readonly IEquipeService _equipeService;

        public EquipesController(IEquipeService equipeService)
        {
            _equipeService = equipeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var equipes = await _equipeService.GetAllEquipesAsync();
            return Ok(equipes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var equipe = await _equipeService.GetEquipeParIdAsync(id);
            if (equipe == null) return NotFound();
            return Ok(equipe);
        }

        [HttpGet("division/{division}")]
        public async Task<IActionResult> GetByDivision(DivisionEnum division)
        {
            var equipes = await _equipeService.GetEquipesParDivisionAsync(division);
            return Ok(equipes);
        }

        [HttpGet("{id}/joueurs")]
        public async Task<IActionResult> GetWithJoueurs(int id)
        {
            var equipe = await _equipeService.GetEquipeAvecJoueursAsync(id);
            if (equipe == null) return NotFound();
            return Ok(equipe);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Equipe equipe)
        {
            var created = await _equipeService.CreerEquipeAsync(equipe);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Equipe equipe)
        {
            if (id != equipe.Id) return BadRequest();
            await _equipeService.UpdateEquipeAsync(equipe);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _equipeService.DeleteEquipeAsync(id);
            return NoContent();
        }
    }
}