using F237.Domain.Entities;
using F237.Domain.Enums;

namespace F237.BLL.Services.Interfaces
{
    public interface IClassementService
    {
        Task<IEnumerable<Classement>> GetClassementParSaisonAsync(int saisonId);
        Task<IEnumerable<Classement>> GetClassementParDivisionAsync(DivisionEnum division);
        Task<Classement?> GetClassementEquipeAsync(int equipeId, int saisonId);
        Task RecalculerClassementAsync(int saisonId);
        Task MettreAJourClassementApresMatchAsync(int matchId);
    }
}