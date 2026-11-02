using F237.Domain.Enums;

namespace F237.Domain.Entities
{
    public class Match
    {
        public int Id { get; set; }
        public int ApiFootballId { get; set; }
        public int EquipeDomicileId { get; set; }
        public int EquipeExterieurId { get; set; }
        public int? ScoreDomicile { get; set; }
        public int? ScoreExterieur { get; set; }
        public DateTime DateMatch { get; set; }
        public StatutMatchEnum Statut { get; set; }
        public int SaisonId { get; set; }

        // Navigation
        public Equipe EquipeDomicile { get; set; } = null!;
        public Equipe EquipeExterieur { get; set; } = null!;
        public Saison Saison { get; set; } = null!;
        public ICollection<Pari> Paris { get; set; } = new List<Pari>();
        public ICollection<ButMatch> Buts { get; set; } = new List<ButMatch>();
    }
}