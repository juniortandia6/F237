namespace F237.BLL.Services.Interfaces
{
    public interface IApiFootballService
    {
        Task<bool> TestConnectionAsync();
        Task SyncEquipesAsync(int leagueId, int saison);
        Task SyncMatchsJourneeAsync(int leagueId, int saison, int saisonId = 1);
        Task SyncScoresLiveAsync(int leagueId);
        Task SyncClassementAsync(int leagueId, int saison, int saisonId = 1);
        Task SyncJoueursAsync(int leagueId, int saison);
        Task SyncEvenementsAsync(int leagueId, int saison, int saisonId);

        /// <summary>
        /// Importe une saison complète (saison, équipes, matchs, classement, buts)
        /// pour une ligue. "saison" = paramètre "season" d'API-Football (ex. 2022).
        /// Peut être relancé sans risque : ce qui existe déjà n'est pas dupliqué,
        /// et les buts reprennent là où l'import s'était arrêté.
        /// </summary>
        Task<ResultatImportSaison> ImporterSaisonAsync(int leagueId, int saison);

        /// <summary>Requêtes restantes aujourd'hui (GET /status, ne consomme pas de quota).</summary>
        Task<QuotaApiFootball?> GetQuotaAsync();
    }

    public class ResultatImportSaison
    {
        public int LeagueId { get; set; }
        public int Saison { get; set; }
        public int SaisonId { get; set; }
        public string NomSaison { get; set; } = string.Empty;
        public int EquipesAjoutees { get; set; }
        public int Matchs { get; set; }
        public int EquipesClassement { get; set; }
        public int ButsImportes { get; set; }
        public int MatchsSansButsRestants { get; set; }
        public int RequetesUtilisees { get; set; }
        public int? RequetesRestantes { get; set; }
        public bool Termine { get; set; }
        public string? Erreur { get; set; }
    }

    public class QuotaApiFootball
    {
        public string Plan { get; set; } = string.Empty;
        public int RequetesDuJour { get; set; }
        public int LimiteParJour { get; set; }
        public int Restantes => LimiteParJour - RequetesDuJour;
    }
}