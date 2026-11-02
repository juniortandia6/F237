namespace F237.Domain.Entities
{
    public class Transaction
    {
        public int Id { get; set; }
        public int UtilisateurId { get; set; }
        public int Montant { get; set; }
        public string Type { get; set; } = string.Empty; // "Gain", "Perte", "Retrait", "Bonus"
        public string? Description { get; set; }
        public DateTime DateTransaction { get; set; } = DateTime.Now;

        // Navigation
        public Utilisateur Utilisateur { get; set; } = null!;
    }
}