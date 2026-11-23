// F237.Domain/Entities/EvenementMatch.cs
// Événement d'un match autre qu'un but (penalty manqué, cartons), saisi dans l'admin.
// Affiché dans la chronologie du match. N'est jamais touché par l'import ni par le direct.
using F237.Domain.Enums;

namespace F237.Domain.Entities
{
    public class EvenementMatch
    {
        public int Id { get; set; }
        public int MatchId { get; set; }
        public TypeEvenementEnum Type { get; set; }
        public int Minute { get; set; }                       // 0 = minute inconnue
        public string NomJoueur { get; set; } = string.Empty; // "Inconnu" si non renseigné
        public string NomEquipe { get; set; } = string.Empty; // équipe du joueur concerné
        public int? JoueurId { get; set; }                    // joueur de l'effectif (null = pas relié)

        // Navigation
        public Match Match { get; set; } = null!;
        public Joueur? Joueur { get; set; }
    }
}