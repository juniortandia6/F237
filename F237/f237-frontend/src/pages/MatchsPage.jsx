// f237-frontend/src/pages/MatchsPage.jsx
// Calendrier des matchs, inspiré de FIBA :
// - zone haute sombre (dégradé vert F237) : titre, choix de la compétition, calendrier
// - zone basse claire : cartes de matchs + colonne "la journée en chiffres"

import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { locale } from '../i18n';
import { ChevronLeft, ChevronRight, EyeOff, Radio, CalendarClock } from 'lucide-react';
import { matchService } from '../services/matchService';
import { COMPETITIONS, ANNEE_ACTUELLE, SAISONS_DB, libelleSaison } from '../data/saisons';
import SelecteurSaison from '../components/SelecteurSaison';
import { useLiveScores } from '../hooks/useLiveScores';
import theme from '../theme';
import { etatMatch } from '../data/statutMatch';
import { useEcranMobile } from '../hooks/useEcranMobile';

// ── Couleurs de la zone claire ──────────────────────────────────────────
const CLAIR = {
  fond: '#eef1ef',
  carte: '#ffffff',
  bord: '#e2e7e4',
  texte: '#141414',
  doux: '#6b7470',
  perdant: '#9aa19d',
  tuile: '#f2f4f3',
  tuileHaut: '#e6eae8',
  vert: '#14532f',
  vertFonce: '#0f3d26',
};


// Clé de jour en heure LOCALE ("2026-06-30") — évite les décalages de fuseau
// qu'on avait avec toISOString() (qui travaille en UTC)
const cleJour = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const depuisCle = (cle) => {
  const [a, m, j] = cle.split('-').map(Number);
  return new Date(a, m - 1, j);
};
const heure = (date) => new Date(date).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });

// Fond de la zone haute : même dégradé + éclats que les bandes de l'accueil
const FOND_BANDE = `linear-gradient(120deg, ${theme.greenDeep} 0%, #12462c 45%, #0f3a25 100%)`;

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

// ── Petit interrupteur (comme "Masquer les scores" / "En direct" chez FIBA) ──
function Interrupteur({ actif, onChange, icone: Icone, children }) {
  const mobile = useEcranMobile();
  return (
    <button
      onClick={() => onChange(!actif)}
      aria-pressed={actif}
      style={{
        flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: mobile ? '8px' : '10px',
        padding: mobile ? '12px 10px' : '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
        color: CLAIR.doux, fontSize: mobile ? '13px' : '14px', fontWeight: 600, lineHeight: 1.2,
      }}
    >
      {!mobile && <Icone size={16} />}
      <span style={{ textAlign: 'left' }}>{children}</span>
      <span style={{
        position: 'relative', width: '44px', height: '24px', borderRadius: '999px', flexShrink: 0,
        backgroundColor: actif ? theme.green : '#d5dbd8', transition: 'background-color 0.2s ease',
      }}>
        <span style={{
          position: 'absolute', top: '3px', left: actif ? '23px' : '3px',
          width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left 0.2s ease',
        }} />
      </span>
    </button>
  );
}

// ── Une tuile du calendrier ─────────────────────────────────────────────
function TuileDate({ cle, active, aujourdhui, nbMatchs, onClick }) {
  const { t } = useTranslation();
  const d = depuisCle(cle);
  const jourSemaine = d.toLocaleDateString(locale(), { weekday: 'short' }).replace('.', '');
  const mois = d.toLocaleDateString(locale(), { month: 'short' }).replace('.', '').toUpperCase();

  return (
    <button
      data-actif={active}
      onClick={onClick}
      style={{
        position: 'relative', flex: '0 0 104px', borderRadius: '10px', overflow: 'hidden',
        border: 'none', cursor: 'pointer', textAlign: 'center',
        backgroundColor: active ? CLAIR.vert : CLAIR.tuile,
        color: active ? '#fff' : CLAIR.texte,
        transition: 'background-color 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = '#e8ece9'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = CLAIR.tuile; }}
    >
      {/* Bandeau année */}
      <div style={{
        padding: '4px 0', fontSize: '12px', fontWeight: 600,
        backgroundColor: active ? CLAIR.vertFonce : CLAIR.tuileHaut,
        color: active ? 'rgba(255,255,255,0.8)' : CLAIR.doux,
      }}>
        {d.getFullYear()}
      </div>
      <div style={{ padding: '8px 4px 10px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, textTransform: 'capitalize', opacity: active ? 0.95 : 0.75 }}>{jourSemaine}</div>
        <div style={{ fontSize: '30px', fontWeight: 800, lineHeight: 1.1, fontFamily: '"Barlow Condensed", Arial, sans-serif' }}>
          {String(d.getDate()).padStart(2, '0')}
        </div>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', opacity: active ? 0.9 : 0.7 }}>{mois}</div>
        <div style={{ fontSize: '10px', marginTop: '4px', color: active ? theme.yellow : CLAIR.doux, fontWeight: 700 }}>
          {t('matchs.nbMatchs', { count: nbMatchs })}
        </div>
      </div>
      {aujourdhui && (
        <span style={{
          position: 'absolute', top: '26px', right: '6px',
          width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.red,
        }} title={t('matchs.aujourdhui')} />
      )}
    </button>
  );
}

// ── Une ligne d'équipe dans une carte de match ──────────────────────────
function LigneEquipe({ equipe, score, gagnant, perdant, masquer, aVenir }) {
  const mobile = useEcranMobile();
  const couleur = perdant && !masquer ? CLAIR.perdant : CLAIR.texte;
  const logo = mobile ? '24px' : '28px';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? '10px' : '12px', minWidth: 0 }}>
        {equipe?.logoUrl
          ? <img src={equipe.logoUrl} alt="" style={{ width: logo, height: logo, objectFit: 'contain', flexShrink: 0 }} />
          : <span style={{
              width: logo, height: logo, borderRadius: '50%', backgroundColor: '#eceeed', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: CLAIR.doux,
            }}>{equipe?.nom?.substring(0, 2).toUpperCase()}</span>}
        <span style={{ fontSize: mobile ? '16px' : '18px', fontWeight: 700, color: couleur, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {equipe?.nom ?? '—'}
        </span>
      </div>
      {!aVenir && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: mobile ? '18px' : '20px', fontWeight: 800, color: couleur, minWidth: '22px', textAlign: 'right' }}>
            {masquer ? '–' : (score ?? '–')}
          </span>
          {/* Triangle rouge vers le score gagnant */}
          <span style={{
            width: 0, height: 0,
            borderTop: '6px solid transparent', borderBottom: '6px solid transparent',
            borderRight: `7px solid ${gagnant && !masquer ? theme.red : 'transparent'}`,
          }} />
        </div>
      )}
    </div>
  );
}

// ── Carte d'un match (style FIBA) — cliquable, ouvre la page du match ───
function CarteMatch({ m, competition, masquer }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const mobile = useEcranMobile();
  // 'live' | 'termine' | 'aVenir' | 'reporte' | 'annule' | 'nonDispute'
  const etat = etatMatch(m);
  const termine = etat === 'termine';
  const live = etat === 'live';
  const aVenir = etat === 'aVenir';
  const sansScore = !termine && !live; // à venir, reporté, annulé ou non disputé
  const dom = m.scoreDomicile, ext = m.scoreExterieur;
  const domGagne = (termine || live) && dom > ext;
  const extGagne = (termine || live) && ext > dom;
  const journee = m.journee ?? m.numeroJournee ?? m.round ?? null;

  // On passe le match dans le "state" du routeur : la page détail s'affiche tout de suite
  const ouvrir = () => navigate(`/matchs/${m.id}`, { state: { match: m } });

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={ouvrir}
      onKeyDown={e => { if (e.key === 'Enter') ouvrir(); }}
      className="transition-shadow hover:shadow-lg"
      style={{
        backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '14px',
        overflow: 'hidden', cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'stretch', padding: mobile ? '14px 14px 14px 16px' : '16px 20px' }}>
        {/* Gauche : en-tête + équipes */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: mobile ? '12px' : '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: mobile ? '11px' : '12px', fontWeight: 700, color: '#2c312e', textTransform: 'uppercase', letterSpacing: '0.4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {journee ? `${t('matchs.journee', { n: journee })} · ` : ''}{mobile ? '' : 'MTN '}{competition}
            </span>
            {live ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: theme.red }}>
                <span className="animate-pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: theme.red }} />
                {m.statutCourt === 'HT' ? t('commun.miTempsMaj') : `${t('commun.enDirectMaj')}${m.minute ? ` · ${m.minute}${m.minuteExtra ? `+${m.minuteExtra}` : ''}'` : ''}`}
              </span>
            ) : (
              <span style={{ fontSize: '12px', fontWeight: 700, color: CLAIR.doux, textTransform: 'uppercase' }}>
                {t(`commun.${etat}`)}
              </span>
            )}
          </div>
          <LigneEquipe equipe={m.equipeDomicile} score={dom} gagnant={domGagne} perdant={extGagne} masquer={masquer} aVenir={sansScore} />
          <LigneEquipe equipe={m.equipeExterieur} score={ext} gagnant={extGagne} perdant={domGagne} masquer={masquer} aVenir={sansScore} />
        </div>

        {/* Droite : séparateur + heure ou bouton détail */}
        <div style={{
          borderLeft: `1px solid ${CLAIR.bord}`, paddingLeft: mobile ? '12px' : '20px', minWidth: mobile ? '78px' : '120px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }}>
          {sansScore ? (
            <>
              <span style={{
                backgroundColor: aVenir || etat === 'reporte' ? CLAIR.texte : '#c9cfcc', color: '#fff',
                textDecoration: etat === 'annule' ? 'line-through' : 'none', fontWeight: 800, fontSize: mobile ? '15px' : '16px', padding: mobile ? '7px 10px' : '8px 14px', borderRadius: '8px' }}>
                {heure(m.dateMatch)}
              </span>
              {aVenir && (
                <Link to="/jouer" onClick={e => e.stopPropagation()}
                  style={{ fontSize: '12px', fontWeight: 700, color: theme.green, textDecoration: 'none' }}>
                  {t('matchs.pronostiquer')} →
                </Link>
              )}
            </>
          ) : (
            <span
              className="transition-colors"
              style={{
                backgroundColor: '#eceeed', color: '#2c312e', borderRadius: '8px', padding: mobile ? '8px 12px' : '9px 16px',
                fontSize: mobile ? '14px' : '15px', fontWeight: 600,
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = CLAIR.vert; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#eceeed'; e.currentTarget.style.color = '#2c312e'; }}
            >
              {t('commun.plus')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Colonne de droite : la journée en chiffres ──────────────────────────
function ResumeJournee({ matchs, masquer }) {
  const { t } = useTranslation();
  const joues = matchs.filter(m => m.statut === 2 || m.statut === 1);
  const totalButs = joues.reduce((s, m) => s + (m.scoreDomicile ?? 0) + (m.scoreExterieur ?? 0), 0);
  // L'API ne donne pas toujours le nom des buteurs : on compte les buts sans buteur connu
  const inconnu = (nom) => !nom || /inconnu|unknown/i.test(nom);
  const buteurs = {};
  let butsAttribues = 0; // buts avec un buteur connu (ou contre son camp)
  for (const m of joues) for (const b of m.buts ?? []) {
    if (b.estButCSC) { butsAttribues++; continue; }
    if (inconnu(b.nomJoueur)) continue;
    butsAttribues++;
    const cle = `${b.nomJoueur}|${b.nomEquipe}`;
    buteurs[cle] = { nom: b.nomJoueur, equipe: b.nomEquipe, buts: (buteurs[cle]?.buts ?? 0) + 1 };
  }
  const topButeurs = Object.values(buteurs).sort((a, b) => b.buts - a.buts).slice(0, 5);
  const butsSansButeur = Math.max(0, totalButs - butsAttribues);

  const chiffres = [
    [t('matchs.chiffres.matchs'), matchs.length],
    [t('matchs.chiffres.buts'), masquer ? '–' : totalButs],
    [t('matchs.chiffres.moyenne'), masquer || !joues.length ? '–' : (totalButs / joues.length).toFixed(1)],
  ];

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: CLAIR.vert, color: '#fff', padding: '12px 18px', fontWeight: 800, fontSize: '15px' }}>
          {t('matchs.journeeEnChiffres')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {chiffres.map(([label, val], i) => (
            <div key={label} style={{ padding: '16px 8px', textAlign: 'center', borderLeft: i ? `1px solid ${CLAIR.bord}` : 'none' }}>
              <div style={{ fontSize: '26px', fontWeight: 800, color: CLAIR.texte, fontFamily: '"Barlow Condensed", Arial, sans-serif' }}>{val}</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: CLAIR.doux, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '14px', padding: '16px 18px' }}>
        <div style={{ fontWeight: 800, fontSize: '15px', color: CLAIR.texte, marginBottom: '10px' }}>{t('matchs.buteursDuJour')}</div>
        {masquer ? (
          <p style={{ fontSize: '13px', color: CLAIR.doux }}>{t('matchs.masqueSurprise')}</p>
        ) : topButeurs.length === 0 ? (
          /* Aucun nom de buteur : soit il n'y a pas eu de but, soit l'API ne les a pas encore donnés */
          <p style={{ fontSize: '13px', color: CLAIR.doux, lineHeight: 1.5 }}>
            {totalButs > 0 ? t('matchs.butsSansButeurs', { count: totalButs }) : t('matchs.aucunBut')}
          </p>
        ) : topButeurs.map((j, i) => (
          <div key={`${j.nom}|${j.equipe}`} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
            padding: '8px 0', borderTop: i ? `1px solid ${CLAIR.bord}` : 'none',
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: CLAIR.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.nom}</div>
              <div style={{ fontSize: '12px', color: CLAIR.doux }}>{j.equipe}</div>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: CLAIR.vert }}>{j.buts}</span>
          </div>
        ))}
        {/* Une partie des buts sans buteur connu */}
        {!masquer && topButeurs.length > 0 && butsSansButeur > 0 && (
          <p style={{ fontSize: '12px', color: CLAIR.doux, paddingTop: '8px', borderTop: `1px solid ${CLAIR.bord}` }}>
            {t('matchs.butsNonAttribues', { count: butsSansButeur })}
          </p>
        )}
      </div>
    </aside>
  );
}

// ── Page ────────────────────────────────────────────────────────────────
const MatchsPage = () => {
  const { t } = useTranslation();
  const mobile = useEcranMobile();
  const [matchs, setMatchs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [annee, setAnnee] = useState(ANNEE_ACTUELLE);
  // Lien depuis l'accueil : /matchs?date=2026-11-07&comp=two
  const [parametres] = useSearchParams();
  const dateVoulue = parametres.get('date');
  const [comp, setComp] = useState(parametres.get('comp') === 'two' ? 'two' : 'one');
  const saisonId = SAISONS_DB[annee]?.[comp] ?? null; // null = pas encore de données
  const [dateSelectionnee, setDateSelectionnee] = useState(null);
  const [masquerScores, setMasquerScores] = useState(false);
  const [directSeulement, setDirectSeulement] = useState(false);
  const calRef = useRef(null);
  const { matchsLive } = useLiveScores();

  // Change de saison ou de compétition : on vide l'écran et on lance le chargement ici
  // (et pas dans l'effet, pour respecter la règle ESLint set-state-in-effect)
  const changerSelection = (nouvelleAnnee, nouvelleComp) => {
    if (nouvelleAnnee === annee && nouvelleComp === comp) return;
    const nouvelId = SAISONS_DB[nouvelleAnnee]?.[nouvelleComp] ?? null;
    setAnnee(nouvelleAnnee);
    setComp(nouvelleComp);
    setMatchs([]);
    setDateSelectionnee(null);
    setDirectSeulement(false);
    setLoading(nouvelId != null);
  };

  useEffect(() => {
    if (saisonId == null) return; // saison pas encore importée : rien à charger
    let ignore = false;
    matchService.getBySaison(saisonId)
      .then(data => {
        if (ignore) return;
        setMatchs(data);
        setLoading(false);
        // Date par défaut : le prochain jour de match (ou le dernier s'il n'y en a plus)
        const aujourd = cleJour(new Date());
        const dates = [...new Set(data.map(m => cleJour(m.dateMatch)))].sort();
        setDateSelectionnee(dateVoulue && dates.includes(dateVoulue)
          ? dateVoulue
          : dates.find(d => d >= aujourd) ?? dates[dates.length - 1] ?? null);
      })
      .catch(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [saisonId, dateVoulue]);

  // Scores en direct (SignalR) : on met à jour les matchs correspondants
  const matchsAJour = useMemo(() => {
    if (!matchsLive?.length) return matchs;
    const live = new Map(matchsLive.map(l => [l.apiFootballId, l]));
    return matchs.map(m => {
      const l = m.apiFootballId != null ? live.get(m.apiFootballId) : null;
      return l ? { ...m, statut: 1, scoreDomicile: l.scoreDomicile, scoreExterieur: l.scoreExterieur, minute: l.minuteLive ?? l.minute ?? m.minuteLive ?? m.minute, statutCourt: l.statutCourt, minuteExtra: l.minuteExtra, buts: l.buts ?? m.buts } : m;
    });
  }, [matchs, matchsLive]);

  const parJour = useMemo(() => {
    const map = new Map();
    for (const m of matchsAJour) {
      const cle = cleJour(m.dateMatch);
      if (!map.has(cle)) map.set(cle, []);
      map.get(cle).push(m);
    }
    for (const liste of map.values()) liste.sort((a, b) => new Date(a.dateMatch) - new Date(b.dateMatch));
    return map;
  }, [matchsAJour]);

  const datesUniques = useMemo(() => [...parJour.keys()].sort(), [parJour]);
  const aujourd = cleJour(new Date());
  const nbLive = matchsAJour.filter(m => m.statut === 1).length;

  const matchsAffiches = directSeulement
    ? matchsAJour.filter(m => m.statut === 1)
    : (parJour.get(dateSelectionnee) ?? []);

  const competition = COMPETITIONS.find(c => c.cle === comp)?.label ?? '';
  const pasDeDonnees = saisonId == null;

  // Amène la date sélectionnée au centre du calendrier
  useEffect(() => {
    const tuile = calRef.current?.querySelector('[data-actif="true"]');
    if (tuile) {
      const cal = calRef.current;
      cal.scrollTo({ left: tuile.offsetLeft - cal.clientWidth / 2 + tuile.clientWidth / 2, behavior: 'smooth' });
    }
  }, [dateSelectionnee, datesUniques.length]);

  const scrollCal = (dir) => calRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });

  const FLECHE = {
    flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%',
    backgroundColor: '#fff', border: `1px solid ${CLAIR.bord}`, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  };

  return (
    <div>
      {/* ── ZONE HAUTE : fond sombre + calendrier ──────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: FOND_BANDE, padding: mobile ? '28px 0 32px' : '56px 0 64px' }}>
        <EclatsBande />

        <div style={{ position: 'relative', maxWidth: '1150px', margin: '0 auto', padding: '0 var(--marge-page)', boxSizing: 'content-box' }}>
          {/* Titre + choix de la compétition */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: mobile ? '14px' : '20px', flexWrap: 'wrap', marginBottom: mobile ? '20px' : '28px' }}>
            <div>
              <SelecteurSaison annee={annee} onChange={a => changerSelection(a, comp)} />
              <h1 style={{ color: '#fff', fontSize: mobile ? '30px' : '42px', fontWeight: 400, lineHeight: 1.1, fontFamily: 'var(--font-titres)' }}>
                {t('matchs.titre')}
              </h1>
            </div>

            {/* Téléphone : le sélecteur prend toute la largeur, deux moitiés égales */}
            <div style={{ display: 'flex', width: mobile ? '100%' : 'auto', padding: '4px', borderRadius: '999px', backgroundColor: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.12)' }}>
              {COMPETITIONS.map(c => {
                const actif = c.cle === comp;
                return (
                  <button key={c.cle}
                    onClick={() => changerSelection(annee, c.cle)}
                    style={{
                      flex: mobile ? 1 : 'none', whiteSpace: 'nowrap',
                      padding: mobile ? '10px 8px' : '10px 22px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                      fontSize: mobile ? '13px' : '14px', fontWeight: 700, letterSpacing: '0.5px',
                      backgroundColor: actif ? '#fff' : 'transparent',
                      color: actif ? CLAIR.vertFonce : 'rgba(255,255,255,0.8)',
                      transition: 'all 0.2s ease',
                    }}>
                    MTN {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Carte blanche du calendrier */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 16px 40px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: mobile ? '14px 12px' : '20px 20px' }}>
              <button onClick={() => scrollCal(-1)} aria-label={t('matchs.datesPrecedentes')} className="fleche-carrousel" style={FLECHE}>
                <ChevronLeft size={20} color="#222" />
              </button>

              <div ref={calRef} style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none', flex: 1, padding: '2px' }}>
                {loading ? (
                  <span style={{ padding: '30px 10px', color: CLAIR.doux, fontSize: '14px' }}>{t('matchs.chargementCalendrier')}</span>
                ) : datesUniques.length === 0 ? (
                  <span style={{ padding: '30px 10px', color: CLAIR.doux, fontSize: '14px' }}>
                    {pasDeDonnees ? t('matchs.calendrierBientot', { s: libelleSaison(annee) }) : t('matchs.aucunProgramme')}
                  </span>
                ) : datesUniques.map(cle => (
                  <TuileDate
                    key={cle}
                    cle={cle}
                    active={!directSeulement && cle === dateSelectionnee}
                    aujourdhui={cle === aujourd}
                    nbMatchs={parJour.get(cle)?.length ?? 0}
                    onClick={() => { setDateSelectionnee(cle); setDirectSeulement(false); }}
                  />
                ))}
              </div>

              <button onClick={() => scrollCal(1)} aria-label={t('matchs.datesSuivantes')} className="fleche-carrousel" style={FLECHE}>
                <ChevronRight size={20} color="#222" />
              </button>
            </div>

            {/* Barre du bas : interrupteurs */}
            <div style={{ display: 'flex', borderTop: `1px solid ${CLAIR.bord}` }}>
              <Interrupteur actif={masquerScores} onChange={setMasquerScores} icone={EyeOff}>
                {t('matchs.masquerScores')}
              </Interrupteur>
              <div style={{ width: '1px', backgroundColor: CLAIR.bord }} />
              <Interrupteur actif={directSeulement} onChange={setDirectSeulement} icone={Radio}>
                {t('commun.enDirect')} ({nbLive})
              </Interrupteur>
            </div>
          </div>
        </div>
      </section>

      {/* ── ZONE BASSE : fond clair + matchs ───────────────────────────── */}
      <section style={{ backgroundColor: CLAIR.fond, minHeight: '480px', padding: mobile ? '24px 0 40px' : '36px 0 64px' }}>
        <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '0 var(--marge-page)', boxSizing: 'content-box' }}>
          {/* Date affichée */}
          <h2 style={{ fontSize: mobile ? '18px' : '22px', fontWeight: 800, color: CLAIR.texte, marginBottom: mobile ? '14px' : '18px', textTransform: 'capitalize' }}>
            {directSeulement
              ? t('matchs.matchsEnDirect')
              : dateSelectionnee
                ? depuisCle(dateSelectionnee).toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                : ''}
          </h2>

          {pasDeDonnees ? (
            /* Saison pas encore importée dans la base */
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center',
              padding: '56px 24px', backgroundColor: CLAIR.carte, border: `1px dashed ${CLAIR.bord}`, borderRadius: '14px',
            }}>
              <span style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#e8f3ec', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarClock size={26} color={CLAIR.vert} />
              </span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: CLAIR.texte }}>
                MTN {competition} · {t('saison.saison', { s: libelleSaison(annee) })}
              </div>
              <p style={{ fontSize: '15px', color: CLAIR.doux, maxWidth: '440px', lineHeight: 1.5 }}>
                {t('matchs.saisonIndispo')}
              </p>
              <button
                onClick={() => changerSelection(ANNEE_ACTUELLE, comp)}
                style={{
                  marginTop: '6px', padding: '10px 20px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                  backgroundColor: CLAIR.vert, color: '#fff', fontSize: '14px', fontWeight: 700,
                }}>
                {t('matchs.revenirSaison', { s: libelleSaison(ANNEE_ACTUELLE) })}
              </button>
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" style={{ alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? '12px' : '14px', minWidth: 0 }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: CLAIR.doux }}>{t('commun.chargement')}</div>
              ) : matchsAffiches.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '48px 20px', color: CLAIR.doux,
                  backgroundColor: CLAIR.carte, border: `1px dashed ${CLAIR.bord}`, borderRadius: '14px',
                }}>
                  {directSeulement ? t('matchs.aucunEnDirect') : t('matchs.aucunCetteDate')}
                </div>
              ) : matchsAffiches.map(m => (
                <CarteMatch key={m.id} m={m} competition={competition} masquer={masquerScores} />
              ))}
            </div>

            {!directSeulement && !loading && <ResumeJournee matchs={matchsAffiches} masquer={masquerScores} />}
          </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MatchsPage;