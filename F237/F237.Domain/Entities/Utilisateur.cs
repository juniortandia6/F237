using System.Transactions;

namespace F237.Domain.Entities
{
    public class Utilisateur
    {
        public int Id { get; set; }
        public string Nom { get; set; } = string.Empty;
        public string Prenom { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string MotDePasseHash { get; set; } = string.Empty;
        public int SoldePoints { get; set; } = 0;
        public DateTime DateInscription { get; set; } = DateTime.Now;
        public bool EstActif { get; set; } = true;

        // Navigation
        public ICollection<Pari> Paris { get; set; } = new List<Pari>();
        public ICollection<PariGroupe> PariGroupes { get; set; } = new List<PariGroupe>();
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}