using F237.DAL.Data;
using F237.DAL.Repositories.Interfaces;
using F237.Domain.Entities;
using F237.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace F237.DAL.Repositories.Implementations
{
    public class EquipeRepository : BaseRepository<Equipe>, IEquipeRepository
    {
        public EquipeRepository(F237DbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Equipe>> GetByDivisionAsync(DivisionEnum division)
        {
            return await _context.Equipes
                .Where(e => e.Division == division)
                .ToListAsync();
        }

        public async Task<Equipe?> GetWithJoueursAsync(int equipeId)
        {
            return await _context.Equipes
                .Include(e => e.Joueurs)
                .FirstOrDefaultAsync(e => e.Id == equipeId);
        }

        public async Task<IEnumerable<Equipe>> GetEquipesActivesAsync()
        {
            return await _context.Equipes
                .Where(e => e.EstActive)
                .ToListAsync();
        }
    }
}