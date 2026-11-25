// f237-frontend/src/pages/PageLegalePage.jsx
// Pages légales : /confidentialite et /conditions (textes dans data/pagesLegales.js, FR + EN).
// Même habillage que la page article : bande verte, carte blanche, sommaire collant à gauche.
// Une ancre dans l'adresse (/confidentialite#cookies) fait défiler jusqu'à la section.

import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Mail } from 'lucide-react';
import theme from '../theme';
import { useEcranMobile } from '../hooks/useEcranMobile';
import ContenuArticle from '../components/ContenuArticle';
import { COULEURS_ARTICLE as C } from '../data/contenuArticle';
import { PAGES_LEGALES, MISE_A_JOUR, CONTACT_LEGAL } from '../data/pagesLegales';

const LARGEUR = '1200px';
const AUTRE_PAGE = { confidentialite: 'conditions', conditions: 'confidentialite' };
const CHEMIN = { confidentialite: '/confidentialite', conditions: '/conditions' };

export default function PageLegalePage({ page }) {
  const { t, i18n } = useTranslation();
  const mobile = useEcranMobile();
  const { hash } = useLocation();
  const langue = i18n.language?.startsWith('en') ? 'en' : 'fr';
  const contenu = PAGES_LEGALES[page][langue];
  const autre = PAGES_LEGALES[AUTRE_PAGE[page]][langue];

  const dateMaj = new Date(`${MISE_A_JOUR}T12:00:00`).toLocaleDateString(langue === 'en' ? 'en-CA' : 'fr-CA', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  useEffect(() => {
    document.title = `${contenu.titre} · F237`;
  }, [contenu.titre]);

  // Arrivée avec une ancre (#cookies) : on va à la section ; sinon, haut de page
  useEffect(() => {
    const cible = hash ? document.getElementById(hash.slice(1)) : null;
    if (cible) cible.scrollIntoView({ block: 'start' });
    else window.scrollTo(0, 0);
  }, [hash, page]);

  return (
    <div style={{ backgroundColor: '#eef1ef' }}>
      {/* Bande verte */}
      <section style={{
        background: `repeating-linear-gradient(135deg, rgba(255,255,255,.03) 0 70px, transparent 70px 160px), linear-gradient(120deg, ${theme.greenDeep} 0%, #12462c 55%, #1a5a37 100%)`,
        padding: mobile ? '28px 0 60px' : '44px 0 120px',
      }}>
        <div style={{ maxWidth: LARGEUR, width: mobile ? 'auto' : 'calc(100% - 2 * var(--marge-page))', margin: '0 auto', padding: mobile ? '0 18px' : 0 }}>
          <nav aria-label={t('legal.filAriane')} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,.7)' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,.85)', textDecoration: 'none', fontWeight: 600 }}>{t('legal.accueil')}</Link>
            <ChevronRight size={14} />
            <span>{contenu.titre}</span>
          </nav>
          <h1 style={{ color: '#fff', fontFamily: 'var(--font-titres)', fontWeight: 400, fontSize: mobile ? '34px' : '54px', lineHeight: 1.1, margin: '14px 0 10px' }}>
            {contenu.titre}
          </h1>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: mobile ? '15px' : '17px', lineHeight: 1.55, maxWidth: '720px' }}>{contenu.chapo}</p>
          <p style={{ color: theme.yellow, fontSize: '13px', fontWeight: 700, marginTop: '14px' }}>
            {t('legal.miseAJour', { date: dateMaj })}
          </p>
        </div>
      </section>

      {/* Carte blanche */}
      <div style={{
        maxWidth: LARGEUR, width: mobile ? 'auto' : 'calc(100% - 2 * var(--marge-page))',
        margin: mobile ? '-36px 12px 0' : '-80px auto 0', backgroundColor: '#fff', borderRadius: mobile ? '14px' : '18px',
        boxShadow: '0 20px 50px rgba(0,0,0,.12)', padding: mobile ? '24px 18px 32px' : '48px 56px 56px',
        display: 'grid', gridTemplateColumns: mobile ? '1fr' : '240px minmax(0, 1fr)', gap: mobile ? '8px' : '56px', alignItems: 'start',
      }}>
        {/* Sommaire */}
        {!mobile && (
          <nav aria-label={t('legal.sommaire')} style={{ position: 'sticky', top: '96px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: C.doux, marginBottom: '10px' }}>
              {t('legal.sommaire')}
            </div>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px', borderLeft: '2px solid #e6e9e7' }}>
              {contenu.sections.map((s, i) => (
                <li key={s.cle}>
                  <a href={`#${s.cle}`}
                    onClick={(e) => { e.preventDefault(); document.getElementById(s.cle)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); window.history.replaceState(null, '', `#${s.cle}`); }}
                    style={{
                      display: 'block', padding: '6px 12px', marginLeft: '-2px', fontSize: '14px', lineHeight: 1.35, textDecoration: 'none',
                      color: hash === `#${s.cle}` ? C.vert : C.texte, fontWeight: hash === `#${s.cle}` ? 700 : 500,
                      borderLeft: `2px solid ${hash === `#${s.cle}` ? C.vert : 'transparent'}`,
                    }}>
                    <span style={{ color: C.doux, marginRight: '6px' }}>{i + 1}.</span>{s.titre}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Contenu */}
        <div>
          {contenu.sections.map((s, i) => (
            <section key={s.cle} aria-labelledby={s.cle}>
              <h2 id={s.cle} style={{ scrollMarginTop: '110px', margin: i === 0 ? '0 0 14px' : '40px 0 14px', fontSize: mobile ? '21px' : '25px', fontWeight: 800, color: C.texte, lineHeight: 1.25 }}>
                <span style={{ color: C.vert, marginRight: '8px' }}>{i + 1}.</span>{s.titre}
              </h2>
              <ContenuArticle paragraphes={s.paragraphes} compact={mobile} />
            </section>
          ))}

          {/* Contact + lien vers l'autre page */}
          <div style={{ marginTop: '44px', paddingTop: '24px', borderTop: '1px solid #e6e9e7', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href={`mailto:${CONTACT_LEGAL}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '999px', backgroundColor: C.vert, color: '#fff', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
              <Mail size={16} /> {t('legal.nousEcrire')}
            </a>
            <Link to={CHEMIN[AUTRE_PAGE[page]]} style={{ color: C.vert, fontWeight: 700, fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              {autre.titre} <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
      <div style={{ height: mobile ? '40px' : '72px' }} />
    </div>
  );
}