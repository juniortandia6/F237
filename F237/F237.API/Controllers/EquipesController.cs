// F237.API/Controllers/EquipesController.cs

using F237.API.DTOs;
using F237.DAL.Data;
using F237.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace F237.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EquipesController : ControllerBase
    {
        private readonly F237DbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public EquipesController(F237DbContext context, IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        // GET /api/equipes
        [HttpGet]
        // GET /api/equipes
        [HttpGet]
        public async Task<ActionResult<List<EquipeSimpleDto>>> GetAll()
        {
            var domicileIds = await _context.Matchs
                .Where(m => m.SaisonId == 3 || m.SaisonId == 4)
                .Select(m => m.EquipeDomicileId)
                .Distinct()
                .ToListAsync();

            var exterieurIds = await _context.Matchs
                .Where(m => m.SaisonId == 3 || m.SaisonId == 4)
                .Select(m => m.EquipeExterieurId)
                .Distinct()
                .ToListAsync();

            var equipeIds = domicileIds.Union(exterieurIds).Distinct().ToList();

            var equipes = await _context.Equipes
                .Where(e => equipeIds.Contains(e.Id))
                .OrderBy(e => e.Division)
                .ThenBy(e => e.Nom)
                .Select(e => new EquipeSimpleDto
                {
                    Id = e.Id,
                    Nom = e.Nom,
                    LogoUrl = e.LogoUrl,
                    Division = (int)e.Division
                })
                .ToListAsync();

            return Ok(equipes);
        }

        // GET /api/equipes/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<EquipeDetailDto>> GetDetail(int id)
        {
            var equipe = await _context.Equipes.FindAsync(id);
            if (equipe == null) return NotFound();

            var apiKey = _configuration["ApiFootball:Key"] ?? "e728d2eec6983f078956a4d692a77d26";
            var client = _httpClientFactory.CreateClient("ApiFootball");

            var detail = new EquipeDetailDto
            {
                Id = equipe.Id,
                ApiFootballId = equipe.ApiFootballId,
                Nom = equipe.Nom,
                LogoUrl = equipe.LogoUrl,
                Division = (int)equipe.Division
            };

            // ── 1. Infos club + stade ─────────────────────────────────────────
            try
            {
                var teamResp = await client.GetAsync($"teams?id={equipe.ApiFootballId}");
                if (teamResp.IsSuccessStatusCode)
                {
                    var teamJson = await teamResp.Content.ReadAsStringAsync();
                    var teamDoc = JsonDocument.Parse(teamJson);
                    var responses = teamDoc.RootElement.GetProperty("response");

                    if (responses.GetArrayLength() > 0)
                    {
                        var first = responses[0];
                        var t = first.GetProperty("team");
                        var v = first.GetProperty("venue");

                        detail.Infos = new InfosClubDto
                        {
                            Nom = t.GetProperty("name").GetString() ?? equipe.Nom,
                            Pays = SafeGetString(t, "country"),
                            AnneeCreation = SafeGetInt(t, "founded"),
                            LogoUrl = SafeGetString(t, "logo"),
                            StadeNom = SafeGetString(v, "name"),
                            StadeVille = SafeGetString(v, "city"),
                            StadeCapacite = SafeGetInt(v, "capacity"),
                            StadeImage = SafeGetString(v, "image"),
                        };
                        detail.Infos.Ville = detail.Infos.StadeVille;
                    }
                }
            }
            catch { }

            // ── 2. Palmarès ───────────────────────────────────────────────────
            try
            {
                var trophyResp = await client.GetAsync($"trophies?team={equipe.ApiFootballId}");
                if (trophyResp.IsSuccessStatusCode)
                {
                    var trophyJson = await trophyResp.Content.ReadAsStringAsync();
                    var trophyDoc = JsonDocument.Parse(trophyJson);
                    var responses = trophyDoc.RootElement.GetProperty("response");

                    foreach (var item in responses.EnumerateArray())
                    {
                        var place = item.GetProperty("place").GetString() ?? "";
                        if (place.Contains("Winner") || place == "1st Place")
                        {
                            detail.Palmares.Add(new TropheeDto
                            {
                                Ligue = SafeGetString(item, "league") ?? "",
                                Pays = SafeGetString(item, "country") ?? "",
                                Saison = SafeGetString(item, "season") ?? "",
                                Place = place
                            });
                        }
                    }
                }
            }
            catch { }

            // ── 3. Effectif ───────────────────────────────────────────────────
            try
            {
                var squadResp = await client.GetAsync($"players/squads?team={equipe.ApiFootballId}");
                if (squadResp.IsSuccessStatusCode)
                {
                    var squadJson = await squadResp.Content.ReadAsStringAsync();
                    var squadDoc = JsonDocument.Parse(squadJson);
                    var responses = squadDoc.RootElement.GetProperty("response");

                    if (responses.GetArrayLength() > 0)
                    {
                        var players = responses[0].GetProperty("players");
                        foreach (var p in players.EnumerateArray())
                        {
                            detail.Effectif.Add(new JoueurEffectifDto
                            {
                                ApiId = p.GetProperty("id").GetInt32(),
                                Nom = p.GetProperty("name").GetString() ?? "",
                                Photo = SafeGetString(p, "photo"),
                                Age = SafeGetInt(p, "age"),
                                Numero = SafeGetString(p, "number"),
                                Poste = SafeGetString(p, "position"),
                            });
                        }
                    }
                }
            }
            catch { }

            // ── 4. Classement depuis DB ───────────────────────────────────────
            var saisonId = equipe.Division == DivisionEnum.EliteOne ? 3 : 4;

            var classement = await _context.Classements
                .FirstOrDefaultAsync(c => c.EquipeId == id && c.SaisonId == saisonId);

            if (classement != null)
            {
                detail.Classement = new ClassementSimpleDto
                {
                    Position = classement.Position,
                    Points = classement.Points,
                    MatchsJoues = classement.MatchsJoues,
                    Victoires = classement.Victoires,
                    Nuls = classement.Nuls,
                    Defaites = classement.Defaites,
                    ButsPour = classement.ButsPour,
                    ButsContre = classement.ButsContre,
                    DifferenceDesButs = classement.DifferenceDesButs
                };
            }

            // ── 5. 5 derniers matchs depuis DB ────────────────────────────────
            var derniersMatchs = await _context.Matchs
                .Include(m => m.EquipeDomicile)
                .Include(m => m.EquipeExterieur)
                .Where(m => (m.EquipeDomicileId == id || m.EquipeExterieurId == id)
                         && m.SaisonId == saisonId
                         && m.Statut == StatutMatchEnum.Terminé)
                .OrderByDescending(m => m.DateMatch)
                .Take(5)
                .ToListAsync();

            foreach (var match in derniersMatchs)
            {
                var estDomicile = match.EquipeDomicileId == id;
                var mesButs = estDomicile ? match.ScoreDomicile : match.ScoreExterieur;
                var leursButs = estDomicile ? match.ScoreExterieur : match.ScoreDomicile;

                string resultat = "?";
                if (mesButs.HasValue && leursButs.HasValue)
                {
                    if (mesButs > leursButs) resultat = "V";
                    else if (mesButs == leursButs) resultat = "N";
                    else resultat = "D";
                }

                detail.DerniersMatchs.Add(new FormeMatchDto
                {
                    MatchId = match.Id,
                    DateMatch = match.DateMatch,
                    EquipeDomicile = match.EquipeDomicile?.Nom ?? "",
                    EquipeExterieur = match.EquipeExterieur?.Nom ?? "",
                    LogoDomicile = match.EquipeDomicile?.LogoUrl,
                    LogoExterieur = match.EquipeExterieur?.LogoUrl,
                    ScoreDomicile = match.ScoreDomicile,
                    ScoreExterieur = match.ScoreExterieur,
                    Resultat = resultat,
                    EstDomicile = estDomicile
                });
            }

            return Ok(detail);
        }

        // ── Helpers ───────────────────────────────────────────────────────────
        private static string? SafeGetString(JsonElement el, string prop)
        {
            if (el.TryGetProperty(prop, out var val) && val.ValueKind == JsonValueKind.String)
                return val.GetString();
            return null;
        }

        private static int? SafeGetInt(JsonElement el, string prop)
        {
            if (el.TryGetProperty(prop, out var val) && val.ValueKind == JsonValueKind.Number)
                return val.GetInt32();
            return null;
        }
    }
}