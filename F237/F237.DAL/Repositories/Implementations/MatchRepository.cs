using F237.DAL.Data;
using F237.DAL.Repositories.Interfaces;
using F237.Domain.Entities;
using F237.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace F237.DAL.Repositories.Implementations
{
    public class MatchRepository : BaseRepository<Match>, IMatchRepository
    {
        public MatchRepository(F237DbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Match>> GetMatchsEnCoursAsync()
        {
            return await _context.Matchs
                .Include(m => m.EquipeDomicile)
                .Include(m => m.EquipeExterieur)
                .Include(m => m.Buts)
                .Where(m => m.Statut == StatutMatchEnum.EnCours)
                .ToListAsync();
        }

        public async Task<IEnumerable<Match>> GetMatchsParSaisonAsync(int saisonId)
        {
            return await _context.Matchs
                .Include(m => m.EquipeDomicile)
                .Include(m => m.EquipeExterieur)
                .Include(m => m.Buts)
                .Where(m => m.SaisonId == saisonId)
                .OrderBy(m => m.DateMatch)
                .ToListAsync();
        }

        public async Task<IEnumerable<Match>> GetMatchsParEquipeAsync(int equipeId)
        {
            return await _context.Matchs
                .Include(m => m.EquipeDomicile)
                .Include(m => m.EquipeExterieur)
                .Include(m => m.Buts)
                .Where(m => m.EquipeDomicileId == equipeId ||
                            m.EquipeExterieurId == equipeId)
                .OrderByDescending(m => m.DateMatch)
                .ToListAsync();
        }

        public async Task<IEnumerable<Match>> GetMatchsParDateAsync(DateTime date)
        {
            return await _context.Matchs
                .Include(m => m.EquipeDomicile)
                .Include(m => m.EquipeExterieur)
                .Include(m => m.Buts)
                .Where(m => m.DateMatch.Date == date.Date)
                .ToListAsync();
        }

        public async Task<Match?> GetMatchAvecButsAsync(int matchId)
        {
            return await _context.Matchs
                .Include(m => m.EquipeDomicile)
                .Include(m => m.EquipeExterieur)
                .Include(m => m.Buts)
                .FirstOrDefaultAsync(m => m.Id == matchId);
        }
    }
}