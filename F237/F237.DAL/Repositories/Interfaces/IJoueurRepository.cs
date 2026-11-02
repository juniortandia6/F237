using F237.Domain.Entities;

namespace F237.DAL.Repositories.Interfaces
{
    public interface IJoueurRepository : IRepository<Joueur>
    {
        Task<IEnumerable<Joueur>> GetJoueursParEquipeAsync(int equipeId);
        Task<IEnumerable<Joueur>> GetTopButeursAsync(int limit = 10);
        Task<IEnumerable<Joueur>> GetTopPasseursAsync(int limit = 10);
        Task<Joueur?> GetJoueurAvecStatsAsync(int joueurId);
    }
}