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
        public EquipeSimpleDto? EquipeDomicile { get; set; }
        public EquipeSimpleDto? EquipeExterieur { get; set; }
    }

    public class EquipeSimpleDto
    {
        public int Id { get; set; }
        public string Nom { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public int Division { get; set; }
    }
}