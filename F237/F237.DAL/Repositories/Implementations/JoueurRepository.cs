using F237.DAL.Data;
using F237.DAL.Repositories.Interfaces;
using F237.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace F237.DAL.Repositories.Implementations
{
    public class JoueurRepository : BaseRepository<Joueur>, IJoueurRepository
    {
        public JoueurRepository(F237DbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Joueur>> GetJoueursParEquipeAsync(int equipeId)
        {
            return await _context.Joueurs
                .Where(j => j.EquipeId == equipeId && j.EstActif)
                .OrderBy(j => j.Nom)
                .ToListAsync();
        }

        public async Task<IEnumerable<Joueur>> GetTopButeursAsync(int limit = 10)
        {
            return await _context.Joueurs
                .Include(j => j.Equipe)
                .Where(j => j.EstActif)
                .OrderByDescending(j => j.NombreButs)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<IEnumerable<Joueur>> GetTopPasseursAsync(int limit = 10)
        {
            return await _context.Joueurs
                .Include(j => j.Equipe)
                .Where(j => j.EstActif)
                .OrderByDescending(j => j.NombrePasses)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<Joueur?> GetJoueurAvecStatsAsync(int joueurId)
        {
            return await _context.Joueurs
                .Include(j => j.Equipe)
                .Include(j => j.Buts)
                .FirstOrDefaultAsync(j => j.Id == joueurId);
        }
    }
}