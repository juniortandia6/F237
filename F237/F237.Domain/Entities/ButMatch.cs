namespace F237.Domain.Entities
{
    public class ButMatch
    {
        public int Id { get; set; }
        public int MatchId { get; set; }
        public int? JoueurId { get; set; }
        public string NomJoueur { get; set; } = string.Empty;
        public string NomEquipe { get; set; } = string.Empty;
        public int ApiJoueurId { get; set; }
        public int Minute { get; set; }
        public bool EstButCSC { get; set; } = false;
        public bool EstPenalty { get; set; } = false;
        // Navigation
        public Match Match { get; set; } = null!;
        public Joueur? Joueur { get; set; }
    }
}