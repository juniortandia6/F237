using F237.BLL.Services.Interfaces;
using F237.DAL.Repositories.Implementations;
using F237.DAL.Repositories.Interfaces;
using F237.Domain.Entities;
using F237.Domain.Enums;

namespace F237.BLL.Services.Implementations
{
    public class MatchService : IMatchService
    {
        private readonly IMatchRepository _matchRepository;
        private readonly IClassementService _classementService;

        public MatchService(IMatchRepository matchRepository, IClassementService classementService)
        {
            _matchRepository = matchRepository;
            _classementService = classementService;
        }

        public async Task<IEnumerable<Match>> GetAllMatchsAsync()
        {
            return await _matchRepository.GetAllAsync();
        }

        public async Task<IEnumerable<Match>> GetMatchsEnCoursAsync()
        {
            return await _matchRepository.GetMatchsEnCoursAsync();
        }

        public async Task<IEnumerable<Match>> GetMatchsParSaisonAsync(int saisonId)
        {
            return await _matchRepository.GetMatchsParSaisonAsync(saisonId);
        }

        public async Task<IEnumerable<Match>> GetMatchsParEquipeAsync(int equipeId)
        {
            return await _matchRepository.GetMatchsParEquipeAsync(equipeId);
        }

        public async Task<IEnumerable<Match>> GetMatchsParDateAsync(DateTime date)
        {
            return await _matchRepository.GetMatchsParDateAsync(date);
        }

        public async Task<Match?> GetMatchParIdAsync(int id)
        {
            return await _matchRepository.GetByIdAsync(id);
        }

        public async Task<Match?> GetMatchAvecButsAsync(int matchId)
        {
            return await _matchRepository.GetMatchAvecButsAsync(matchId);
        }

        public async Task<Match> CreerMatchAsync(Match match)
        {
            return await _matchRepository.AddAsync(match);
        }

        public async Task UpdateScoreAsync(int matchId, int scoreDomicile, int scoreExterieur)
        {
            var match = await _matchRepository.GetByIdAsync(matchId);
            if (match != null)
            {
                match.ScoreDomicile = scoreDomicile;
                match.ScoreExterieur = scoreExterieur;
                match.Statut = StatutMatchEnum.EnCours;
                await _matchRepository.UpdateAsync(match);
            }
        }

        public async Task TerminerMatchAsync(int matchId)
        {
            var match = await _matchRepository.GetByIdAsync(matchId);
            if (match != null)
            {
                match.Statut = StatutMatchEnum.Terminé;
                await _matchRepository.UpdateAsync(match);
                await _classementService.MettreAJourClassementApresMatchAsync(matchId);
            }
        }
    }
}