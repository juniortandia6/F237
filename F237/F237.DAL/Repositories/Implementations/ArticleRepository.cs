using F237.DAL.Data;
using F237.DAL.Repositories.Interfaces;
using F237.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace F237.DAL.Repositories.Implementations
{
    public class ArticleRepository : IArticleRepository
    {
        private readonly F237DbContext _context;

        public ArticleRepository(F237DbContext context)
        {
            _context = context;
        }

        public async Task<List<Article>> GetPubliesAsync(string? tag, DateTime maintenantUtc)
        {
            var requete = _context.Articles
                .AsNoTracking()
                .Where(a => a.EstPublie && a.DatePublication <= maintenantUtc);

            if (!string.IsNullOrWhiteSpace(tag))
                requete = requete.Where(a => a.Tag == tag);

            return await requete
                .OrderByDescending(a => a.DatePublication)
                .ThenByDescending(a => a.Id)
                .ToListAsync();
        }

        public async Task<List<Article>> GetTousAsync()
        {
            return await _context.Articles
                .AsNoTracking()
                .OrderByDescending(a => a.DatePublication)
                .ThenByDescending(a => a.Id)
                .ToListAsync();
        }

        public async Task<Article?> GetByIdAsync(int id)
        {
            return await _context.Articles.FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<Article?> GetBySlugAsync(string slug)
        {
            return await _context.Articles.AsNoTracking().FirstOrDefaultAsync(a => a.Slug == slug);
        }

        public async Task<bool> SlugExisteAsync(string slug, int? saufId = null)
        {
            return await _context.Articles.AnyAsync(a => a.Slug == slug && (saufId == null || a.Id != saufId));
        }

        public async Task AjouterAsync(Article article)
        {
            _context.Articles.Add(article);
            await _context.SaveChangesAsync();
        }

        public async Task ModifierAsync(Article article)
        {
            _context.Articles.Update(article);
            await _context.SaveChangesAsync();
        }

        public async Task SupprimerAsync(Article article)
        {
            _context.Articles.Remove(article);
            await _context.SaveChangesAsync();
        }
    }
}