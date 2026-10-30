// f237-frontend/src/data/saisons.js
// Saisons et compétitions, partagées par toutes les pages.
//
// Une saison est identifiée par la MÊME année que le paramètre "season" d'API-Football
// (pour le Cameroun, c'est l'année où la saison se TERMINE).
// Le libellé affiché vient des vraies dates (GET /leagues?id=411) :
//   season 2026 = janv. → juil. 2026      -> "2026"
//   season 2027 = oct. 2026 → mai 2027    -> "2026-27"

export const COMPETITIONS = [
  { cle: 'one', label: 'Elite One' },
  { cle: 'two', label: 'Elite Two' },
];

// season API -> [année de début, année de fin] (source : /leagues?id=411, Elite One)
const DATES_SAISONS = {
  2016: [2016, 2016],
  2017: [2017, 2017],
  2018: [2018, 2018],
  2019: [2019, 2019],
  2020: [2019, 2020],
  2021: [2020, 2021],
  2022: [2022, 2022],
  2023: [2022, 2023],
  2024: [2023, 2024],
  2025: [2024, 2025],
  2026: [2026, 2026],
  2027: [2026, 2027],
};

// Première saison disponible chez API-Football (2016-2019 : classements et
// résultats seulement, pas de buteurs ; buteurs disponibles à partir de 2020)
export const ANNEE_DEBUT = 2016;

// Saison réellement en cours chez API-Football ("current": true)
export const SAISON_EN_COURS = 2027;

// Saisons déjà importées dans F237Db (season API → SaisonId par compétition).
// Ajoute une ligne ici chaque fois que tu importes une nouvelle saison.
export const SAISONS_DB = {
  2026: { one: 3, two: 4 },
};

// Saison affichée par défaut : la plus récente qui a des données
export const ANNEE_ACTUELLE = Math.max(...Object.keys(SAISONS_DB).map(Number));

// Toutes les saisons du menu, de la plus récente à la plus ancienne
export const SAISONS = Array.from({ length: SAISON_EN_COURS - ANNEE_DEBUT + 1 }, (_, i) => SAISON_EN_COURS - i);

// 2026 -> "2026" ; 2027 -> "2026-27"
export function libelleSaison(annee) {
  const dates = DATES_SAISONS[annee];
  if (!dates || dates[0] === dates[1]) return String(annee);
  return `${dates[0]}-${String(dates[1] % 100).padStart(2, '0')}`;
}

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