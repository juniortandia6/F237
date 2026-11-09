// f237-frontend/src/pages/ActualiteDetailPage.jsx
// Page article : /actualites/:slug

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import theme from '../theme';
import { formatDateActu, texteActu, normaliserArticle } from '../data/actualites';
import { useActualites } from '../hooks/useActualites';
import { articleService } from '../services/articleService';

function ActualiteDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { articles } = useActualites();
  // Article complet (avec son contenu) : { slug, article } une fois chargé
  const [charge, setCharge] = useState({ slug: null, article: null, erreur: false });

  // Remonter en haut de la page à chaque changement d'article
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [slug]);

  useEffect(() => {
    let ignore = false;
    articleService.getBySlug(slug)
      .then(a => { if (!ignore) setCharge({ slug, article: a ? normaliserArticle(a) : null, erreur: false }); })
      .catch(() => { if (!ignore) setCharge({ slug, article: null, erreur: true }); });
    return () => { ignore = true; };
  }, [slug]);

  const pret = charge.slug === slug;
  // Pendant le chargement : l'en-tête vient déjà de la liste (sans le contenu)
  const actu = pret ? charge.article : articles.find(a => a.slug === slug) ?? null;

  if (!pret && !actu) {
    return (
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '96px 24px', textAlign: 'center', color: theme.textFaint }}>
        {t('commun.chargement')}
      </div>
    );
  }

  if (!actu) {
    return (
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <h1 style={{ color: theme.text, fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>
          {charge.erreur ? t('actualites.erreur') : t('actualites.introuvable')}
        </h1>
        <Link to="/actualites" style={{ color: theme.greenBright, fontWeight: 700 }}>← {t('actualites.retour')}</Link>
      </div>
    );
  }

  const autres = articles.filter(a => a.slug !== slug).slice(0, 3);

  return (
    <article>
      {/* Bandeau image */}
      <div style={{ position: 'relative', height: '460px', overflow: 'hidden' }}>
        <img src={actu.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(${theme.bgRgb},0.2) 0%, rgba(${theme.bgRgb},0.65) 60%, ${theme.bg} 100%)` }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0 24px 36px' }}>
            <Link to="/actualites" className="flex items-center gap-1 transition-opacity hover:opacity-80"
              style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '18px', width: 'fit-content' }}>
              <ArrowLeft size={16} /> {t('accueil.nouvelles.toutes')}
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <span style={{
                backgroundColor: theme.red, color: '#fff', padding: '4px 14px', borderRadius: '20px',
                fontSize: '11px', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase',
              }}>{t(`actualites.tags.${actu.tag}`, { defaultValue: actu.tag })}</span>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{formatDateActu(actu.date)}</span>
            </div>
            <h1 style={{ color: '#fff', fontSize: '40px', fontWeight: 400, lineHeight: 1.2, fontFamily: 'var(--font-titres)' }}>
              {texteActu(actu, 'titre')}
            </h1>
          </div>
        </div>
      </div>

      {/* Corps */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '36px 24px 56px' }}>
        <p style={{ color: theme.text, fontSize: '19px', fontWeight: 600, lineHeight: 1.6, marginBottom: '24px' }}>{texteActu(actu, 'resume')}</p>
        {(texteActu(actu, 'contenu') ?? []).map((p, i) => (
          <p key={i} style={{ color: theme.textMuted, fontSize: '17px', lineHeight: 1.8, marginBottom: '18px' }}>{p}</p>
        ))}
      </div>

      {/* À lire aussi */}
      {autres.length > 0 && <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '0 60px 72px', boxSizing: 'content-box' }}>
        <h2 style={{ color: theme.text, fontSize: '24px', fontWeight: 400, fontFamily: 'var(--font-titres)', marginBottom: '18px' }}>
          {t('actualites.aLireAussi')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {autres.map(a => (
            <Link key={a.slug} to={`/actualites/${a.slug}`} className="group"
              style={{ position: 'relative', display: 'block', height: '220px', borderRadius: '14px', overflow: 'hidden', textDecoration: 'none' }}>
              <img src={a.img} alt="" className="transition-transform duration-500 group-hover:scale-105"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85) 100%)' }} />
              <span style={{ position: 'absolute', left: '16px', right: '16px', bottom: '14px', color: '#fff', fontSize: '17px', fontWeight: 800, lineHeight: 1.3 }}>
                {texteActu(a, 'titre')}
              </span>
            </Link>
          ))}
        </div>
      </div>}
    </article>
  );
}

export default ActualiteDetailPage;