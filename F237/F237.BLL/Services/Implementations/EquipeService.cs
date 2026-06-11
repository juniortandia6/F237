using F237.BLL.Services.Interfaces;
using F237.DAL.Repositories.Interfaces;
using F237.Domain.Entities;
using F237.Domain.Enums;

namespace F237.BLL.Services.Implementations
{
    public class EquipeService : IEquipeService
    {
        private readonly IEquipeRepository _equipeRepository;

        public EquipeService(IEquipeRepository equipeRepository)
        {
            _equipeRepository = equipeRepository;
        }

        public async Task<IEnumerable<Equipe>> GetAllEquipesAsync()
        {
            return await _equipeRepository.GetAllAsync();
        }

        public async Task<IEnumerable<Equipe>> GetEquipesParDivisionAsync(DivisionEnum division)
        {
            return await _equipeRepository.GetByDivisionAsync(division);
        }

        public async Task<Equipe?> GetEquipeParIdAsync(int id)
        {
            return await _equipeRepository.GetByIdAsync(id);
        }

        public async Task<Equipe?> GetEquipeAvecJoueursAsync(int equipeId)
        {
            return await _equipeRepository.GetWithJoueursAsync(equipeId);
        }

        public async Task<Equipe> CreerEquipeAsync(Equipe equipe)
        {
            return await _equipeRepository.AddAsync(equipe);
        }

        public async Task UpdateEquipeAsync(Equipe equipe)
        {
            await _equipeRepository.UpdateAsync(equipe);
        }

        public async Task DeleteEquipeAsync(int id)
        {
            await _equipeRepository.DeleteAsync(id);
        }
    }
}