namespace F237.Domain.Entities
{
    public class Classement
    {
        public int Id { get; set; }
        public int EquipeId { get; set; }
        public int SaisonId { get; set; }

        // Poule ou phase (ex. "Elite One: Championship Round"). Null quand la saison
        // n'a qu'un seul classement.
        public string? Groupe { get; set; }

        // Ordre d'affichage des groupes (0 = premier groupe renvoyé par l'API)
        public int OrdreGroupe { get; set; } = 0;

        // Ce que la place rapporte selon l'API (ex. "CAF Champions League", "Relegation")
        public string? Description { get; set; }

        // Évolution depuis la journée précédente selon l'API : "up", "down" ou "same"
        public string? Evolution { get; set; }

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