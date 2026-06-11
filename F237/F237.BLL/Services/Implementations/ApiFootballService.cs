using F237.BLL.Services.Interfaces;
using F237.DAL.Data;
using F237.DAL.Repositories.Interfaces;
using F237.Domain.Entities;
using F237.Domain.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
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
        private readonly F237DbContext _context;

        public ApiFootballService(
            HttpClient httpClient,
            IConfiguration configuration,
            IEquipeRepository equipeRepository,
            IMatchRepository matchRepository,
            IClassementRepository classementRepository,
            IJoueurRepository joueurRepository,
            F237DbContext context)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _equipeRepository = equipeRepository;
            _matchRepository = matchRepository;
            _classementRepository = classementRepository;
            _joueurRepository = joueurRepository;
            _context = context;

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

            var equipesExistantes = await _context.Equipes.ToListAsync();

            foreach (var team in teams.EnumerateArray())
            {
                var teamInfo = team.GetProperty("team");
                var apiId = teamInfo.GetProperty("id").GetInt32();
                var nom = teamInfo.GetProperty("name").GetString() ?? string.Empty;
                var logo = teamInfo.GetProperty("logo").GetString();
                var pays = teamInfo.GetProperty("country").GetString() ?? string.Empty;
                var division = leagueId == 411 ? DivisionEnum.EliteOne : DivisionEnum.EliteTwo;

                var equipeExistante = equipesExistantes.FirstOrDefault(e => e.ApiFootballId == apiId);

                if (equipeExistante != null)
                {
                    equipeExistante.Nom = nom;
                    equipeExistante.LogoUrl = logo;
                    equipeExistante.Division = division;
                    equipeExistante.EstActive = true;
                    _context.Equipes.Update(equipeExistante);
                }
                else
                {
                    var equipe = new Equipe
                    {
                        ApiFootballId = apiId,
                        Nom = nom,
                        Pays = pays,
                        LogoUrl = logo,
                        Division = division,
                        EstActive = true
                    };
                    await _context.Equipes.AddAsync(equipe);
                }
            }
            await _context.SaveChangesAsync();
        }

        public async Task SyncMatchsJourneeAsync(int leagueId, int saison)
        {
            var response = await _httpClient.GetAsync($"/fixtures?league={leagueId}&season={saison}");
            if (!response.IsSuccessStatusCode) return;

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonDocument.Parse(json);
            var fixtures = data.RootElement.GetProperty("response");

            var equipes = await _context.Equipes.ToListAsync();

            foreach (var fixture in fixtures.EnumerateArray())
            {
                var fixtureInfo = fixture.GetProperty("fixture");
                var goals = fixture.GetProperty("goals");
                var teams = fixture.GetProperty("teams");

                var apiIdDomicile = teams.GetProperty("home").GetProperty("id").GetInt32();
                var apiIdExterieur = teams.GetProperty("away").GetProperty("id").GetInt32();

                var equipeDomicile = equipes.FirstOrDefault(e => e.ApiFootballId == apiIdDomicile);
                var equipeExterieur = equipes.FirstOrDefault(e => e.ApiFootballId == apiIdExterieur);

                if (equipeDomicile == null || equipeExterieur == null) continue;

                var apiFixtureId = fixtureInfo.GetProperty("id").GetInt32();

                var matchExistant = await _context.Matchs
                    .FirstOrDefaultAsync(m => m.ApiFootballId == apiFixtureId);

                if (matchExistant != null) continue;

                var statutStr = fixtureInfo.GetProperty("status").GetProperty("short").GetString();
                var statut = statutStr switch
                {
                    "FT" => StatutMatchEnum.Terminé,
                    "LIVE" or "1H" or "2H" or "HT" => StatutMatchEnum.EnCours,
                    _ => StatutMatchEnum.Planifié
                };

                var match = new Match
                {
                    ApiFootballId = apiFixtureId,
                    DateMatch = fixtureInfo.GetProperty("date").GetDateTime(),
                    Statut = statut,
                    EquipeDomicileId = equipeDomicile.Id,
                    EquipeExterieurId = equipeExterieur.Id,
                    SaisonId = leagueId == 411 ? 1 : 2,
                    ScoreDomicile = goals.GetProperty("home").ValueKind != JsonValueKind.Null
                        ? goals.GetProperty("home").GetInt32() : null,
                    ScoreExterieur = goals.GetProperty("away").ValueKind != JsonValueKind.Null
                        ? goals.GetProperty("away").GetInt32() : null,
                };
                await _context.Matchs.AddAsync(match);
            }
            await _context.SaveChangesAsync();
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
                var fixtureInfo = fixture.GetProperty("fixture");
                var goals = fixture.GetProperty("goals");
                var apiFixtureId = fixtureInfo.GetProperty("id").GetInt32();

                var match = await _context.Matchs
                    .FirstOrDefaultAsync(m => m.ApiFootballId == apiFixtureId);

                if (match == null) continue;

                match.ScoreDomicile = goals.GetProperty("home").ValueKind != JsonValueKind.Null
                    ? goals.GetProperty("home").GetInt32() : null;
                match.ScoreExterieur = goals.GetProperty("away").ValueKind != JsonValueKind.Null
                    ? goals.GetProperty("away").GetInt32() : null;
                match.Statut = StatutMatchEnum.EnCours;

                _context.Matchs.Update(match);
            }
            await _context.SaveChangesAsync();
        }

        public async Task SyncClassementAsync(int leagueId, int saison)
        {
            var response = await _httpClient.GetAsync($"/standings?league={leagueId}&season={saison}");
            if (!response.IsSuccessStatusCode) return;

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonDocument.Parse(json);

            var responseArray = data.RootElement.GetProperty("response");
            if (responseArray.GetArrayLength() == 0) return;

            var standings = responseArray[0]
                .GetProperty("league")
                .GetProperty("standings")[0];

            var equipes = await _context.Equipes.ToListAsync();
            var saisonId = leagueId == 411 ? 1 : 2;

            foreach (var entry in standings.EnumerateArray())
            {
                var apiTeamId = entry.GetProperty("team").GetProperty("id").GetInt32();
                var equipe = equipes.FirstOrDefault(e => e.ApiFootballId == apiTeamId);
                if (equipe == null) continue;

                var all = entry.GetProperty("all");

                var existant = await _context.Classements
                    .FirstOrDefaultAsync(c => c.EquipeId == equipe.Id && c.SaisonId == saisonId);

                if (existant != null)
                {
                    existant.Position = entry.GetProperty("rank").GetInt32();
                    existant.MatchsJoues = all.GetProperty("played").GetInt32();
                    existant.Victoires = all.GetProperty("win").GetInt32();
                    existant.Nuls = all.GetProperty("draw").GetInt32();
                    existant.Defaites = all.GetProperty("lose").GetInt32();
                    existant.ButsPour = all.GetProperty("goals").GetProperty("for").GetInt32();
                    existant.ButsContre = all.GetProperty("goals").GetProperty("against").GetInt32();
                    existant.DifferenceDesButs = entry.GetProperty("goalsDiff").GetInt32();
                    existant.Points = entry.GetProperty("points").GetInt32();
                    _context.Classements.Update(existant);
                }
                else
                {
                    var classement = new Classement
                    {
                        EquipeId = equipe.Id,
                        SaisonId = saisonId,
                        Position = entry.GetProperty("rank").GetInt32(),
                        MatchsJoues = all.GetProperty("played").GetInt32(),
                        Victoires = all.GetProperty("win").GetInt32(),
                        Nuls = all.GetProperty("draw").GetInt32(),
                        Defaites = all.GetProperty("lose").GetInt32(),
                        ButsPour = all.GetProperty("goals").GetProperty("for").GetInt32(),
                        ButsContre = all.GetProperty("goals").GetProperty("against").GetInt32(),
                        DifferenceDesButs = entry.GetProperty("goalsDiff").GetInt32(),
                        Points = entry.GetProperty("points").GetInt32()
                    };
                    await _context.Classements.AddAsync(classement);
                }
            }
            await _context.SaveChangesAsync();
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