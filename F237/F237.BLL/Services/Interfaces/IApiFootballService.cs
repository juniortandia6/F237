using F237.Domain.Entities;
namespace F237.BLL.Services.Interfaces
{
    public interface IApiFootballService
    {
        Task SyncEquipesAsync(int leagueId, int saison);
        Task SyncMatchsJourneeAsync(int leagueId, int saison, int saisonId = 1);
        Task SyncScoresLiveAsync(int leagueId);
        Task SyncClassementAsync(int leagueId, int saison, int saisonId = 1);
        Task SyncJoueursAsync(int leagueId, int saison);
        Task SyncEvenementsAsync(int leagueId, int saison, int saisonId);
        Task<bool> TestConnectionAsync();
    }
}