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

  // ── Articles (brouillons compris) ──────────────────────────────────────
  articles: {
    /** Tous les articles, du plus récent au plus ancien. */
    liste: () => appel('/api/articles/admin').then(l => l ?? []),
    /** Un article complet (contenu brut, FR + EN). */
    get: (id) => appel(`/api/articles/admin/${id}`),
    /** Création : renvoie l'article créé (avec son id et son slug). */
    creer: (saisie) => appel('/api/articles', { method: 'POST', body: JSON.stringify(saisie) }),
    /** Modification complète (même corps que la création). */
    modifier: (id, saisie) => appel(`/api/articles/${id}`, { method: 'PUT', body: JSON.stringify(saisie) }),
    supprimer: (id) => appel(`/api/articles/${id}`, { method: 'DELETE' }),
  },

  // ── Matchs : buteurs, mi-temps, heure ──────────────────────────────────
  matchs: {
    /** Matchs d'une saison (route publique, avec les buts et leur id). */
    saison: (saisonId) => appel(`/api/matchs/saison/${saisonId}`).then(l => l ?? []),
    /** Un match (route publique). */
    get: (id) => appel(`/api/matchs/${id}`),
    /** but = { nomJoueur, nomEquipe (équipe créditée), minute, estPenalty, estButCSC } */
    ajouterBut: (matchId, but) => appel(`/api/admin/matchs/${matchId}/buts`, { method: 'POST', body: JSON.stringify(but) }),
    modifierBut: (butId, but) => appel(`/api/admin/buts/${butId}`, { method: 'PUT', body: JSON.stringify(but) }),
    supprimerBut: (butId) => appel(`/api/admin/buts/${butId}`, { method: 'DELETE' }),
    /** null + null = effacer le score à la mi-temps */
    miTemps: (matchId, domicile, exterieur) => appel(`/api/admin/matchs/${matchId}/mi-temps`, { method: 'PUT', body: JSON.stringify({ domicile, exterieur }) }),
    /** heure = chaîne ISO avec fuseau, ex. "2026-11-14T15:30:00+01:00" (heure du Cameroun) */
    corrigerHeure: (apiFootballId, heure) => appel(`/api/sync/match/${apiFootballId}/heure`, { method: 'PUT', body: JSON.stringify({ heure }) }),
    annulerHeure: (apiFootballId) => appel(`/api/sync/match/${apiFootballId}/heure`, { method: 'DELETE' }),
  },
};

// Catégories acceptées par l'API (TagsArticle.Tous côté backend)
export const TAGS_ARTICLE = ['Elite One', 'Elite Two', 'Transfert', 'Talents', 'Compétition'];

/** Article admin (ArticleAdminDto) -> corps attendu par POST / PUT (SaisieArticle). */
export const versSaisie = (a, changements = {}) => ({
  slug: a.slug ?? null,
  tag: a.tag,
  imageUrl: a.imageUrl ?? null,
  titreFr: a.titreFr,
  resumeFr: a.resumeFr,
  contenuFr: a.contenuFr,
  titreEn: a.titreEn ?? null,
  resumeEn: a.resumeEn ?? null,
  contenuEn: a.contenuEn ?? null,
  estPublie: a.estPublie,
  aLaUne: a.aLaUne,
  datePublication: a.datePublication ?? null,
  ...changements,
});

/** Date renvoyée par l'API : sans fuseau = UTC (dates EF Core). */
export const dateApi = (s) => (s ? new Date(/Z$|[+-]\d\d:\d\d$/.test(s) ? s : `${s}Z`) : null);

// Identifiants API-Football des compétitions F237
export const LIGUES_API = { one: 411, two: 813 };