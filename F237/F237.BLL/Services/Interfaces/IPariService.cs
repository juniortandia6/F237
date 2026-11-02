using F237.Domain.Entities;

namespace F237.BLL.Services.Interfaces
{
    public interface IPariService
    {
        Task<IEnumerable<Pari>> GetParisParUtilisateurAsync(int utilisateurId);
        Task<IEnumerable<Pari>> GetParisParMatchAsync(int matchId);
        Task<IEnumerable<Pari>> GetParisParGroupeAsync(int pariGroupeId);
        Task<Pari> PlacerPariAsync(int utilisateurId, int matchId, string pronostic, int mise);
        Task TraiterParisApresMatchAsync(int matchId);
        Task<int> GetSoldePointsAsync(int utilisateurId);
        Task<bool> DemanderRetraitAsync(int utilisateurId, int montantPoints, string numeromobileMoney, string operateur);
    }
}