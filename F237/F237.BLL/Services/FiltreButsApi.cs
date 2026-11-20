// F237.BLL/Services/FiltreButsApi.cs
// Tri des événements "events" d'API-Football : ne garde que les VRAIS buts.
//
// Pourquoi : chez API-Football, le type "Goal" ne veut pas toujours dire but marqué.
//   - un penalty raté est un événement "Goal" avec detail "Missed Penalty" ;
//   - un but refusé (arbitre / VAR) peut rester dans la liste, suivi d'un événement
//     "Var" avec detail "Goal cancelled" / "Goal Disallowed" ;
//   - en direct, l'API envoie parfois un but qui est ensuite annulé sans autre trace.
// Résultat avant ce filtre : un 0-0 affiché avec « Buteur inconnu 36' ».
//
// Règles appliquées, dans l'ordre :
//   1. type "Goal" uniquement, sans les penaltys ratés (quelle que soit la casse) ;
//   2. chaque événement "Var" de but annulé retire le but de la même équipe le plus proche
//      dans le temps (au plus 5 minutes avant) ;
//   3. le nombre de buts ne peut pas dépasser le score du match (si on le connaît) :
//      on retire d'abord les buts sans buteur, puis les plus tardifs.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace F237.BLL.Services
{
    public static class FiltreButsApi
    {
        private const int ECART_MAX_ANNULATION = 5; // minutes entre le but et l'annulation VAR

        /// <summary>
        /// Les événements "Goal" qui correspondent à de vrais buts.
        /// scoreDomicile / scoreExterieur : score officiel du match (null = inconnu, pas de plafond).
        /// </summary>
        public static List<JsonElement> ButsValides(JsonElement events, int? scoreDomicile, int? scoreExterieur)
        {
            var buts = new List<JsonElement>();
            var annulations = new List<JsonElement>();
            if (events.ValueKind != JsonValueKind.Array) return buts;

            foreach (var evt in events.EnumerateArray())
            {
                var type = Texte(evt, "type");
                var detail = Texte(evt, "detail") ?? "";

                if (string.Equals(type, "Goal", StringComparison.OrdinalIgnoreCase))
                {
                    if (detail.Contains("missed", StringComparison.OrdinalIgnoreCase)) continue; // penalty raté
                    buts.Add(evt);
                }
                else if (string.Equals(type, "Var", StringComparison.OrdinalIgnoreCase)
                         && detail.Contains("goal", StringComparison.OrdinalIgnoreCase)
                         && (detail.Contains("cancel", StringComparison.OrdinalIgnoreCase)
                             || detail.Contains("disallow", StringComparison.OrdinalIgnoreCase)))
                {
                    annulations.Add(evt);
                }
            }

            // 2. Buts annulés par la VAR / l'arbitre
            foreach (var annul in annulations)
            {
                var minuteAnnul = Minute(annul);
                var equipe = EquipeId(annul);
                var cible = buts
                    .Where(b => EquipeId(b) == equipe && Minute(b) <= minuteAnnul && minuteAnnul - Minute(b) <= ECART_MAX_ANNULATION)
                    .OrderByDescending(Minute)
                    .Cast<JsonElement?>()
                    .FirstOrDefault();
                if (cible.HasValue) buts.Remove(cible.Value);
            }

            // 3. Jamais plus de buts que le score
            if (scoreDomicile.HasValue && scoreExterieur.HasValue)
            {
                var max = scoreDomicile.Value + scoreExterieur.Value;
                while (buts.Count > max)
                {
                    var aRetirer = buts
                        .OrderBy(b => NomJoueur(b) == null ? 0 : 1) // sans buteur d'abord
                        .ThenByDescending(Minute)                     // puis le plus tardif
                        .First();
                    buts.Remove(aRetirer);
                }
            }
            return buts;
        }

        /// <summary>Score d'un objet "fixture" de l'API (champ "goals"), null si absent.</summary>
        public static (int? domicile, int? exterieur) Score(JsonElement fixture)
        {
            if (!fixture.TryGetProperty("goals", out var goals)) return (null, null);
            return (Entier(goals, "home"), Entier(goals, "away"));
        }

        // ── Lecture prudente du JSON ─────────────────────────────────────

        private static string? Texte(JsonElement e, string nom) =>
            e.TryGetProperty(nom, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() : null;

        private static int? Entier(JsonElement e, string nom) =>
            e.TryGetProperty(nom, out var v) && v.ValueKind == JsonValueKind.Number ? v.GetInt32() : null;

        private static int Minute(JsonElement evt) =>
            evt.TryGetProperty("time", out var t) ? (Entier(t, "elapsed") ?? 0) + (Entier(t, "extra") ?? 0) : 0;

        private static int EquipeId(JsonElement evt) =>
            evt.TryGetProperty("team", out var t) ? Entier(t, "id") ?? 0 : 0;

        private static string? NomJoueur(JsonElement evt)
        {
            if (!evt.TryGetProperty("player", out var p)) return null;
            var nom = Texte(p, "name");
            return string.IsNullOrWhiteSpace(nom) ? null : nom;
        }
    }
}