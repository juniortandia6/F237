using F237.Domain.Entities;

namespace F237.BLL.Services.Interfaces
{
    public interface IJoueurService
    {
        Task<IEnumerable<Joueur>> GetAllJoueursAsync();
        Task<IEnumerable<Joueur>> GetJoueursParEquipeAsync(int equipeId);
        Task<IEnumerable<Joueur>> GetTopButeursAsync(int limit = 10);
        Task<IEnumerable<Joueur>> GetTopPasseursAsync(int limit = 10);
        Task<Joueur?> GetJoueurParIdAsync(int id);
        Task<Joueur?> GetJoueurAvecStatsAsync(int joueurId);
        Task<Joueur> CreerJoueurAsync(Joueur joueur);
        Task UpdateJoueurAsync(Joueur joueur);
        Task DeleteJoueurAsync(int id);
    }
}