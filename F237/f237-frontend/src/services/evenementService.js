// f237-frontend/src/services/evenementService.js
// Événements d'un match autres que les buts (penalty manqué, cartons), saisis dans l'admin.
import api from './api';

export const TYPE_EVENEMENT = { PENALTY_MANQUE: 1, CARTON_JAUNE: 2, CARTON_ROUGE: 3, DEUXIEME_JAUNE: 4 };

export const evenementService = {
  // [{ id, type, minute, joueurId, nomJoueur, nomEquipe }] ; [] si aucun
  getParMatch: (matchId) => api.get(`/matchs/${matchId}/evenements`),
};