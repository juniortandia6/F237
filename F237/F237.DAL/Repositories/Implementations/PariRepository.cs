using F237.DAL.Data;
using F237.DAL.Repositories.Interfaces;
using F237.Domain.Entities;
using F237.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace F237.DAL.Repositories.Implementations
{
    public class PariRepository : BaseRepository<Pari>, IPariRepository
    {
        public PariRepository(F237DbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Pari>> GetParisParUtilisateurAsync(int utilisateurId)
        {
            return await _context.Paris
                .Include(p => p.Match)
                    .ThenInclude(m => m.EquipeDomicile)
                .Include(p => p.Match)
                    .ThenInclude(m => m.EquipeExterieur)
                .Where(p => p.UtilisateurId == utilisateurId)
                .OrderByDescending(p => p.DatePari)
                .ToListAsync();
        }

        public async Task<IEnumerable<Pari>> GetParisParMatchAsync(int matchId)
        {
            return await _context.Paris
                .Include(p => p.Utilisateur)
                .Where(p => p.MatchId == matchId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Pari>> GetParisEnAttenteAsync()
        {
            return await _context.Paris
                .Include(p => p.Match)
                .Include(p => p.Utilisateur)
                .Where(p => p.Statut == StatutPariEnum.EnAttente)
                .ToListAsync();
        }

        public async Task<IEnumerable<Pari>> GetParisParGroupeAsync(int pariGroupeId)
        {
            return await _context.Paris
                .Include(p => p.Utilisateur)
                .Include(p => p.Match)
                    .ThenInclude(m => m.EquipeDomicile)
                .Include(p => p.Match)
                    .ThenInclude(m => m.EquipeExterieur)
                .Where(p => p.PariGroupeId == pariGroupeId)
                .ToListAsync();
        }

        public async Task<int> GetSoldePointsUtilisateurAsync(int utilisateurId)
        {
            var utilisateur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Id == utilisateurId);
            return utilisateur?.SoldePoints ?? 0;
        }
    }
}