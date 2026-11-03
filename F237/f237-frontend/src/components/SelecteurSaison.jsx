// f237-frontend/src/components/SelecteurSaison.jsx
// Bouton "SAISON 2026 ▾" avec menu déroulant des saisons (pour les zones sombres).

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Check } from 'lucide-react';
import { SAISONS, SAISONS_DB, libelleSaison } from '../data/saisons';
import theme from '../theme';

function SelecteurSaison({ annee, onChange }) {
  const { t } = useTranslation();
  // null = fermé ; sinon position du menu à l'écran ({ top, left })
  const [pos, setPos] = useState(null);
  const ouvert = pos !== null;
  const ref = useRef(null);
  const menuRef = useRef(null);

  // Le menu est en position fixe (par rapport à l'écran) : ainsi il n'est jamais
  // coupé par une section qui a overflow: hidden (les bandes vertes en ont)
  const basculer = () => {
    if (ouvert) { setPos(null); return; }
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.bottom + 8, left: r.left });
  };
  const fermer = () => setPos(null);

  // Ferme le menu quand on clique ailleurs ou qu'on appuie sur Échap
  useEffect(() => {
    if (!ouvert) return;
    const clic = (e) => {
      if (!ref.current?.contains(e.target) && !menuRef.current?.contains(e.target)) fermer();
    };
    const touche = (e) => { if (e.key === 'Escape') fermer(); };
    // Si la page défile ou change de taille, on ferme (le menu ne suivrait plus le bouton)
    const defile = (e) => { if (!menuRef.current?.contains(e.target)) fermer(); };
    document.addEventListener('mousedown', clic);
    document.addEventListener('keydown', touche);
    window.addEventListener('scroll', defile, true);
    window.addEventListener('resize', fermer);
    return () => {
      document.removeEventListener('mousedown', clic);
      document.removeEventListener('keydown', touche);
      window.removeEventListener('scroll', defile, true);
      window.removeEventListener('resize', fermer);
    };
  }, [ouvert]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={basculer}
        aria-haspopup="listbox"
        aria-expanded={ouvert}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '7px 12px 7px 14px', borderRadius: '999px', cursor: 'pointer',
          backgroundColor: ouvert ? 'rgba(252,209,22,0.16)' : 'rgba(0,0,0,0.25)',
          border: `1px solid ${ouvert ? theme.yellow : 'rgba(252,209,22,0.45)'}`,
          color: theme.yellow, fontSize: '13px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = theme.yellow; }}
        onMouseLeave={e => { if (!ouvert) e.currentTarget.style.borderColor = 'rgba(252,209,22,0.45)'; }}
      >
        {t('saison.saison', { s: libelleSaison(annee) })}
        <ChevronDown size={15} style={{ transition: 'transform 0.2s ease', transform: ouvert ? 'rotate(180deg)' : 'none' }} />
      </button>

      {ouvert && (
        <ul ref={menuRef} role="listbox" style={{
          position: 'fixed', top: pos.top, left: pos.left, zIndex: 60, minWidth: '230px',
          maxHeight: `calc(100vh - ${pos.top + 16}px)`, overflowY: 'auto', listStyle: 'none', margin: 0, padding: '6px',
          backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
        }}>
          {SAISONS.map(a => {
            const actif = a === annee;
            const dispo = !!SAISONS_DB[a];
            return (
              <li key={a}>
                <button
                  role="option"
                  aria-selected={actif}
                  onClick={() => { onChange(a); fermer(); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                    padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left',
                    backgroundColor: actif ? '#e8f3ec' : 'transparent',
                    color: '#141414', fontSize: '15px', fontWeight: actif ? 800 : 600,
                  }}
                  onMouseEnter={e => { if (!actif) e.currentTarget.style.backgroundColor = '#f2f4f3'; }}
                  onMouseLeave={e => { if (!actif) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span>{t('saison.saison', { s: libelleSaison(a) })}</span>
                  {actif
                    ? <Check size={16} color="#14532f" />
                    : !dispo && <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7470', backgroundColor: '#f2f4f3', padding: '2px 8px', borderRadius: '999px' }}>{t('saison.bientot')}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default SelecteurSaison;