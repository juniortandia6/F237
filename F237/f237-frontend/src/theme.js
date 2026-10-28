// f237-frontend/src/theme.js
// Palette sombre F237 — fond vert sombre + accents du drapeau camerounais.
// Toutes les pages importent ces valeurs pour rester cohérentes.
// Pour éclaircir/assombrir tout le site : change bgRgb (et les fonds dérivés).

const bgRgb = '22, 38, 30'; // = #16261e (version un cran plus claire)

const theme = {
  // Fonds
  bgRgb,                      // pour les dégradés/transparences : `rgba(${theme.bgRgb}, 0.5)`
  bg: '#16261e',              // fond principal du site
  bgDeep: '#111e18',          // footer / bannière live
  nav: `rgba(${bgRgb}, 0.92)`,// navbar (légèrement transparente + flou)
  surface: '#1f3329',         // cartes sombres
  surfaceHover: '#263d31',    // cartes au survol / lignes mises en avant

  // Bordures
  border: 'rgba(255,255,255,0.09)',
  borderStrong: 'rgba(255,255,255,0.18)',

  // Textes
  text: '#f2f5f3',
  textMuted: 'rgba(242,245,243,0.66)',
  textFaint: 'rgba(242,245,243,0.44)',

  // Accents Cameroun
  green: '#1f9d55',
  greenBright: '#3ccf7a',
  greenDeep: '#0f3d26',
  red: '#e1252b',
  yellow: '#fcd116',

  // Barres de progression du hero
  cyan: '#00c8d7',
};

export default theme;