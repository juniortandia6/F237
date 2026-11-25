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

        // Calcule le classement d'une saison à partir de NOS matchs (scores corrigés à la main compris).
        // Utilisé pour l'Elite Two à chaque import, et pour l'Elite One quand un score a été saisi dans l'admin.
        //  - Seuls les matchs terminés avec un score comptent (reportés, annulés, à venir : ignorés).
        //  - Toutes les équipes de la saison apparaissent, même sans match joué (0 point).
        //  - Égalité : points, puis différence de buts, puis buts marqués, puis ordre alphabétique
        //    (pour que deux équipes à égalité parfaite gardent toujours le même ordre).
        public async Task RecalculerClassementAsync(int saisonId)
        {
            var matchs = (await _matchRepository.GetMatchsParSaisonAsync(saisonId)).ToList();

            // Toutes les équipes de la saison (calendrier), même celles qui n'ont pas encore joué
            var stats = new Dictionary<int, Classement>();
            var noms = new Dictionary<int, string>();
            foreach (var m in matchs)
            {
                AjouterEquipe(stats, noms, m.EquipeDomicileId, m.EquipeDomicile?.Nom, saisonId);
                AjouterEquipe(stats, noms, m.EquipeExterieurId, m.EquipeExterieur?.Nom, saisonId);
            }

            foreach (var m in matchs)
            {
                if (m.Statut != StatutMatchEnum.Terminé) continue;
                if (m.ScoreDomicile == null || m.ScoreExterieur == null) continue;

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
                .ThenBy(c => noms.GetValueOrDefault(c.EquipeId, string.Empty), StringComparer.CurrentCultureIgnoreCase)
                .ThenBy(c => c.EquipeId)
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

        private static void AjouterEquipe(Dictionary<int, Classement> stats, Dictionary<int, string> noms, int equipeId, string? nom, int saisonId)
        {
            if (!stats.ContainsKey(equipeId))
                stats[equipeId] = new Classement { EquipeId = equipeId, SaisonId = saisonId };
            if (!string.IsNullOrEmpty(nom)) noms[equipeId] = nom;
        }

        public async Task MettreAJourClassementApresMatchAsync(int matchId)
        {
            var match = await _matchRepository.GetMatchAvecButsAsync(matchId);
            if (match == null || match.Statut != StatutMatchEnum.Terminé) return;
            await RecalculerClassementAsync(match.SaisonId);
        }
    }
}