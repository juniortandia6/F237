// f237-frontend/src/data/couleursClubs.js
// Couleurs des maillots, utilisées par les avatars des joueurs (components/AvatarJoueur.jsx).
// principale = corps du maillot, secondaire = col et liserés.
// Couleurs tirées des logos des clubs : ajuste-les librement (code hexadécimal).
// Un club absent de la liste reçoit une couleur automatique, toujours la même pour lui.

const COULEURS = {
  // ── MTN Elite One ──
  'colombe':                 { principale: '#c62828', secondaire: '#ffffff' },
  'cotonsport':              { principale: '#1b8a3a', secondaire: '#f4d03f' },
  'canon':                   { principale: '#2e7d32', secondaire: '#d32f2f' },
  'dynamo de douala':        { principale: '#1f4fa3', secondaire: '#f28c28' },
  'panthere':                { principale: '#2e8b3e', secondaire: '#ffffff' },
  'pwd bamenda':             { principale: '#1e6fd0', secondaire: '#ffffff' },
  'aigle royal':             { principale: '#f2c230', secondaire: '#1a1a1a' }, // de la Menoua
  'aigle royal de moungo':   { principale: '#1f4fa3', secondaire: '#ffffff' },
  'stade renard':            { principale: '#e8742a', secondaire: '#ffffff' },
  'apejes academy':          { principale: '#4b2c91', secondaire: '#35c4e8' },
  'unisport bafang':         { principale: '#f2c230', secondaire: '#d32f2f' },
  'victoria united':         { principale: '#0f5aa8', secondaire: '#f2c230' },
  'union abong-mbang':       { principale: '#2e7d32', secondaire: '#f2c230' },
  'gazelle':                 { principale: '#f2c230', secondaire: '#1b8a3a' },

  // ── MTN Elite Two ──
  'bamboutos':               { principale: '#b71c1c', secondaire: '#1c2a5a' },
  'les astres':              { principale: '#2e9b45', secondaire: '#f2d230' },
  'avion academy':           { principale: '#1d35c9', secondaire: '#ffffff' },
  'tonnerre':                { principale: '#1a1a1a', secondaire: '#ffffff' },
  'elecsport':               { principale: '#e8742a', secondaire: '#ffffff' },
  'mintack':                 { principale: '#c62828', secondaire: '#f2c230' },
  'atlantic':                { principale: '#1d4fa8', secondaire: '#ffffff' },
};

// Palette de secours pour les clubs sans couleurs connues
const PALETTE = [
  { principale: '#1b6e43', secondaire: '#ffffff' },
  { principale: '#1f4fa3', secondaire: '#ffffff' },
  { principale: '#b71c1c', secondaire: '#ffffff' },
  { principale: '#5e35b1', secondaire: '#ffffff' },
  { principale: '#00838f', secondaire: '#ffffff' },
  { principale: '#e8742a', secondaire: '#1a1a1a' },
  { principale: '#37474f', secondaire: '#f2c230' },
];

const normaliser = (s) => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Couleurs du maillot d'un club (toujours les mêmes pour un même nom). */
export function couleursClub(nomClub) {
  const cle = normaliser(nomClub);
  if (COULEURS[cle]) return COULEURS[cle];
  let h = 0;
  for (const c of cle) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

/** Noir ou blanc, selon ce qui se lit le mieux sur la couleur donnée. */
export function texteSur(hex) {
  const n = parseInt((hex ?? '#000').replace('#', ''), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) > 165 ? '#1a1a1a' : '#ffffff';
}

/** Initiales d'un joueur : "M. Williams" -> "MW", "Jean-Hugues Eyango Priso" -> "JE". */
export function initialesJoueur(nom) {
  const mots = (nom ?? '').replace(/\./g, ' ').split(/[\s-]+/).filter(Boolean);
  return mots.slice(0, 2).map(m => m[0]).join('').toUpperCase() || '?';
}