using F237.Domain.Entities;
using F237.Domain.Enums;

namespace F237.DAL.Repositories.Interfaces
{
    public interface IEquipeRepository : IRepository<Equipe>
    {
        Task<IEnumerable<Equipe>> GetByDivisionAsync(DivisionEnum division);
        Task<Equipe?> GetWithJoueursAsync(int equipeId);
        Task<IEnumerable<Equipe>> GetEquipesActivesAsync();
    }
}