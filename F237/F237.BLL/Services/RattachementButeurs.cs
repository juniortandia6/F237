// F237.BLL/Services/RattachementButeurs.cs
// Relie les buts aux joueurs de l'effectif (ButMatch.JoueurId).
// Utilisé partout où des buts sont créés : import API, scores en direct, saisie admin.
//
// Règles (les mêmes que le script SQL de rattachement) :
//   1. Nom : un SEUL joueur de l'effectif de l'équipe créditée porte ce nom
//      ("Samuel Tagbor", "S. Tagbor" ou "Tagbor", sans tenir compte des accents ni de la casse).
//   2. Sinon, identifiant API : ce même ApiJoueurId a déjà été relié à UN SEUL joueur
//      dans un autre but (utile quand l'API écrit le nom autrement d'un match à l'autre).
//   CSC, buteur inconnu, aucun ou plusieurs joueurs possibles : JoueurId reste null,
//   le but est alors compté par nom dans le classement des buteurs (comme avant).

using F237.DAL.Data;
using F237.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace F237.BLL.Services
{
    public static class RattachementButeurs
    {
        public const string BUTEUR_INCONNU = "Inconnu";

        /// <summary>
        /// Nom de NOTRE équipe pour un but venant de l'API. L'API peut donner un autre nom
        /// que le nôtre ("PWD" pour "PWD Bamenda", ancien nom d'un club...) : on se fie à son
        /// identifiant d'équipe (alias compris), et au nom de l'API seulement en dernier recours.
        /// </summary>
        public static string NomEquipeCreditee(Match match, int? apiEquipeId, string? nomApi)
        {
            if (apiEquipeId is int id && id > 0)
            {
                if (match.EquipeDomicile?.CorrespondA(id) == true) return match.EquipeDomicile.Nom;
                if (match.EquipeExterieur?.CorrespondA(id) == true) return match.EquipeExterieur.Nom;
            }
            return nomApi ?? string.Empty;
        }

        /// <summary>
        /// Relie les buts encore sans joueur des matchs donnés, puis sauvegarde.
        /// À appeler APRÈS le SaveChanges qui a créé les buts. Renvoie le nombre de buts reliés.
        /// </summary>
        public static async Task<int> RelierButsAsync(F237DbContext context, IEnumerable<int> matchIds, CancellationToken ct = default)
        {
            var ids = matchIds.Distinct().ToList();
            if (ids.Count == 0) return 0;

            var buts = await context.ButsMatch
                .Where(b => ids.Contains(b.MatchId) && b.JoueurId == null && !b.EstButCSC)
                .ToListAsync(ct);
            buts = buts.Where(b => NormaliserNom(b.NomJoueur) is var n && n.Length > 0 && n != "inconnu").ToList();
            if (buts.Count == 0) return 0;

            var matchs = await context.Matchs
                .AsNoTracking()
                .Where(m => ids.Contains(m.Id))
                .Select(m => new {
                    m.Id,
                    m.EquipeDomicileId,
                    m.EquipeExterieurId,
                    NomDom = m.EquipeDomicile.Nom,
                    NomExt = m.EquipeExterieur.Nom
                })
                .ToDictionaryAsync(m => m.Id, ct);

            var equipeIds = matchs.Values.SelectMany(m => new[] { m.EquipeDomicileId, m.EquipeExterieurId }).Distinct().ToList();
            var joueursParEquipe = (await context.Joueurs
                    .AsNoTracking()
                    .Where(j => equipeIds.Contains(j.EquipeId))
                    .Select(j => new { j.Id, j.EquipeId, j.Prenom, j.Nom })
                    .ToListAsync(ct))
                .GroupBy(j => j.EquipeId)
                .ToDictionary(g => g.Key, g => g.Select(j => (j.Id, Formes: FormesDuNom(j.Prenom, j.Nom).ToHashSet())).ToList());

            // Identifiants API déjà reliés à un seul joueur dans d'autres buts
            var apiIds = buts.Select(b => b.ApiJoueurId).Where(id => id > 0).Distinct().ToList();
            var joueurParApiId = apiIds.Count == 0
                ? new Dictionary<int, int>()
                : (await context.ButsMatch
                        .AsNoTracking()
                        .Where(b => apiIds.Contains(b.ApiJoueurId) && b.JoueurId != null)
                        .Select(b => new { b.ApiJoueurId, JoueurId = b.JoueurId!.Value })
                        .Distinct()
                        .ToListAsync(ct))
                    .GroupBy(x => x.ApiJoueurId)
                    .Where(g => g.Count() == 1)
                    .ToDictionary(g => g.Key, g => g.First().JoueurId);

            var relies = 0;
            foreach (var but in buts)
            {
                if (!matchs.TryGetValue(but.MatchId, out var m)) continue;

                int? equipeId = but.NomEquipe == m.NomDom ? m.EquipeDomicileId
                              : but.NomEquipe == m.NomExt ? m.EquipeExterieurId
                              : (int?)null;

                int? joueurId = null;
                if (equipeId is int eq && joueursParEquipe.TryGetValue(eq, out var effectif))
                {
                    var cle = NormaliserNom(but.NomJoueur);
                    var trouves = effectif.Where(j => j.Formes.Contains(cle)).Select(j => j.Id).Distinct().ToList();
                    if (trouves.Count == 1) joueurId = trouves[0];
                }
                if (joueurId == null && but.ApiJoueurId > 0 && joueurParApiId.TryGetValue(but.ApiJoueurId, out var parApi))
                    joueurId = parApi;

                if (joueurId != null)
                {
                    but.JoueurId = joueurId;
                    relies++;
                }
            }

            if (relies > 0) await context.SaveChangesAsync(ct);
            return relies;
        }

        /// <summary>Les écritures possibles d'un joueur dans un but : nom complet, "P. Nom", nom seul.</summary>
        public static IEnumerable<string> FormesDuNom(string? prenom, string? nom)
        {
            prenom = (prenom ?? string.Empty).Trim();
            nom = (nom ?? string.Empty).Trim();
            yield return NormaliserNom($"{prenom} {nom}");
            if (prenom.Length > 0) yield return NormaliserNom($"{prenom[0]}. {nom}");
            yield return NormaliserNom(nom);
        }

        /// <summary>"  Ndamé  NDAME " -> "ndame ndame"</summary>
        public static string NormaliserNom(string? texte)
        {
            var decompose = (texte ?? string.Empty).Normalize(System.Text.NormalizationForm.FormD);
            var sb = new System.Text.StringBuilder(decompose.Length);
            foreach (var c in decompose)
                if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
                    sb.Append(c);
            return string.Join(' ', sb.ToString().ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries));
        }
    }
}