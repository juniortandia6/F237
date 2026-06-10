using F237.Domain.Enums;

namespace F237.Domain.Entities
{
    public class Pari
    {
        public int Id { get; set; }
        public int UtilisateurId { get; set; }
        public int MatchId { get; set; }
        public ResultatPariEnum Pronostic { get; set; }
        public int Mise { get; set; }
        public int? GainPotentiel { get; set; }
        public StatutPariEnum Statut { get; set; } = StatutPariEnum.EnAttente;
        public DateTime DatePari { get; set; } = DateTime.Now;
        public int? PariGroupeId { get; set; }

        // Navigation
        public Utilisateur Utilisateur { get; set; } = null!;
        public Match Match { get; set; } = null!;
        public PariGroupe? PariGroupe { get; set; }
    }
}