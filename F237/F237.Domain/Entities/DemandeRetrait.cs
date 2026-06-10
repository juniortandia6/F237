namespace F237.Domain.Entities
{
    public class DemandeRetrait
    {
        public int Id { get; set; }
        public int UtilisateurId { get; set; }
        public int MontantPoints { get; set; }
        public decimal MontantFCFA { get; set; }
        public string NumereMobileMoney { get; set; } = string.Empty;
        public string Operateur { get; set; } = string.Empty; // "MTN", "Orange"
        public string Statut { get; set; } = "EnAttente"; // "EnAttente", "Approuvé", "Rejeté"
        public DateTime DateDemande { get; set; } = DateTime.Now;
        public DateTime? DateTraitement { get; set; }

        // Navigation
        public Utilisateur Utilisateur { get; set; } = null!;
    }
}