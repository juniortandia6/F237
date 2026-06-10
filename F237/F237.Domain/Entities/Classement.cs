namespace F237.Domain.Entities
{
    public class Classement
    {
        public int Id { get; set; }
        public int EquipeId { get; set; }
        public int SaisonId { get; set; }
        public int Position { get; set; }
        public int MatchsJoues { get; set; } = 0;
        public int Victoires { get; set; } = 0;
        public int Nuls { get; set; } = 0;
        public int Defaites { get; set; } = 0;
        public int ButsPour { get; set; } = 0;
        public int ButsContre { get; set; } = 0;
        public int DifferenceDesButs { get; set; } = 0;
        public int Points { get; set; } = 0;

        // Navigation
        public Equipe Equipe { get; set; } = null!;
        public Saison Saison { get; set; } = null!;
    }
}