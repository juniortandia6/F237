using F237.Domain.Entities;

namespace F237.BLL.Services.Interfaces
{
    public interface IMatchService
    {
        Task<IEnumerable<Match>> GetAllMatchsAsync();
        Task<IEnumerable<Match>> GetMatchsEnCoursAsync();
        Task<IEnumerable<Match>> GetMatchsParSaisonAsync(int saisonId);
        Task<IEnumerable<Match>> GetMatchsParEquipeAsync(int equipeId);
        Task<IEnumerable<Match>> GetMatchsParDateAsync(DateTime date);
        Task<Match?> GetMatchParIdAsync(int id);
        Task<Match?> GetMatchAvecButsAsync(int matchId);
        Task<Match> CreerMatchAsync(Match match);
        Task UpdateScoreAsync(int matchId, int scoreDomicile, int scoreExterieur);
        Task TerminerMatchAsync(int matchId);
    }
}