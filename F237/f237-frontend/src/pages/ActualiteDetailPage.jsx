// f237-frontend/src/pages/ActualiteDetailPage.jsx
// Page article : /actualites/:slug
//
// Mise en page "magazine" (inspirée des pages d'actualité de la FIBA) :
//   - bandeau coloré en haut, puis une grande carte BLANCHE posée dessus ;
//   - fil d'Ariane, date, titre, catégorie + temps de lecture + bouton Partager ;
//   - image de couverture affichée EN ENTIER (plus en fond derrière le texte) ;
//   - chapô (résumé) en gros, puis le corps (intertitres, images, citations : voir ContenuArticle) ;
//   - colonne de droite : dernières actualités ; barre "Sommaire" collante s'il y a des intertitres ;
//   - en bas : "À lire aussi" (même catégorie d'abord).

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronDown, List, Share2, Check } from 'lucide-react';
import theme from '../theme';
import { formatDateActu, texteActu, normaliserArticle } from '../data/actualites';
import { useActualites } from '../hooks/useActualites';
import { useEcranMobile } from '../hooks/useEcranMobile';
import { articleService } from '../services/articleService';
import { SqueletteArticle, ZoneChargement } from '../components/Squelette';
import ContenuArticle from '../components/ContenuArticle';
import { COULEURS_ARTICLE as C, sectionsDe, minutesLecture } from '../data/contenuArticle';

const LARGEUR = '1400px';
const HAUT_NAV = { bureau: 68, mobile: 60 }; // hauteur de la barre de navigation collante (Navbar.jsx)

// ── Petits éléments ─────────────────────────────────────────────────────

function Pastille({ children, fond = '#efe9ea', couleur = '#7a2433' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '4px', backgroundColor: fond, color: couleur, fontSize: '12px', fontWeight: 600 }}>
      {children}
    </span>
  );
}

function BoutonPartager({ titre }) {
  const { t } = useTranslation();
  const [copie, setCopie] = useState(false);
  const partager = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: titre, url }); return; }
      await navigator.clipboard.writeText(url);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch { /* partage annulé : rien à faire */ }
  };
  return (
    <button type="button" onClick={partager}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '4px', border: '1px solid #dfe3e1', background: '#fff', color: C.doux, fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
      {copie ? <Check size={14} /> : <Share2 size={14} />}
      {copie ? t('actualites.lienCopie') : t('actualites.partager')}
    </button>
  );
}

// Barre collante "Sommaire" : affiche l'intertitre en cours de lecture, menu déroulant pour sauter
function Sommaire({ sections, mobile }) {
  const { t } = useTranslation();
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(sections[0]?.id);

  useEffect(() => {
    const surDefilement = () => {
      let courant = sections[0]?.id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < 180) courant = s.id;
      }
      setActif(courant);
    };
    surDefilement();
    window.addEventListener('scroll', surDefilement, { passive: true });
    return () => window.removeEventListener('scroll', surDefilement);
  }, [sections]);

  const aller = (id) => {
    setOuvert(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const courant = sections.find(s => s.id === actif) ?? sections[0];

  return (
    <div style={{ position: 'sticky', top: mobile ? HAUT_NAV.mobile : HAUT_NAV.bureau, zIndex: 30, margin: mobile ? '0 -18px 20px' : '0 0 24px' }}>
      <div style={{ position: 'relative', backgroundColor: '#fff', borderBottom: '1px solid #e6e9e7', padding: mobile ? '8px 18px' : '10px 0' }}>
        <button type="button" onClick={() => setOuvert(o => !o)} aria-expanded={ouvert}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', maxWidth: '100%' }}>
          <span style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: '#eef1ef', display: 'grid', placeItems: 'center', color: C.doux, flexShrink: 0 }}>
            <List size={16} />
          </span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: '11px', color: C.vert, fontWeight: 600 }}>{t('actualites.sommaire')}</span>
            <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: C.texte, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{courant?.texte}</span>
          </span>
          <ChevronDown size={16} color={C.doux} style={{ flexShrink: 0, transform: ouvert ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        </button>
        {ouvert && (
          <div style={{ position: 'absolute', left: mobile ? '18px' : 0, top: '100%', marginTop: '6px', minWidth: '260px', maxWidth: '90vw', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 12px 30px rgba(0,0,0,.15)', padding: '6px', zIndex: 31 }}>
            {sections.map(s => (
              <button key={s.id} type="button" onClick={() => aller(s.id)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: s.id === actif ? 700 : 500, color: s.id === actif ? C.vert : C.texte, backgroundColor: s.id === actif ? '#eef7f1' : 'transparent' }}>
                {s.texte}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Colonne de droite : dernières actualités
function Dernieres({ articles }) {
  const { t } = useTranslation();
  if (articles.length === 0) return null;
  return (
    <div style={{ border: '1px solid #e6e9e7', borderRadius: '14px', padding: '18px 16px 16px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 800, color: C.texte, marginBottom: '14px' }}>{t('actualites.dernieres')}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {articles.map(a => (
          <Link key={a.slug} to={`/actualites/${a.slug}`} className="group"
            style={{ display: 'flex', gap: '12px', padding: '8px', borderRadius: '10px', backgroundColor: '#f2f4f3', textDecoration: 'none', alignItems: 'center' }}>
            <img src={a.img} alt="" loading="lazy" style={{ width: '72px', height: '72px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
            <span style={{ minWidth: 0 }}>
              <span className="group-hover:underline" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '14px', fontWeight: 600, color: C.texte, lineHeight: 1.3 }}>
                {texteActu(a, 'titre')}
              </span>
              <span style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: C.doux, textTransform: 'uppercase', letterSpacing: '.3px' }}>{formatDateActu(a.date)}</span>
            </span>
          </Link>
        ))}
      </div>
      <Link to="/actualites" style={{ display: 'block', width: 'fit-content', margin: '16px auto 0', padding: '8px 14px', borderRadius: '6px', border: `1.5px solid ${C.vert}`, color: C.vert, fontSize: '12px', fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', textDecoration: 'none' }}>
        {t('actualites.voirToutes')}
      </Link>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────

function ActualiteDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const mobile = useEcranMobile();
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
  const contenu = useMemo(() => (actu ? texteActu(actu, 'contenu') ?? [] : []), [actu]);
  const sections = useMemo(() => sectionsDe(contenu), [contenu]);

  if (!pret && !actu) {
    return (
      <ZoneChargement label={t('commun.chargement')} style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 24px 96px' }}>
        <SqueletteArticle />
      </ZoneChargement>
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

  const titre = texteActu(actu, 'titre');
  const resume = texteActu(actu, 'resume');
  const autres = articles.filter(a => a.slug !== slug);
  const dernieres = autres.slice(0, 4);
  // À lire aussi : même catégorie d'abord, puis les plus récents
  const aLireAussi = [...autres.filter(a => a.tag === actu.tag), ...autres.filter(a => a.tag !== actu.tag)].slice(0, 3);
  const minutes = minutesLecture(resume, contenu);

  const lienAriane = { color: C.doux, textDecoration: 'none' };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bandeau coloré derrière la carte (bandes diagonales, comme les fiches match) */}
      <div aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: mobile ? '160px' : '360px',
        background: `repeating-linear-gradient(135deg, rgba(255,255,255,.03) 0 70px, transparent 70px 160px), linear-gradient(120deg, ${theme.greenDeep} 0%, #12462c 55%, #1a5a37 100%)`,
      }} />

      <article style={{
        position: 'relative', maxWidth: LARGEUR, width: mobile ? '100%' : 'calc(100% - 2 * var(--marge-page))', margin: mobile ? '0 auto' : '48px auto 0', backgroundColor: '#fff',
        borderRadius: mobile ? 0 : '18px', padding: mobile ? '20px 18px 32px' : '48px 64px 64px',
        boxShadow: mobile ? 'none' : '0 20px 60px rgba(0,0,0,.25)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'minmax(0, 1fr) 360px', gap: mobile ? '32px' : '56px', alignItems: 'start' }}>
          {/* ── Colonne principale ── */}
          <div style={{ minWidth: 0 }}>
            {/* Fil d'Ariane */}
            <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '12px', marginBottom: mobile ? '18px' : '28px' }}>
              <Link to="/" style={lienAriane}>{t('nav.accueil')}</Link>
              <ChevronRight size={13} color={C.doux} />
              <Link to="/actualites" style={lienAriane}>{t('nav.actualites')}</Link>
              <ChevronRight size={13} color={C.doux} />
              <span style={{ color: C.texte, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: mobile ? '180px' : '420px' }}>{titre}</span>
            </nav>

            <div style={{ fontSize: '11px', fontWeight: 600, color: C.doux, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '8px' }}>
              {formatDateActu(actu.date)}
            </div>
            <h1 style={{ fontFamily: 'var(--font-titres)', fontWeight: 400, color: C.texte, fontSize: mobile ? '28px' : '40px', lineHeight: 1.2, marginBottom: '16px' }}>
              {titre}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <Pastille fond="#fdeaea" couleur={theme.red}>{t(`actualites.tags.${actu.tag}`, { defaultValue: actu.tag })}</Pastille>
              <Pastille fond="#eef1ef" couleur={C.doux}>{t('actualites.minLecture', { n: minutes })}</Pastille>
              <BoutonPartager titre={titre} />
            </div>

            {/* Image de couverture, affichée en entier */}
            <img src={actu.img} alt="" style={{ display: 'block', width: '100%', height: 'auto', maxHeight: '620px', objectFit: 'cover', borderRadius: '12px', backgroundColor: '#e8ebe9' }} />

            {/* Chapô */}
            {resume && (
              <p style={{ fontSize: mobile ? '20px' : '26px', fontWeight: 500, color: C.texte, lineHeight: 1.35, margin: mobile ? '24px 0 22px' : '32px 0 28px' }}>
                {resume}
              </p>
            )}

            {sections.length >= 2 && <Sommaire sections={sections} mobile={mobile} />}

            {pret
              ? <ContenuArticle paragraphes={contenu} />
              : <ZoneChargement label={t('commun.chargement')}><SqueletteArticle /></ZoneChargement>}
          </div>

          {/* ── Colonne de droite ── */}
          <aside style={{ position: mobile ? 'static' : 'sticky', top: HAUT_NAV.bureau + 20 }}>
            <Dernieres articles={dernieres} />
          </aside>
        </div>
      </article>

      {/* ── À lire aussi ── */}
      {aLireAussi.length > 0 && (
        <section style={{ maxWidth: LARGEUR, width: mobile ? '100%' : 'calc(100% - 2 * var(--marge-page))', margin: '0 auto', padding: mobile ? '36px 18px 56px' : '56px 0 72px' }}>
          <h2 style={{ color: theme.text, fontSize: mobile ? '24px' : '30px', fontWeight: 400, fontFamily: 'var(--font-titres)', marginBottom: '20px' }}>
            {t('actualites.aLireAussi')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {aLireAussi.map(a => (
              <Link key={a.slug} to={`/actualites/${a.slug}`} className="group"
                style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#fff', borderRadius: '14px', padding: '14px', textDecoration: 'none' }}>
                <span style={{ display: 'block', overflow: 'hidden', borderRadius: '10px', aspectRatio: '16 / 9' }}>
                  <img src={a.img} alt="" loading="lazy" className="transition-transform duration-500 group-hover:scale-105"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </span>
                <span style={{ marginTop: '14px', fontSize: '11px', fontWeight: 600, color: C.doux, textTransform: 'uppercase', letterSpacing: '.4px' }}>{formatDateActu(a.date)}</span>
                <span className="group-hover:underline" style={{ marginTop: '4px', fontSize: '18px', fontWeight: 700, color: C.texte, lineHeight: 1.3 }}>{texteActu(a, 'titre')}</span>
                <span style={{ marginTop: '12px' }}>
                  <Pastille fond="#fdeaea" couleur={theme.red}>{t(`actualites.tags.${a.tag}`, { defaultValue: a.tag })}</Pastille>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ActualiteDetailPage;