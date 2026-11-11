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

        // L'API complète souvent les buteurs après coup : on relit les buts des matchs
        // récents (ce nombre de jours) tant qu'il leur manque un buteur ou un but.
        private const int JOURS_RELECTURE_BUTS = 30;
        private const string BUTEUR_INCONNU = "Inconnu";

        // Plan Pro : on garde une petite pause entre deux appels (si l'API répond 429,
        // le code attend et réessaie tout seul)
        private static readonly TimeSpan DELAI_MIN_ENTRE_REQUETES = TimeSpan.FromMilliseconds(300);
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

        // Statut API -> statut F237.
        // L'API n'est pas constante sur la casse (ex. "Canc" au lieu de "CANC") :
        // on compare toujours en majuscules.
        //   NS, TBD                -> Planifié (TBD = date à fixer, le match reste à venir)
        //   PST, SUSP              -> Reporté
        //   CANC, ABD              -> Annulé  (annulé, ou arrêté et jamais repris)
        //   FT, AET, PEN, AWD, WO  -> Terminé (AWD / WO = sur tapis vert)
        private static StatutMatchEnum ConvertirStatut(string? statutCourt) => statutCourt?.Trim().ToUpperInvariant() switch
        {
            "FT" or "AET" or "PEN" or "AWD" or "WO" => StatutMatchEnum.Terminé,
            "LIVE" or "1H" or "2H" or "HT" or "ET" or "BT" or "P" or "INT" => StatutMatchEnum.EnCours,
            "PST" or "SUSP" => StatutMatchEnum.Reporté,
            "CANC" or "ABD" => StatutMatchEnum.Annulé,
            _ => StatutMatchEnum.Planifié
        };

        private static DivisionEnum DivisionDe(int leagueId) =>
            leagueId == 411 ? DivisionEnum.EliteOne : DivisionEnum.EliteTwo;

        // Ajoute les buts d'un match à partir de son tableau "events"
        private async Task<int> AjouterButsAsync(int matchId, JsonElement events)
        {
            // Les équipes du match : pour créditer le but sous NOTRE nom d'équipe (voir RattachementButeurs)
            var match = await _context.Matchs
                .AsNoTracking()
                .Include(m => m.EquipeDomicile)
                .Include(m => m.EquipeExterieur)
                .FirstOrDefaultAsync(m => m.Id == matchId);

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
                    NomJoueur = TexteOuNull(joueur, "name") ?? BUTEUR_INCONNU,
                    NomEquipe = match == null
                        ? evt.GetProperty("team").GetProperty("name").GetString() ?? ""
                        : RattachementButeurs.NomEquipeCreditee(match,
                            EntierOuNull(evt.GetProperty("team").GetProperty("id")),
                            evt.GetProperty("team").GetProperty("name").GetString()),
                    ApiJoueurId = EntierOuNull(joueur.GetProperty("id")) ?? 0,
                    Minute = EntierOuNull(evt.GetProperty("time").GetProperty("elapsed")) ?? 0,
                    EstButCSC = detail == "Own Goal",
                    EstPenalty = detail == "Penalty"
                });
                ajoutes++;
            }
            return ajoutes;
        }

        // Compte les buts d'un tableau "events" : (total, avec un buteur connu)
        private static (int total, int connus) CompterButs(JsonElement events)
        {
            int total = 0, connus = 0;
            foreach (var evt in events.EnumerateArray())
            {
                if (evt.GetProperty("type").GetString() != "Goal") continue;
                if (evt.GetProperty("detail").GetString() == "Missed Penalty") continue;
                total++;
                if (TexteOuNull(evt.GetProperty("player"), "name") != null) connus++;
            }
            return (total, connus);
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

                var equipeExistante = equipesExistantes.FirstOrDefault(e => e.CorrespondA(apiId));

                if (equipeExistante != null)
                {
                    equipeExistante.Nom = nom;
                    // Un logo remplacé à la main n'est pas écrasé (on garde juste celui de l'API à côté)
                    if (equipeExistante.LogoManuel) equipeExistante.LogoApi = logo;
                    else equipeExistante.LogoUrl = logo;
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

                var equipeDomicile = equipes.FirstOrDefault(e => e.CorrespondA(apiIdDomicile));
                var equipeExterieur = equipes.FirstOrDefault(e => e.CorrespondA(apiIdExterieur));
                if (equipeDomicile == null || equipeExterieur == null) continue;

                var apiFixtureId = fixtureInfo.GetProperty("id").GetInt32();
                var statut = ConvertirStatut(fixtureInfo.GetProperty("status").GetProperty("short").GetString());
                var scoreDomicile = EntierOuNull(goals.GetProperty("home"));
                var scoreExterieur = EntierOuNull(goals.GetProperty("away"));
                var (miTempsDomicile, miTempsExterieur) = ScoreMiTemps(fixture);
                var journee = NumeroJournee(fixture);

                if (matchsExistants.TryGetValue(apiFixtureId, out var matchExistant))
                {
                    matchExistant.Statut = statut;
                    matchExistant.ScoreDomicile = scoreDomicile;
                    matchExistant.ScoreExterieur = scoreExterieur;
                    // Score à la mi-temps : l'API n'en a pas toujours (ex. Elite Two). Si elle n'en
                    // donne pas, on garde celui de la base (éventuellement saisi à la main dans l'admin).
                    if (miTempsDomicile != null && miTempsExterieur != null)
                    {
                        matchExistant.ScoreMiTempsDomicile = miTempsDomicile;
                        matchExistant.ScoreMiTempsExterieur = miTempsExterieur;
                    }
                    matchExistant.Journee = journee ?? matchExistant.Journee;
                    matchExistant.SaisonId = saisonId;
                    // Heure du match : on garde une heure corrigée à la main par l'admin, SAUF si
                    // l'API a changé son heure depuis (elle a enfin la vraie heure, ou le match est reporté)
                    var dateApi = DateUtc(fixtureInfo);
                    if (!matchExistant.HeureManuelle || matchExistant.DateApi != dateApi)
                    {
                        matchExistant.DateMatch = dateApi;
                        matchExistant.HeureManuelle = false;
                    }
                    matchExistant.DateApi = dateApi;
                    _context.Matchs.Update(matchExistant);
                }
                else
                {
                    await _context.Matchs.AddAsync(new Match
                    {
                        ApiFootballId = apiFixtureId,
                        DateMatch = DateUtc(fixtureInfo),
                        DateApi = DateUtc(fixtureInfo),
                        Statut = statut,
                        EquipeDomicileId = equipeDomicile.Id,
                        EquipeExterieurId = equipeExterieur.Id,
                        SaisonId = saisonId,
                        ScoreDomicile = scoreDomicile,
                        ScoreExterieur = scoreExterieur,
                        ScoreMiTempsDomicile = miTempsDomicile,
                        ScoreMiTempsExterieur = miTempsExterieur,
                        Journee = journee,
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

        // Enregistre le classement d'une saison. Certaines saisons se jouent en
        // plusieurs poules / phases (ex. Elite One 2023-24 : "Championship Round" et
        // "Relegation Round") : chaque ligne garde le nom de son groupe et son ordre.
        // On repart de zéro à chaque import pour ne pas garder de vieilles lignes.
        private async Task<int> EnregistrerClassementAsync(JsonElement responseArray, int saisonId)
        {
            if (responseArray.GetArrayLength() == 0) return 0;

            var groupes = responseArray[0].GetProperty("league").GetProperty("standings");
            var equipes = await _context.Equipes.ToListAsync();

            // 1. Supprime l'ancien classement de cette saison
            var anciens = await _context.Classements.Where(c => c.SaisonId == saisonId).ToListAsync();
            _context.Classements.RemoveRange(anciens);

            // 2. Ajoute toutes les lignes, groupe par groupe
            var total = 0;
            var ordreGroupe = 0;
            foreach (var groupe in groupes.EnumerateArray())
            {
                foreach (var entry in groupe.EnumerateArray())
                {
                    var apiTeamId = entry.GetProperty("team").GetProperty("id").GetInt32();
                    var equipe = equipes.FirstOrDefault(e => e.CorrespondA(apiTeamId));
                    if (equipe == null) continue;

                    var all = entry.GetProperty("all");
                    await _context.Classements.AddAsync(new Classement
                    {
                        EquipeId = equipe.Id,
                        SaisonId = saisonId,
                        Groupe = TexteOuNull(entry, "group"),
                        OrdreGroupe = ordreGroupe,
                        Description = TexteOuNull(entry, "description"),
                        Evolution = TexteOuNull(entry, "status"),
                        Position = entry.GetProperty("rank").GetInt32(),
                        MatchsJoues = all.GetProperty("played").GetInt32(),
                        Victoires = all.GetProperty("win").GetInt32(),
                        Nuls = all.GetProperty("draw").GetInt32(),
                        Defaites = all.GetProperty("lose").GetInt32(),
                        ButsPour = EntierOuNull(all.GetProperty("goals").GetProperty("for")) ?? 0,
                        ButsContre = EntierOuNull(all.GetProperty("goals").GetProperty("against")) ?? 0,
                        DifferenceDesButs = entry.GetProperty("goalsDiff").GetInt32(),
                        Points = entry.GetProperty("points").GetInt32(),
                    });
                    total++;
                }
                ordreGroupe++;
            }
            await _context.SaveChangesAsync();
            return total;
        }

        // Corrige à la main l'heure d'un match (quand l'API a une heure provisoire fausse).
        // L'heure reste corrigée tant que l'API ne change pas la sienne.
        public async Task<Match?> CorrigerHeureMatchAsync(int apiFootballId, DateTimeOffset heure)
        {
            var match = await _context.Matchs.FirstOrDefaultAsync(m => m.ApiFootballId == apiFootballId);
            if (match == null) return null;
            match.DateApi ??= match.DateMatch; // l'heure actuelle vient de l'API : on la retient
            match.DateMatch = heure.UtcDateTime;
            match.HeureManuelle = true;
            await _context.SaveChangesAsync();
            return match;
        }

        // Annule la correction : on revient à l'heure donnée par l'API
        public async Task<Match?> AnnulerCorrectionHeureAsync(int apiFootballId)
        {
            var match = await _context.Matchs.FirstOrDefaultAsync(m => m.ApiFootballId == apiFootballId);
            if (match == null) return null;
            if (match.DateApi != null) match.DateMatch = match.DateApi.Value;
            match.HeureManuelle = false;
            await _context.SaveChangesAsync();
            return match;
        }

        // Remplace le logo d'un club (ex. "/logos/victoria-united.png").
        // L'import ne le touchera plus ; l'ancien logo de l'API est gardé dans LogoApi.
        public async Task<Equipe?> DefinirLogoEquipeAsync(int equipeId, string logoUrl)
        {
            var equipe = await _context.Equipes.FirstOrDefaultAsync(e => e.Id == equipeId);
            if (equipe == null) return null;
            if (!equipe.LogoManuel) equipe.LogoApi = equipe.LogoUrl; // on retient le logo de l'API une seule fois
            equipe.LogoUrl = logoUrl.Trim();
            equipe.LogoManuel = true;
            await _context.SaveChangesAsync();
            return equipe;
        }

        // Annule le remplacement : on revient au logo de l'API
        public async Task<Equipe?> AnnulerLogoEquipeAsync(int equipeId)
        {
            var equipe = await _context.Equipes.FirstOrDefaultAsync(e => e.Id == equipeId);
            if (equipe == null) return null;
            if (equipe.LogoManuel) equipe.LogoUrl = equipe.LogoApi;
            equipe.LogoManuel = false;
            equipe.LogoApi = null;
            await _context.SaveChangesAsync();
            return equipe;
        }

        // Score à la mi-temps : "score": { "halftime": { "home": 0, "away": 1 } } (null si l'API ne l'a pas)
        private static (int?, int?) ScoreMiTemps(JsonElement fixture)
        {
            if (!fixture.TryGetProperty("score", out var score)
                || !score.TryGetProperty("halftime", out var mt)
                || mt.ValueKind != JsonValueKind.Object)
                return (null, null);
            return (EntierOuNull(mt.GetProperty("home")), EntierOuNull(mt.GetProperty("away")));
        }

        // Numéro de journée : "league": { "round": "Regular Season - 3" } -> 3 (null pour les autres phases)
        private static int? NumeroJournee(JsonElement fixture)
        {
            if (!fixture.TryGetProperty("league", out var league)
                || !league.TryGetProperty("round", out var round)
                || round.ValueKind != JsonValueKind.String)
                return null;
            var m = System.Text.RegularExpressions.Regex.Match(round.GetString() ?? "", @"^Regular Season\s*-\s*(\d+)$");
            return m.Success ? int.Parse(m.Groups[1].Value) : null;
        }

        // Date d'un match en UTC. L'API envoie "2026-11-04T14:30:00+00:00" : on garde
        // l'heure UTC telle quelle, peu importe le fuseau de la machine qui fait l'import.
        // Chaque navigateur la convertit ensuite dans SON fuseau (Canada, Cameroun...).
        private static DateTime DateUtc(JsonElement fixtureInfo) =>
            fixtureInfo.GetProperty("date").GetDateTimeOffset().UtcDateTime;

        // Lit une propriété texte du JSON (null si absente ou vide)
        private static string? TexteOuNull(JsonElement element, string nom)
        {
            if (!element.TryGetProperty(nom, out var valeur) || valeur.ValueKind != JsonValueKind.String) return null;
            var texte = valeur.GetString();
            return string.IsNullOrWhiteSpace(texte) ? null : texte;
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
                await RattachementButeurs.RelierButsAsync(_context, new[] { match.Id });
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

                // L'API fournit-elle les événements (buts) pour cette ligue / saison ?
                // Ex. Elite Two : non -> inutile de demander les buts match par match.
                resultat.ButsFournis = ButsFournisParApi(infosSaison);

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
                // Ids principaux ET alias : un club connu sous un autre id n'est pas recréé
                var idsExistants = (await _context.Equipes.AsNoTracking().ToListAsync())
                    .SelectMany(e => e.TousLesIdsApi()).ToHashSet();
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

                // 4 bis. Saison la plus récente de cette ligue : ses clubs SONT les clubs actuels de la division.
                //        On aligne leur division et on les réactive (promus, relégués, clubs créés inactifs).
                var estPlusRecente = !await _context.Saisons.AnyAsync(s => s.Division == division && s.Annee > saison);
                if (estPlusRecente)
                {
                    var idsClubs = await _context.Matchs.Where(m => m.SaisonId == entiteSaison.Id).Select(m => m.EquipeDomicileId)
                        .Union(_context.Matchs.Where(m => m.SaisonId == entiteSaison.Id).Select(m => m.EquipeExterieurId))
                        .ToListAsync();
                    var aAligner = await _context.Equipes
                        .Where(e => idsClubs.Contains(e.Id) && (e.Division != division || !e.EstActive))
                        .ToListAsync();
                    foreach (var club in aAligner)
                    {
                        club.Division = division;
                        club.EstActive = true;
                    }
                    if (aAligner.Count > 0) await _context.SaveChangesAsync();
                }

                // 5. Classement (1 requête)
                var standings = await GetApiAsync($"/standings?league={leagueId}&season={saison}");
                resultat.EquipesClassement = await EnregistrerClassementAsync(standings, entiteSaison.Id);

                // 6. Buts, par lots de 20 matchs (≈ 1 requête pour 20 matchs),
                //    seulement si l'API fournit les événements de cette ligue
                if (resultat.ButsFournis)
                    resultat.ButsImportes = await ImporterButsParLotsAsync(entiteSaison.Id);

                // 7. Rattachement des buts encore sans joueur de toute la saison
                //    (buts arrivés par le direct, joueurs ajoutés depuis à l'effectif...). Aucune requête API.
                var idsMatchsSaison = await _context.Matchs
                    .Where(m => m.SaisonId == entiteSaison.Id)
                    .Select(m => m.Id)
                    .ToListAsync();
                await RattachementButeurs.RelierButsAsync(_context, idsMatchsSaison);
            }
            catch (ApiFootballException ex)
            {
                resultat.Erreur = ex.Message;
            }

            // Ce qui reste à faire (si le quota s'est épuisé en route).
            // Ligue sans buteurs chez l'API : rien à attendre, donc rien "en retard".
            if (resultat.SaisonId != 0 && resultat.ButsFournis)
                resultat.MatchsSansButsRestants = await RequeteMatchsSansButs(resultat.SaisonId).CountAsync();

            resultat.RequetesUtilisees = _requetesUtilisees;
            resultat.RequetesRestantes = _requetesRestantes;
            resultat.Termine = resultat.Erreur == null && resultat.MatchsSansButsRestants == 0;
            return resultat;
        }

        // Couverture de l'API pour une saison (bloc "coverage" de GET /leagues) :
        // coverage.fixtures.events = true si les buts sont fournis match par match.
        // En cas de doute (champ absent), on considère qu'ils sont fournis.
        private static bool ButsFournisParApi(JsonElement infosSaison)
        {
            if (infosSaison.TryGetProperty("coverage", out var coverage)
                && coverage.TryGetProperty("fixtures", out var fixtures)
                && fixtures.TryGetProperty("events", out var events)
                && (events.ValueKind == JsonValueKind.True || events.ValueKind == JsonValueKind.False))
                return events.GetBoolean();
            return true;
        }

        // Matchs terminés avec au moins un but marqué, mais aucun but enregistré
        // (les 0-0 sont exclus : ils n'ont rien à importer)
        private IQueryable<Match> RequeteMatchsSansButs(int saisonId) =>
            _context.Matchs.Where(m =>
                m.SaisonId == saisonId
                && m.Statut == StatutMatchEnum.Terminé
                && (m.ScoreDomicile ?? 0) + (m.ScoreExterieur ?? 0) > 0
                && !_context.ButsMatch.Any(b => b.MatchId == m.Id));

        // Matchs terminés récemment dont les buts enregistrés sont incomplets :
        // un buteur "Inconnu", ou moins de buts enregistrés que le score final
        private IQueryable<Match> RequeteMatchsButsIncomplets(int saisonId, DateTime depuisUtc) =>
            _context.Matchs.Where(m =>
                m.SaisonId == saisonId
                && m.Statut == StatutMatchEnum.Terminé
                && m.DateMatch >= depuisUtc
                && _context.ButsMatch.Any(b => b.MatchId == m.Id)
                && (_context.ButsMatch.Any(b => b.MatchId == m.Id && (b.NomJoueur == BUTEUR_INCONNU || b.NomJoueur == ""))
                    || _context.ButsMatch.Count(b => b.MatchId == m.Id) < (m.ScoreDomicile ?? 0) + (m.ScoreExterieur ?? 0)));

        // Importe les buts manquants ET relit les buts incomplets des matchs récents
        // (l'API donne souvent le nom du buteur quelques heures ou jours après le match)
        private async Task<int> ImporterButsParLotsAsync(int saisonId)
        {
            var sansButs = await RequeteMatchsSansButs(saisonId)
                .Select(m => new { m.Id, m.ApiFootballId })
                .ToListAsync();
            var incomplets = await RequeteMatchsButsIncomplets(saisonId, DateTime.UtcNow.AddDays(-JOURS_RELECTURE_BUTS))
                .Select(m => new { m.Id, m.ApiFootballId })
                .ToListAsync();
            var aTraiter = sansButs.Concat(incomplets).DistinctBy(m => m.Id).ToList();

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

                    var existants = await _context.ButsMatch.Where(b => b.MatchId == match.Id).ToListAsync();
                    if (existants.Count == 0)
                    {
                        total += await AjouterButsAsync(match.Id, events);
                        continue;
                    }

                    // Déjà des buts : on ne les remplace que si l'API en sait PLUS qu'avant
                    // (plus de buts, ou plus de buteurs connus). Sinon on ne touche à rien.
                    var (nouveauxTotal, nouveauxConnus) = CompterButs(events);
                    var anciensConnus = existants.Count(b => !string.IsNullOrWhiteSpace(b.NomJoueur) && b.NomJoueur != BUTEUR_INCONNU);
                    if (nouveauxTotal > existants.Count || (nouveauxTotal == existants.Count && nouveauxConnus > anciensConnus))
                    {
                        _context.ButsMatch.RemoveRange(existants);
                        total += await AjouterButsAsync(match.Id, events);
                    }
                }
                await _context.SaveChangesAsync(); // on sauvegarde à chaque lot : reprise possible
                await RattachementButeurs.RelierButsAsync(_context, lot.Select(m => m.Id));
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