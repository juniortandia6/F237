using F237.API.DTOs;
using F237.BLL.Services.Interfaces;
using F237.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace F237.API.Controllers
{
    /// <summary>
    /// Actualités du site.
    ///   Public : GET /api/articles?tag=Elite%20One   et   GET /api/articles/{slug}
    ///   Admin  : GET /api/articles/admin, GET /api/articles/admin/{id},
    ///            POST /api/articles, PUT /api/articles/{id}, DELETE /api/articles/{id}
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class ArticlesController : ControllerBase
    {
        private readonly IArticleService _articleService;

        public ArticlesController(IArticleService articleService)
        {
            _articleService = articleService;
        }

        // ── Public ────────────────────────────────────────────────────────────

        // GET /api/articles?tag=Elite%20One — articles publiés, du plus récent au plus ancien
        [HttpGet]
        public async Task<ActionResult<List<ArticleDto>>> GetPublies([FromQuery] string? tag)
        {
            var articles = await _articleService.GetPubliesAsync(tag);
            return Ok(articles.Select(a => ArticleDto.Depuis(a, avecContenu: false)));
        }

        // GET /api/articles/{slug} — un article publié, avec son contenu
        [HttpGet("{slug}")]
        public async Task<ActionResult<ArticleDto>> GetBySlug(string slug)
        {
            var article = await _articleService.GetPublieBySlugAsync(slug);
            return article == null ? NotFound() : Ok(ArticleDto.Depuis(article, avecContenu: true));
        }

        // ── Admin ─────────────────────────────────────────────────────────────

        // GET /api/articles/admin — tous les articles, brouillons compris
        [Authorize(Roles = Roles.Admin)]
        [HttpGet("admin")]
        public async Task<ActionResult<List<ArticleAdminDto>>> GetTous()
        {
            var articles = await _articleService.GetTousAsync();
            return Ok(articles.Select(ArticleAdminDto.Depuis));
        }

        // GET /api/articles/admin/5
        [Authorize(Roles = Roles.Admin)]
        [HttpGet("admin/{id:int}")]
        public async Task<ActionResult<ArticleAdminDto>> GetById(int id)
        {
            var article = await _articleService.GetByIdAsync(id);
            return article == null ? NotFound() : Ok(ArticleAdminDto.Depuis(article));
        }

        // POST /api/articles
        [Authorize(Roles = Roles.Admin)]
        [HttpPost]
        public async Task<ActionResult<ArticleAdminDto>> Creer([FromBody] SaisieArticle saisie)
        {
            var resultat = await _articleService.CreerAsync(saisie);
            if (resultat.Erreur != null) return BadRequest(new { message = resultat.Erreur });
            return CreatedAtAction(nameof(GetById), new { id = resultat.Article!.Id }, ArticleAdminDto.Depuis(resultat.Article));
        }

        // PUT /api/articles/5
        [Authorize(Roles = Roles.Admin)]
        [HttpPut("{id:int}")]
        public async Task<ActionResult<ArticleAdminDto>> Modifier(int id, [FromBody] SaisieArticle saisie)
        {
            var resultat = await _articleService.ModifierAsync(id, saisie);
            if (resultat.Introuvable) return NotFound();
            if (resultat.Erreur != null) return BadRequest(new { message = resultat.Erreur });
            return Ok(ArticleAdminDto.Depuis(resultat.Article!));
        }

        // DELETE /api/articles/5
        [Authorize(Roles = Roles.Admin)]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Supprimer(int id)
        {
            return await _articleService.SupprimerAsync(id) ? NoContent() : NotFound();
        }
    }
}