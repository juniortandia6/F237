using F237.BLL.Services.Interfaces;
using F237.DAL.Repositories.Interfaces;
using F237.Domain.Entities;
using F237.Domain.Enums;

namespace F237.BLL.Services.Implementations
{
    public class PariService : IPariService
    {
        private readonly IPariRepository _pariRepository;
        private readonly IMatchRepository _matchRepository;

        public PariService(IPariRepository pariRepository, IMatchRepository matchRepository)
        {
            _pariRepository = pariRepository;
            _matchRepository = matchRepository;
        }

        public async Task<IEnumerable<Pari>> GetParisParUtilisateurAsync(int utilisateurId)
        {
            return await _pariRepository.GetParisParUtilisateurAsync(utilisateurId);
        }

        public async Task<IEnumerable<Pari>> GetParisParMatchAsync(int matchId)
        {
            return await _pariRepository.GetParisParMatchAsync(matchId);
        }

        public async Task<IEnumerable<Pari>> GetParisParGroupeAsync(int pariGroupeId)
        {
            return await _pariRepository.GetParisParGroupeAsync(pariGroupeId);
        }

        public async Task<Pari> PlacerPariAsync(int utilisateurId, int matchId, string pronostic, int mise)
        {
            var match = await _matchRepository.GetByIdAsync(matchId);
            if (match == null) throw new Exception("Match introuvable");
            if (match.Statut != StatutMatchEnum.Planifié)
                throw new Exception("Ce match n'accepte plus de paris");

            var pari = new Pari
            {
                UtilisateurId = utilisateurId,
                MatchId = matchId,
                Pronostic = Enum.Parse<ResultatPariEnum>(pronostic),
                Mise = mise,
                GainPotentiel = mise * 2,
                Statut = StatutPariEnum.EnAttente,
                DatePari = DateTime.Now
            };

            return await _pariRepository.AddAsync(pari);
        }

        public async Task TraiterParisApresMatchAsync(int matchId)
        {
            var match = await _matchRepository.GetByIdAsync(matchId);
            if (match == null || match.Statut != StatutMatchEnum.Terminé) return;

            ResultatPariEnum resultat;
            if (match.ScoreDomicile > match.ScoreExterieur)
                resultat = ResultatPariEnum.Domicile;
            else if (match.ScoreExterieur > match.ScoreDomicile)
                resultat = ResultatPariEnum.Extérieur;
            else
                resultat = ResultatPariEnum.Nul;

            var paris = await _pariRepository.GetParisParMatchAsync(matchId);
            foreach (var pari in paris)
            {
                pari.Statut = pari.Pronostic == resultat
                    ? StatutPariEnum.Gagné
                    : StatutPariEnum.Perdu;
                await _pariRepository.UpdateAsync(pari);
            }
        }

        public async Task<int> GetSoldePointsAsync(int utilisateurId)
        {
            return await _pariRepository.GetSoldePointsUtilisateurAsync(utilisateurId);
        }

        public async Task<bool> DemanderRetraitAsync(int utilisateurId, int montantPoints, string numeromobileMoney, string operateur)
        {
            var solde = await _pariRepository.GetSoldePointsUtilisateurAsync(utilisateurId);
            if (solde < montantPoints) return false;

            // Logique de retrait à implémenter
            return true;
        }
    }
}