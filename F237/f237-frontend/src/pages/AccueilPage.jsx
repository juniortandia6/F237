import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { locale } from '../i18n';
import { useLiveScores } from '../hooks/useLiveScores';
import { classementService } from '../services/classementService';
import { matchService } from '../services/matchService';
import theme from '../theme';
import AvatarJoueur from '../components/AvatarJoueur';
import { texteActu, articlesHero, IMAGES_DEFAUT } from '../data/actualites';
import { useActualites } from '../hooks/useActualites';
import { UTILISER_DEMO, construireMatchsDemo } from '../data/matchsDemo';
import { COMPETITIONS, SAISONS_DB, ANNEE_ACTUELLE } from '../data/saisons';

// Hero : les actus de l'API (à la une d'abord, 5 max). Sans article publié,
// une seule diapo d'accueil (pas de fausse actu).

const DUREE = 5000;

function formatHeure(dateStr) {
  return new Date(dateStr).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });
}
function formatDateCourte(dateStr) {
  return new Date(dateStr).toLocaleDateString(locale(), { day: 'numeric', month: 'short' });
}

// ── Barre de matchs ─────────────────────────────────────────────────────
const LARGEUR_CARTE = 360;
// La première carte s'aligne sur le contenu du hero (1150px centrés, 60px de marge min)
const DEBUT_RANGEE = 'max(60px, calc((100% - 1150px) / 2))';

const FLECHE = (cote) => ({
  position: 'absolute', top: '50%', [cote]: '18px',
  transform: 'translateY(-60%)',
  width: '40px', height: '40px', borderRadius: '50%',
  backgroundColor: '#fff', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 4px 14px rgba(0,0,0,0.35)', zIndex: 2,
});

// Une ligne d'équipe : logo + nom à gauche, score (+ triangle du vainqueur) à droite
function LigneEquipe({ equipe, score, gagnant, perdant, aVenir }) {
  const couleur = perdant ? '#8e8e8e' : '#141414';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        {equipe?.logoUrl
          ? <img src={equipe.logoUrl} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }} />
          : <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#e6e6e6', flexShrink: 0 }} />}
        <span style={{ fontSize: '16px', fontWeight: 700, color: couleur, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {equipe?.nom ?? '—'}
        </span>
      </div>
      {!aVenir && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span style={{ fontSize: '17px', fontWeight: 800, color: couleur, minWidth: '20px', textAlign: 'right' }}>{score ?? '–'}</span>
          {/* Triangle rouge pointant vers le score gagnant, comme FIBA */}
          <span style={{
            width: 0, height: 0,
            borderTop: '5px solid transparent', borderBottom: '5px solid transparent',
            borderRight: `6px solid ${gagnant ? theme.red : 'transparent'}`,
          }} />
        </div>
      )}
    </div>
  );
}

function CarteMatch({ m }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Toute la carte ouvre la page du match (le match est passé au routeur : affichage immédiat)
  const ouvrir = () => { if (m.id != null) navigate(`/matchs/${m.id}`, { state: { match: m } }); };
  const termine = m.statut === 2;
  const live = m.statut === 1;
  const aVenir = m.statut === 0;
  const dom = m.scoreDomicile, ext = m.scoreExterieur;
  const domGagne = (termine || live) && dom > ext;
  const extGagne = (termine || live) && ext > dom;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={ouvrir}
      onKeyDown={e => { if (e.key === 'Enter') ouvrir(); }}
      className="transition-transform duration-200 hover:-translate-y-1"
      style={{
        flex: `0 0 ${LARGEUR_CARTE}px`, scrollSnapAlign: 'start', cursor: 'pointer',
        display: 'flex', alignItems: 'stretch',
        backgroundColor: '#fff', borderRadius: '12px',
        boxShadow: '0 8px 22px rgba(0,0,0,0.30)',
        padding: '14px 16px',
      }}
    >
      {/* Partie gauche : compétition + statut + 2 équipes */}
      <div style={{ flex: 1, minWidth: 0, paddingRight: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            {m.competition ?? 'Elite One'}
          </span>
          {live ? (
            <span style={{ fontSize: '11px', fontWeight: 800, color: theme.red, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="animate-pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: theme.red }} />
              {t('commun.enDirectMaj')}
            </span>
          ) : termine ? (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e8e8e', textTransform: 'uppercase' }}>{t('commun.termine')}</span>
          ) : (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e8e8e', textTransform: 'uppercase' }}>
              {formatDateCourte(m.dateMatch)}
            </span>
          )}
        </div>
        <LigneEquipe equipe={m.equipeDomicile} score={dom} gagnant={domGagne} perdant={extGagne} aVenir={aVenir} />
        <LigneEquipe equipe={m.equipeExterieur} score={ext} gagnant={extGagne} perdant={domGagne} aVenir={aVenir} />
      </div>

      {/* Partie droite : séparateur + bouton (ou heure si à venir) */}
      <div style={{
        borderLeft: '1px solid #e7e7e7', paddingLeft: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '86px',
      }}>
        {aVenir ? (
          <span style={{
            backgroundColor: '#141414', color: '#fff', fontWeight: 700, fontSize: '15px',
            padding: '8px 12px', borderRadius: '8px',
          }}>
            {formatHeure(m.dateMatch)}
          </span>
        ) : (
          <Link to={m.id != null ? `/matchs/${m.id}` : '/matchs'} state={{ match: m }}
            onClick={e => e.stopPropagation()}
            className="transition-colors hover:bg-gray-200"
            style={{
              backgroundColor: '#efefef', color: '#333', fontWeight: 600, fontSize: '14px',
              padding: '8px 12px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
            {t('commun.plus')}
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Fond commun des bandes "Derniers résultats" et "Dernières nouvelles" ──
const FOND_BANDE = `linear-gradient(120deg, ${theme.greenDeep} 0%, #12462c 45%, #0f3a25 100%)`;

// Éclats géométriques en arrière-plan (rappel des couleurs du drapeau)
function EclatsBande() {
  return (
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <polygon points="0,600 0,380 260,0 420,0" fill="#1f9d55" opacity="0.22" />
      <polygon points="160,600 520,0 640,0 330,600" fill="#3ccf7a" opacity="0.10" />
      <polygon points="1440,0 1440,260 1180,600 1010,600" fill="#e1252b" opacity="0.16" />
      <polygon points="1300,0 1440,0 1440,90 1240,420" fill="#fcd116" opacity="0.10" />
      <polygon points="760,600 980,180 1060,180 900,600" fill="#1f9d55" opacity="0.10" />
    </svg>
  );
}

// ── Section "En direct" (inspirée de "Dernières vidéos" FIBA) ───────────
// Bande pleine largeur en dégradé vert avec éclats géométriques,
// grosses cartes blanches qui défilent, flèches rondes sur les bords.
// Sans match en direct : affiche les prochains matchs (sinon les derniers résultats).

const LARGEUR_CARTE_DIRECT = 320;

// Logo d'équipe, ou pastille neutre si l'équipe n'a pas de logo
function LogoCarte({ src }) {
  const style = { position: 'relative', width: '64px', height: '64px', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' };
  return src
    ? <img src={src} alt="" className="transition-transform duration-300 group-hover:scale-110" style={style} />
    : <span style={{ ...style, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.35)' }} />;
}

// Lien vers le calendrier, ouvert sur le jour (et le championnat) du match
const lienCalendrier = (m) => {
  const d = new Date(m.dateMatch);
  const jour = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return `/matchs?date=${jour}&comp=${m.competition === 'Elite Two' ? 'two' : 'one'}`;
};

// mode : 'live' | 'avenir' | 'termine'
function CarteDirect({ m, mode }) {
  const { t } = useTranslation();
  const live = mode === 'live';
  const avenir = mode === 'avenir';
  const dom = m.scoreDomicile, ext = m.scoreExterieur;
  const aScore = dom != null && ext != null;
  const minute = m.minute ?? m.minuteLive ?? m.tempsEcoule ?? null;

  return (
    <Link
      to={avenir ? lienCalendrier(m) : m.id != null ? `/matchs/${m.id}` : '/matchs'}
      state={avenir ? undefined : { match: m }}
      className="group"
      style={{
        flex: `0 0 ${LARGEUR_CARTE_DIRECT}px`, scrollSnapAlign: 'start',
        display: 'flex', flexDirection: 'column',
        backgroundColor: '#fff', borderRadius: '18px', padding: '14px',
        textDecoration: 'none', color: 'inherit',
        boxShadow: '0 10px 28px rgba(0,0,0,0.28)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 18px 36px rgba(0,0,0,0.36)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.28)'; }}
    >
      {/* Vignette : les deux logos + le score, comme une miniature vidéo */}
      <div style={{
        position: 'relative', height: '168px', borderRadius: '10px', overflow: 'hidden',
        background: `linear-gradient(135deg, ${theme.greenDeep} 0%, #14532f 55%, #1d6b3f 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 12px',
      }}>
        {/* Rayures diagonales discrètes */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.12,
          backgroundImage: 'repeating-linear-gradient(115deg, #fff 0 2px, transparent 2px 26px)',
        }} />

        {/* Badge de statut */}
        <span style={{
          position: 'absolute', top: '10px', left: '10px',
          display: 'flex', alignItems: 'center', gap: '6px',
          backgroundColor: live ? theme.red : avenir ? theme.green : 'rgba(0,0,0,0.45)', color: '#fff',
          fontSize: '10px', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: '20px',
        }}>
          {live && <span className="animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff' }} />}
          {live ? (m.statutCourt === 'HT' ? t('commun.miTemps') : minute ? `${t('commun.enDirect')} · ${minute}${m.minuteExtra ? `+${m.minuteExtra}` : ''}'` : t('commun.enDirect')) : avenir ? t('commun.aVenir') : t('commun.termine')}
        </span>

        <LogoCarte src={m.equipeDomicile?.logoUrl} />

        {avenir ? (
          /* Match à venir : l'heure du coup d'envoi en grand */
          <span style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
            <span style={{ fontWeight: 900, fontSize: '32px', fontFamily: '"Barlow Condensed", Arial, sans-serif', letterSpacing: '1px', lineHeight: 1 }}>
              {formatHeure(m.dateMatch)}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.8, marginTop: '4px' }}>
              {new Date(m.dateMatch).toLocaleDateString(locale(), { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </span>
        ) : (
          <span style={{
            position: 'relative', color: '#fff', fontWeight: 900, fontSize: '34px',
            fontFamily: '"Barlow Condensed", Arial, sans-serif', letterSpacing: '1px',
            textShadow: '0 2px 10px rgba(0,0,0,0.4)',
          }}>
            {aScore ? `${dom} - ${ext}` : 'VS'}
          </span>
        )}

        <LogoCarte src={m.equipeExterieur?.logoUrl} />
      </div>

      {/* Infos */}
      <span style={{ marginTop: '14px', fontSize: '11px', fontWeight: 700, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Elite One{m.dateMatch ? ` · ${new Date(m.dateMatch).toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
      </span>
      <span style={{
        marginTop: '6px', fontSize: '18px', fontWeight: 700, color: '#141414', lineHeight: 1.3,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        minHeight: '47px',
      }}>
        {m.equipeDomicile?.nom ?? '—'} – {m.equipeExterieur?.nom ?? '—'}
      </span>

      {/* Pied de carte */}
      <div style={{
        marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #ececec',
        display: 'flex', alignItems: 'center', gap: '6px', color: '#6b6b6b', fontSize: '14px', fontWeight: 600,
      }}>
        {live ? t('accueil.direct.suivre') : avenir ? t('jouer.voirCalendrier') : t('accueil.direct.resume')}
        <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function SectionDirect({ matchsLive, matchsAVenir, matchsTermines, isConnected, demo }) {
  const { t } = useTranslation();
  const mode = matchsLive.length > 0 ? 'live' : matchsAVenir.length > 0 ? 'avenir' : 'termine';
  const live = mode === 'live';
  const liste = live ? matchsLive : mode === 'avenir' ? matchsAVenir.slice(0, 8) : matchsTermines.slice(0, 8);
  const TITRES = { live: t('accueil.direct.titreLive'), avenir: t('accueil.direct.titreAvenir'), termine: t('accueil.direct.titreTermine') };
  const rangeeRef = useRef(null);
  const [gauche, setGauche] = useState(false);
  const [droite, setDroite] = useState(true);

  const maj = useCallback(() => {
    const el = rangeeRef.current;
    if (!el) return;
    setGauche(el.scrollLeft > 8);
    setDroite(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    maj();
    window.addEventListener('resize', maj);
    return () => window.removeEventListener('resize', maj);
  }, [liste.length, maj]);

  const defiler = (dir) => rangeeRef.current?.scrollBy({ left: dir * (LARGEUR_CARTE_DIRECT + 16) * 2, behavior: 'smooth' });

  return (
    <section style={{
      position: 'relative', padding: '56px 0 56px',
      // Fond fourni par la bande verte (voir AccueilPage)
    }}>

      {/* En-tête aligné sur le contenu */}
      <div style={{ position: 'relative', maxWidth: '1150px', margin: '0 auto', padding: '0 60px', boxSizing: 'content-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
          <h2 style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            color: '#fff', fontSize: '28px', fontWeight: 400,
            fontFamily: 'var(--font-titres)',
          }}>
            {live && <span className="animate-pulse" style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: theme.red, boxShadow: `0 0 12px ${theme.red}` }} />}
            {TITRES[mode]}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: isConnected ? theme.greenBright : 'rgba(255,255,255,0.5)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: isConnected ? theme.greenBright : 'rgba(255,255,255,0.5)' }} />
              {isConnected ? t('accueil.direct.liveConnecte') : t('accueil.direct.connexion')}
            </span>
            <Link to="/matchs" className="flex items-center gap-1 transition-opacity hover:opacity-80"
              style={{ fontSize: '15px', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>
              {t('accueil.tousLesMatchs')} <ChevronRight size={18} />
            </Link>
          </div>
        </div>
        {!live && (
          <p style={{ marginTop: '-12px', marginBottom: '20px', fontSize: '14px', color: 'rgba(255,255,255,0.65)' }}>
            {t('accueil.direct.aucunEnCours')} {mode === 'avenir'
              ? t('accueil.direct.texteAvenir')
              : t('accueil.direct.texteTermine')}
            {demo && (
              <span style={{
                marginLeft: '10px', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                backgroundColor: 'rgba(252,209,22,0.18)', color: theme.yellow, letterSpacing: '0.5px',
              }}>
                {t('commun.demo')}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Rangée de cartes */}
      <div style={{ position: 'relative' }}>
        <div
          ref={rangeeRef}
          onScroll={maj}
          style={{
            display: 'flex', gap: '16px',
            overflowX: 'auto', scrollbarWidth: 'none',
            scrollSnapType: 'x mandatory',
            paddingLeft: DEBUT_RANGEE, paddingRight: DEBUT_RANGEE, scrollPaddingLeft: DEBUT_RANGEE,
            paddingTop: '6px', paddingBottom: '16px',
          }}
        >
          {liste.length === 0 ? (
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{t('accueil.direct.aucunAfficher')}</span>
          ) : liste.map((m, i) => (
            <CarteDirect key={m.apiFootballId ?? m.id ?? i} m={m} mode={mode} />
          ))}
        </div>

        {gauche && (
          <button onClick={() => defiler(-1)} aria-label={t('commun.precedent')} style={FLECHE('left')}>
            <ChevronLeft size={20} color="#222" />
          </button>
        )}
        {droite && liste.length > 0 && (
          <button onClick={() => defiler(1)} aria-label={t('commun.suivant')} style={FLECHE('right')}>
            <ChevronRight size={20} color="#222" />
          </button>
        )}
      </div>
    </section>
  );
}

// ── Section "Classements" (inspirée de FIBA) ──────────────────────────────
// Onglets Elite One / Elite Two, podium des 3 premiers, puis 4e à 8e
// dans un tableau. Chaque équipe mène à sa fiche (saison en cours).

// Saison en cours (la plus récente importée, voir data/saisons.js)
const LIGUES = [
  { cle: 'elite-one', label: 'MTN Elite One', saisonId: SAISONS_DB[ANNEE_ACTUELLE]?.one },
  { cle: 'elite-two', label: 'MTN Elite Two', saisonId: SAISONS_DB[ANNEE_ACTUELLE]?.two },
];

const MEDAILLES = {
  1: { couleur: '#f5c542', label: '1er' },
  2: { couleur: '#c9d1d6', label: '2e' },
  3: { couleur: '#d08a4a', label: '3e' },
};

// Lit une statistique quel que soit le nom exact du champ renvoyé par l'API
const stat = (e, ...noms) => {
  for (const n of noms) if (e?.[n] != null) return e[n];
  return null;
};
const nomEquipe = (e) => e?.equipe?.nom ?? e?.nom ?? '—';
const logoEquipe = (e) => e?.equipe?.logoUrl ?? e?.logoUrl;

function bilan(e, t) {
  const v = stat(e, 'victoires', 'gagnes', 'win');
  const n = stat(e, 'nuls', 'egalites', 'draw');
  const d = stat(e, 'defaites', 'perdus', 'lose');
  return v != null && n != null && d != null ? t('commun.bilan', { v, n, d }) : null;
}

// Palette des sections Classements + Meilleurs buteurs (fond blanc, style FIBA)
const CLAIRE = {
  ...theme,
  text: '#141414',
  textMuted: '#6b7470',
  textFaint: '#9aa39e',
  border: '#e2e7e4',
  surface: '#f2f4f3',
  surfaceHover: '#e8eeea',
  bg: '#fafbfa',
  vert: '#14532f',
};

const lienEquipe = (e) => {
  const id = e?.equipeId ?? e?.equipe?.id;
  return id != null ? `/equipes/${id}?saison=${ANNEE_ACTUELLE}` : null;
};

// Lien si l'équipe a un id, sinon simple bloc (évite un lien cassé)
function LienEquipe({ e, children, ...rest }) {
  const to = lienEquipe(e);
  return to
    ? <Link to={to} {...rest}>{children}</Link>
    : <div {...rest}>{children}</div>;
}

// Médaille numérotée (1 / 2 / 3) comme sur FIBA
function PastilleMedaille({ rang, taille = 34 }) {
  const med = MEDAILLES[rang];
  return (
    <span style={{
      width: `${taille}px`, height: `${taille}px`, borderRadius: '50%',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(circle at 35% 30%, #ffffff88 0%, transparent 45%), ${med.couleur}`,
      boxShadow: `0 0 0 3px #fff, 0 0 0 4px ${med.couleur}, 0 4px 10px rgba(0,0,0,0.12)`,
      color: '#1d1d1d', fontWeight: 900, fontSize: `${Math.round(taille * 0.5)}px`,
      fontFamily: '"Barlow Condensed", Arial, sans-serif',
    }}>
      {rang}
    </span>
  );
}

function CartePodium({ e, rang }) {
  const { t } = useTranslation();
  const med = MEDAILLES[rang];
  const premier = rang === 1;
  const b = bilan(e, t);
  return (
    <LienEquipe
      e={e}
      className="group"
      style={{
        flex: 1, minWidth: 0, alignSelf: 'flex-end', position: 'relative',
        backgroundColor: CLAIRE.surface,
        borderRadius: '16px',
        padding: premier ? '26px 18px 22px' : '20px 18px 18px',
        minHeight: premier ? '262px' : '226px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
        textAlign: 'center', textDecoration: 'none', overflow: 'hidden',
        borderBottom: `4px solid ${med.couleur}`,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease',
      }}
      onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-4px)'; ev.currentTarget.style.boxShadow = '0 14px 28px rgba(20,40,30,0.12)'; ev.currentTarget.style.backgroundColor = '#ffffff'; }}
      onMouseLeave={ev => { ev.currentTarget.style.transform = 'translateY(0)'; ev.currentTarget.style.boxShadow = 'none'; ev.currentTarget.style.backgroundColor = CLAIRE.surface; }}
    >
      {/* Médaille + rang */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <PastilleMedaille rang={rang} taille={premier ? 38 : 32} />
        {premier && <Trophy size={20} color={med.couleur} fill={med.couleur} strokeWidth={1.5} />}
      </div>

      {/* Logo */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: premier ? '104px' : '86px' }}>
        {logoEquipe(e)
          ? <img src={logoEquipe(e)} alt=""
              className="transition-transform duration-300 group-hover:scale-110"
              style={{ width: premier ? '96px' : '78px', height: premier ? '96px' : '78px', objectFit: 'contain' }} />
          : <span style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: CLAIRE.border }} />}
      </div>

      {/* Nom */}
      <span style={{
        fontSize: premier ? '19px' : '17px', fontWeight: 800, color: CLAIRE.text, lineHeight: 1.2,
        maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {nomEquipe(e)}
      </span>

      {/* Points + bilan */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        <span style={{ fontFamily: '"Barlow Condensed", Arial, sans-serif', fontSize: premier ? '30px' : '26px', fontWeight: 800, color: CLAIRE.vert, lineHeight: 1 }}>
          {e.points ?? 0} <span style={{ fontSize: '14px', fontWeight: 700, color: CLAIRE.textMuted }}>{t('accueil.classements.pts')}</span>
        </span>
        {b && <span style={{ fontSize: '13px', color: CLAIRE.textMuted, fontWeight: 600 }}>{b}</span>}
      </div>
    </LienEquipe>
  );
}

// ── Meilleurs buteurs (cartes "leaders" style FIBA) ───────────────────────
// Calculés à partir des buts renvoyés avec chaque match (m.buts) :
// sans les CSC ni les buteurs inconnus.

function calculerJoueurs(matchs = []) {
  const logos = new Map();
  const parJoueur = new Map();

  for (const m of matchs) {
    for (const e of [m.equipeDomicile, m.equipeExterieur]) {
      if (e?.nom && e.logoUrl) logos.set(e.nom, e.logoUrl);
    }
    for (const b of m.buts ?? []) {
      if (b.estButCSC) continue;                                   // un CSC ne compte pas pour le buteur
      const nom = (b.nomJoueur ?? '').trim();
      if (!nom || nom === 'Inconnu') continue;
      const cle = `${nom}|${b.nomEquipe}`;
      const j = parJoueur.get(cle) ?? { nom, equipe: b.nomEquipe, buts: 0, penaltys: 0, matchs: new Set() };
      j.buts += 1;
      if (b.estPenalty) j.penaltys += 1;
      j.matchs.add(m.id);
      parJoueur.set(cle, j);
    }
  }
  return [...parJoueur.values()].map(j => ({ ...j, matchs: j.matchs.size, logo: logos.get(j.equipe) }));
}

// Classement des buteurs : plus de buts > moins de penaltys > ordre alphabétique
const classerButeurs = (joueurs) =>
  [...joueurs].sort((a, b) => b.buts - a.buts || a.penaltys - b.penaltys || a.nom.localeCompare(b.nom));

// "C. Ndongo" -> { prenom: "C.", nom: "Ndongo" }
function decouperNom(complet) {
  const i = complet.indexOf(' ');
  return i === -1 ? { prenom: '', nom: complet } : { prenom: complet.slice(0, i), nom: complet.slice(i + 1) };
}

// Couleurs des cartes buteurs
const L = {
  hero: 'linear-gradient(150deg, #1f7a45 0%, #14532f 55%, #0b331e 100%)',
  rayures: 'repeating-linear-gradient(115deg, rgba(255,255,255,0.035) 0 14px, transparent 14px 28px)',
  texte: '#141414',
  doux: '#6b7470',
  vert: '#14532f',
  bord: '#e9edeb',
};

const LARGEUR_LEADER = 300;

// Lien vers le classement des buteurs (page Classement, bonne compétition, joueur mis en avant)
const lienButeurs = (comp, j) =>
  `/classement?comp=${comp}${j ? `&joueur=${encodeURIComponent(`${j.nom}|${j.equipe}`)}` : ''}#buteurs`;

// Une carte par buteur : 1er à gauche, puis 2e, 3e...
function CarteButeur({ j, rang, lien }) {
  const { t } = useTranslation();
  const med = MEDAILLES[rang];
  const { prenom, nom: famille } = decouperNom(j.nom);
  return (
    <Link to={lien} className="group" aria-label={`${rang}. ${j.nom} (${j.equipe}) – ${j.buts}`} style={{
      flex: `0 0 ${LARGEUR_LEADER}px`, scrollSnapAlign: 'start', textDecoration: 'none', color: 'inherit',
      backgroundColor: '#fff', borderRadius: '18px', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      border: '1px solid rgba(255,255,255,0.14)',
      boxShadow: '0 10px 26px rgba(0,0,0,0.25)',
      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.35)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 26px rgba(0,0,0,0.25)'; }}
    >
      {/* Le joueur */}
      <div style={{
        position: 'relative', height: '226px', overflow: 'hidden',
        background: `${L.rayures}, ${L.hero}`,
        borderTop: `4px solid ${med ? med.couleur : 'rgba(255,255,255,0.25)'}`,
      }}>
        {/* Halo derrière le joueur */}
        <span aria-hidden="true" style={{
          position: 'absolute', right: '-40px', bottom: '-60px', width: '260px', height: '260px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 65%)', pointerEvents: 'none',
        }} />

        {/* Le joueur, grand et posé sur le bas de la carte (comme FIBA) */}
        <span aria-hidden="true" className="transition-transform duration-500 group-hover:scale-105"
          style={{
            position: 'absolute', right: '-6px', bottom: 0, width: '178px', height: '198px',
            transformOrigin: 'bottom center', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))',
          }}>
          {/* Pas de photo dans l'API pour l'instant : silhouette */}
          <AvatarJoueur photo={j.photo} variante="buste" />
        </span>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', padding: '16px 18px', maxWidth: '60%', boxSizing: 'border-box' }}>
          {/* Rang */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            {med
              ? <PastilleMedaille rang={rang} taille={30} />
              : <span style={{
                  width: '30px', height: '30px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  backgroundColor: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)',
                  color: '#fff', fontWeight: 800, fontSize: '16px', fontFamily: '"Barlow Condensed", Arial, sans-serif',
                }}>{rang}</span>}
            <span style={{
              color: rang === 1 ? MEDAILLES[1].couleur : 'rgba(255,255,255,0.75)',
              fontSize: '10px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', lineHeight: 1.25,
            }}>
              {t('accueil.buteurs.meilleurButeur')}
            </span>
          </div>

          {/* Club (logo + nom), comme le drapeau sur les cartes FIBA */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start', maxWidth: '100%',
            marginTop: '16px', padding: '3px 9px 3px 4px', borderRadius: '6px',
            backgroundColor: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.18)',
            color: '#fff', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase',
          }}>
            {j.logo && (
              <span style={{ width: '18px', height: '18px', borderRadius: '4px', backgroundColor: '#fff', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={j.logo} alt="" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
              </span>
            )}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.equipe}</span>
          </span>

          {/* Nom */}
          <div style={{ marginTop: '12px', minWidth: 0 }}>
            {prenom && <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', fontWeight: 500, lineHeight: 1.2 }}>{prenom}</div>}
            <div style={{
              color: '#fff', fontSize: '28px', fontWeight: 800, lineHeight: 1.05, textTransform: 'uppercase',
              fontFamily: '"Barlow Condensed", Arial, sans-serif', letterSpacing: '0.3px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {famille}
            </div>
          </div>

          {/* Buts : la pastille blanche des cartes FIBA */}
          <span style={{
            marginTop: 'auto', alignSelf: 'flex-start',
            backgroundColor: '#fff', borderRadius: '8px', padding: '5px 12px 4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.18)', lineHeight: 1,
            fontFamily: '"Barlow Condensed", Arial, sans-serif',
          }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: L.vert }}>{j.buts}</span>
            <span style={{ marginLeft: '5px', fontSize: '13px', fontWeight: 700, color: L.doux, textTransform: 'uppercase' }}>
              {t('commun.but', { count: j.buts })}
            </span>
          </span>
        </div>
      </div>

      {/* Statistiques */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {[
          [t('accueil.buteurs.penaltys'), j.penaltys],
          [t('accueil.buteurs.matchsAvecBut'), j.matchs],
        ].map(([label, val, vedette], i) => (
          <div key={i} style={{
            padding: '12px 8px 13px', textAlign: 'center',
            borderLeft: i ? `1px solid ${L.bord}` : 'none',
            backgroundColor: vedette ? '#f1f7f3' : '#fff',
          }}>
            <div style={{
              fontFamily: '"Barlow Condensed", Arial, sans-serif', lineHeight: 1,
              fontSize: vedette ? '30px' : '22px', fontWeight: 800, color: vedette ? L.vert : L.texte,
            }}>
              {val}
            </div>
            <div style={{ marginTop: '4px', color: L.doux, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.2 }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </Link>
  );
}

function BlocButeurs({ matchs, live, competition, comp }) {
  const { t } = useTranslation();
  // Top 10, du 1er (à gauche) au 10e
  const buteurs = useMemo(() => classerButeurs(calculerJoueurs(matchs)).slice(0, 10), [matchs]);
  const rangeeRef = useRef(null);
  const [gauche, setGauche] = useState(false);
  const [droite, setDroite] = useState(true);

  const maj = useCallback(() => {
    const el = rangeeRef.current;
    if (!el) return;
    setGauche(el.scrollLeft > 8);
    setDroite(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    maj();
    window.addEventListener('resize', maj);
    return () => window.removeEventListener('resize', maj);
  }, [maj, buteurs.length]);

  const defiler = (dir) => rangeeRef.current?.scrollBy({ left: dir * (LARGEUR_LEADER + 16), behavior: 'smooth' });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ color: '#fff', fontSize: '28px', fontWeight: 400, fontFamily: 'var(--font-titres)' }}>
            {t('accueil.buteurs.titre')}
          </h3>
          {competition && (
            <span style={{
              padding: '3px 10px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.85)',
              fontSize: '12px', fontWeight: 700,
            }}>
              {competition}
            </span>
          )}
          {live && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '20px',
              backgroundColor: CLAIRE.red, color: '#fff', fontSize: '11px', fontWeight: 800, letterSpacing: '0.6px',
            }}>
              <span className="animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff' }} />
              {t('commun.enDirectMaj')}
            </span>
          )}
        </div>
        <Link to={lienButeurs(comp)} className="flex items-center gap-1 transition-opacity hover:opacity-80"
          style={{ fontSize: '15px', fontWeight: 600, color: '#fff', textDecoration: 'none' }}>
          {t('accueil.buteurs.afficherTout')} <ChevronRight size={18} />
        </Link>
      </div>

      <div style={{ position: 'relative' }}>
        <div ref={rangeeRef} onScroll={maj}
          style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollbarWidth: 'none', scrollSnapType: 'x mandatory', paddingBottom: '4px' }}>
          {buteurs.length === 0 ? (
            <div style={{ padding: '28px 0', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{t('accueil.buteurs.aucun')}</div>
          ) : buteurs.map((j, i) => (
            <CarteButeur key={`${j.nom}|${j.equipe}`} j={j} rang={i + 1} lien={lienButeurs(comp, j)} />
          ))}
        </div>
        {gauche && (
          <button onClick={() => defiler(-1)} aria-label={t('commun.precedent')} style={FLECHE('left')}>
            <ChevronLeft size={20} color="#222" />
          </button>
        )}
        {droite && (
          <button onClick={() => defiler(1)} aria-label={t('commun.suivant')} style={FLECHE('right')}>
            <ChevronRight size={20} color="#222" />
          </button>
        )}
      </div>
    </div>
  );
}

// "Elite One: Group B" -> "Poule B" ; autres phases : nom traduit si connu
function titreGroupe(g, t) {
  const nom = (g ?? '').replace(/^[^:]*:\s*/, '').trim();
  const poule = nom.match(/^group\s+(\w+)$/i);
  if (poule) return t('classement.poule', { l: poule[1].toUpperCase() });
  return t(`classement.groupes.${nom}`, { defaultValue: nom || t('classement.titre') });
}

// #, Équipe, J, V, N, D, DB, Pts
const GRILLE_MINI = '44px minmax(0,1fr) repeat(5, 46px) 56px';

// signatureLive change dès qu'un score évolue en direct -> on recharge
// classement + buteurs, sans afficher de "Chargement..." (pas de clignotement)
function SectionClassement({ signatureLive = '', live = false }) {
  const { t } = useTranslation();
  const [ligue, setLigue] = useState(LIGUES[0].cle);
  const [donnees, setDonnees] = useState({});      // { 'elite-one': [...], 'elite-two': [...] }
  const [matchsParLigue, setMatchsParLigue] = useState({}); // pour calculer les buteurs
  const [chargement, setChargement] = useState(true);
  const [groupeParLigue, setGroupeParLigue] = useState({}); // poule choisie par compétition

  useEffect(() => {
    let ignore = false;
    Promise.all(LIGUES.map(l => Promise.all([
      classementService.getBySaison(l.saisonId).catch(() => []),
      matchService.getBySaison(l.saisonId).catch(() => []),
    ]).then(([classement, matchs]) => [l.cle, classement, matchs])))
      .then(lignes => {
        if (ignore) return;
        const cl = {}, mt = {};
        for (const [cle, classement, matchs] of lignes) {
          cl[cle] = [...(classement ?? [])].sort((a, b) =>
            (a.ordreGroupe ?? 0) - (b.ordreGroupe ?? 0)
            || (a.position ?? 999) - (b.position ?? 999) || (b.points ?? 0) - (a.points ?? 0));
          mt[cle] = matchs ?? [];
        }
        setDonnees(cl);
        setMatchsParLigue(mt);
        setChargement(false);
      });
    return () => { ignore = true; };
  }, [signatureLive]);


  // Saison en poules : on affiche une poule à la fois (sinon les deux se mélangent)
  const groupes = [];
  for (const e of donnees[ligue] ?? []) {
    const cle = e.groupe ?? '';
    let g = groupes.find(x => x.cle === cle);
    if (!g) groupes.push(g = { cle, lignes: [] });
    g.lignes.push(e);
  }
  const groupeActif = groupes.find(g => g.cle === groupeParLigue[ligue]) ?? groupes[0];
  const top5 = (groupeActif?.lignes ?? []).slice(0, 8);
  const podium = top5.slice(0, 3);
  const suite = top5.slice(3, 8);

  return (
    <>
    <section style={{ backgroundColor: '#ffffff', padding: '56px 0 64px' }}>
     <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '0 60px', boxSizing: 'content-box' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <h2 style={{ color: CLAIRE.text, fontSize: '28px', fontWeight: 400, fontFamily: 'var(--font-titres)' }}>
          {t('accueil.classements.titre')}
        </h2>
        <Link to="/classement" className="flex items-center gap-1 transition-opacity hover:opacity-80"
          style={{ fontSize: '15px', fontWeight: 600, color: CLAIRE.text, textDecoration: 'none' }}>
          {t('accueil.classements.tousLesDetails')} <ChevronRight size={18} />
        </Link>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '28px', borderBottom: `1px solid ${CLAIRE.border}`, marginBottom: '26px' }}>
        {LIGUES.map(l => {
          const actif = l.cle === ligue;
          return (
            <button key={l.cle} onClick={() => setLigue(l.cle)}
              style={{
                padding: '0 4px 12px', marginBottom: '-1px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '15px', fontWeight: actif ? 700 : 500,
                color: actif ? CLAIRE.text : CLAIRE.textMuted,
                borderBottom: `3px solid ${actif ? CLAIRE.vert : 'transparent'}`,
                transition: 'color 0.2s ease, border-color 0.2s ease',
              }}>
              {l.label}
            </button>
          );
        })}
      </div>

      {chargement ? (
        <div className="text-center py-10" style={{ fontSize: '14px', color: CLAIRE.textFaint }}>{t('commun.chargement')}</div>
      ) : top5.length === 0 ? (
        <div className="text-center py-10" style={{ fontSize: '14px', color: CLAIRE.textMuted }}>
          {t('accueil.classements.indisponible')}
        </div>
      ) : (
        <>
          {/* Choix de la poule (seulement si la saison en a plusieurs) */}
          {groupes.length > 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '22px' }}>
              {groupes.map(g => {
                const actif = g === groupeActif;
                return (
                  <button key={g.cle} onClick={() => setGroupeParLigue(prev => ({ ...prev, [ligue]: g.cle }))}
                    style={{
                      padding: '7px 16px', borderRadius: '999px', cursor: 'pointer',
                      fontSize: '13px', fontWeight: 700,
                      border: `1px solid ${actif ? CLAIRE.vert : CLAIRE.border}`,
                      backgroundColor: actif ? CLAIRE.vert : '#fff',
                      color: actif ? '#fff' : CLAIRE.textMuted,
                      transition: 'background-color 0.2s ease, color 0.2s ease',
                    }}>
                    {titreGroupe(g.cle, t)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Podium : 2e – 1er – 3e */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '20px' }}>
            {podium[1] && <CartePodium e={podium[1]} rang={2} />}
            {podium[0] && <CartePodium e={podium[0]} rang={1} />}
            {podium[2] && <CartePodium e={podium[2]} rang={3} />}
          </div>

          {/* 4e à 8e : tableau à en-tête sombre, lignes blanches cliquables */}
          {suite.length > 0 && (
            <div style={{ borderRadius: '14px', overflow: 'hidden', border: `1px solid ${CLAIRE.border}` }}>
              <div style={{
                display: 'grid', gridTemplateColumns: GRILLE_MINI, alignItems: 'center',
                padding: '11px 18px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.6px',
                textTransform: 'uppercase', color: '#fff', backgroundColor: CLAIRE.vert,
              }}>
                <span>#</span>
                <span>{t('accueil.classements.equipe')}</span>
                {['j', 'v', 'n', 'd', 'db'].map(c => (
                  <span key={c} style={{ textAlign: 'center' }}>{t(`classement.col.${c}`)}</span>
                ))}
                <span style={{ textAlign: 'right' }}>{t('classement.col.pts')}</span>
              </div>
              {suite.map((e, i) => {
                const fond = i % 2 === 0 ? '#ffffff' : CLAIRE.bg;
                const db = stat(e, 'differenceDesButs', 'differenceButs', 'diffButs', 'goalDifference');
                return (
                  <LienEquipe key={e.equipeId ?? e.id ?? i} e={e}
                    style={{
                      display: 'grid', gridTemplateColumns: GRILLE_MINI, alignItems: 'center',
                      padding: '12px 18px', fontSize: '15px', textDecoration: 'none',
                      backgroundColor: fond, borderTop: `1px solid ${CLAIRE.border}`,
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={ev => { ev.currentTarget.style.backgroundColor = '#eef5f0'; }}
                    onMouseLeave={ev => { ev.currentTarget.style.backgroundColor = fond; }}
                  >
                    <span style={{ fontFamily: '"Barlow Condensed", Arial, sans-serif', fontSize: '18px', color: CLAIRE.textMuted, fontWeight: 700 }}>
                      {e.position ?? i + 4}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '12px', color: CLAIRE.text, fontWeight: 700, minWidth: 0 }}>
                      {logoEquipe(e)
                        ? <img src={logoEquipe(e)} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain', flexShrink: 0 }} />
                        : <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: CLAIRE.border, flexShrink: 0 }} />}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nomEquipe(e)}</span>
                    </span>
                    {[
                      stat(e, 'matchsJoues', 'joues', 'played'),
                      stat(e, 'victoires', 'gagnes', 'win'),
                      stat(e, 'nuls', 'egalites', 'draw'),
                      stat(e, 'defaites', 'perdus', 'lose'),
                      db != null && db > 0 ? `+${db}` : db,
                    ].map((v, k) => (
                      <span key={k} style={{ textAlign: 'center', color: CLAIRE.textMuted, fontWeight: 600 }}>{v ?? '–'}</span>
                    ))}
                    <span style={{ textAlign: 'right', color: CLAIRE.text, fontWeight: 800, fontFamily: '"Barlow Condensed", Arial, sans-serif', fontSize: '19px' }}>
                      {e.points ?? 0}
                    </span>
                  </LienEquipe>
                );
              })}
            </div>
          )}
        </>
      )}

     </div>
    </section>

    {/* Meilleurs buteurs de la compétition sélectionnée : bande verte (comme Prochains matchs) */}
    {!chargement && (
      <div style={{ position: 'relative', overflow: 'hidden', background: FOND_BANDE }}>
        <EclatsBande />
        <div style={{ position: 'relative', maxWidth: '1150px', margin: '0 auto', padding: '56px 60px 64px', boxSizing: 'content-box' }}>
          <BlocButeurs
            matchs={matchsParLigue[ligue] ?? []}
            live={live}
            competition={LIGUES.find(l => l.cle === ligue)?.label}
            comp={ligue === 'elite-two' ? 'two' : 'one'}
          />
        </div>
      </div>
    )}
    </>
  );
}

// ── Section "Dernières nouvelles" (inspirée de FIBA) ──────────────────────
// Bande pleine largeur aux tons rouges, cartes portrait image + titre,
// qui mènent chacune à la page article.

const LARGEUR_CARTE_NEWS = 220;

function SectionNouvelles({ articles }) {
  const { t } = useTranslation();
  const rangeeRef = useRef(null);
  const [gauche, setGauche] = useState(false);
  const [droite, setDroite] = useState(true);

  const maj = useCallback(() => {
    const el = rangeeRef.current;
    if (!el) return;
    setGauche(el.scrollLeft > 8);
    setDroite(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    maj();
    window.addEventListener('resize', maj);
    return () => window.removeEventListener('resize', maj);
  }, [maj]);

  const defiler = (dir) => rangeeRef.current?.scrollBy({ left: dir * (LARGEUR_CARTE_NEWS + 14) * 3, behavior: 'smooth' });

  return (
    <section style={{
      position: 'relative', overflow: 'hidden', padding: '56px 0 64px',
      backgroundColor: '#ffffff',
    }}>
      {/* En-tête */}
      <div style={{ position: 'relative', maxWidth: '1150px', margin: '0 auto', padding: '0 60px', boxSizing: 'content-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
          <h2 style={{ color: '#141414', fontSize: '28px', fontWeight: 400, fontFamily: 'var(--font-titres)' }}>
            {t('accueil.nouvelles.titre')}
          </h2>
          <Link to="/actualites" className="flex items-center gap-1 transition-opacity hover:opacity-80"
            style={{ fontSize: '15px', color: '#141414', fontWeight: 600, textDecoration: 'none' }}>
            {t('accueil.nouvelles.toutes')} <ChevronRight size={18} />
          </Link>
        </div>
      </div>

      {/* Cartes portrait */}
      <div style={{ position: 'relative' }}>
        <div
          ref={rangeeRef}
          onScroll={maj}
          style={{
            display: 'flex', gap: '14px',
            overflowX: 'auto', scrollbarWidth: 'none',
            scrollSnapType: 'x mandatory',
            paddingLeft: DEBUT_RANGEE, paddingRight: DEBUT_RANGEE, scrollPaddingLeft: DEBUT_RANGEE,
            paddingTop: '6px', paddingBottom: '14px',
          }}
        >
          {articles.map(a => (
            <Link key={a.slug} to={`/actualites/${a.slug}`} className="group"
              style={{
                position: 'relative', flex: `0 0 ${LARGEUR_CARTE_NEWS}px`, height: '330px',
                borderRadius: '10px', overflow: 'hidden', scrollSnapAlign: 'start',
                textDecoration: 'none', boxShadow: '0 10px 26px rgba(0,0,0,0.35)',
                transition: 'transform 0.25s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <img src={a.img} alt="" className="transition-transform duration-500 group-hover:scale-110"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.88) 100%)' }} />
              <span style={{
                position: 'absolute', top: '12px', left: '12px',
                backgroundColor: theme.red, color: '#fff', padding: '3px 10px', borderRadius: '20px',
                fontSize: '10px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase',
              }}>{t(`actualites.tags.${a.tag}`, { defaultValue: a.tag })}</span>
              <span style={{
                position: 'absolute', left: '12px', right: '12px', bottom: '14px',
                color: '#fff', fontSize: '17px', fontWeight: 800, lineHeight: 1.25,
                display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {texteActu(a, 'titre')}
              </span>
            </Link>
          ))}
        </div>

        {gauche && (
          <button onClick={() => defiler(-1)} aria-label={t('commun.precedent')} style={FLECHE('left')}>
            <ChevronLeft size={20} color="#222" />
          </button>
        )}
        {droite && (
          <button onClick={() => defiler(1)} aria-label={t('commun.suivant')} style={FLECHE('right')}>
            <ChevronRight size={20} color="#222" />
          </button>
        )}
      </div>
    </section>
  );
}

const AccueilPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { matchsLive, isConnected } = useLiveScores();
  const { articles } = useActualites();
  const actusHero = articlesHero(articles);
  const sansActu = actusHero.length === 0;
  const ACTUS = sansActu
    ? [{ slug: null, tag: null, img: IMAGES_DEFAUT[0], titre: t('accueil.bienvenue.titre'), en: null }]
    : actusHero;
  const [matchs, setMatchs] = useState([]);
  const [loadingMatchs, setLoadingMatchs] = useState(true);
  // Heure du chargement des matchs (Date.now() est interdit pendant le rendu)
  const [chargeLe, setChargeLe] = useState(0);
  const [actuActive, setActuActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const barreRef = useRef(null);
  const [peutGauche, setPeutGauche] = useState(false);
  const [peutDroite, setPeutDroite] = useState(true);
  const intervalRef = useRef(null);
  const progressRef = useRef(null);
  const startTimeRef = useRef(null);

  const goTo = useCallback((index) => {
    clearInterval(intervalRef.current);
    setActuActive(index);
    setProgress(0);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setActuActive(prev => {
        startTimeRef.current = Date.now();
        setProgress(0);
        return prev + 1;
      });
    }, DUREE);
  }, []);

  const next = useCallback(() => {
    setActuActive(prev => {
      startTimeRef.current = Date.now();
      setProgress(0);
      return prev + 1;
    });
  }, []);

  // actuActive avance sans fin : l'actu affichée est son reste (le nombre d'actus peut changer)
  const indexActu = actuActive % ACTUS.length;
  const actu = ACTUS[indexActu];

  useEffect(() => {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(next, DUREE);
    const tick = () => {
      const elapsed = Date.now() - (startTimeRef.current || Date.now());
      setProgress(Math.min((elapsed / DUREE) * 100, 100));
      progressRef.current = requestAnimationFrame(tick);
    };
    progressRef.current = requestAnimationFrame(tick);
    return () => {
      clearInterval(intervalRef.current);
      cancelAnimationFrame(progressRef.current);
    };
  }, [next]);

  useEffect(() => {
    let ignore = false;
    // Matchs de la saison en cours, Elite One ET Elite Two
    const ids = SAISONS_DB[ANNEE_ACTUELLE] ?? {};
    Promise.all(COMPETITIONS
      .filter(c => ids[c.cle] != null)
      .map(c => matchService.getBySaison(ids[c.cle])
        .then(liste => liste.map(m => ({ ...m, competition: c.label })))
        .catch(() => [])))
      .then(listes => {
        if (ignore) return;
        setMatchs(listes.flat());
        setChargeLe(Date.now());
        setLoadingMatchs(false);
      });
    return () => { ignore = true; };
  }, []);

  // Empreinte des scores en direct : change à chaque but -> classement et buteurs se rechargent
  const signatureLive = matchsLive
    .map(m => `${m.apiFootballId ?? m.id}:${m.scoreDomicile ?? 0}-${m.scoreExterieur ?? 0}`)
    .join('|');

  // Scores en direct (SignalR) appliqués aux matchs de la saison
  const matchsAJour = useMemo(() => {
    if (!matchsLive?.length) return matchs;
    const live = new Map(matchsLive.map(l => [l.apiFootballId, l]));
    return matchs.map(m => {
      const l = m.apiFootballId != null ? live.get(m.apiFootballId) : null;
      return l ? { ...m, statut: 1, scoreDomicile: l.scoreDomicile, scoreExterieur: l.scoreExterieur, minute: l.minuteLive ?? l.minute, statutCourt: l.statutCourt, minuteExtra: l.minuteExtra, buts: l.buts ?? m.buts } : m;
    });
  }, [matchs, matchsLive]);

  // Bandeau "Matchs" : uniquement les derniers résultats de la saison
  // (les matchs en direct ont leur propre section "En direct" plus bas)
  const matchsTermines = useMemo(() => matchsAJour
    .filter(m => m.statut === 2)
    .sort((a, b) => new Date(b.dateMatch) - new Date(a.dateMatch)), [matchsAJour]);
  const matchsCarrousel = useMemo(() => matchsTermines.slice(0, 12), [matchsTermines]);

  // Prochains matchs : les vrais (statut 0) s'il y en a, sinon la démo
  // (statut "à venir" ET date pas encore passée : un match d'octobre resté "à venir"
  // a été reporté sans nouvelle date, ce n'est pas un prochain match)
  const vraisAVenir = useMemo(() => matchsAJour
    .filter(m => m.statut === 0 && new Date(m.dateMatch).getTime() > chargeLe - 3 * 3600 * 1000)
    .sort((a, b) => new Date(a.dateMatch) - new Date(b.dateMatch))
    .slice(0, 8), [matchsAJour, chargeLe]);
  const demoActive = UTILISER_DEMO && !loadingMatchs && vraisAVenir.length === 0;
  const matchsAVenir = useMemo(() => {
    if (!demoActive) return vraisAVenir;
    const equipes = new Map();
    for (const m of matchs) {
      for (const e of [m.equipeDomicile, m.equipeExterieur]) if (e?.nom) equipes.set(e.nom, e);
    }
    return construireMatchsDemo([...equipes.values()]);
  }, [demoActive, vraisAVenir, matchs]);

  // Affiche/masque les flèches selon la position du défilement
  const majFleches = useCallback(() => {
    const el = barreRef.current;
    if (!el) return;
    setPeutGauche(el.scrollLeft > 8);
    setPeutDroite(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    majFleches();
    window.addEventListener('resize', majFleches);
    return () => window.removeEventListener('resize', majFleches);
  }, [matchs, majFleches]);

  // Défile de 2 cartes à la fois
  const scrollBarre = (dir) => {
    if (barreRef.current) barreRef.current.scrollBy({ left: dir * (LARGEUR_CARTE + 16) * 2, behavior: 'smooth' });
  };

  return (
    <div style={{ backgroundColor: theme.bg }}>
      {/* ── HERO PLEINE LARGEUR ───────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: '1020px', overflow: 'hidden' }}>

        {/* Images fond */}
        {ACTUS.map((a, i) => (
          <img key={i} src={a.img} alt=""
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover',
              opacity: i === indexActu ? 1 : 0,
              transition: 'opacity 0.6s ease',
            }}
          />
        ))}

        {/* Overlay : léger en haut, puis fondu vers le vert sombre du site
            pour que le hero se fonde dans la page (comme l'aubergine FIBA) */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(180deg,
            rgba(${theme.bgRgb},0.25) 0%,
            rgba(${theme.bgRgb},0.35) 35%,
            rgba(${theme.bgRgb},0.72) 62%,
            ${theme.bg} 92%)`,
        }} />

        {/* Contenu : tag + titre + bouton + ticker (style FIBA : posé en bas du
            visuel, juste au-dessus de la barre des matchs, aligné sur le contenu) */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: '450px',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '0 60px',
        }}>
          <div style={{ width: '100%', maxWidth: '1150px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <span style={{
              display: 'inline-block', backgroundColor: theme.red, color: '#fff',
              padding: '5px 14px', borderRadius: '6px',
              fontSize: '11px', fontWeight: 800, letterSpacing: '1.2px',
              textTransform: 'uppercase', marginBottom: '18px',
            }}>
              {actu.tag ? t(`actualites.tags.${actu.tag}`, { defaultValue: actu.tag }) : t('accueil.bienvenue.tag')}
            </span>

            <h2 style={{
              color: '#fff', fontWeight: 400, fontSize: '42px',
              lineHeight: 1.15, maxWidth: '820px', marginBottom: '24px',
              fontFamily: 'var(--font-titres)',
              textShadow: '0 3px 16px rgba(0,0,0,0.5)',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {texteActu(actu, 'titre')}
            </h2>

            <Link to={actu.slug ? `/actualites/${actu.slug}` : '/matchs'}
              className="group transition-all hover:brightness-110"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                backgroundColor: theme.red, color: '#fff',
                padding: '15px 30px', borderRadius: '32px',
                fontWeight: 800, fontSize: '14px', letterSpacing: '0.4px', textDecoration: 'none',
                textTransform: 'uppercase', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}>
              {sansActu ? t('accueil.bienvenue.bouton') : t('accueil.enSavoirPlus')}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>

            {/* ── TICKER D'ACTUS : 5 colonnes égales sur toute la largeur ───── */}
            {!sansActu && (
              <div style={{ width: '100%', marginTop: '44px', display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', columnGap: '24px' }}>
                {ACTUS.map((a, i) => {
                  const active = i === indexActu;
                  return (
                    <button
                      key={a.slug ?? i}
                      // 1er clic : affiche l'actu dans le hero ; clic sur l'actu déjà active : ouvre l'article
                      onClick={() => (active ? navigate(`/actualites/${a.slug}`) : goTo(i))}
                      title={active ? t('accueil.lireArticle') : texteActu(a, 'titre')}
                      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignSelf: 'start', textAlign: 'left', padding: 0, margin: 0, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', minWidth: 0 }}
                    >
                      {/* Barre de progression */}
                      <span style={{ display: 'block', position: 'relative', height: '3px', borderRadius: '3px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.25)', marginBottom: '14px' }}>
                        {active && (
                          <span style={{
                            position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: '3px',
                            backgroundColor: theme.greenBright, width: `${progress}%`,
                            boxShadow: `0 0 8px ${theme.greenBright}`,
                          }} />
                        )}
                      </span>
                      <span style={{
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        fontSize: '16px', lineHeight: 1.4,
                        fontFamily: 'var(--font-texte)',
                        color: active ? '#ffffff' : 'rgba(235,235,235,0.6)',
                        fontWeight: active ? 700 : 500,
                        textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                        transition: 'color 0.3s ease',
                      }}>
                        {texteActu(a, 'titre')}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── BARRE MATCHS (style FIBA) ────────────────────────────────────
            - En-tête "Matchs / Tous les matchs" aligné sur le contenu du hero
            - Rangée qui défile sur toute la largeur, première carte alignée
              sur le contenu
            - Grosses cartes blanches + flèches rondes posées sur les bords */}
        <div style={{ position: 'absolute', bottom: '36px', left: 0, right: 0 }}>
          <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '0 60px', boxSizing: 'content-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '19px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('accueil.matchs')}
              </span>
              <Link to="/matchs"
                className="flex items-center gap-1 transition-opacity hover:opacity-80"
                style={{ fontSize: '15px', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>
                {t('accueil.tousLesMatchs')} <ChevronRight size={18} />
              </Link>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div
              ref={barreRef}
              onScroll={majFleches}
              style={{
                display: 'flex', gap: '16px',
                overflowX: 'auto', scrollbarWidth: 'none',
                scrollSnapType: 'x mandatory',
                paddingLeft: DEBUT_RANGEE, paddingRight: DEBUT_RANGEE,
                scrollPaddingLeft: DEBUT_RANGEE,
                paddingTop: '4px', paddingBottom: '10px',
              }}
            >
              {loadingMatchs ? (
                <span style={{ fontSize: '14px', color: theme.textMuted }}>{t('commun.chargement')}</span>
              ) : matchsCarrousel.length === 0 ? (
                <span style={{ fontSize: '14px', color: theme.textMuted }}>{t('accueil.aucunMatch')}</span>
              ) : matchsCarrousel.map((m, i) => (
                <CarteMatch key={m.id ?? i} m={m} />
              ))}
            </div>

            {peutGauche && (
              <button onClick={() => scrollBarre(-1)} aria-label={t('accueil.matchsPrecedents')} style={FLECHE('left')}>
                <ChevronLeft size={20} color="#222" />
              </button>
            )}
            {peutDroite && (
              <button onClick={() => scrollBarre(1)} aria-label={t('accueil.matchsSuivants')} style={FLECHE('right')}>
                <ChevronRight size={20} color="#222" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── BANDE VERTE : En direct / prochains matchs ── */}
      <div style={{ position: 'relative', overflow: 'hidden', background: FOND_BANDE }}>
        <EclatsBande />

        {/* En direct / prochains matchs */}
        <SectionDirect
          matchsLive={matchsLive}
          matchsAVenir={matchsAVenir}
          matchsTermines={matchsTermines}
          isConnected={isConnected}
          demo={demoActive}
        />

      </div>

      {/* ── CLASSEMENTS (fond blanc, style FIBA) + MEILLEURS BUTEURS (bande verte) ── */}
      <SectionClassement signatureLive={signatureLive} live={matchsLive.length > 0} />

      {/* ── DERNIÈRES NOUVELLES (bande pleine largeur) ──────────────────── */}
      {articles.length > 0 && <SectionNouvelles articles={articles} />}
    </div>
  );
};

export default AccueilPage;