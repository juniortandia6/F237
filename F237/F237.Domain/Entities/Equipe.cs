using F237.Domain.Enums;
using System.Text.RegularExpressions;

namespace F237.Domain.Entities
{
    public class Equipe
    {
        public int Id { get; set; }
        public int ApiFootballId { get; set; }
        public string Nom { get; set; } = string.Empty;
        public string Pays { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public DivisionEnum Division { get; set; }
        public bool EstActive { get; set; } = true;

        // Logo remplacé à la main (ex. "/logos/victoria-united.png") : l'import ne le touche plus.
        public bool LogoManuel { get; set; } = false;
        // Logo d'origine de l'API-Football, gardé pour pouvoir annuler le remplacement
        public string? LogoApi { get; set; }

        // Couleurs du maillot (format "#c62828"), saisies dans l'admin.
        // Null = le site utilise ses couleurs par défaut (couleursClubs.js).
        // L'API-Football ne fournit pas de couleurs : l'import n'y touche jamais.
        public string? CouleurPrincipale { get; set; }
        public string? CouleurSecondaire { get; set; }

        // Autres identifiants API-Football du même club, séparés par des virgules (ex. "15566").
        // L'API donne parfois un nouvel id à un club selon la saison (ex. Gazelle : 15566 puis 28568) ;
        // l'import reconnaît le club par son ApiFootballId OU par l'un de ces alias, sans créer de doublon.
        public string? ApiFootballIdsAlias { get; set; }

        /// <summary>Vrai si cet identifiant API-Football désigne ce club (id principal ou alias).</summary>
        public bool CorrespondA(int apiId) =>
            ApiFootballId == apiId
            || (!string.IsNullOrWhiteSpace(ApiFootballIdsAlias)
                && ApiFootballIdsAlias.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .Contains(apiId.ToString()));

        /// <summary>Tous les identifiants API-Football de ce club (principal + alias).</summary>
        public IEnumerable<int> TousLesIdsApi() =>
            new[] { ApiFootballId }.Concat(
                (ApiFootballIdsAlias ?? string.Empty)
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .Select(s => int.TryParse(s, out var id) ? id : 0)
                    .Where(id => id > 0));

        // Navigation
        public ICollection<Joueur> Joueurs { get; set; } = new List<Joueur>();
        public ICollection<Match> MatchsDomicile { get; set; } = new List<Match>();
        public ICollection<Match> MatchsExterieur { get; set; } = new List<Match>();
    }
}