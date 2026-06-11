using F237.DAL.Data;
using F237.DAL.Repositories.Interfaces;
using F237.Domain.Entities;
using F237.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace F237.DAL.Repositories.Implementations
{
    public class ClassementRepository : BaseRepository<Classement>, IClassementRepository
    {
        public ClassementRepository(F237DbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Classement>> GetClassementParSaisonAsync(int saisonId)
        {
            return await _context.Classements
                .Include(c => c.Equipe)
                .Where(c => c.SaisonId == saisonId)
                .OrderBy(c => c.Position)
                .ToListAsync();
        }

        public async Task<IEnumerable<Classement>> GetClassementParDivisionAsync(DivisionEnum division)
        {
            return await _context.Classements
                .Include(c => c.Equipe)
                .Include(c => c.Saison)
                .Where(c => c.Equipe.Division == division && c.Saison.EstActive)
                .OrderBy(c => c.Position)
                .ToListAsync();
        }

        public async Task<Classement?> GetClassementEquipeAsync(int equipeId, int saisonId)
        {
            return await _context.Classements
                .Include(c => c.Equipe)
                .FirstOrDefaultAsync(c => c.EquipeId == equipeId &&
                                         c.SaisonId == saisonId);
        }

        public async Task RecalculerClassementAsync(int saisonId)
        {
            var classements = await _context.Classements
                .Where(c => c.SaisonId == saisonId)
                .OrderByDescending(c => c.Points)
                .ThenByDescending(c => c.DifferenceDesButs)
                .ThenByDescending(c => c.ButsPour)
                .ToListAsync();

            for (int i = 0; i < classements.Count; i++)
            {
                classements[i].Position = i + 1;
            }

            await _context.SaveChangesAsync();
        }
    }
}