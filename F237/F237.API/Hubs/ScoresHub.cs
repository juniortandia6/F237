// F237.API/Hubs/ScoresHub.cs

using Microsoft.AspNetCore.SignalR;

namespace F237.API.Hubs
{
    public class ScoresHub : Hub
    {
        /// <summary>
        /// Le client peut rejoindre un groupe "match_{matchId}" pour recevoir
        /// uniquement les updates d'un match spécifique.
        /// </summary>
        public async Task RejoindreMatch(int matchId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"match_{matchId}");
        }

        public async Task QuitterMatch(int matchId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"match_{matchId}");
        }

        /// <summary>
        /// Rejoindre le groupe "live" pour recevoir TOUS les scores en direct.
        /// </summary>
        public async Task RejoindreScoresLive()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "live");
        }

        public async Task QuitterScoresLive()
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "live");
        }

        public override async Task OnConnectedAsync()
        {
            // Chaque nouvelle connexion rejoint automatiquement le groupe "live"
            await Groups.AddToGroupAsync(Context.ConnectionId, "live");
            await base.OnConnectedAsync();
        }
    }
}
