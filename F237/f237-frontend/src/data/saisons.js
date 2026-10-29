// f237-frontend/src/data/saisons.js
// Saisons et compétitions, partagées entre MatchsPage et MatchDetailPage.

export const COMPETITIONS = [
  { cle: 'one', label: 'Elite One' },
  { cle: 'two', label: 'Elite Two' },
];

// Première saison couverte par API-Football pour le Cameroun : à confirmer avec
// GET /leagues?country=Cameroon (le tableau "seasons" donne les années dispo).
export const ANNEE_DEBUT = 2019;
export const ANNEE_ACTUELLE = 2026;
export const SAISONS = Array.from({ length: ANNEE_ACTUELLE - ANNEE_DEBUT + 1 }, (_, i) => ANNEE_ACTUELLE - i);

// Saisons déjà importées dans F237Db (année → SaisonId par compétition).
// Ajoute une ligne ici chaque fois que tu importes une nouvelle saison.
export const SAISONS_DB = {
  2026: { one: 3, two: 4 },
};

// Retrouve l'année et la compétition d'un SaisonId (ex. 3 → { annee: 2026, cle: 'one', label: 'Elite One' })
export function infosSaison(saisonId) {
  for (const [annee, ids] of Object.entries(SAISONS_DB)) {
    for (const [cle, id] of Object.entries(ids)) {
      if (id === saisonId) {
        const label = COMPETITIONS.find(c => c.cle === cle)?.label ?? '';
        return { annee: Number(annee), cle, label };
      }
    }
  }
  return null;
}

// Tous les SaisonId connus, de la saison la plus récente à la plus ancienne
export const TOUS_LES_SAISON_IDS = Object.keys(SAISONS_DB)
  .sort((a, b) => b - a)
  .flatMap(a => Object.values(SAISONS_DB[a]));