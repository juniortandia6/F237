namespace F237.Domain.Entities
{
    public class Joueur
    {
        public int Id { get; set; }
        public string Nom { get; set; } = string.Empty;
        public string Prenom { get; set; } = string.Empty;   // peut rester vide si on ne le connaît pas
        public string? PhotoUrl { get; set; }                // pas utilisé tant qu'il n'y a pas d'accord des clubs
        public string? Poste { get; set; }                   // "Gardien", "Défenseur", "Milieu", "Attaquant"
        public int? Numero { get; set; }                     // numéro de maillot (1 à 99)
        public DateTime? DateNaissance { get; set; }
        public string? Nationalite { get; set; }
        public int EquipeId { get; set; }
        public bool EstActif { get; set; } = true;           // false = a quitté le club (gardé pour l'historique)

        // Stats
        public int NombreButs { get; set; } = 0;
        public int NombrePasses { get; set; } = 0;
        public int NombreMatchs { get; set; } = 0;

        // Navigation
        public Equipe Equipe { get; set; } = null!;
        public ICollection<ButMatch> Buts { get; set; } = new List<ButMatch>();
    }
}