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

        // Navigation
        public ICollection<Joueur> Joueurs { get; set; } = new List<Joueur>();
        public ICollection<Match> MatchsDomicile { get; set; } = new List<Match>();
        public ICollection<Match> MatchsExterieur { get; set; } = new List<Match>();
    }
}