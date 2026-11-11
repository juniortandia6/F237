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

  // ── Équipes : logos et couleurs ────────────────────────────────────────
  equipes: {
    /** Toutes les équipes (avec nbMatchs, couleurs, état du logo). */
    liste: () => appel('/api/admin/equipes').then(l => l ?? []),
    /** Téléverse un logo (PNG, JPG ou WebP, 2 Mo max). */
    televerserLogo: async (id, fichier) => {
      const donnees = new FormData();
      donnees.append('fichier', fichier);
      // Pas de Content-Type : le navigateur met multipart/form-data avec sa frontière
      const reponse = await fetch(`${API_URL}/api/admin/equipes/${id}/logo`, {
        method: 'POST', headers: { ...authService.getAuthHeader() }, body: donnees,
      });
      const corps = await reponse.json().catch(() => null);
      if (!reponse.ok) {
        const erreur = new Error(corps?.message ?? corps?.title ?? `Erreur ${reponse.status}`);
        erreur.statut = reponse.status;
        throw erreur;
      }
      return corps;
    },
    /** Retour au logo fourni par l'API-Football. */
    retablirLogo: (id) => appel(`/api/admin/equipes/${id}/logo`, { method: 'DELETE' }),
    /** couleurs = { principale: '#c62828', secondaire: '#ffffff' }, ou nulls pour revenir aux couleurs par défaut */
    couleurs: (id, principale, secondaire) => appel(`/api/admin/equipes/${id}/couleurs`, { method: 'PUT', body: JSON.stringify({ principale, secondaire }) }),
  },

  // ── Effectifs ───────────────────────────────────────────────────────────
  joueurs: {
    /** Joueurs d'une équipe (actifs et anciens). */
    liste: (equipeId) => appel(`/api/admin/equipes/${equipeId}/joueurs`).then(l => l ?? []),
    /** joueur = { prenom, nom, numero, poste, nationalite, dateNaissance } */
    ajouter: (equipeId, joueur) => appel(`/api/admin/equipes/${equipeId}/joueurs`, { method: 'POST', body: JSON.stringify(joueur) }),
    /** Saisie rapide : un joueur par ligne ("9 Mathew Williams"). Renvoie { ajoutes, ignores }. */
    /** Copie l'effectif de l'API-Football dans F237 (1 requête). Renvoie { ajoutes, ignores, message? }. */
    importerApi: (equipeId) => appel(`/api/admin/equipes/${equipeId}/joueurs/importer-api`, { method: 'POST' }),
    ajouterLot: (equipeId, lignes, poste) => appel(`/api/admin/equipes/${equipeId}/joueurs/lot`, { method: 'POST', body: JSON.stringify({ lignes, poste }) }),
    /** Même corps que ajouter, + estActif (false = a quitté le club) */
    modifier: (id, joueur) => appel(`/api/admin/joueurs/${id}`, { method: 'PUT', body: JSON.stringify(joueur) }),
    supprimer: (id) => appel(`/api/admin/joueurs/${id}`, { method: 'DELETE' }),
  },

  // ── Utilisateurs ────────────────────────────────────────────────────────
  utilisateurs: {
    liste: () => appel('/api/admin/utilisateurs').then(l => l ?? []),
    /** Détail + 50 dernières transactions */
    get: (id) => appel(`/api/admin/utilisateurs/${id}`),
    activer: (id, estActif) => appel(`/api/admin/utilisateurs/${id}/actif`, { method: 'PUT', body: JSON.stringify({ estActif }) }),
    /** role = 'Admin' | 'Utilisateur' (pris en compte à sa prochaine connexion) */
    role: (id, role) => appel(`/api/admin/utilisateurs/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
    /** montant positif (ajout) ou négatif (retrait), motif obligatoire */
    points: (id, montant, motif) => appel(`/api/admin/utilisateurs/${id}/points`, { method: 'POST', body: JSON.stringify({ montant, motif }) }),
  },
};

export const POSTES = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'];

/** Nom affiché d'un joueur : "Mathew Williams", ou "Williams" sans prénom */
export const nomJoueur = (j) => [j.prenom, j.nom].filter(Boolean).join(' ');

/** Nom au format des buteurs ("M. Williams"), pour garder la même orthographe que les buts */
export const nomButeur = (j) => (j.prenom ? `${j.prenom[0].toUpperCase()}. ${j.nom}` : j.nom);

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