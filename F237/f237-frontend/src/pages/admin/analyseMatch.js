// f237-frontend/src/pages/admin/analyseMatch.js
// Ce qui manque à un match terminé : buteurs inconnus, buts pas encore saisis,
// score à la mi-temps absent. Sert à la liste et à la page d'un match.

export const estInconnu = (nom) => !nom || /^(inconnu|unknown)$/i.test(nom.trim());

/** { inconnus, manquants, enTrop, miTemps, total } — tout à 0 / false si le match n'est pas terminé */
export function problemesMatch(m) {
  if (m?.statut !== 2) return { inconnus: 0, manquants: 0, enTrop: 0, miTemps: false, total: 0 };
  const buts = m.buts ?? [];
  const score = (m.scoreDomicile ?? 0) + (m.scoreExterieur ?? 0);
  const inconnus = buts.filter(b => estInconnu(b.nomJoueur)).length;
  const manquants = Math.max(0, score - buts.length);
  const enTrop = Math.max(0, buts.length - score);
  const miTemps = m.scoreMiTempsDomicile == null || m.scoreMiTempsExterieur == null;
  return { inconnus, manquants, enTrop, miTemps, total: inconnus + manquants + enTrop + (miTemps ? 1 : 0) };
}

/** Buts saisis pour une équipe (équipe créditée), triés par minute */
export const butsDe = (m, nomEquipe) =>
  (m?.buts ?? []).filter(b => b.nomEquipe === nomEquipe).sort((a, b) => a.minute - b.minute);