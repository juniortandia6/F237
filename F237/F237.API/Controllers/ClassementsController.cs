using F237.BLL.Services.Interfaces;
using F237.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace F237.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClassementsController : ControllerBase
    {
        private readonly IClassementService _classementService;

        public ClassementsController(IClassementService classementService)
        {
            _classementService = classementService;
        }

        [HttpGet("saison/{saisonId}")]
        public async Task<IActionResult> GetBySaison(int saisonId)
        {
            var classement = await _classementService.GetClassementParSaisonAsync(saisonId);
            return Ok(classement);
        }

        [HttpGet("division/{division}")]
        public async Task<IActionResult> GetByDivision(DivisionEnum division)
        {
            var classement = await _classementService.GetClassementParDivisionAsync(division);
            return Ok(classement);
        }

        [HttpGet("equipe/{equipeId}/saison/{saisonId}")]
        public async Task<IActionResult> GetByEquipe(int equipeId, int saisonId)
        {
            var classement = await _classementService.GetClassementEquipeAsync(equipeId, saisonId);
            if (classement == null) return NotFound();
            return Ok(classement);
        }

        [HttpPost("recalculer/{saisonId}")]
        public async Task<IActionResult> Recalculer(int saisonId)
        {
            await _classementService.RecalculerClassementAsync(saisonId);
            return Ok("Classement recalculé avec succès");
        }
    }
}