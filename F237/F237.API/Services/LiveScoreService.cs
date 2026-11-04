// F237.API/Services/LiveScoreService.cs

using F237.API.DTOs;
using F237.API.Hubs;
using F237.DAL.Data;
using F237.Domain.Enums;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace F237.API.Services
{
    /// <summary>
    /// Service en arrière-plan pour les scores en direct (Elite One + Elite Two).
    /// À chaque tour :
    ///   1. Demande à API-Football les matchs en cours : /fixtures?live=411-813
    ///      (pas de saison dans la requête : ça marche quelle que soit la saison en cours)
    ///   2. Met à jour score, statut et minute en base
    ///   3. Pour les matchs qui ne sont plus "live" depuis le tour précédent (match terminé,
    ///      interrompu...), va chercher leur état final : sinon ils resteraient "en cours"
    ///   4. Envoie les scores à tous les navigateurs connectés (SignalR)
    /// </summary>
    public class LiveScoreService : BackgroundService
    {
        private readonly IServiceProvider _services;
        private readonly IHubContext<ScoresHub> _hub;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<LiveScoreService> _logger;

        // Plan Pro (7 500 requêtes/jour) : 1 requête par tour
        private readonly TimeSpan _intervalLive = TimeSpan.FromSeconds(30);  // pendant les matchs
        private readonly TimeSpan _intervalIdle = TimeSpan.FromMinutes(2);   // aucun match en cours

        private const string LIGUES = "411-813"; // Elite One - Elite Two

        // Matchs (id API) en cours au tour précédent
        private HashSet<int> _enCoursPrecedent = new();

        /// <summary>
        /// Dernier état du direct envoyé aux navigateurs. Le hub le renvoie à chaque
        /// nouvelle connexion : le navigateur a tout de suite scores et minutes,
        /// sans attendre le prochain tour (jusqu'à 30 s).
        /// </summary>
        public static IReadOnlyList<MatchDto> DernierEtat { get; private set; } = Array.Empty<MatchDto>();

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
                var desMatchsEnCours = false;
                try
                {
                    desMatchsEnCours = await SyncEtBroadcast(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Erreur dans LiveScoreService");
                }

                var delai = desMatchsEnCours ? _intervalLive : _intervalIdle;
                _logger.LogInformation("⏱ Prochain sync dans {Secondes}s", delai.TotalSeconds);
                await Task.Delay(delai, stoppingToken);
            }
        }

        private async Task<bool> SyncEtBroadcast(CancellationToken ct)
        {
            var client = _httpClientFactory.CreateClient("ApiFootball");

            // 1. Matchs en cours chez API-Football
            var enCours = await GetFixturesAsync(client, $"fixtures?live={LIGUES}", ct);
            if (enCours == null)
            {
                // Erreur réseau / API : on ne dit SURTOUT PAS "aucun match en direct" aux
                // navigateurs (le direct disparaîtrait). On garde l'état et on réessaie au tour suivant.
                return _enCoursPrecedent.Count > 0;
            }

            // 3. Matchs qui étaient en cours au tour précédent et ne le sont plus : état final
            var idsEnCours = enCours.Select(f => f.ApiFootballId).ToHashSet();
            var disparus = _enCoursPrecedent.Where(id => !idsEnCours.Contains(id)).ToList();
            var finis = disparus.Count > 0
                ? await GetFixturesAsync(client, $"fixtures?ids={string.Join('-', disparus)}", ct) ?? new List<MatchDto>()
                : new List<MatchDto>();
            _enCoursPrecedent = idsEnCours;

            // 2. Mise à jour en base
            using var scope = _services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<F237DbContext>();

            var aDiffuser = new List<MatchDto>();
            foreach (var fixture in enCours.Concat(finis))
            {
                var match = await context.Matchs.FirstOrDefaultAsync(m => m.ApiFootballId == fixture.ApiFootballId, ct);
                if (match == null)
                {
                    _logger.LogWarning("Match API {Id} en direct mais absent de la base (saison pas importée ?)", fixture.ApiFootballId);
                    continue;
                }

                var ancienScore = $"{match.ScoreDomicile}-{match.ScoreExterieur}";
                match.ScoreDomicile = fixture.ScoreDomicile;
                match.ScoreExterieur = fixture.ScoreExterieur;
                match.Statut = (StatutMatchEnum)fixture.Statut;

                // Infos de notre base pour les navigateurs
                fixture.Id = match.Id;
                fixture.SaisonId = match.SaisonId;
                if (fixture.Statut == 1) aDiffuser.Add(fixture);

                _logger.LogInformation("⚽ Match {Id}: {Ancien} → {Nouveau} ({Minute}', statut {Statut})",
                    match.Id, ancienScore, $"{match.ScoreDomicile}-{match.ScoreExterieur}", fixture.MinuteLive, match.Statut);
            }
            await context.SaveChangesAsync(ct);

            // 4. Diffusion
            DernierEtat = aDiffuser;
            if (aDiffuser.Count > 0)
            {
                await _hub.Clients.Group("live").SendAsync("ScoresLiveMaj", aDiffuser, ct);
                foreach (var m in aDiffuser)
                    await _hub.Clients.Group($"match_{m.Id}").SendAsync("MatchMaj", m, ct);
            }
            else
            {
                await _hub.Clients.Group("live").SendAsync("AucunMatchLive", ct);
            }

            return aDiffuser.Count > 0;
        }

        /// <summary>Appelle API-Football et transforme la réponse en MatchDto (null en cas d'erreur).</summary>
        private async Task<List<MatchDto>?> GetFixturesAsync(HttpClient client, string url, CancellationToken ct)
        {
            var fixtures = new List<MatchDto>();
            try
            {
                var resp = await client.GetAsync(url, ct);
                if (!resp.IsSuccessStatusCode)
                {
                    _logger.LogWarning("API-Football {Url} : HTTP {Code}", url, (int)resp.StatusCode);
                    return null;
                }

                using var doc = JsonDocument.Parse(await resp.Content.ReadAsStringAsync(ct));
                foreach (var item in doc.RootElement.GetProperty("response").EnumerateArray())
                {
                    var fix = item.GetProperty("fixture");
                    var goals = item.GetProperty("goals");
                    var teams = item.GetProperty("teams");
                    var statusEl = fix.GetProperty("status");

                    // NS=0, en cours=1, terminé=2, reporté/annulé=3, suspendu=4
                    var statut = statusEl.GetProperty("short").GetString() switch
                    {
                        "1H" or "HT" or "2H" or "ET" or "BT" or "P" or "LIVE" => 1,
                        "FT" or "AET" or "PEN" or "AWD" or "WO" => 2,
                        "PST" or "CANC" or "ABD" => 3,
                        "SUSP" or "INT" => 4,
                        _ => 0,
                    };

                    int? minute = statusEl.TryGetProperty("elapsed", out var el) && el.ValueKind == JsonValueKind.Number
                        ? el.GetInt32() : null;

                    fixtures.Add(new MatchDto
                    {
                        ApiFootballId = fix.GetProperty("id").GetInt32(),
                        DateMatch = fix.GetProperty("date").GetDateTimeOffset().UtcDateTime,
                        Statut = statut,
                        ScoreDomicile = goals.GetProperty("home").ValueKind == JsonValueKind.Number ? goals.GetProperty("home").GetInt32() : null,
                        ScoreExterieur = goals.GetProperty("away").ValueKind == JsonValueKind.Number ? goals.GetProperty("away").GetInt32() : null,
                        EquipeDomicile = new EquipeSimpleDto
                        {
                            Nom = teams.GetProperty("home").GetProperty("name").GetString() ?? "",
                            LogoUrl = teams.GetProperty("home").GetProperty("logo").GetString(),
                        },
                        EquipeExterieur = new EquipeSimpleDto
                        {
                            Nom = teams.GetProperty("away").GetProperty("name").GetString() ?? "",
                            LogoUrl = teams.GetProperty("away").GetProperty("logo").GetString(),
                        },
                        MinuteLive = minute,
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur API-Football {Url}", url);
                return null;
            }
            return fixtures;
        }
    }
}