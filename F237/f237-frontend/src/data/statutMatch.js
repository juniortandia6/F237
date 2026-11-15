// f237-frontend/src/data/statutMatch.js
// État d'affichage d'un match, à partir du statut F237 (StatutMatchEnum côté API) :
//   0 = Planifié, 1 = EnCours, 2 = Terminé, 3 = Reporté, 4 = Annulé
//
// Filet de sécurité : un match encore "Planifié" dont le coup d'envoi est passé
// depuis plus de 24 h n'est plus "à venir" -> "nonDispute" (ex. vieux match
// jamais mis à jour par l'API). Pas de bouton "Pronostiquer" dans ce cas.
// De même, un match "Reporté" d'une saison TERMINÉE ne sera jamais joué :
// il s'affiche aussi "nonDispute" (on garde "Reporté" pour la saison en cours).

import { infosSaison, SAISON_EN_COURS } from './saisons';

export const STATUT = { PLANIFIE: 0, EN_COURS: 1, TERMINE: 2, REPORTE: 3, ANNULE: 4 };

// Heure de chargement de la page (fixe pendant la session : pas de Date.now au rendu)
const CHARGE_LE = Date.now();
const DELAI_NON_DISPUTE = 24 * 3600 * 1000;

// Match d'Elite Two ? (d'après sa saison, sinon le nom de la compétition)
function estEliteTwo(m) {
  const cle = infosSaison(m?.saisonId)?.cle;
  if (cle) return cle === 'two';
  return /elite\s*two|elite\s*2/i.test(m?.competition ?? '');
}

// Saison du match déjà terminée ? (inconnue -> on considère qu'elle est en cours)
function saisonTerminee(m) {
  const annee = infosSaison(m?.saisonId)?.annee;
  return annee != null && annee < SAISON_EN_COURS;
}

/**
 * 'live' | 'termine' | 'aVenir' | 'enAttente' | 'reporte' | 'annule' | 'nonDispute'
 * enAttente : match d'Elite Two "planifié" dont l'heure est passée depuis moins de 24 h, sans score
 * (l'API ne donne que le résultat final, pas de direct). Elite One : reste « à venir ».
 */
export function etatMatch(m) {
  switch (m?.statut) {
    case STATUT.EN_COURS: return 'live';
    case STATUT.TERMINE: return 'termine';
    case STATUT.REPORTE: return saisonTerminee(m) ? 'nonDispute' : 'reporte';
    case STATUT.ANNULE: return 'annule';
    default: {
      const debut = new Date(m?.dateMatch).getTime();
      if (Number.isFinite(debut) && debut < CHARGE_LE - DELAI_NON_DISPUTE) return 'nonDispute';
      // Heure passée : « résultat en attente » seulement en Elite Two (pas de direct chez l'API).
      // En Elite One, le direct prend le relais : le match reste « à venir » jusqu'au coup d'envoi réel.
      if (Number.isFinite(debut) && debut < CHARGE_LE && estEliteTwo(m)) return 'enAttente';
      return 'aVenir';
    }
  }
}

/** Vrai pour un match qu'on peut encore pronostiquer / afficher dans "prochains matchs" */
export const estAVenir = (m) => etatMatch(m) === 'aVenir';
export const estEnAttente = (m) => etatMatch(m) === 'enAttente';