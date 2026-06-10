using F237.Domain.Enums;
using System.Text.RegularExpressions;

namespace F237.Domain.Entities
{
    public class Equipe
    {
        public int Id { get; set; }
        public string Nom { get; set; } = string.Empty;
        public string Ville { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public DivisionEnum Division { get; set; }
        public bool EstActive { get; set; } = true;

        // Navigation
        public ICollection<Joueur> Joueurs { get; set; } = new List<Joueur>();
        public ICollection<Match> MatchsDomicile { get; set; } = new List<Match>();
        public ICollection<Match> MatchsExterieur { get; set; } = new List<Match>();
    }
}