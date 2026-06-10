namespace F237.Domain.Entities
{
    public class ButMatch
    {
        public int Id { get; set; }
        public int MatchId { get; set; }
        public int JoueurId { get; set; }
        public int Minute { get; set; }
        public bool EstButCSC { get; set; } = false; // Contre son camp

        // Navigation
        public Match Match { get; set; } = null!;
        public Joueur Joueur { get; set; } = null!;
    }
}