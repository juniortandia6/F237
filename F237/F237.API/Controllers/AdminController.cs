// F237.API/Controllers/AdminController.cs
// Routes de l'espace admin (/admin côté site). Toutes réservées au rôle Admin.
// Les imports, le quota, les logos et les heures restent dans SyncController ;
// ici : ce qui sert à l'affichage de l'espace admin (tableau de bord...).

using F237.DAL.Data;
using F237.Domain.Entities;
using F237.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace F237.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Roles.Admin)]
    public class AdminController : ControllerBase
    {
        private const string BUTEUR_INCONNU = "Inconnu";
        private readonly F237DbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IHttpClientFactory _httpClientFactory;

        public AdminController(F237DbContext context, IWebHostEnvironment env, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _env = env;
            _httpClientFactory = httpClientFactory;
        }

        // GET /api/admin/tableau-de-bord?saisons=8,9
        // Chiffres clés pour les saisons demandées (en général la saison en cours,
        // Elite One + Elite Two) et quelques totaux du site.
        [HttpGet("tableau-de-bord")]
        public async Task<ActionResult<TableauDeBordDto>> TableauDeBord([FromQuery] string? saisons)
        {
            var ids = (saisons ?? string.Empty)
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(s => int.TryParse(s, out var id) ? id : (int?)null)
                .Where(id => id != null)
                .Select(id => id!.Value)
                .Distinct()
                .ToList();

            var maintenant = DateTime.UtcNow;
            var parSaison = new List<StatsSaisonDto>();

            foreach (var id in ids)
            {
                var saison = await _context.Saisons.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
                if (saison == null) continue;

                var matchs = _context.Matchs.AsNoTracking().Where(m => m.SaisonId == id);
                var buts = _context.ButsMatch.AsNoTracking().Where(b => matchs.Any(m => m.Id == b.MatchId));

                parSaison.Add(new StatsSaisonDto
                {
                    SaisonId = id,
                    Nom = saison.Nom,
                    Matchs = await matchs.CountAsync(),
                    Termines = await matchs.CountAsync(m => m.Statut == StatutMatchEnum.Terminé),
                    AVenir = await matchs.CountAsync(m => m.Statut == StatutMatchEnum.Planifié && m.DateMatch >= maintenant),
                    Reportes = await matchs.CountAsync(m => m.Statut == StatutMatchEnum.Reporté),
                    Annules = await matchs.CountAsync(m => m.Statut == StatutMatchEnum.Annulé),
                    // Planifiés mais date dépassée de plus d'un jour : à réimporter
                    EnRetard = await matchs.CountAsync(m => m.Statut == StatutMatchEnum.Planifié && m.DateMatch < maintenant.AddDays(-1)),
                    Buts = await buts.CountAsync(),
                    ButsInconnus = await buts.CountAsync(b => b.NomJoueur == BUTEUR_INCONNU || b.NomJoueur == ""),
                    ProchainMatch = await matchs
                        .Where(m => m.Statut == StatutMatchEnum.Planifié && m.DateMatch >= maintenant)
                        .OrderBy(m => m.DateMatch)
                        .Select(m => (DateTime?)m.DateMatch)
                        .FirstOrDefaultAsync(),
                });
            }

            return Ok(new TableauDeBordDto
            {
                Saisons = parSaison,
                ArticlesPublies = await _context.Articles.CountAsync(a => a.EstPublie),
                ArticlesBrouillons = await _context.Articles.CountAsync(a => !a.EstPublie),
                Utilisateurs = await _context.Utilisateurs.CountAsync(u => u.EstActif), // comptes actifs seulement
                Equipes = await _context.Equipes.CountAsync(),
            });
        }

        // ── Matchs : buteurs et score à la mi-temps ───────────────────────────
        // La lecture se fait avec les routes publiques (/api/matchs/saison/{id}, /api/matchs/{id}),
        // qui renvoient maintenant l'Id de chaque but.
        // Protection face à l'import : les buts d'un match ne sont remplacés par ceux de l'API
        // que si elle en connaît plus (plus de buts, ou plus de buteurs identifiés).

        // POST /api/admin/matchs/1444/buts   { "nomJoueur": "...", "nomEquipe": "...", "minute": 37, "estPenalty": false, "estButCSC": false }
        [HttpPost("matchs/{matchId:int}/buts")]
        public async Task<IActionResult> AjouterBut(int matchId, [FromBody] SaisieButDto saisie)
        {
            var match = await MatchAvecEquipesAsync(matchId);
            if (match == null) return NotFound(new { message = "Match introuvable." });

            var erreur = ValiderBut(saisie, match);
            if (erreur != null) return BadRequest(new { message = erreur });

            var but = new ButMatch { MatchId = matchId };
            Appliquer(but, saisie);
            await _context.ButsMatch.AddAsync(but);
            await _context.SaveChangesAsync();
            return Ok(VersDto(but));
        }

        // PUT /api/admin/buts/512   (même corps)
        [HttpPut("buts/{id:int}")]
        public async Task<IActionResult> ModifierBut(int id, [FromBody] SaisieButDto saisie)
        {
            var but = await _context.ButsMatch.FirstOrDefaultAsync(b => b.Id == id);
            if (but == null) return NotFound(new { message = "But introuvable." });

            var match = await MatchAvecEquipesAsync(but.MatchId);
            if (match == null) return NotFound(new { message = "Match introuvable." });

            var erreur = ValiderBut(saisie, match);
            if (erreur != null) return BadRequest(new { message = erreur });

            Appliquer(but, saisie);
            await _context.SaveChangesAsync();
            return Ok(VersDto(but));
        }

        // DELETE /api/admin/buts/512
        [HttpDelete("buts/{id:int}")]
        public async Task<IActionResult> SupprimerBut(int id)
        {
            var but = await _context.ButsMatch.FirstOrDefaultAsync(b => b.Id == id);
            if (but == null) return NotFound(new { message = "But introuvable." });
            _context.ButsMatch.Remove(but);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT /api/admin/matchs/1444/mi-temps   { "domicile": 1, "exterieur": 0 }   (null + null = effacer)
        // Gardé lors des imports tant que l'API ne fournit pas elle-même ce score.
        [HttpPut("matchs/{matchId:int}/mi-temps")]
        public async Task<IActionResult> DefinirMiTemps(int matchId, [FromBody] SaisieMiTempsDto saisie)
        {
            var match = await _context.Matchs.FirstOrDefaultAsync(m => m.Id == matchId);
            if (match == null) return NotFound(new { message = "Match introuvable." });

            if ((saisie.Domicile == null) != (saisie.Exterieur == null))
                return BadRequest(new { message = "Donne les deux scores, ou aucun pour effacer." });
            if (saisie.Domicile is < 0 or > 30 || saisie.Exterieur is < 0 or > 30)
                return BadRequest(new { message = "Score à la mi-temps invalide." });
            if (match.ScoreDomicile != null && match.ScoreExterieur != null
                && (saisie.Domicile > match.ScoreDomicile || saisie.Exterieur > match.ScoreExterieur))
                return BadRequest(new { message = "Le score à la mi-temps ne peut pas dépasser le score final." });

            match.ScoreMiTempsDomicile = saisie.Domicile;
            match.ScoreMiTempsExterieur = saisie.Exterieur;
            await _context.SaveChangesAsync();
            return Ok(new { match.Id, match.ScoreMiTempsDomicile, match.ScoreMiTempsExterieur });
        }

        // ── Équipes : logos et couleurs ───────────────────────────────────────

        private const long TAILLE_MAX_LOGO = 2 * 1024 * 1024; // 2 Mo
        private static readonly System.Text.RegularExpressions.Regex REGEX_COULEUR = new(@"^#[0-9a-fA-F]{6}$");

        // GET /api/admin/equipes
        // Toutes les équipes, avec leur nombre de matchs (utile pour repérer les doublons).
        [HttpGet("equipes")]
        public async Task<IActionResult> Equipes()
        {
            var equipes = await _context.Equipes
                .AsNoTracking()
                .OrderBy(e => e.Nom)
                .Select(e => new
                {
                    e.Id,
                    e.ApiFootballId,
                    e.Nom,
                    e.Pays,
                    Division = (int)e.Division,
                    e.EstActive,
                    e.LogoUrl,
                    e.LogoManuel,
                    e.LogoApi,
                    e.CouleurPrincipale,
                    e.CouleurSecondaire,
                    NbMatchs = _context.Matchs.Count(m => m.EquipeDomicileId == e.Id || m.EquipeExterieurId == e.Id),
                    DernierMatch = _context.Matchs
                        .Where(m => m.EquipeDomicileId == e.Id || m.EquipeExterieurId == e.Id)
                        .Max(m => (DateTime?)m.DateMatch),
                })
                .ToListAsync();
            return Ok(equipes);
        }

        // POST /api/admin/equipes/37/logo   (multipart/form-data, champ "fichier" : PNG, JPG ou WebP, 2 Mo max)
        // Enregistre l'image dans wwwroot/uploads/logos et la met comme logo du club.
        // Le logo de l'API est gardé (LogoApi) pour pouvoir revenir en arrière.
        [HttpPost("equipes/{id:int}/logo")]
        [RequestSizeLimit(TAILLE_MAX_LOGO + 64 * 1024)]
        public async Task<IActionResult> TeleverserLogo(int id, [FromForm] IFormFile? fichier)
        {
            var equipe = await _context.Equipes.FirstOrDefaultAsync(e => e.Id == id);
            if (equipe == null) return NotFound(new { message = "Équipe introuvable." });
            if (fichier == null || fichier.Length == 0) return BadRequest(new { message = "Aucun fichier reçu." });
            if (fichier.Length > TAILLE_MAX_LOGO) return BadRequest(new { message = "Image trop lourde (2 Mo maximum)." });

            // Type vérifié sur le contenu réel du fichier (pas seulement son nom).
            // Pas de SVG : il peut contenir du code exécuté par le navigateur.
            var entete = new byte[12];
            await using (var lecture = fichier.OpenReadStream())
                _ = await lecture.ReadAsync(entete.AsMemory(0, entete.Length));
            var extension = ExtensionImage(entete);
            if (extension == null) return BadRequest(new { message = "Format non accepté : PNG, JPG ou WebP seulement." });

            // Nom de fichier choisi par le serveur (jamais celui envoyé par le navigateur)
            var dossier = Path.Combine(DossierWeb(), "uploads", "logos");
            Directory.CreateDirectory(dossier);
            var nomFichier = $"{equipe.Id}-{Slug(equipe.Nom)}-{DateTime.UtcNow:yyyyMMddHHmmss}{extension}";
            await using (var sortie = System.IO.File.Create(Path.Combine(dossier, nomFichier)))
                await fichier.CopyToAsync(sortie);

            // Remplace un ancien logo téléversé (pas celui de l'API, ni ceux de public/logos)
            SupprimerLogoTeleverse(equipe.LogoUrl);

            if (!equipe.LogoManuel) equipe.LogoApi = equipe.LogoUrl;
            equipe.LogoUrl = $"{Request.Scheme}://{Request.Host}/uploads/logos/{nomFichier}";
            equipe.LogoManuel = true;
            await _context.SaveChangesAsync();
            return Ok(new { equipe.Id, equipe.LogoUrl, equipe.LogoManuel, equipe.LogoApi });
        }

        // DELETE /api/admin/equipes/37/logo   -> retour au logo de l'API
        [HttpDelete("equipes/{id:int}/logo")]
        public async Task<IActionResult> RetablirLogo(int id)
        {
            var equipe = await _context.Equipes.FirstOrDefaultAsync(e => e.Id == id);
            if (equipe == null) return NotFound(new { message = "Équipe introuvable." });
            if (!equipe.LogoManuel) return Ok(new { equipe.Id, equipe.LogoUrl, equipe.LogoManuel, equipe.LogoApi });

            SupprimerLogoTeleverse(equipe.LogoUrl);
            equipe.LogoUrl = equipe.LogoApi;
            equipe.LogoManuel = false;
            await _context.SaveChangesAsync();
            return Ok(new { equipe.Id, equipe.LogoUrl, equipe.LogoManuel, equipe.LogoApi });
        }

        // PUT /api/admin/equipes/37/couleurs   { "principale": "#c62828", "secondaire": "#ffffff" }
        // null + null = revenir aux couleurs par défaut du site
        [HttpPut("equipes/{id:int}/couleurs")]
        public async Task<IActionResult> DefinirCouleurs(int id, [FromBody] SaisieCouleursDto saisie)
        {
            var equipe = await _context.Equipes.FirstOrDefaultAsync(e => e.Id == id);
            if (equipe == null) return NotFound(new { message = "Équipe introuvable." });

            var principale = saisie.Principale?.Trim();
            var secondaire = saisie.Secondaire?.Trim();
            if (string.IsNullOrEmpty(principale) != string.IsNullOrEmpty(secondaire))
                return BadRequest(new { message = "Donne les deux couleurs, ou aucune pour revenir aux couleurs par défaut." });
            if (!string.IsNullOrEmpty(principale) && (!REGEX_COULEUR.IsMatch(principale) || !REGEX_COULEUR.IsMatch(secondaire!)))
                return BadRequest(new { message = "Couleur invalide : utilise le format #RRGGBB (ex. #c62828)." });

            equipe.CouleurPrincipale = string.IsNullOrEmpty(principale) ? null : principale.ToLowerInvariant();
            equipe.CouleurSecondaire = string.IsNullOrEmpty(secondaire) ? null : secondaire.ToLowerInvariant();
            await _context.SaveChangesAsync();
            return Ok(new { equipe.Id, equipe.CouleurPrincipale, equipe.CouleurSecondaire });
        }

        // ── Utilisateurs ──────────────────────────────────────────────────────
        // Garde-fous : l'admin ne peut ni se désactiver ni se retirer son propre rôle
        // (il se bloquerait l'accès à l'admin).

        private const string TYPE_AJUSTEMENT = "Ajustement admin";

        // GET /api/admin/utilisateurs
        [HttpGet("utilisateurs")]
        public async Task<IActionResult> ListeUtilisateurs()
        {
            var liste = await _context.Utilisateurs
                .AsNoTracking()
                .OrderByDescending(u => u.DateInscription)
                .Select(u => new
                {
                    u.Id,
                    u.Prenom,
                    u.Nom,
                    u.Email,
                    u.Role,
                    u.SoldePoints,
                    u.DateInscription,
                    u.EstActif,
                    NbParis = u.Paris.Count,
                    NbParisGagnes = u.Paris.Count(p => p.Statut == StatutPariEnum.Gagné),
                })
                .ToListAsync();
            return Ok(liste);
        }

        // GET /api/admin/utilisateurs/5   (détail + 50 dernières transactions)
        [HttpGet("utilisateurs/{id:int}")]
        public async Task<IActionResult> DetailUtilisateur(int id)
        {
            var u = await _context.Utilisateurs.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (u == null) return NotFound(new { message = "Utilisateur introuvable." });

            var transactions = await _context.Transactions
                .AsNoTracking()
                .Where(t => t.UtilisateurId == id)
                .OrderByDescending(t => t.DateTransaction)
                .Take(50)
                .Select(t => new { t.Montant, t.Type, t.Description, t.DateTransaction })
                .ToListAsync();
            var nbParis = await _context.Paris.CountAsync(p => p.UtilisateurId == id);
            var nbGagnes = await _context.Paris.CountAsync(p => p.UtilisateurId == id && p.Statut == StatutPariEnum.Gagné);

            return Ok(new
            {
                u.Id,
                u.Prenom,
                u.Nom,
                u.Email,
                u.Role,
                u.SoldePoints,
                u.DateInscription,
                u.EstActif,
                NbParis = nbParis,
                NbParisGagnes = nbGagnes,
                Transactions = transactions,
            });
        }

        // PUT /api/admin/utilisateurs/5/actif   { "estActif": false }
        // Un compte désactivé ne peut plus se connecter.
        [HttpPut("utilisateurs/{id:int}/actif")]
        public async Task<IActionResult> ActiverUtilisateur(int id, [FromBody] SaisieActifDto saisie)
        {
            var u = await _context.Utilisateurs.FirstOrDefaultAsync(x => x.Id == id);
            if (u == null) return NotFound(new { message = "Utilisateur introuvable." });
            if (id == IdConnecte() && !saisie.EstActif) return BadRequest(new { message = "Tu ne peux pas désactiver ton propre compte." });

            u.EstActif = saisie.EstActif;
            await _context.SaveChangesAsync();
            return Ok(new { u.Id, u.EstActif });
        }

        // PUT /api/admin/utilisateurs/5/role   { "role": "Admin" }   (pris en compte à sa prochaine connexion)
        [HttpPut("utilisateurs/{id:int}/role")]
        public async Task<IActionResult> ChangerRole(int id, [FromBody] SaisieRoleDto saisie)
        {
            var u = await _context.Utilisateurs.FirstOrDefaultAsync(x => x.Id == id);
            if (u == null) return NotFound(new { message = "Utilisateur introuvable." });
            if (saisie.Role != Roles.Admin && saisie.Role != Roles.Utilisateur) return BadRequest(new { message = "Rôle inconnu." });
            if (id == IdConnecte()) return BadRequest(new { message = "Tu ne peux pas changer ton propre rôle." });

            u.Role = saisie.Role;
            await _context.SaveChangesAsync();
            return Ok(new { u.Id, u.Role });
        }

        // POST /api/admin/utilisateurs/5/points   { "montant": 500, "motif": "Compensation match annulé" }
        // Ajoute ou retire des points ; chaque ajustement laisse une trace dans Transactions.
        [HttpPost("utilisateurs/{id:int}/points")]
        public async Task<IActionResult> AjusterPoints(int id, [FromBody] SaisiePointsDto saisie)
        {
            var u = await _context.Utilisateurs.FirstOrDefaultAsync(x => x.Id == id);
            if (u == null) return NotFound(new { message = "Utilisateur introuvable." });
            var motif = saisie.Motif?.Trim() ?? string.Empty;
            if (saisie.Montant == 0 || Math.Abs(saisie.Montant) > 100_000) return BadRequest(new { message = "Montant invalide (entre 1 et 100 000, positif ou négatif)." });
            if (motif.Length < 3 || motif.Length > 200) return BadRequest(new { message = "Indique un motif (3 à 200 caractères)." });
            if (u.SoldePoints + saisie.Montant < 0) return BadRequest(new { message = $"Le solde ne peut pas devenir négatif (solde actuel : {u.SoldePoints})." });

            u.SoldePoints += saisie.Montant;
            _context.Transactions.Add(new Transaction
            {
                UtilisateurId = u.Id,
                Montant = saisie.Montant,
                Type = TYPE_AJUSTEMENT,
                Description = motif,
                DateTransaction = DateTime.UtcNow,
            });
            await _context.SaveChangesAsync();
            return Ok(new { u.Id, u.SoldePoints });
        }

        // Id de l'admin connecté (claim "sub" du token)
        private int IdConnecte()
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            return int.TryParse(claim?.Value, out var id) ? id : 0;
        }

        // ── Effectifs ─────────────────────────────────────────────────────────

        private static readonly string[] POSTES = { "Gardien", "Défenseur", "Milieu", "Attaquant" };

        // GET /api/admin/equipes/37/joueurs   (actifs et anciens joueurs)
        [HttpGet("equipes/{equipeId:int}/joueurs")]
        public async Task<IActionResult> Joueurs(int equipeId)
        {
            if (!await _context.Equipes.AnyAsync(e => e.Id == equipeId))
                return NotFound(new { message = "Équipe introuvable." });
            var joueurs = await _context.Joueurs
                .AsNoTracking()
                .Where(j => j.EquipeId == equipeId)
                .OrderBy(j => j.Numero == null).ThenBy(j => j.Numero).ThenBy(j => j.Nom)
                .Select(j => VersJoueurDto(j))
                .ToListAsync();
            return Ok(joueurs);
        }

        // POST /api/admin/equipes/37/joueurs   { "prenom": "Mathew", "nom": "Williams", "numero": 9, "poste": "Attaquant", ... }
        [HttpPost("equipes/{equipeId:int}/joueurs")]
        public async Task<IActionResult> AjouterJoueur(int equipeId, [FromBody] SaisieJoueurDto saisie)
        {
            if (!await _context.Equipes.AnyAsync(e => e.Id == equipeId))
                return NotFound(new { message = "Équipe introuvable." });
            var erreur = ValiderJoueur(saisie);
            if (erreur != null) return BadRequest(new { message = erreur });

            var joueur = new Joueur { EquipeId = equipeId, EstActif = true };
            Appliquer(joueur, saisie);
            await _context.Joueurs.AddAsync(joueur);
            await _context.SaveChangesAsync();
            return Ok(VersJoueurDto(joueur));
        }

        // POST /api/admin/equipes/37/joueurs/lot   { "lignes": "1 Jean Efala\n9 Mathew Williams\nB. Ndam", "poste": "Attaquant" }
        // Saisie rapide : un joueur par ligne, numéro facultatif en début de ligne.
        // Les joueurs déjà présents (même prénom + nom) sont ignorés.
        [HttpPost("equipes/{equipeId:int}/joueurs/lot")]
        public async Task<IActionResult> AjouterJoueursEnLot(int equipeId, [FromBody] SaisieLotDto saisie)
        {
            if (!await _context.Equipes.AnyAsync(e => e.Id == equipeId))
                return NotFound(new { message = "Équipe introuvable." });
            var poste = string.IsNullOrWhiteSpace(saisie.Poste) ? null : saisie.Poste.Trim();
            if (poste != null && !POSTES.Contains(poste)) return BadRequest(new { message = "Poste inconnu." });

            var existants = await _context.Joueurs.Where(j => j.EquipeId == equipeId)
                .Select(j => (j.Prenom + " " + j.Nom).ToLower()).ToListAsync();
            var deja = new HashSet<string>(existants.Select(x => x.Trim()));
            var ajoutes = 0;
            var ignores = new List<string>();

            foreach (var brute in (saisie.Lignes ?? string.Empty).Split('\n'))
            {
                var ligne = brute.Trim();
                if (ligne.Length == 0) continue;
                var m = System.Text.RegularExpressions.Regex.Match(ligne, @"^(\d{1,2})\s*[-.)]?\s+(.+)$");
                int? numero = m.Success ? int.Parse(m.Groups[1].Value) : null;
                var nomComplet = (m.Success ? m.Groups[2].Value : ligne).Trim();
                var (prenom, nom) = SeparerNom(nomComplet);
                if (nom.Length == 0 || nom.Length > 100 || prenom.Length > 100) { ignores.Add(ligne); continue; }
                var cle = $"{prenom} {nom}".ToLower().Trim();
                if (!deja.Add(cle)) { ignores.Add(ligne); continue; }

                await _context.Joueurs.AddAsync(new Joueur
                {
                    EquipeId = equipeId,
                    Prenom = prenom,
                    Nom = nom,
                    Numero = numero is >= 1 and <= 99 ? numero : null,
                    Poste = poste,
                    EstActif = true,
                });
                ajoutes++;
            }
            await _context.SaveChangesAsync();
            return Ok(new { ajoutes, ignores });
        }

        // POST /api/admin/equipes/37/joueurs/importer-api
        // Copie l'effectif connu de l'API-Football (GET players/squads, 1 requête) dans F237 :
        // numéro, poste, nom. Les joueurs déjà présents (même nom) sont ignorés ; rien n'est supprimé.
        [HttpPost("equipes/{equipeId:int}/joueurs/importer-api")]
        public async Task<IActionResult> ImporterEffectifApi(int equipeId)
        {
            var equipe = await _context.Equipes.AsNoTracking().FirstOrDefaultAsync(e => e.Id == equipeId);
            if (equipe == null) return NotFound(new { message = "Équipe introuvable." });
            if (equipe.ApiFootballId <= 0) return BadRequest(new { message = "Ce club n'est pas lié à l'API-Football." });

            var client = _httpClientFactory.CreateClient("ApiFootball");
            HttpResponseMessage reponse;
            try
            {
                reponse = await client.GetAsync($"players/squads?team={equipe.ApiFootballId}");
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                return StatusCode(502, new { message = "API-Football injoignable pour le moment." });
            }
            if (!reponse.IsSuccessStatusCode)
                return StatusCode(502, new { message = $"API-Football a répondu {(int)reponse.StatusCode}." });

            using var doc = System.Text.Json.JsonDocument.Parse(await reponse.Content.ReadAsStringAsync());
            var racine = doc.RootElement;
            if (!racine.TryGetProperty("response", out var resultats) || resultats.GetArrayLength() == 0
                || !resultats[0].TryGetProperty("players", out var joueursApi))
                return Ok(new { ajoutes = 0, ignores = 0, message = "L'API-Football n'a pas d'effectif pour ce club." });

            var existants = await _context.Joueurs.Where(j => j.EquipeId == equipeId)
                .Select(j => (j.Prenom + " " + j.Nom).Trim().ToLower()).ToListAsync();
            var deja = new HashSet<string>(existants);
            var postes = new Dictionary<string, string>
            {
                ["Goalkeeper"] = "Gardien",
                ["Defender"] = "Défenseur",
                ["Midfielder"] = "Milieu",
                ["Attacker"] = "Attaquant",
            };
            int ajoutes = 0, ignores = 0;

            foreach (var ja in joueursApi.EnumerateArray())
            {
                var nomComplet = ja.TryGetProperty("name", out var n) && n.ValueKind == System.Text.Json.JsonValueKind.String ? n.GetString()?.Trim() : null;
                if (string.IsNullOrEmpty(nomComplet) || nomComplet.Length > 200) { ignores++; continue; }
                var (prenom, nom) = SeparerNom(nomComplet);   // "K. Bello" -> ("K.", "Bello")
                if (!deja.Add($"{prenom} {nom}".Trim().ToLower())) { ignores++; continue; }

                int? numero = ja.TryGetProperty("number", out var num) && num.ValueKind == System.Text.Json.JsonValueKind.Number
                    && num.TryGetInt32(out var v) && v is >= 1 and <= 99 ? v : null;
                string? poste = ja.TryGetProperty("position", out var pos) && pos.ValueKind == System.Text.Json.JsonValueKind.String
                    && postes.TryGetValue(pos.GetString() ?? "", out var p) ? p : null;

                await _context.Joueurs.AddAsync(new Joueur
                {
                    EquipeId = equipeId,
                    Prenom = prenom.Length > 100 ? prenom[..100] : prenom,
                    Nom = nom.Length > 100 ? nom[..100] : nom,
                    Numero = numero,
                    Poste = poste,
                    EstActif = true,
                });
                ajoutes++;
            }
            await _context.SaveChangesAsync();
            return Ok(new { ajoutes, ignores });
        }

        // PUT /api/admin/joueurs/12   (même corps que l'ajout, + "estActif")
        [HttpPut("joueurs/{id:int}")]
        public async Task<IActionResult> ModifierJoueur(int id, [FromBody] SaisieJoueurDto saisie)
        {
            var joueur = await _context.Joueurs.FirstOrDefaultAsync(j => j.Id == id);
            if (joueur == null) return NotFound(new { message = "Joueur introuvable." });
            var erreur = ValiderJoueur(saisie);
            if (erreur != null) return BadRequest(new { message = erreur });

            Appliquer(joueur, saisie);
            if (saisie.EstActif.HasValue) joueur.EstActif = saisie.EstActif.Value;
            await _context.SaveChangesAsync();
            return Ok(VersJoueurDto(joueur));
        }

        // DELETE /api/admin/joueurs/12   (suppression définitive ; pour un départ, préférer EstActif = false)
        [HttpDelete("joueurs/{id:int}")]
        public async Task<IActionResult> SupprimerJoueur(int id)
        {
            var joueur = await _context.Joueurs.FirstOrDefaultAsync(j => j.Id == id);
            if (joueur == null) return NotFound(new { message = "Joueur introuvable." });
            _context.Joueurs.Remove(joueur);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict(new { message = "Ce joueur est lié à d'autres données : retire-le plutôt de l'effectif." });
            }
            return NoContent();
        }

        private static string? ValiderJoueur(SaisieJoueurDto s)
        {
            if (string.IsNullOrWhiteSpace(s.Nom)) return "Le nom est obligatoire.";
            if (s.Nom.Trim().Length > 100 || (s.Prenom?.Trim().Length ?? 0) > 100) return "Nom ou prénom trop long (100 caractères max).";
            if (s.Numero is < 1 or > 99) return "Le numéro doit être entre 1 et 99.";
            if (!string.IsNullOrWhiteSpace(s.Poste) && !POSTES.Contains(s.Poste.Trim())) return "Poste inconnu.";
            if ((s.Nationalite?.Trim().Length ?? 0) > 60) return "Nationalité trop longue.";
            if (s.DateNaissance is { } d && (d.Year < 1960 || d > DateTime.UtcNow.AddYears(-12))) return "Date de naissance invalide.";
            return null;
        }

        private static void Appliquer(Joueur j, SaisieJoueurDto s)
        {
            j.Prenom = s.Prenom?.Trim() ?? string.Empty;
            j.Nom = s.Nom!.Trim();
            j.Numero = s.Numero;
            j.Poste = string.IsNullOrWhiteSpace(s.Poste) ? null : s.Poste.Trim();
            j.Nationalite = string.IsNullOrWhiteSpace(s.Nationalite) ? null : s.Nationalite.Trim();
            j.DateNaissance = s.DateNaissance?.Date;
        }

        // "Jean-Hugues Eyango Priso" -> ("Jean-Hugues", "Eyango Priso") ; "Williams" -> ("", "Williams")
        private static (string Prenom, string Nom) SeparerNom(string complet)
        {
            var mots = complet.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            return mots.Length <= 1 ? (string.Empty, complet.Trim()) : (mots[0], string.Join(' ', mots.Skip(1)));
        }

        private static object VersJoueurDto(Joueur j) => new
        {
            j.Id,
            j.EquipeId,
            j.Prenom,
            j.Nom,
            j.Numero,
            j.Poste,
            j.Nationalite,
            j.DateNaissance,
            j.EstActif,
        };

        private string DossierWeb() => _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");

        // ".png" / ".jpg" / ".webp" d'après les premiers octets du fichier, sinon null
        private static string? ExtensionImage(byte[] o)
        {
            if (o.Length >= 8 && o[0] == 0x89 && o[1] == 0x50 && o[2] == 0x4E && o[3] == 0x47) return ".png";
            if (o.Length >= 3 && o[0] == 0xFF && o[1] == 0xD8 && o[2] == 0xFF) return ".jpg";
            if (o.Length >= 12 && o[0] == 0x52 && o[1] == 0x49 && o[2] == 0x46 && o[3] == 0x46
                && o[8] == 0x57 && o[9] == 0x45 && o[10] == 0x42 && o[11] == 0x50) return ".webp";
            return null;
        }

        // Supprime un fichier de wwwroot/uploads/logos si l'adresse y mène (sinon ne fait rien)
        private void SupprimerLogoTeleverse(string? url)
        {
            if (string.IsNullOrEmpty(url)) return;
            var marqueur = "/uploads/logos/";
            var i = url.IndexOf(marqueur, StringComparison.OrdinalIgnoreCase);
            if (i < 0) return;
            var nom = Path.GetFileName(url[(i + marqueur.Length)..]);
            if (string.IsNullOrEmpty(nom)) return;
            var chemin = Path.Combine(DossierWeb(), "uploads", "logos", nom);
            try { if (System.IO.File.Exists(chemin)) System.IO.File.Delete(chemin); } catch (IOException) { /* fichier occupé : tant pis */ }
        }

        private static string Slug(string texte)
        {
            var sansAccents = new string(texte.Normalize(System.Text.NormalizationForm.FormD)
                .Where(c => System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
                .ToArray());
            var slug = System.Text.RegularExpressions.Regex.Replace(sansAccents.ToLowerInvariant(), "[^a-z0-9]+", "-").Trim('-');
            return slug.Length > 40 ? slug[..40] : slug;
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private Task<Match?> MatchAvecEquipesAsync(int matchId) =>
            _context.Matchs
                .Include(m => m.EquipeDomicile)
                .Include(m => m.EquipeExterieur)
                .FirstOrDefaultAsync(m => m.Id == matchId);

        // nomEquipe = équipe CRÉDITÉE du but (pour un CSC : l'équipe qui en profite),
        // comme les buts venant de l'API.
        private static string? ValiderBut(SaisieButDto s, Match match)
        {
            var nom = s.NomJoueur?.Trim() ?? string.Empty;
            if (nom.Length == 0) return "Le nom du buteur est obligatoire.";
            if (nom.Length > 200) return "Le nom du buteur dépasse 200 caractères.";
            // 0 = minute inconnue (le but compte, sans minute affichée sur le site)
            if (s.Minute is < 0 or > 130) return "La minute doit être entre 1 et 130 (ou 0 si elle est inconnue).";
            var nomEquipe = s.NomEquipe ?? string.Empty;
            if (nomEquipe != match.EquipeDomicile?.Nom && nomEquipe != match.EquipeExterieur?.Nom)
                return "L'équipe doit être l'une des deux équipes du match.";
            return null;
        }

        private static void Appliquer(ButMatch but, SaisieButDto s)
        {
            but.NomJoueur = s.NomJoueur!.Trim();
            but.NomEquipe = s.NomEquipe!;
            but.Minute = s.Minute;
            but.EstPenalty = s.EstPenalty && !s.EstButCSC; // un CSC n'est jamais un penalty
            but.EstButCSC = s.EstButCSC;
        }

        private static object VersDto(ButMatch b) => new
        {
            b.Id,
            b.MatchId,
            b.Minute,
            b.NomJoueur,
            b.NomEquipe,
            b.EstPenalty,
            b.EstButCSC,
        };
    }

    public class SaisieButDto
    {
        public string? NomJoueur { get; set; }
        public string? NomEquipe { get; set; }
        public int Minute { get; set; }
        public bool EstPenalty { get; set; }
        public bool EstButCSC { get; set; }
    }

    public class SaisieActifDto
    {
        public bool EstActif { get; set; }
    }

    public class SaisieRoleDto
    {
        public string? Role { get; set; }
    }

    public class SaisiePointsDto
    {
        public int Montant { get; set; }
        public string? Motif { get; set; }
    }

    public class SaisieJoueurDto
    {
        public string? Prenom { get; set; }
        public string? Nom { get; set; }
        public int? Numero { get; set; }
        public string? Poste { get; set; }
        public string? Nationalite { get; set; }
        public DateTime? DateNaissance { get; set; }
        public bool? EstActif { get; set; }              // seulement pour la modification
    }

    public class SaisieLotDto
    {
        public string? Lignes { get; set; }
        public string? Poste { get; set; }
    }

    public class SaisieCouleursDto
    {
        public string? Principale { get; set; }
        public string? Secondaire { get; set; }
    }

    public class SaisieMiTempsDto
    {
        public int? Domicile { get; set; }
        public int? Exterieur { get; set; }
    }

    public class TableauDeBordDto
    {
        public List<StatsSaisonDto> Saisons { get; set; } = new();
        public int ArticlesPublies { get; set; }
        public int ArticlesBrouillons { get; set; }
        public int Utilisateurs { get; set; }
        public int Equipes { get; set; }
    }

    public class StatsSaisonDto
    {
        public int SaisonId { get; set; }
        public string Nom { get; set; } = string.Empty;
        public int Matchs { get; set; }
        public int Termines { get; set; }
        public int AVenir { get; set; }
        public int Reportes { get; set; }
        public int Annules { get; set; }
        public int EnRetard { get; set; }
        public int Buts { get; set; }
        public int ButsInconnus { get; set; }
        public DateTime? ProchainMatch { get; set; }
    }
}