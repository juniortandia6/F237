using F237.BLL.Services.Interfaces;
using F237.DAL.Repositories.Interfaces;
using F237.Domain.Entities;

namespace F237.BLL.Services.Implementations
{
    public class JoueurService : IJoueurService
    {
        private readonly IJoueurRepository _joueurRepository;

        public JoueurService(IJoueurRepository joueurRepository)
        {
            _joueurRepository = joueurRepository;
        }

        public async Task<IEnumerable<Joueur>> GetAllJoueursAsync()
        {
            return await _joueurRepository.GetAllAsync();
        }

        public async Task<IEnumerable<Joueur>> GetJoueursParEquipeAsync(int equipeId)
        {
            return await _joueurRepository.GetJoueursParEquipeAsync(equipeId);
        }

        public async Task<IEnumerable<Joueur>> GetTopButeursAsync(int limit = 10)
        {
            return await _joueurRepository.GetTopButeursAsync(limit);
        }

        public async Task<IEnumerable<Joueur>> GetTopPasseursAsync(int limit = 10)
        {
            return await _joueurRepository.GetTopPasseursAsync(limit);
        }

        public async Task<Joueur?> GetJoueurParIdAsync(int id)
        {
            return await _joueurRepository.GetByIdAsync(id);
        }

        public async Task<Joueur?> GetJoueurAvecStatsAsync(int joueurId)
        {
            return await _joueurRepository.GetJoueurAvecStatsAsync(joueurId);
        }

        public async Task<Joueur> CreerJoueurAsync(Joueur joueur)
        {
            return await _joueurRepository.AddAsync(joueur);
        }

        public async Task UpdateJoueurAsync(Joueur joueur)
        {
            await _joueurRepository.UpdateAsync(joueur);
        }

        public async Task DeleteJoueurAsync(int id)
        {
            await _joueurRepository.DeleteAsync(id);
        }
    }
}