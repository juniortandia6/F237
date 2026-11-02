using F237.Domain.Entities;
using F237.Domain.Enums;

namespace F237.DAL.Repositories.Interfaces
{
    public interface IPariRepository : IRepository<Pari>
    {
        Task<IEnumerable<Pari>> GetParisParUtilisateurAsync(int utilisateurId);
        Task<IEnumerable<Pari>> GetParisParMatchAsync(int matchId);
        Task<IEnumerable<Pari>> GetParisEnAttenteAsync();
        Task<IEnumerable<Pari>> GetParisParGroupeAsync(int pariGroupeId);
        Task<int> GetSoldePointsUtilisateurAsync(int utilisateurId);
    }
}