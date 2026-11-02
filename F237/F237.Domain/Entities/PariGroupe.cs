namespace F237.Domain.Entities
{
    public class PariGroupe
    {
        public int Id { get; set; }
        public string Nom { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int CreateurId { get; set; }
        public DateTime DateCreation { get; set; } = DateTime.Now;
        public bool EstActif { get; set; } = true;

        // Navigation
        public Utilisateur Createur { get; set; } = null!;
        public ICollection<Pari> Paris { get; set; } = new List<Pari>();
    }
}