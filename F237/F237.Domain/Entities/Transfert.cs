namespace F237.Domain.Entities
{
    public class Transfert
    {
        public int Id { get; set; }
        public int JoueurId { get; set; }
        public int EquipeDepartId { get; set; }
        public int EquipeArriveeId { get; set; }
        public DateTime DateTransfert { get; set; }
        public decimal? Montant { get; set; }
        public string Type { get; set; } = string.Empty;
        public string? Notes { get; set; }

        // Navigation
        public Joueur Joueur { get; set; } = null!;
        public Equipe EquipeDepart { get; set; } = null!;
        public Equipe EquipeArrivee { get; set; } = null!;
    }
}