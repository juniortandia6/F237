namespace F237.Domain.Entities
{
    public class Joueur
    {
        public int Id { get; set; }
        public string Nom { get; set; } = string.Empty;
        public string Prenom { get; set; } = string.Empty;
        public string? PhotoUrl { get; set; }
        public string? Poste { get; set; }
        public DateTime? DateNaissance { get; set; }
        public string? Nationalite { get; set; }
        public int EquipeId { get; set; }
        public bool EstActif { get; set; } = true;

        // Stats
        public int NombreButs { get; set; } = 0;
        public int NombrePasses { get; set; } = 0;
        public int NombreMatchs { get; set; } = 0;

        // Navigation
        public Equipe Equipe { get; set; } = null!;
        public ICollection<ButMatch> Buts { get; set; } = new List<ButMatch>();
    }
}