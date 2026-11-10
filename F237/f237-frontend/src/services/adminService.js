// f237-frontend/src/services/adminService.js
// Appels réservés au rôle Admin (le token est envoyé à chaque requête).
// Un 401 / 403 lève une erreur avec "statut" pour que la page puisse réagir.

import { authService } from './authService';

const API_URL = (import.meta.env?.VITE_API_URL ?? 'http://localhost:5257').replace(/\/$/, '');

async function appel(chemin, options = {}) {
  const reponse = await fetch(`${API_URL}${chemin}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authService.getAuthHeader(), ...(options.headers ?? {}) },
  });
  const texte = await reponse.text();
  // Corps JSON si possible, sinon le texte brut (ex. message d'erreur simple)
  let donnees;
  try { donnees = texte ? JSON.parse(texte) : null; } catch { donnees = texte; }

  // 207 = import partiel (réponse utilisable, avec un champ "erreur")
  if (!reponse.ok && reponse.status !== 207) {
    const message = (typeof donnees === 'string' ? donnees : donnees?.message ?? donnees?.title) || `Erreur ${reponse.status}`;
    const erreur = new Error(message);
    erreur.statut = reponse.status;
    throw erreur;
  }
  return donnees;
}

export const adminService = {
  /** Chiffres clés des saisons demandées (ids F237) + totaux du site. */
  tableauDeBord: (saisonIds) => appel(`/api/admin/tableau-de-bord?saisons=${saisonIds.join(',')}`),

  /** Quota API-Football du jour : { plan, requetesDuJour, limiteParJour, restantes }. */
  quota: () => appel('/api/sync/quota'),

  /** Import complet d'une saison (league 411 = Elite One, 813 = Elite Two). */
  importerSaison: (league, season) => appel(`/api/sync/saison?league=${league}&season=${season}`, { method: 'POST' }),
};

// Identifiants API-Football des compétitions F237
export const LIGUES_API = { one: 411, two: 813 };