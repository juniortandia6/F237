using F237.Domain.Enums;

namespace F237.Domain.Entities
{
    public class Saison
    {
        public int Id { get; set; }
        public string Nom { get; set; } = string.Empty;
        public int Annee { get; set; }
        public DivisionEnum Division { get; set; }
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public bool EstActive { get; set; } = false;

        // Navigation
        public ICollection<Match> Matchs { get; set; } = new List<Match>();
        public ICollection<Classement> Classements { get; set; } = new List<Classement>();
    }
}