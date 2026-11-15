// f237-frontend/src/components/LogoCompetition.jsx
// Logo officiel d'une compétition (MTN Elite One / Elite Two), dans une pastille blanche arrondie.
// Les fichiers sont dans public/competitions/ (copies locales des logos fournis par API-Football :
// l'API demande de stocker ses images chez soi plutôt que de les appeler à chaque affichage).
// Utilisation à titre d'identification seulement : les logos appartiennent à leurs propriétaires.
import { COMPETITIONS } from '../data/saisons';

function LogoCompetition({ cle, size = 22 }) {
  const comp = COMPETITIONS.find(c => c.cle === cle);
  if (!comp?.logo) return null;
  return (
    <span style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '6px', backgroundColor: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
    }}>
      <img src={comp.logo} alt="" aria-hidden="true" draggable={false} loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        onError={e => { e.currentTarget.parentElement.style.display = 'none'; }} />
    </span>
  );
}

export default LogoCompetition;