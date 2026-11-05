using F237.Domain.Entities;

namespace F237.DAL.Repositories.Interfaces
{
    public interface IArticleRepository
    {
        /// <summary>Articles publiés dont la date de publication est passée, du plus récent au plus ancien.</summary>
        Task<List<Article>> GetPubliesAsync(string? tag, DateTime maintenantUtc);

        /// <summary>Tous les articles (brouillons compris), pour l'admin.</summary>
        Task<List<Article>> GetTousAsync();

        Task<Article?> GetByIdAsync(int id);
        Task<Article?> GetBySlugAsync(string slug);
        Task<bool> SlugExisteAsync(string slug, int? saufId = null);

        Task AjouterAsync(Article article);
        Task ModifierAsync(Article article);
        Task SupprimerAsync(Article article);
    }
}