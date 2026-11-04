// F237.API/Services/SyncAutoService.cs

using F237.BLL.Services.Interfaces;
using F237.DAL.Data;
using Microsoft.EntityFrameworkCore;

namespace F237.API.Services
{
    /// <summary>
    /// Synchronisation automatique avec API-Football, sans passer par Postman.
    ///   1. Après chaque match terminé (signalé par LiveScoreService) : réimport de sa
    ///      saison 10 min puis 60 min après la fin -> score final, buteurs, classement
    ///      et flèches d'évolution à jour (l'API met parfois quelques minutes à suivre).
    ///   2. Toutes les 6 heures : réimport des saisons en cours -> heures corrigées,
    ///      matchs reportés, nouveaux matchs programmés.
    /// Un import de saison coûte environ 5 requêtes : largement dans le plan Pro.
    /// </summary>
    public class SyncAutoService : BackgroundService
    {
        private readonly IServiceProvider _services;
        private readonly ILogger<SyncAutoService> _logger;

        private static readonly TimeSpan INTERVALLE_GENERAL = TimeSpan.FromHours(6);
        private static readonly TimeSpan PREMIER_IMPORT = TimeSpan.FromMinutes(5); // après le démarrage de l'API

        // Imports demandés : (SaisonId, quand)
        private static readonly List<(int SaisonId, DateTime Quand)> _planifies = new();
        private static readonly object _verrou = new();

        public SyncAutoService(IServiceProvider services, ILogger<SyncAutoService> logger)
        {
            _services = services;
            _logger = logger;
        }

        /// <summary>Demande le réimport d'une saison dans "delai" (appelé quand un match se termine).</summary>
        public static void Planifier(int saisonId, TimeSpan delai)
        {
            var quand = DateTime.UtcNow + delai;
            lock (_verrou)
            {
                // Pas de doublon : un import déjà prévu à 2 minutes près suffit
                if (_planifies.Any(p => p.SaisonId == saisonId && Math.Abs((p.Quand - quand).TotalMinutes) < 2)) return;
                _planifies.Add((saisonId, quand));
            }
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🔄 SyncAutoService démarré");
            var prochainImportGeneral = DateTime.UtcNow + PREMIER_IMPORT;

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // 1. Imports demandés après des fins de match
                    List<int> aImporter;
                    lock (_verrou)
                    {
                        var dus = _planifies.Where(p => p.Quand <= DateTime.UtcNow).ToList();
                        _planifies.RemoveAll(p => p.Quand <= DateTime.UtcNow);
                        aImporter = dus.Select(p => p.SaisonId).Distinct().ToList();
                    }
                    foreach (var saisonId in aImporter)
                        await ImporterAsync(saisonId, "fin de match", stoppingToken);

                    // 2. Import régulier des saisons en cours
                    if (DateTime.UtcNow >= prochainImportGeneral)
                    {
                        foreach (var saisonId in await SaisonsEnCoursAsync(stoppingToken))
                            await ImporterAsync(saisonId, "import régulier", stoppingToken);
                        prochainImportGeneral = DateTime.UtcNow + INTERVALLE_GENERAL;
                    }
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    _logger.LogError(ex, "❌ Erreur dans SyncAutoService");
                }

                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }

        // Saisons dont les dates englobent aujourd'hui (avec une marge d'une semaine après la fin)
        private async Task<List<int>> SaisonsEnCoursAsync(CancellationToken ct)
        {
            using var scope = _services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<F237DbContext>();
            var maintenant = DateTime.UtcNow;
            return await context.Saisons
                .Where(s => s.DateDebut <= maintenant.AddDays(3) && s.DateFin >= maintenant.AddDays(-7))
                .Select(s => s.Id)
                .ToListAsync(ct);
        }

        private async Task ImporterAsync(int saisonId, string raison, CancellationToken ct)
        {
            using var scope = _services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<F237DbContext>();
            var api = scope.ServiceProvider.GetRequiredService<IApiFootballService>();

            var saison = await context.Saisons.FirstOrDefaultAsync(s => s.Id == saisonId, ct);
            if (saison == null) return;

            // Division 0 = Elite One (411), 1 = Elite Two (813) ; Annee = paramètre "season" de l'API
            var leagueId = (int)saison.Division == 0 ? 411 : 813;
            var resultat = await api.ImporterSaisonAsync(leagueId, saison.Annee);

            _logger.LogInformation("🔄 Import auto ({Raison}) : {Nom} — {Matchs} matchs, {Classement} lignes de classement, {Buts} buts, erreur : {Erreur}",
                raison, saison.Nom, resultat.Matchs, resultat.EquipesClassement, resultat.ButsImportes, resultat.Erreur ?? "aucune");
        }
    }
}