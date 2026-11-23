// f237-frontend/src/components/IconeEvenement.jsx
// Petite icône d'un événement de match saisi dans l'admin :
// 1 = penalty manqué (❌), 2 = carton jaune, 3 = carton rouge, 4 = 2e jaune (jaune + rouge superposés).
// Les cartons sont dessinés en CSS (pas d'image) pour rester nets à toutes les tailles.

const JAUNE = '#f5c518';
const ROUGE = '#d62828';

function Carton({ couleur, decale = false, taille }) {
  return (
    <span style={{
      position: decale ? 'absolute' : 'relative',
      left: decale ? `${Math.round(taille * 0.35)}px` : 0,
      top: decale ? `${Math.round(taille * 0.15)}px` : 0,
      display: 'inline-block', width: `${Math.round(taille * 0.68)}px`, height: `${taille}px`,
      borderRadius: '2px', backgroundColor: couleur, boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
    }} />
  );
}

export default function IconeEvenement({ type, taille = 16 }) {
  if (type === 1) return <span aria-hidden="true" style={{ fontSize: `${taille - 2}px` }}>❌</span>;
  if (type === 4) {
    return (
      <span aria-hidden="true" style={{ position: 'relative', display: 'inline-block', width: `${Math.round(taille * 1.05)}px`, height: `${Math.round(taille * 1.15)}px`, verticalAlign: 'middle' }}>
        <Carton couleur={JAUNE} taille={taille} />
        <Carton couleur={ROUGE} taille={taille} decale />
      </span>
    );
  }
  return (
    <span aria-hidden="true" style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
      <Carton couleur={type === 2 ? JAUNE : ROUGE} taille={taille} />
    </span>
  );
}