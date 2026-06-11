using F237.BLL.Services.Interfaces;
using F237.DAL.Repositories.Interfaces;
using F237.Domain.Entities;
using F237.Domain.Enums;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Text.Json;

namespace F237.BLL.Services.Implementations
{
    public class ApiFootballService : IApiFootballService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly IEquipeRepository _equipeRepository;
        private readonly IMatchRepository _matchRepository;
        private readonly IClassementRepository _classementRepository;
        private readonly IJoueurRepository _joueurRepository;

        public ApiFootballService(
            HttpClient httpClient,
            IConfiguration configuration,
            IEquipeRepository equipeRepository,
            IMatchRepository matchRepository,
            IClassementRepository classementRepository,
            IJoueurRepository joueurRepository)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _equipeRepository = equipeRepository;
            _matchRepository = matchRepository;
            _classementRepository = classementRepository;
            _joueurRepository = joueurRepository;

            // Configuration du client HTTP
            var apiKey = _configuration["ApiFootball:ApiKey"];
            var baseUrl = _configuration["ApiFootball:BaseUrl"];
            _httpClient.BaseAddress = new Uri(baseUrl!);
            _httpClient.DefaultRequestHeaders.Add("x-apisports-key", apiKey);
        }

        public async Task<bool> TestConnectionAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("/status");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public async Task SyncEquipesAsync(int leagueId, int saison)
        {
            var response = await _httpClient.GetAsync($"/teams?league={leagueId}&season={saison}");
            if (!response.IsSuccessStatusCode) return;

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonDocument.Parse(json);
            var teams = data.RootElement.GetProperty("response");

            foreach (var team in teams.EnumerateArray())
            {
                var teamInfo = team.GetProperty("team");
                var equipe = new Equipe
                {
                    Nom = teamInfo.GetProperty("name").GetString() ?? string.Empty,
                    Ville = teamInfo.GetProperty("country").GetString() ?? string.Empty,
                    LogoUrl = teamInfo.GetProperty("logo").GetString(),
                    Division = leagueId == 715 ? DivisionEnum.EliteOne : DivisionEnum.EliteTwo,
                    EstActive = true
                };
                await _equipeRepository.AddAsync(equipe);
            }
        }

        public async Task SyncMatchsJourneeAsync(int leagueId, int saison)
        {
            var response = await _httpClient.GetAsync($"/fixtures?league={leagueId}&season={saison}");
            if (!response.IsSuccessStatusCode) return;

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonDocument.Parse(json);
            var fixtures = data.RootElement.GetProperty("response");

            foreach (var fixture in fixtures.EnumerateArray())
            {
                var fixtureInfo = fixture.GetProperty("fixture");
                var teams = fixture.GetProperty("teams");
                var goals = fixture.GetProperty("goals");

                var match = new Match
                {
                    DateMatch = fixtureInfo.GetProperty("date").GetDateTime(),
                    Statut = StatutMatchEnum.Planifié,
                    ScoreDomicile = goals.GetProperty("home").ValueKind != JsonValueKind.Null
                        ? goals.GetProperty("home").GetInt32() : null,
                    ScoreExterieur = goals.GetProperty("away").ValueKind != JsonValueKind.Null
                        ? goals.GetProperty("away").GetInt32() : null,
                };
                await _matchRepository.AddAsync(match);
            }
        }

        public async Task SyncScoresLiveAsync(int leagueId)
        {
            var response = await _httpClient.GetAsync($"/fixtures?live=all&league={leagueId}");
            if (!response.IsSuccessStatusCode) return;

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonDocument.Parse(json);
            var fixtures = data.RootElement.GetProperty("response");

            foreach (var fixture in fixtures.EnumerateArray())
            {
                var goals = fixture.GetProperty("goals");
                // Mise à jour des scores en direct
            }
        }

        public async Task SyncClassementAsync(int leagueId, int saison)
        {
            var response = await _httpClient.GetAsync($"/standings?league={leagueId}&season={saison}");
            if (!response.IsSuccessStatusCode) return;

            var json = await response.Content.ReadAsStringAsync();
            // Parser et mettre à jour le classement
        }

        public async Task SyncJoueursAsync(int leagueId, int saison)
        {
            var response = await _httpClient.GetAsync($"/players?league={leagueId}&season={saison}");
            if (!response.IsSuccessStatusCode) return;

            var json = await response.Content.ReadAsStringAsync();
            // Parser et mettre à jour les joueurs
        }
    }
}