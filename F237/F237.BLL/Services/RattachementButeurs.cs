// F237.BLL/Services/RattachementButeurs.cs
// Relie les buts aux joueurs de l'effectif (ButMatch.JoueurId).
// Utilisé partout où des buts sont créés : import API, scores en direct, saisie admin.
//
// Règles (les mêmes que le script SQL de rattachement) :
//   1. Nom : un SEUL joueur de l'effectif de l'équipe créditée porte ce nom, sous l'une de ses
//      écritures possibles ("Samuel Tagbor", "S. Tagbor", "Tagbor", et pour un nom officiel à plusieurs
//      prénoms "S. Belemb" ou "J. P. Belemb" ; voir FormesDuNom), accents et casse ignorés.
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

        /// <summary>
        /// Les écritures possibles d'un joueur dans un but. Les noms officiels ont souvent plusieurs prénoms
        /// et plusieurs noms ("Julien Patrice Samuel Belemb"), alors que l'API écrit "S. Belemb" ou "J. Belemb".
        /// On produit donc : le nom complet, chaque mot seul, et "X. suite de mots" / "X. Y. suite de mots"
        /// pour toute initiale X (et Y) prise parmi les mots. Le rattachement exige ensuite qu'UN SEUL joueur
        /// de l'équipe corresponde : une écriture trop vague ("Manga") ne relie donc personne.
        /// </summary>
        public static IEnumerable<string> FormesDuNom(string? prenom, string? nom)
        {
            prenom = (prenom ?? string.Empty).Trim();
            nom = (nom ?? string.Empty).Trim();
            var formes = new HashSet<string>
            {
                NormaliserNom($"{prenom} {nom}"),
                NormaliserNom(nom),
            };
            if (prenom.Length > 0) formes.Add(NormaliserNom($"{prenom[0]}. {nom}"));

            var mots = NormaliserNom($"{prenom} {nom}").Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Where(m => !m.EndsWith('.')).ToList();
            foreach (var m in mots.Where(m => m.Length >= 3)) formes.Add(m);

            // Suites de 1 à 3 mots consécutifs, prises dans les mots restants (dans l'ordre)
            static IEnumerable<string> Suites(List<string> restants)
            {
                for (var debut = 0; debut < restants.Count; debut++)
                    for (var n = 1; n <= 3 && debut + n <= restants.Count; n++)
                        yield return string.Join(' ', restants.Skip(debut).Take(n));
            }

            for (var a = 0; a < mots.Count; a++)
            {
                var sansA = mots.Where((_, i) => i != a).ToList();
                foreach (var suite in Suites(sansA)) formes.Add($"{mots[a][0]}. {suite}");
                for (var b = 0; b < mots.Count; b++)
                {
                    if (b == a) continue;
                    var sansAB = mots.Where((_, i) => i != a && i != b).ToList();
                    foreach (var suite in Suites(sansAB)) formes.Add($"{mots[a][0]}. {mots[b][0]}. {suite}");
                }
            }
            return formes;
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