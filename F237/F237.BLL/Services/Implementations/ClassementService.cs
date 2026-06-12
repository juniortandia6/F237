using F237.BLL.Services.Interfaces;
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
            var matchs = await _matchRepository.GetMatchsParSaisonAsync(saisonId);
            var matchsTermines = matchs.Where(m => m.Statut == StatutMatchEnum.Terminé).ToList();

            // Construire stats depuis zéro
            var stats = new Dictionary<int, Classement>();

            foreach (var m in matchsTermines)
            {
                if (m.ScoreDomicile == null || m.ScoreExterieur == null) continue;

                if (!stats.ContainsKey(m.EquipeDomicileId))
                    stats[m.EquipeDomicileId] = new Classement { EquipeId = m.EquipeDomicileId, SaisonId = saisonId };

                if (!stats.ContainsKey(m.EquipeExterieurId))
                    stats[m.EquipeExterieurId] = new Classement { EquipeId = m.EquipeExterieurId, SaisonId = saisonId };

                var dom = stats[m.EquipeDomicileId];
                var ext = stats[m.EquipeExterieurId];

                dom.MatchsJoues++;
                ext.MatchsJoues++;
                dom.ButsPour += m.ScoreDomicile.Value;
                dom.ButsContre += m.ScoreExterieur.Value;
                ext.ButsPour += m.ScoreExterieur.Value;
                ext.ButsContre += m.ScoreDomicile.Value;

                if (m.ScoreDomicile > m.ScoreExterieur)
                {
                    dom.Victoires++; dom.Points += 3; ext.Defaites++;
                }
                else if (m.ScoreExterieur > m.ScoreDomicile)
                {
                    ext.Victoires++; ext.Points += 3; dom.Defaites++;
                }
                else
                {
                    dom.Nuls++; ext.Nuls++; dom.Points++; ext.Points++;
                }
            }

            // Trier
            var classementTrie = stats.Values
                .Select(c => { c.DifferenceDesButs = c.ButsPour - c.ButsContre; return c; })
                .OrderByDescending(c => c.Points)
                .ThenByDescending(c => c.DifferenceDesButs)
                .ThenByDescending(c => c.ButsPour)
                .ToList();

            for (int i = 0; i < classementTrie.Count; i++)
                classementTrie[i].Position = i + 1;

            // Supprimer anciens classements
            var anciens = await _classementRepository.GetClassementParSaisonAsync(saisonId);
            foreach (var ancien in anciens)
                await _classementRepository.DeleteAsync(ancien.Id);

            // Insérer nouveaux
            foreach (var c in classementTrie)
                await _classementRepository.AddAsync(c);
        }

        public async Task MettreAJourClassementApresMatchAsync(int matchId)
        {
            var match = await _matchRepository.GetMatchAvecButsAsync(matchId);
            if (match == null || match.Statut != StatutMatchEnum.Terminé) return;
            await RecalculerClassementAsync(match.SaisonId);
        }
    }
}