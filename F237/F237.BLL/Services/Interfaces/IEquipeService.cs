using F237.Domain.Entities;
using F237.Domain.Enums;

namespace F237.BLL.Services.Interfaces
{
    public interface IEquipeService
    {
        Task<IEnumerable<Equipe>> GetAllEquipesAsync();
        Task<IEnumerable<Equipe>> GetEquipesParDivisionAsync(DivisionEnum division);
        Task<Equipe?> GetEquipeParIdAsync(int id);
        Task<Equipe?> GetEquipeAvecJoueursAsync(int equipeId);
        Task<Equipe> CreerEquipeAsync(Equipe equipe);
        Task UpdateEquipeAsync(Equipe equipe);
        Task DeleteEquipeAsync(int id);
    }
}