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
        // Dernière heure reçue de l'API (UTC) et heure corrigée à la main par l'admin
        public DateTime? DateApi { get; set; }
        public bool HeureManuelle { get; set; } = false;

        // Score à la mi-temps (API : score.halftime). Utile quand l'API ne donne pas
        // le détail des buts (ex. Elite Two) : 1re MT = mi-temps, 2e MT = final - mi-temps.
        public int? ScoreMiTempsDomicile { get; set; }
        public int? ScoreMiTempsExterieur { get; set; }

        // Numéro de journée (API : league.round, "Regular Season - 3" -> 3). Null si inconnu.
        public int? Journee { get; set; }

        // Navigation
        public Equipe EquipeDomicile { get; set; } = null!;
        public Equipe EquipeExterieur { get; set; } = null!;
        public Saison Saison { get; set; } = null!;
        public ICollection<Pari> Paris { get; set; } = new List<Pari>();
        public ICollection<ButMatch> Buts { get; set; } = new List<ButMatch>();
    }
}