// F237.API/Services/LiveScoreService.cs

using F237.API.DTOs;
using F237.API.Hubs;
using F237.BLL.Services;
using F237.DAL.Data;
using F237.Domain.Entities;
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
        public static IReadOnlyList<object> DernierEtat { get; private set; } = Array.Empty<object>();

        // Buts lus dans les "events" de l'API, par match (id API)
        private readonly Dictionary<int, List<ButLive>> _butsParMatch = new();

        // Statut court de l'API par match (ex. "HT" = mi-temps), pour l'affichage
        private readonly Dictionary<int, string> _statutCourtParMatch = new();

        // Temps additionnel en cours par match (ex. 5 pour "90+5'"), si l'API le donne
        private readonly Dictionary<int, int?> _extraParMatch = new();

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

            using var scope = _services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<F237DbContext>();

            // 3. Matchs "en cours" dans NOTRE base mais plus en direct chez l'API : on va
            //    chercher leur état final. On part de la base (et pas d'une liste en mémoire)
            //    pour que ça marche même si l'API F237 a redémarré pendant ou après le match.
            var idsEnCours = enCours.Select(f => f.ApiFootballId).ToHashSet();
            var enCoursEnBase = await context.Matchs
                .Where(m => m.Statut == StatutMatchEnum.EnCours && m.ApiFootballId != null)
                .Select(m => m.ApiFootballId)
                .ToListAsync(ct);
            var disparus = enCoursEnBase.Select(id => (int)id).Where(id => !idsEnCours.Contains(id)).Distinct().ToList();
            var finis = new List<MatchDto>();
            foreach (var lot in disparus.Chunk(20)) // 20 matchs max par appel /fixtures?ids=
                finis.AddRange(await GetFixturesAsync(client, $"fixtures?ids={string.Join('-', lot)}", ct) ?? new List<MatchDto>());
            _enCoursPrecedent = idsEnCours;

            // 2. Mise à jour en base

            var aDiffuser = new List<(int Id, object Donnees)>();
            var matchsMaj = new List<int>();
            foreach (var fixture in enCours.Concat(finis))
            {
                var match = await context.Matchs
                    .Include(m => m.EquipeDomicile)
                    .Include(m => m.EquipeExterieur)
                    .FirstOrDefaultAsync(m => m.ApiFootballId == fixture.ApiFootballId, ct);
                if (match == null)
                {
                    _logger.LogWarning("Match API {Id} en direct mais absent de la base (saison pas importée ?)", fixture.ApiFootballId);
                    continue;
                }

                // Match qui vient de se terminer : réimport auto de sa saison (classement, flèches, buts)
                if (fixture.Statut == 2 && (int)match.Statut != 2)
                {
                    SyncAutoService.Planifier(match.SaisonId, TimeSpan.FromMinutes(10));
                    SyncAutoService.Planifier(match.SaisonId, TimeSpan.FromMinutes(60));
                }

                var ancienScore = $"{match.ScoreDomicile}-{match.ScoreExterieur}";
                match.ScoreDomicile = fixture.ScoreDomicile;
                match.ScoreExterieur = fixture.ScoreExterieur;
                match.Statut = (StatutMatchEnum)fixture.Statut;

                // Buts du match (comme Flashscore : minute + buteur) : on remplace ceux de la base
                var buts = _butsParMatch.GetValueOrDefault(fixture.ApiFootballId) ?? new List<ButLive>();
                var anciensButs = await context.ButsMatch.Where(b => b.MatchId == match.Id).ToListAsync(ct);
                context.ButsMatch.RemoveRange(anciensButs);
                foreach (var b in buts)
                {
                    await context.ButsMatch.AddAsync(new ButMatch
                    {
                        MatchId = match.Id,
                        NomJoueur = b.NomJoueur,
                        NomEquipe = RattachementButeurs.NomEquipeCreditee(match, b.ApiEquipeId, b.NomEquipe),
                        ApiJoueurId = b.ApiJoueurId,
                        Minute = b.Minute,
                        EstButCSC = b.EstButCSC,
                        EstPenalty = b.EstPenalty,
                    }, ct);
                }

                // Infos de notre base pour les navigateurs
                fixture.Id = match.Id;
                fixture.SaisonId = match.SaisonId;

                // Logos : ceux de NOTRE base (logo remplacé à la main compris), pas ceux de l'API
                // (l'API renvoie parfois une image "image not available"). Les noms restent ceux de l'API,
                // car les buts diffusés en direct utilisent ces noms pour savoir de quel côté les afficher.
                if (fixture.EquipeDomicile != null && match.EquipeDomicile != null)
                {
                    fixture.EquipeDomicile.Id = match.EquipeDomicile.Id;
                    fixture.EquipeDomicile.LogoUrl = match.EquipeDomicile.LogoUrl ?? fixture.EquipeDomicile.LogoUrl;
                    fixture.EquipeDomicile.Division = (int)match.EquipeDomicile.Division;
                }
                if (fixture.EquipeExterieur != null && match.EquipeExterieur != null)
                {
                    fixture.EquipeExterieur.Id = match.EquipeExterieur.Id;
                    fixture.EquipeExterieur.LogoUrl = match.EquipeExterieur.LogoUrl ?? fixture.EquipeExterieur.LogoUrl;
                    fixture.EquipeExterieur.Division = (int)match.EquipeExterieur.Division;
                }
                if (fixture.Statut == 1)
                {
                    aDiffuser.Add((match.Id, new
                    {
                        fixture.Id,
                        fixture.ApiFootballId,
                        fixture.SaisonId,
                        fixture.Statut,
                        fixture.DateMatch,
                        fixture.ScoreDomicile,
                        fixture.ScoreExterieur,
                        fixture.MinuteLive,
                        StatutCourt = _statutCourtParMatch.GetValueOrDefault(fixture.ApiFootballId),
                        MinuteExtra = _extraParMatch.GetValueOrDefault(fixture.ApiFootballId),
                        fixture.EquipeDomicile,
                        fixture.EquipeExterieur,
                        Buts = buts,
                    }));
                }

                _logger.LogInformation("⚽ Match {Id}: {Ancien} → {Nouveau} ({Minute}', statut {Statut})",
                    match.Id, ancienScore, $"{match.ScoreDomicile}-{match.ScoreExterieur}", fixture.MinuteLive, match.Statut);
                matchsMaj.Add(match.Id);
            }
            await context.SaveChangesAsync(ct);

            // Buts recréés à chaque tour : on les relie aussitôt aux joueurs de l'effectif
            await RattachementButeurs.RelierButsAsync(context, matchsMaj, ct);

            // 4. Diffusion
            DernierEtat = aDiffuser.Select(x => x.Donnees).ToList();
            if (aDiffuser.Count > 0)
            {
                await _hub.Clients.Group("live").SendAsync("ScoresLiveMaj", DernierEtat, ct);
                foreach (var (id, donnees) in aDiffuser)
                    await _hub.Clients.Group($"match_{id}").SendAsync("MatchMaj", donnees, ct);
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

                    // Mêmes valeurs que StatutMatchEnum :
                    // 0 = Planifié, 1 = EnCours, 2 = Terminé, 3 = Reporté, 4 = Annulé.
                    // (INT = interrompu quelques minutes : le match est toujours en cours.)
                    var statut = statusEl.GetProperty("short").GetString()?.Trim().ToUpperInvariant() switch
                    {
                        "1H" or "HT" or "2H" or "ET" or "BT" or "P" or "LIVE" or "INT" => 1,
                        "FT" or "AET" or "PEN" or "AWD" or "WO" => 2,
                        "PST" or "SUSP" => 3,
                        "CANC" or "ABD" => 4,
                        _ => 0,
                    };

                    int? minute = statusEl.TryGetProperty("elapsed", out var el) && el.ValueKind == JsonValueKind.Number
                        ? el.GetInt32() : null;

                    // Buts (événements "Goal", sans les penaltys ratés)
                    var buts = new List<ButLive>();
                    if (item.TryGetProperty("events", out var events) && events.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var evt in events.EnumerateArray())
                        {
                            if (evt.GetProperty("type").GetString() != "Goal") continue;
                            var detail = evt.GetProperty("detail").GetString();
                            if (detail == "Missed Penalty") continue;
                            var joueur = evt.GetProperty("player");
                            var time = evt.GetProperty("time");
                            buts.Add(new ButLive
                            {
                                NomJoueur = joueur.TryGetProperty("name", out var nom) && nom.ValueKind == JsonValueKind.String
                                    ? nom.GetString() ?? "Inconnu" : "Inconnu",
                                NomEquipe = evt.GetProperty("team").GetProperty("name").GetString() ?? "",
                                ApiEquipeId = evt.GetProperty("team").TryGetProperty("id", out var eid) && eid.ValueKind == JsonValueKind.Number ? eid.GetInt32() : 0,
                                ApiJoueurId = joueur.TryGetProperty("id", out var jid) && jid.ValueKind == JsonValueKind.Number ? jid.GetInt32() : 0,
                                Minute = time.GetProperty("elapsed").ValueKind == JsonValueKind.Number ? time.GetProperty("elapsed").GetInt32() : 0,
                                MinuteAdditionnelle = time.TryGetProperty("extra", out var ex) && ex.ValueKind == JsonValueKind.Number ? ex.GetInt32() : null,
                                EstButCSC = detail == "Own Goal",
                                EstPenalty = detail == "Penalty",
                            });
                        }
                    }
                    _butsParMatch[fix.GetProperty("id").GetInt32()] = buts;
                    _statutCourtParMatch[fix.GetProperty("id").GetInt32()] = statusEl.GetProperty("short").GetString() ?? "";
                    _extraParMatch[fix.GetProperty("id").GetInt32()] =
                        statusEl.TryGetProperty("extra", out var extra) && extra.ValueKind == JsonValueKind.Number ? extra.GetInt32() : null;

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

    /// <summary>Un but tel que lu dans les événements en direct d'API-Football.</summary>
    public class ButLive
    {
        public string NomJoueur { get; set; } = "Inconnu";
        public string NomEquipe { get; set; } = "";
        public int ApiJoueurId { get; set; }
        [System.Text.Json.Serialization.JsonIgnore]
        public int ApiEquipeId { get; set; }          // sert à créditer le but sous NOTRE nom d'équipe (non diffusé)
        public int Minute { get; set; }
        public int? MinuteAdditionnelle { get; set; } // ex. 45+2
        public bool EstButCSC { get; set; }
        public bool EstPenalty { get; set; }
    }
}