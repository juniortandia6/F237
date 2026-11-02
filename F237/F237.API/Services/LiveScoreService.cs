// F237.API/Services/LiveScoreService.cs

using F237.API.DTOs;
using F237.API.Hubs;
using F237.DAL;
using F237.DAL.Data;
using F237.Domain.Enums;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace F237.API.Services
{
    /// <summary>
    /// Background service qui tourne en arrière-plan.
    /// Toutes les 60 secondes :
    ///   1. Vérifie s'il y a des matchs en cours (Elite One/Two 2026)
    ///   2. Appelle API-Football /fixtures?live=all&league=411 et &league=813
    ///   3. Met à jour les scores en DB
    ///   4. Broadcast via SignalR à tous les clients connectés
    /// </summary>
    public class LiveScoreService : BackgroundService
    {
        private readonly IServiceProvider _services;
        private readonly IHubContext<ScoresHub> _hub;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<LiveScoreService> _logger;

        // Intervalles
        private readonly TimeSpan _intervalLive = TimeSpan.FromSeconds(60);    // pendant matchs live
        private readonly TimeSpan _intervalIdle = TimeSpan.FromMinutes(5);     // aucun match en cours

        private const int ELITE_ONE_ID = 411;
        private const int ELITE_TWO_ID = 813;
        private const int SAISON = 2026;
        private const int ELITE_ONE_SAISONID = 3;
        private const int ELITE_TWO_SAISONID = 4;

        public LiveScoreService(
            IServiceProvider services,
            IHubContext<ScoresHub> hub,
            IHttpClientFactory httpClientFactory,
            ILogger<LiveScoreService> logger)
        {
            _services = services;
            _hub = hub;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🟢 LiveScoreService démarré");

            while (!stoppingToken.IsCancellationRequested)
            {
                bool desMatchsEnCours = false;

                try
                {
                    desMatchsEnCours = await SyncEtBroadcast(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Erreur dans LiveScoreService");
                }

                var delai = desMatchsEnCours ? _intervalLive : _intervalIdle;
                _logger.LogInformation($"⏱ Prochain sync dans {delai.TotalSeconds}s");
                await Task.Delay(delai, stoppingToken);
            }
        }

        private async Task<bool> SyncEtBroadcast(CancellationToken ct)
        {
            var client = _httpClientFactory.CreateClient("ApiFootball");
            var matchsLiveDto = new List<MatchDto>();
            bool auMoinsUnLive = false;

            // Sync Elite One + Elite Two en parallèle
            var tasks = new[]
            {
                FetchMatchsLive(client, ELITE_ONE_ID, ELITE_ONE_SAISONID),
                FetchMatchsLive(client, ELITE_TWO_ID, ELITE_TWO_SAISONID)
            };

            var results = await Task.WhenAll(tasks);

            using var scope = _services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<F237DbContext>();

            foreach (var (fixtures, saisonId) in results)
            {
                if (fixtures == null || fixtures.Count == 0) continue;

                auMoinsUnLive = true;

                foreach (var fixture in fixtures)
                {
                    var matchId = fixture.ApiFootballId;

                    var match = await context.Matchs
                        .FirstOrDefaultAsync(m => m.ApiFootballId == matchId, ct);

                    if (match == null) continue;

                    // Mettre à jour score + statut
                    var ancienScore = $"{match.ScoreDomicile}-{match.ScoreExterieur}";
                    match.ScoreDomicile = fixture.ScoreDomicile;
                    match.ScoreExterieur = fixture.ScoreExterieur;
                    match.Statut = (StatutMatchEnum)fixture.Statut;

                    var nouveauScore = $"{match.ScoreDomicile}-{match.ScoreExterieur}";

                    // Broadcast même si score n'a pas changé (pour le temps écoulé)
                    matchsLiveDto.Add(fixture);

                    _logger.LogInformation(
                        $"⚽ Match {match.Id}: {ancienScore} → {nouveauScore} (statut: {match.Statut})");
                }

                await context.SaveChangesAsync(ct);
            }

            // Broadcast à tous les clients "live"
            if (matchsLiveDto.Count > 0)
            {
                await _hub.Clients.Group("live").SendAsync(
                    "ScoresLiveMaj",
                    matchsLiveDto,
                    ct
                );

                // Broadcast individuel par match
                foreach (var m in matchsLiveDto)
                {
                    await _hub.Clients.Group($"match_{m.Id}").SendAsync(
                        "MatchMaj",
                        m,
                        ct
                    );
                }
            }
            else
            {
                // Aucun match live → envoyer un ping pour dire que tout est calme
                await _hub.Clients.Group("live").SendAsync("AucunMatchLive", ct);
            }

            return auMoinsUnLive;
        }

        /// <summary>
        /// Appelle /fixtures?live=all&league={leagueId} et retourne les matchs en cours
        /// </summary>
        private async Task<(List<MatchDto> fixtures, int saisonId)> FetchMatchsLive(
            HttpClient client, int leagueId, int saisonId)
        {
            var fixtures = new List<MatchDto>();

            try
            {
                // D'abord essayer les matchs "live"
                var resp = await client.GetAsync(
                    $"fixtures?live=all&league={leagueId}&season={SAISON}");

                if (!resp.IsSuccessStatusCode)
                    return (fixtures, saisonId);

                var json = await resp.Content.ReadAsStringAsync();
                var doc = JsonDocument.Parse(json);
                var responses = doc.RootElement.GetProperty("response");

                foreach (var item in responses.EnumerateArray())
                {
                    var fix = item.GetProperty("fixture");
                    var goals = item.GetProperty("goals");
                    var teams = item.GetProperty("teams");

                    var statusEl = fix.GetProperty("status");
                    var statusShort = statusEl.GetProperty("short").GetString();

                    // Mapper le statut API → notre enum
                    // NS=0, 1H/2H/ET/P=1, FT/AET/PEN=2, PST/CANC=3, SUSP=4
                    int statut = statusShort switch
                    {
                        "NS" => 0,
                        "1H" or "HT" or "2H" or "ET" or "BT" or "P" or "LIVE" => 1,
                        "FT" or "AET" or "PEN" => 2,
                        "PST" or "CANC" or "ABD" => 3,
                        "SUSP" or "INT" => 4,
                        _ => 0
                    };

                    // Temps écoulé
                    int? minuteLive = null;
                    if (statusEl.TryGetProperty("elapsed", out var elapsedEl)
                        && elapsedEl.ValueKind == JsonValueKind.Number)
                    {
                        minuteLive = elapsedEl.GetInt32();
                    }

                    var matchDto = new MatchDto
                    {
                        ApiFootballId = fix.GetProperty("id").GetInt32(),
                        DateMatch = fix.GetProperty("date").GetDateTime(),
                        Statut = statut,
                        SaisonId = saisonId,
                        ScoreDomicile = goals.GetProperty("home").ValueKind == JsonValueKind.Number
                            ? goals.GetProperty("home").GetInt32() : null,
                        ScoreExterieur = goals.GetProperty("away").ValueKind == JsonValueKind.Number
                            ? goals.GetProperty("away").GetInt32() : null,
                        EquipeDomicile = new EquipeSimpleDto
                        {
                            Nom = teams.GetProperty("home").GetProperty("name").GetString() ?? "",
                            LogoUrl = teams.GetProperty("home").GetProperty("logo").GetString()
                        },
                        EquipeExterieur = new EquipeSimpleDto
                        {
                            Nom = teams.GetProperty("away").GetProperty("name").GetString() ?? "",
                            LogoUrl = teams.GetProperty("away").GetProperty("logo").GetString()
                        },
                        MinuteLive = minuteLive
                    };

                    fixtures.Add(matchDto);
                }
            }
            catch (Exception ex)
            {
                // Logger mais ne pas crasher
                Console.WriteLine($"[LiveScoreService] Erreur FetchMatchsLive league={leagueId}: {ex.Message}");
            }

            return (fixtures, saisonId);
        }
    }
}
