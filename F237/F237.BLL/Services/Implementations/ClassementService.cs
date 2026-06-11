using F237.BLL.Services.Interfaces;
using F237.DAL.Repositories.Implementations;
using F237.DAL.Repositories.Interfaces;
using F237.Domain.Entities;
using F237.Domain.Enums;

namespace F237.BLL.Services.Implementations
{
    public class ClassementService : IClassementService
    {
        private readonly IClassementRepository _classementRepository;
        private readonly IMatchRepository _matchRepository;

        public ClassementService(IClassementRepository classementRepository, IMatchRepository matchRepository)
        {
            _classementRepository = classementRepository;
            _matchRepository = matchRepository;
        }

        public async Task<IEnumerable<Classement>> GetClassementParSaisonAsync(int saisonId)
        {
            return await _classementRepository.GetClassementParSaisonAsync(saisonId);
        }

        public async Task<IEnumerable<Classement>> GetClassementParDivisionAsync(DivisionEnum division)
        {
            return await _classementRepository.GetClassementParDivisionAsync(division);
        }

        public async Task<Classement?> GetClassementEquipeAsync(int equipeId, int saisonId)
        {
            return await _classementRepository.GetClassementEquipeAsync(equipeId, saisonId);
        }

        public async Task RecalculerClassementAsync(int saisonId)
        {
            await _classementRepository.RecalculerClassementAsync(saisonId);
        }

        public async Task MettreAJourClassementApresMatchAsync(int matchId)
        {
            var match = await _matchRepository.GetMatchAvecButsAsync(matchId);
            if (match == null || match.Statut != StatutMatchEnum.Terminé) return;

            // Mettre à jour classement équipe domicile
            var classementDomicile = await _classementRepository
                .GetClassementEquipeAsync(match.EquipeDomicileId, match.SaisonId);

            // Mettre à jour classement équipe extérieur
            var classementExterieur = await _classementRepository
                .GetClassementEquipeAsync(match.EquipeExterieurId, match.SaisonId);

            if (classementDomicile == null || classementExterieur == null) return;

            classementDomicile.MatchsJoues++;
            classementExterieur.MatchsJoues++;
            classementDomicile.ButsPour += match.ScoreDomicile ?? 0;
            classementDomicile.ButsContre += match.ScoreExterieur ?? 0;
            classementExterieur.ButsPour += match.ScoreExterieur ?? 0;
            classementExterieur.ButsContre += match.ScoreDomicile ?? 0;

            // Victoire domicile
            if (match.ScoreDomicile > match.ScoreExterieur)
            {
                classementDomicile.Victoires++;
                classementDomicile.Points += 3;
                classementExterieur.Defaites++;
            }
            // Victoire extérieur
            else if (match.ScoreExterieur > match.ScoreDomicile)
            {
                classementExterieur.Victoires++;
                classementExterieur.Points += 3;
                classementDomicile.Defaites++;
            }
            // Nul
            else
            {
                classementDomicile.Nuls++;
                classementExterieur.Nuls++;
                classementDomicile.Points++;
                classementExterieur.Points++;
            }

            classementDomicile.DifferenceDesButs = classementDomicile.ButsPour - classementDomicile.ButsContre;
            classementExterieur.DifferenceDesButs = classementExterieur.ButsPour - classementExterieur.ButsContre;

            await _classementRepository.UpdateAsync(classementDomicile);
            await _classementRepository.UpdateAsync(classementExterieur);
            await _classementRepository.RecalculerClassementAsync(match.SaisonId);
        }
    }
}