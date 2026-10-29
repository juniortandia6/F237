// f237-frontend/src/pages/ActualitesPage.jsx
// Liste de toutes les actualités : une à la une + grille, filtrable par catégorie.

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import theme from '../theme';
import { ACTUALITES, formatDateActu } from '../data/actualites';

function Tag({ children }) {
  return (
    <span style={{
      display: 'inline-block', backgroundColor: theme.red, color: '#fff',
      padding: '3px 12px', borderRadius: '20px',
      fontSize: '10px', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase',
    }}>{children}</span>
  );
}

function CarteActu({ a }) {
  return (
    <Link to={`/actualites/${a.slug}`} className="group"
      style={{
        display: 'flex', flexDirection: 'column', textDecoration: 'none',
        backgroundColor: theme.surface, border: `1px solid ${theme.border}`,
        borderRadius: '14px', overflow: 'hidden',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ height: '190px', overflow: 'hidden' }}>
        <img src={a.img} alt="" className="transition-transform duration-500 group-hover:scale-105"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Tag>{a.tag}</Tag>
          <span style={{ fontSize: '12px', color: theme.textFaint }}>{formatDateActu(a.date)}</span>
        </div>
        <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: 800, lineHeight: 1.3 }}>{a.titre}</h3>
        <p style={{ color: theme.textMuted, fontSize: '14px', lineHeight: 1.5, flex: 1 }}>{a.resume}</p>
        <span className="flex items-center gap-1" style={{ color: theme.greenBright, fontSize: '14px', fontWeight: 700 }}>
          Lire l'article <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function ActualitesPage() {
  const categories = useMemo(() => ['Toutes', ...new Set(ACTUALITES.map(a => a.tag))], []);
  const [filtre, setFiltre] = useState('Toutes');
  const liste = filtre === 'Toutes' ? ACTUALITES : ACTUALITES.filter(a => a.tag === filtre);
  const [une, ...reste] = liste;

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '48px 60px 72px', boxSizing: 'content-box' }}>
      <h1 style={{ color: theme.text, fontSize: '40px', fontWeight: 400, fontFamily: '"Permanent Marker", "Raleway", Arial, sans-serif', marginBottom: '20px' }}>
        Actualités
      </h1>

      {/* Filtres */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
        {categories.map(c => {
          const actif = c === filtre;
          return (
            <button key={c} onClick={() => setFiltre(c)}
              style={{
                padding: '7px 16px', borderRadius: '20px', cursor: 'pointer',
                fontSize: '13px', fontWeight: 700,
                backgroundColor: actif ? theme.green : 'transparent',
                color: actif ? '#fff' : theme.textMuted,
                border: `1px solid ${actif ? theme.green : theme.borderStrong}`,
                transition: 'all 0.2s ease',
              }}>
              {c}
            </button>
          );
        })}
      </div>

      {/* À la une */}
      {une && (
        <Link to={`/actualites/${une.slug}`} className="group"
          style={{ position: 'relative', display: 'block', height: '420px', borderRadius: '18px', overflow: 'hidden', marginBottom: '28px', textDecoration: 'none' }}>
          <img src={une.img} alt="" className="transition-transform duration-700 group-hover:scale-105"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.85) 100%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '32px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Tag>{une.tag}</Tag>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>{formatDateActu(une.date)}</span>
            </div>
            <h2 style={{ color: '#fff', fontSize: '34px', fontWeight: 400, lineHeight: 1.2, maxWidth: '780px', fontFamily: '"Permanent Marker", "Raleway", Arial, sans-serif' }}>
              {une.titre}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', marginTop: '10px', maxWidth: '640px' }}>{une.resume}</p>
          </div>
        </Link>
      )}

      {/* Grille */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '22px' }}>
        {reste.map(a => <CarteActu key={a.slug} a={a} />)}
      </div>

      {liste.length === 0 && (
        <p style={{ color: theme.textMuted, textAlign: 'center', padding: '40px 0' }}>Aucune actualité dans cette catégorie.</p>
      )}
    </div>
  );
}

export default ActualitesPage;