using F237.Domain.Entities;
using F237.Domain.Enums;

namespace F237.DAL.Repositories.Interfaces
{
    public interface IMatchRepository : IRepository<Match>
    {
        Task<IEnumerable<Match>> GetMatchsEnCoursAsync();
        Task<IEnumerable<Match>> GetMatchsParSaisonAsync(int saisonId);
        Task<IEnumerable<Match>> GetMatchsParEquipeAsync(int equipeId);
        Task<IEnumerable<Match>> GetMatchsParDateAsync(DateTime date);
        Task<Match?> GetMatchAvecButsAsync(int matchId);
    }
}