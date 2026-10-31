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

        // Suivi du quota pendant un import
        private int _requetesUtilisees;
        private int? _requetesRestantes;

        // Nombre max de matchs par appel /fixtures?ids=... (limite API-Football)
        private const int TAILLE_LOT = 20;

        // Plan gratuit : 10 requêtes par minute -> une requête toutes les 7 secondes
        private static readonly TimeSpan DELAI_MIN_ENTRE_REQUETES = TimeSpan.FromSeconds(7);
        private DateTime _derniereRequete = DateTime.MinValue;

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

        // ── Utilitaires ─────────────────────────────────────────────────────

        /// <summary>
        /// Appelle l'API, compte la requête, lit le quota restant et lève une
        /// exception claire si l'API renvoie une erreur (ex. saison non incluse
        /// dans le plan gratuit). API-Football répond 200 même en cas d'erreur :
        /// il faut lire le champ "errors".
        /// </summary>
        private async Task<JsonElement> GetApiAsync(string url)
        {
            HttpResponseMessage response;
            var tentative = 0;
            while (true)
            {
                // Plan gratuit : 10 requêtes / minute max -> on espace les appels
                var attente = DELAI_MIN_ENTRE_REQUETES - (DateTime.UtcNow - _derniereRequete);
                if (attente > TimeSpan.Zero) await Task.Delay(attente);

                response = await _httpClient.GetAsync(url);
                _derniereRequete = DateTime.UtcNow;
                _requetesUtilisees++;

                // 429 = trop de requêtes dans la minute : on attend et on réessaie (3 fois max)
                if ((int)response.StatusCode == 429 && tentative < 3)
                {
                    tentative++;
                    await Task.Delay(TimeSpan.FromSeconds(30 * tentative));
                    continue;
                }
                break;
            }

            if (response.Headers.TryGetValues("x-ratelimit-requests-remaining", out var valeurs)
                && int.TryParse(valeurs.FirstOrDefault(), out var restantes))
            {
                _requetesRestantes = restantes;
            }

            var json = await response.Content.ReadAsStringAsync();
            if ((int)response.StatusCode == 429)
                throw new ApiFootballException("Limite de requêtes atteinte (par minute ou quota du jour). Vérifie GET /api/sync/quota puis relance : l'import reprendra où il s'est arrêté.");
            if (!response.IsSuccessStatusCode)
                throw new ApiFootballException($"HTTP {(int)response.StatusCode} sur {url}");

            using var doc = JsonDocument.Parse(json);
            var racine = doc.RootElement.Clone();

            if (racine.TryGetProperty("errors", out var erreurs))
            {
                var message = erreurs.ValueKind switch
                {
                    JsonValueKind.Object => string.Join(" | ", erreurs.EnumerateObject().Select(p => p.Value.ToString())),
                    JsonValueKind.Array => string.Join(" | ", erreurs.EnumerateArray().Select(e => e.ToString())),
                    _ => string.Empty,
                };
                if (!string.IsNullOrWhiteSpace(message))
                    throw new ApiFootballException(message);
            }

            return racine.GetProperty("response");
        }

        private static int? EntierOuNull(JsonElement e) =>
            e.ValueKind == JsonValueKind.Number ? e.GetInt32() : null;

        // Statut API -> statut F237
        private static StatutMatchEnum ConvertirStatut(string? statutCourt) => statutCourt switch
        {
            "FT" or "AET" or "PEN" or "AWD" or "WO" => StatutMatchEnum.Terminé,
            "LIVE" or "1H" or "2H" or "HT" or "ET" or "BT" or "P" or "INT" => StatutMatchEnum.EnCours,
            _ => StatutMatchEnum.Planifié
        };

        private static DivisionEnum DivisionDe(int leagueId) =>
            leagueId == 411 ? DivisionEnum.EliteOne : DivisionEnum.EliteTwo;

        // Ajoute les buts d'un match à partir de son tableau "events"
        private async Task<int> AjouterButsAsync(int matchId, JsonElement events)
        {
            var ajoutes = 0;
            foreach (var evt in events.EnumerateArray())
            {
                if (evt.GetProperty("type").GetString() != "Goal") continue;

                var detail = evt.GetProperty("detail").GetString();
                // Un penalty raté est aussi un événement "Goal" chez API-Football : on l'ignore
                if (detail == "Missed Penalty") continue;

                var joueur = evt.GetProperty("player");
                await _context.ButsMatch.AddAsync(new ButMatch
                {
                    MatchId = matchId,
                    NomJoueur = joueur.GetProperty("name").GetString() ?? "Inconnu",
                    NomEquipe = evt.GetProperty("team").GetProperty("name").GetString() ?? "",
                    ApiJoueurId = EntierOuNull(joueur.GetProperty("id")) ?? 0,
                    Minute = EntierOuNull(evt.GetProperty("time").GetProperty("elapsed")) ?? 0,
                    EstButCSC = detail == "Own Goal",
                    EstPenalty = detail == "Penalty"
                });
                ajoutes++;
            }
            return ajoutes;
        }

        // ── Méthodes existantes (inchangées sauf mention) ──────────────────

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
                var division = DivisionDe(leagueId);

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

        // Modifié : statuts AET / PEN / AWD comptés comme terminés, date mise à jour si le match est reporté
        public async Task SyncMatchsJourneeAsync(int leagueId, int saison, int saisonId = 1)
        {
            var response = await _httpClient.GetAsync($"/fixtures?league={leagueId}&season={saison}");
            if (!response.IsSuccessStatusCode) return;

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonDocument.Parse(json);
            var fixtures = data.RootElement.GetProperty("response");
            await EnregistrerMatchsAsync(fixtures, saisonId);
        }

        // Enregistre / met à jour une liste de matchs (réponse de /fixtures)
        private async Task<int> EnregistrerMatchsAsync(JsonElement fixtures, int saisonId)
        {
            var equipes = await _context.Equipes.ToListAsync();
            var matchsExistants = (await _context.Matchs.ToListAsync())
                .GroupBy(m => m.ApiFootballId)
                .ToDictionary(g => g.Key, g => g.First());
            var total = 0;

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
                var statut = ConvertirStatut(fixtureInfo.GetProperty("status").GetProperty("short").GetString());
                var scoreDomicile = EntierOuNull(goals.GetProperty("home"));
                var scoreExterieur = EntierOuNull(goals.GetProperty("away"));

                if (matchsExistants.TryGetValue(apiFixtureId, out var matchExistant))
                {
                    matchExistant.Statut = statut;
                    matchExistant.ScoreDomicile = scoreDomicile;
                    matchExistant.ScoreExterieur = scoreExterieur;
                    matchExistant.SaisonId = saisonId;
                    matchExistant.DateMatch = fixtureInfo.GetProperty("date").GetDateTime(); // match reporté = nouvelle date
                    _context.Matchs.Update(matchExistant);
                }
                else
                {
                    await _context.Matchs.AddAsync(new Match
                    {
                        ApiFootballId = apiFixtureId,
                        DateMatch = fixtureInfo.GetProperty("date").GetDateTime(),
                        Statut = statut,
                        EquipeDomicileId = equipeDomicile.Id,
                        EquipeExterieurId = equipeExterieur.Id,
                        SaisonId = saisonId,
                        ScoreDomicile = scoreDomicile,
                        ScoreExterieur = scoreExterieur,
                    });
                }
                total++;
            }
            await _context.SaveChangesAsync();
            return total;
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

                match.ScoreDomicile = EntierOuNull(goals.GetProperty("home"));
                match.ScoreExterieur = EntierOuNull(goals.GetProperty("away"));
                match.Statut = StatutMatchEnum.EnCours;

                _context.Matchs.Update(match);
            }
            await _context.SaveChangesAsync();
        }

        public async Task SyncClassementAsync(int leagueId, int saison, int saisonId = 1)
        {
            var response = await _httpClient.GetAsync($"/standings?league={leagueId}&season={saison}");
            if (!response.IsSuccessStatusCode) return;

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonDocument.Parse(json);
            await EnregistrerClassementAsync(data.RootElement.GetProperty("response"), saisonId);
        }

        // Modifié : lit TOUS les groupes (l'Elite Two se joue parfois en poules),
        // pas seulement le premier
        private async Task<int> EnregistrerClassementAsync(JsonElement responseArray, int saisonId)
        {
            if (responseArray.GetArrayLength() == 0) return 0;

            var groupes = responseArray[0].GetProperty("league").GetProperty("standings");
            var equipes = await _context.Equipes.ToListAsync();
            var total = 0;

            foreach (var groupe in groupes.EnumerateArray())
            {
                foreach (var entry in groupe.EnumerateArray())
                {
                    var apiTeamId = entry.GetProperty("team").GetProperty("id").GetInt32();
                    var equipe = equipes.FirstOrDefault(e => e.ApiFootballId == apiTeamId);
                    if (equipe == null) continue;

                    var all = entry.GetProperty("all");
                    var existant = await _context.Classements
                        .FirstOrDefaultAsync(c => c.EquipeId == equipe.Id && c.SaisonId == saisonId);

                    var classement = existant ?? new Classement { EquipeId = equipe.Id, SaisonId = saisonId };
                    classement.Position = entry.GetProperty("rank").GetInt32();
                    classement.MatchsJoues = all.GetProperty("played").GetInt32();
                    classement.Victoires = all.GetProperty("win").GetInt32();
                    classement.Nuls = all.GetProperty("draw").GetInt32();
                    classement.Defaites = all.GetProperty("lose").GetInt32();
                    classement.ButsPour = EntierOuNull(all.GetProperty("goals").GetProperty("for")) ?? 0;
                    classement.ButsContre = EntierOuNull(all.GetProperty("goals").GetProperty("against")) ?? 0;
                    classement.DifferenceDesButs = entry.GetProperty("goalsDiff").GetInt32();
                    classement.Points = entry.GetProperty("points").GetInt32();

                    if (existant == null) await _context.Classements.AddAsync(classement);
                    else _context.Classements.Update(classement);
                    total++;
                }
            }
            await _context.SaveChangesAsync();
            return total;
        }

        public async Task SyncJoueursAsync(int leagueId, int saison)
        {
            var response = await _httpClient.GetAsync($"/players?league={leagueId}&season={saison}");
            if (!response.IsSuccessStatusCode) return;

            var json = await response.Content.ReadAsStringAsync();
            // Parser et mettre à jour les joueurs
        }

        // Modifié : ignore les penaltys ratés (type "Goal" + detail "Missed Penalty")
        public async Task SyncEvenementsAsync(int leagueId, int saison, int saisonId)
        {
            var matchs = await _context.Matchs
                .Where(m => m.SaisonId == saisonId && m.Statut == StatutMatchEnum.Terminé)
                .ToListAsync();

            foreach (var match in matchs)
            {
                var butsExistants = await _context.ButsMatch.AnyAsync(b => b.MatchId == match.Id);
                if (butsExistants) continue;

                var response = await _httpClient.GetAsync($"/fixtures/events?fixture={match.ApiFootballId}");
                if (!response.IsSuccessStatusCode) continue;

                var json = await response.Content.ReadAsStringAsync();
                var data = JsonDocument.Parse(json);
                await AjouterButsAsync(match.Id, data.RootElement.GetProperty("response"));
                await _context.SaveChangesAsync();
            }
        }

        // ── Nouveau : import d'une saison complète ─────────────────────────

        public async Task<ResultatImportSaison> ImporterSaisonAsync(int leagueId, int saison)
        {
            _requetesUtilisees = 0;
            _requetesRestantes = null;
            var resultat = new ResultatImportSaison { LeagueId = leagueId, Saison = saison };

            try
            {
                // 1. Dates de la saison (1 requête)
                var ligues = await GetApiAsync($"/leagues?id={leagueId}&season={saison}");
                if (ligues.GetArrayLength() == 0)
                    throw new ApiFootballException($"Saison {saison} introuvable pour la ligue {leagueId}.");

                var infosSaison = ligues[0].GetProperty("seasons")[0];
                var dateDebut = DateTime.Parse(infosSaison.GetProperty("start").GetString()!);
                var dateFin = DateTime.Parse(infosSaison.GetProperty("end").GetString()!);
                var nomLigue = ligues[0].GetProperty("league").GetProperty("name").GetString() ?? "";

                // 2. Saison dans F237Db (créée si elle n'existe pas)
                var division = DivisionDe(leagueId);
                var entiteSaison = await _context.Saisons
                    .FirstOrDefaultAsync(s => s.Annee == saison && s.Division == division);

                var libelle = dateDebut.Year == dateFin.Year
                    ? $"{dateFin.Year}"
                    : $"{dateDebut.Year}-{dateFin.Year % 100:00}";

                if (entiteSaison == null)
                {
                    entiteSaison = new Saison
                    {
                        Nom = $"MTN {nomLigue} {libelle}",
                        Annee = saison,
                        Division = division,
                        DateDebut = dateDebut,
                        DateFin = dateFin,
                        EstActive = false // une saison importée n'est jamais la saison active
                    };
                    await _context.Saisons.AddAsync(entiteSaison);
                    await _context.SaveChangesAsync();
                }
                resultat.SaisonId = entiteSaison.Id;
                resultat.NomSaison = entiteSaison.Nom;

                // 3. Équipes (1 requête) — on AJOUTE seulement les clubs manquants,
                //    sans toucher à la division / EstActive des clubs actuels
                var equipesApi = await GetApiAsync($"/teams?league={leagueId}&season={saison}");
                var idsExistants = (await _context.Equipes.Select(e => e.ApiFootballId).ToListAsync()).ToHashSet();
                foreach (var team in equipesApi.EnumerateArray())
                {
                    var t = team.GetProperty("team");
                    var apiId = t.GetProperty("id").GetInt32();
                    if (idsExistants.Contains(apiId)) continue;

                    await _context.Equipes.AddAsync(new Equipe
                    {
                        ApiFootballId = apiId,
                        Nom = t.GetProperty("name").GetString() ?? string.Empty,
                        Pays = t.GetProperty("country").GetString() ?? string.Empty,
                        LogoUrl = t.GetProperty("logo").GetString(),
                        Division = division,
                        EstActive = false // club d'une ancienne saison, pas forcément encore en championnat
                    });
                    idsExistants.Add(apiId);
                    resultat.EquipesAjoutees++;
                }
                await _context.SaveChangesAsync();

                // 4. Matchs (1 requête)
                var fixtures = await GetApiAsync($"/fixtures?league={leagueId}&season={saison}");
                resultat.Matchs = await EnregistrerMatchsAsync(fixtures, entiteSaison.Id);

                // 5. Classement (1 requête)
                var standings = await GetApiAsync($"/standings?league={leagueId}&season={saison}");
                resultat.EquipesClassement = await EnregistrerClassementAsync(standings, entiteSaison.Id);

                // 6. Buts, par lots de 20 matchs (≈ 1 requête pour 20 matchs)
                resultat.ButsImportes = await ImporterButsParLotsAsync(entiteSaison.Id);
            }
            catch (ApiFootballException ex)
            {
                resultat.Erreur = ex.Message;
            }

            // Ce qui reste à faire (si le quota s'est épuisé en route)
            if (resultat.SaisonId != 0)
                resultat.MatchsSansButsRestants = await RequeteMatchsSansButs(resultat.SaisonId).CountAsync();

            resultat.RequetesUtilisees = _requetesUtilisees;
            resultat.RequetesRestantes = _requetesRestantes;
            resultat.Termine = resultat.Erreur == null && resultat.MatchsSansButsRestants == 0;
            return resultat;
        }

        // Matchs terminés avec au moins un but marqué, mais aucun but enregistré
        // (les 0-0 sont exclus : ils n'ont rien à importer)
        private IQueryable<Match> RequeteMatchsSansButs(int saisonId) =>
            _context.Matchs.Where(m =>
                m.SaisonId == saisonId
                && m.Statut == StatutMatchEnum.Terminé
                && (m.ScoreDomicile ?? 0) + (m.ScoreExterieur ?? 0) > 0
                && !_context.ButsMatch.Any(b => b.MatchId == m.Id));

        private async Task<int> ImporterButsParLotsAsync(int saisonId)
        {
            var aTraiter = await RequeteMatchsSansButs(saisonId)
                .Select(m => new { m.Id, m.ApiFootballId })
                .ToListAsync();

            var total = 0;
            foreach (var lot in aTraiter.Chunk(TAILLE_LOT))
            {
                // On s'arrête avant d'épuiser complètement le quota du jour
                if (_requetesRestantes is <= 2)
                    throw new ApiFootballException("Quota du jour presque épuisé : relance l'import demain, il reprendra où il s'est arrêté.");

                var ids = string.Join("-", lot.Select(m => m.ApiFootballId));
                var fixtures = await GetApiAsync($"/fixtures?ids={ids}");

                foreach (var fixture in fixtures.EnumerateArray())
                {
                    var apiId = fixture.GetProperty("fixture").GetProperty("id").GetInt32();
                    var match = lot.FirstOrDefault(m => m.ApiFootballId == apiId);
                    if (match == null || !fixture.TryGetProperty("events", out var events)) continue;

                    total += await AjouterButsAsync(match.Id, events);
                }
                await _context.SaveChangesAsync(); // on sauvegarde à chaque lot : reprise possible
            }
            return total;
        }

        public async Task<QuotaApiFootball?> GetQuotaAsync()
        {
            var response = await _httpClient.GetAsync("/status");
            if (!response.IsSuccessStatusCode) return null;

            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            var r = doc.RootElement.GetProperty("response");
            if (r.ValueKind != JsonValueKind.Object) return null;

            return new QuotaApiFootball
            {
                Plan = r.GetProperty("subscription").GetProperty("plan").GetString() ?? "",
                RequetesDuJour = r.GetProperty("requests").GetProperty("current").GetInt32(),
                LimiteParJour = r.GetProperty("requests").GetProperty("limit_day").GetInt32(),
            };
        }
    }

    /// <summary>Erreur renvoyée par API-Football (plan, quota, paramètre...).</summary>
    public class ApiFootballException : Exception
    {
        public ApiFootballException(string message) : base(message) { }
    }
}