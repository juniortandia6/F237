namespace F237.API.DTOs
{
    public class MatchDto
    {
        public int Id { get; set; }
        public int ApiFootballId { get; set; }
        public DateTime DateMatch { get; set; }
        public int Statut { get; set; }
        public int? ScoreDomicile { get; set; }
        public int? ScoreExterieur { get; set; }
        public int SaisonId { get; set; }
        public int? MinuteLive { get; set; }
        public EquipeSimpleDto? EquipeDomicile { get; set; }
        public EquipeSimpleDto? EquipeExterieur { get; set; }
        public List<ButDto> Buts { get; set; } = new List<ButDto>();
    }

    public class EquipeSimpleDto
    {
        public int Id { get; set; }
        public string Nom { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public int Division { get; set; }
    }

    public class ButDto
    {
        public int Minute { get; set; }
        public string NomJoueur { get; set; } = string.Empty;
        public string NomEquipe { get; set; } = string.Empty;
        public bool EstButCSC { get; set; }
        public bool EstPenalty { get; set; }
    }
}