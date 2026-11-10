// f237-frontend/src/pages/admin/styleAdmin.js
// Couleurs et styles partagés par les pages de l'espace admin.

export const CLAIR = {
  fond: '#eef1ef',
  carte: '#ffffff',
  bord: '#e2e7e4',
  texte: '#141414',
  doux: '#6b7470',
  tuile: '#f2f4f3',
  vert: '#14532f',
  vertClair: '#e8f3ec',
  orange: '#b45309',
  orangeClair: '#fdf3e2',
  rouge: '#c62828',
  rougeClair: '#fde8e8',
};

export const CHIFFRES = 'var(--font-chiffres)';

export const CARTE = {
  backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '14px', overflow: 'hidden',
};

export const TITRE_CARTE = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
  padding: '14px 18px', borderBottom: `1px solid ${CLAIR.bord}`, fontSize: '16px', fontWeight: 800, color: CLAIR.texte,
};