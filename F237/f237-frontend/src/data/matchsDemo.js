// f237-frontend/src/data/matchsDemo.js
// ⚠️ DONNÉES DE DÉMO pour la section "Prochains matchs" de l'accueil.
//
// Les affiches sont celles de la 2e journée de la MTN Elite One 2026-2027
// (source : cameroun24.net), mais les DATES sont fictives : elles sont
// recalculées pour tomber le week-end prochain, uniquement pour le design.
// La section n'utilise ces données QUE si la base ne contient aucun match à venir.
// Pour les retirer : passe UTILISER_DEMO à false (ou synchronise les vrais matchs).

export const UTILISER_DEMO = true;

// [mot-clé domicile, mot-clé extérieur, nom affiché dom., nom affiché ext., jour (6 = samedi, 0 = dimanche), heure du Cameroun]
const AFFICHES = [
  ['gazelle', 'canon',   'Gazelle FA',               'Canon Sportif',            6, '13:00'],
  ['moungo',  'apejes',  'Aigle du Moungo',          'APEJES Academy',           6, '15:00'],
  ['unisport','victoria','Unisport du Haut-Nkam',    'Victoria United',          6, '17:00'],
  ['pwd',     'dynamo',  'PWD Bamenda',              'Dynamo de Douala',         0, '13:30'],
  ['renard',  'panth',   'Stade Renard',             'Panthère du Ndé',          0, '13:30'],
  ['menoua',  'abong',   'Aigle Royal de la Menoua', 'US Abong-Mbang',           0, '14:30'],
  ['coton',   'colombe', 'Coton Sport',              'Colombe',                  0, '15:00'],
];

const normaliser = (t = '') =>
  t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Prochaine date (à partir d'aujourd'hui) qui tombe sur `jour`, à l'heure du Cameroun (UTC+1)
function prochaineDate(jour, heure) {
  const [h, min] = heure.split(':').map(Number);
  const d = new Date();
  const ecart = (jour - d.getDay() + 7) % 7 || 7; // toujours dans le futur
  d.setDate(d.getDate() + ecart);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), h - 1, min)).toISOString();
}

/**
 * Construit des matchs "à venir" de démo.
 * @param {Array} equipes  équipes connues (issues des matchs chargés), pour récupérer les logos
 */
export function construireMatchsDemo(equipes = []) {
  const trouver = (motCle, nomParDefaut) =>
    equipes.find(e => normaliser(e?.nom).includes(motCle)) ?? { nom: nomParDefaut, logoUrl: null };

  return AFFICHES
    .map(([kDom, kExt, nDom, nExt, jour, heure], i) => ({
      id: `demo-${i}`,
      statut: 0,
      dateMatch: prochaineDate(jour, heure),
      equipeDomicile: trouver(kDom, nDom),
      equipeExterieur: trouver(kExt, nExt),
      scoreDomicile: null,
      scoreExterieur: null,
      demo: true,
    }))
    .sort((a, b) => new Date(a.dateMatch) - new Date(b.dateMatch));
}