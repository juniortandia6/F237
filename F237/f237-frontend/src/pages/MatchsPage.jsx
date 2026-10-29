// f237-frontend/src/pages/MatchsPage.jsx
// Calendrier des matchs, inspiré de FIBA :
// - zone haute sombre (dégradé vert F237) : titre, choix de la compétition, calendrier
// - zone basse claire : cartes de matchs + colonne "la journée en chiffres"

import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown, Check, EyeOff, Radio, CalendarClock } from 'lucide-react';
import { matchService } from '../services/matchService';
import { COMPETITIONS, ANNEE_ACTUELLE, SAISONS, SAISONS_DB } from '../data/saisons';
import { useLiveScores } from '../hooks/useLiveScores';
import theme from '../theme';

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
const heure = (date) => new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

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
  return (
    <button
      onClick={() => onChange(!actif)}
      aria-pressed={actif}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
        color: CLAIR.doux, fontSize: '14px', fontWeight: 600,
      }}
    >
      <Icone size={16} />
      {children}
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
  const d = depuisCle(cle);
  const jourSemaine = d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '');
  const mois = d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '').toUpperCase();

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
          {nbMatchs} match{nbMatchs > 1 ? 's' : ''}
        </div>
      </div>
      {aujourdhui && (
        <span style={{
          position: 'absolute', top: '26px', right: '6px',
          width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.red,
        }} title="Aujourd'hui" />
      )}
    </button>
  );
}

// ── Une ligne d'équipe dans une carte de match ──────────────────────────
function LigneEquipe({ equipe, score, gagnant, perdant, masquer, aVenir }) {
  const couleur = perdant && !masquer ? CLAIR.perdant : CLAIR.texte;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {equipe?.logoUrl
          ? <img src={equipe.logoUrl} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain', flexShrink: 0 }} />
          : <span style={{
              width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eceeed', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: CLAIR.doux,
            }}>{equipe?.nom?.substring(0, 2).toUpperCase()}</span>}
        <span style={{ fontSize: '18px', fontWeight: 700, color: couleur, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {equipe?.nom ?? '—'}
        </span>
      </div>
      {!aVenir && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: couleur, minWidth: '26px', textAlign: 'right' }}>
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
  const termine = m.statut === 2;
  const live = m.statut === 1;
  const aVenir = m.statut === 0;
  const reporte = m.statut === 3;
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
      <div style={{ display: 'flex', alignItems: 'stretch', padding: '16px 20px' }}>
        {/* Gauche : en-tête + équipes */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#2c312e', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {journee ? `Journée ${journee} · ` : ''}MTN {competition}
            </span>
            {live ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: theme.red }}>
                <span className="animate-pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: theme.red }} />
                EN DIRECT{m.minute ? ` · ${m.minute}'` : ''}
              </span>
            ) : (
              <span style={{ fontSize: '12px', fontWeight: 700, color: CLAIR.doux, textTransform: 'uppercase' }}>
                {termine ? 'Terminé' : reporte ? 'Reporté' : 'À venir'}
              </span>
            )}
          </div>
          <LigneEquipe equipe={m.equipeDomicile} score={dom} gagnant={domGagne} perdant={extGagne} masquer={masquer} aVenir={aVenir || reporte} />
          <LigneEquipe equipe={m.equipeExterieur} score={ext} gagnant={extGagne} perdant={domGagne} masquer={masquer} aVenir={aVenir || reporte} />
        </div>

        {/* Droite : séparateur + heure ou bouton détail */}
        <div style={{
          borderLeft: `1px solid ${CLAIR.bord}`, paddingLeft: '20px', minWidth: '120px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }}>
          {aVenir || reporte ? (
            <>
              <span style={{ backgroundColor: CLAIR.texte, color: '#fff', fontWeight: 800, fontSize: '16px', padding: '8px 14px', borderRadius: '8px' }}>
                {heure(m.dateMatch)}
              </span>
              {aVenir && (
                <Link to="/jouer" onClick={e => e.stopPropagation()}
                  style={{ fontSize: '12px', fontWeight: 700, color: theme.green, textDecoration: 'none' }}>
                  Pronostiquer →
                </Link>
              )}
            </>
          ) : (
            <span
              className="transition-colors"
              style={{
                backgroundColor: '#eceeed', color: '#2c312e', borderRadius: '8px', padding: '9px 16px',
                fontSize: '15px', fontWeight: 600,
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = CLAIR.vert; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#eceeed'; e.currentTarget.style.color = '#2c312e'; }}
            >
              + Plus
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Colonne de droite : la journée en chiffres ──────────────────────────
function ResumeJournee({ matchs, masquer }) {
  const joues = matchs.filter(m => m.statut === 2 || m.statut === 1);
  const totalButs = joues.reduce((s, m) => s + (m.scoreDomicile ?? 0) + (m.scoreExterieur ?? 0), 0);
  const buteurs = {};
  for (const m of joues) for (const b of m.buts ?? []) {
    if (b.estButCSC || !b.nomJoueur || b.nomJoueur === 'Inconnu') continue;
    const cle = `${b.nomJoueur}|${b.nomEquipe}`;
    buteurs[cle] = { nom: b.nomJoueur, equipe: b.nomEquipe, buts: (buteurs[cle]?.buts ?? 0) + 1 };
  }
  const topButeurs = Object.values(buteurs).sort((a, b) => b.buts - a.buts).slice(0, 5);

  const chiffres = [
    ['Matchs', matchs.length],
    ['Buts', masquer ? '–' : totalButs],
    ['Moy. / match', masquer || !joues.length ? '–' : (totalButs / joues.length).toFixed(1)],
  ];

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: CLAIR.vert, color: '#fff', padding: '12px 18px', fontWeight: 800, fontSize: '15px' }}>
          La journée en chiffres
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
        <div style={{ fontWeight: 800, fontSize: '15px', color: CLAIR.texte, marginBottom: '10px' }}>Buteurs du jour</div>
        {masquer ? (
          <p style={{ fontSize: '13px', color: CLAIR.doux }}>Masqué pour ne pas gâcher la surprise.</p>
        ) : topButeurs.length === 0 ? (
          <p style={{ fontSize: '13px', color: CLAIR.doux }}>Aucun but enregistré ce jour-là.</p>
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
      </div>
    </aside>
  );
}

// ── Bouton de choix de la saison (menu déroulant) ───────────────────────
function SelecteurSaison({ annee, onChange }) {
  const [ouvert, setOuvert] = useState(false);
  const ref = useRef(null);

  // Ferme le menu quand on clique ailleurs ou qu'on appuie sur Échap
  useEffect(() => {
    if (!ouvert) return;
    const clic = (e) => { if (!ref.current?.contains(e.target)) setOuvert(false); };
    const touche = (e) => { if (e.key === 'Escape') setOuvert(false); };
    document.addEventListener('mousedown', clic);
    document.addEventListener('keydown', touche);
    return () => {
      document.removeEventListener('mousedown', clic);
      document.removeEventListener('keydown', touche);
    };
  }, [ouvert]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
      <button
        onClick={() => setOuvert(o => !o)}
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
        Saison {annee}
        <ChevronDown size={15} style={{ transition: 'transform 0.2s ease', transform: ouvert ? 'rotate(180deg)' : 'none' }} />
      </button>

      {ouvert && (
        <ul role="listbox" style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 20, minWidth: '230px',
          maxHeight: '300px', overflowY: 'auto', listStyle: 'none', margin: 0, padding: '6px',
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
                  onClick={() => { onChange(a); setOuvert(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                    padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left',
                    backgroundColor: actif ? '#e8f3ec' : 'transparent',
                    color: CLAIR.texte, fontSize: '15px', fontWeight: actif ? 800 : 600,
                  }}
                  onMouseEnter={e => { if (!actif) e.currentTarget.style.backgroundColor = CLAIR.tuile; }}
                  onMouseLeave={e => { if (!actif) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span>Saison {a}</span>
                  {actif
                    ? <Check size={16} color={CLAIR.vert} />
                    : !dispo && <span style={{ fontSize: '11px', fontWeight: 700, color: CLAIR.doux, backgroundColor: CLAIR.tuile, padding: '2px 8px', borderRadius: '999px' }}>Bientôt</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────
const MatchsPage = () => {
  const [matchs, setMatchs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [annee, setAnnee] = useState(ANNEE_ACTUELLE);
  const [comp, setComp] = useState('one');
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
        setDateSelectionnee(dates.find(d => d >= aujourd) ?? dates[dates.length - 1] ?? null);
      })
      .catch(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [saisonId]);

  // Scores en direct (SignalR) : on met à jour les matchs correspondants
  const matchsAJour = useMemo(() => {
    if (!matchsLive?.length) return matchs;
    const live = new Map(matchsLive.map(l => [l.apiFootballId, l]));
    return matchs.map(m => {
      const l = m.apiFootballId != null ? live.get(m.apiFootballId) : null;
      return l ? { ...m, statut: 1, scoreDomicile: l.scoreDomicile, scoreExterieur: l.scoreExterieur, minute: l.minute ?? m.minute } : m;
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
      <section style={{ position: 'relative', overflow: 'hidden', background: FOND_BANDE, padding: '56px 0 64px' }}>
        <EclatsBande />

        <div style={{ position: 'relative', maxWidth: '1150px', margin: '0 auto', padding: '0 60px', boxSizing: 'content-box' }}>
          {/* Titre + choix de la compétition */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <div>
              <SelecteurSaison annee={annee} onChange={a => changerSelection(a, comp)} />
              <h1 style={{ color: '#fff', fontSize: '42px', fontWeight: 400, lineHeight: 1.1, fontFamily: '"Permanent Marker", "Raleway", Arial, sans-serif' }}>
                Calendrier des matchs
              </h1>
            </div>

            <div style={{ display: 'flex', padding: '4px', borderRadius: '999px', backgroundColor: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.12)' }}>
              {COMPETITIONS.map(c => {
                const actif = c.cle === comp;
                return (
                  <button key={c.cle}
                    onClick={() => changerSelection(annee, c.cle)}
                    style={{
                      padding: '10px 22px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                      fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 20px' }}>
              <button onClick={() => scrollCal(-1)} aria-label="Dates précédentes" style={FLECHE}>
                <ChevronLeft size={20} color="#222" />
              </button>

              <div ref={calRef} style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none', flex: 1, padding: '2px' }}>
                {loading ? (
                  <span style={{ padding: '30px 10px', color: CLAIR.doux, fontSize: '14px' }}>Chargement du calendrier...</span>
                ) : datesUniques.length === 0 ? (
                  <span style={{ padding: '30px 10px', color: CLAIR.doux, fontSize: '14px' }}>
                    {pasDeDonnees ? `Le calendrier de la saison ${annee} arrive bientôt.` : 'Aucun match programmé.'}
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

              <button onClick={() => scrollCal(1)} aria-label="Dates suivantes" style={FLECHE}>
                <ChevronRight size={20} color="#222" />
              </button>
            </div>

            {/* Barre du bas : interrupteurs */}
            <div style={{ display: 'flex', borderTop: `1px solid ${CLAIR.bord}` }}>
              <Interrupteur actif={masquerScores} onChange={setMasquerScores} icone={EyeOff}>
                Masquer les scores
              </Interrupteur>
              <div style={{ width: '1px', backgroundColor: CLAIR.bord }} />
              <Interrupteur actif={directSeulement} onChange={setDirectSeulement} icone={Radio}>
                En direct ({nbLive})
              </Interrupteur>
            </div>
          </div>
        </div>
      </section>

      {/* ── ZONE BASSE : fond clair + matchs ───────────────────────────── */}
      <section style={{ backgroundColor: CLAIR.fond, minHeight: '480px', padding: '36px 0 64px' }}>
        <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '0 60px', boxSizing: 'content-box' }}>
          {/* Date affichée */}
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: CLAIR.texte, marginBottom: '18px', textTransform: 'capitalize' }}>
            {directSeulement
              ? 'Matchs en direct'
              : dateSelectionnee
                ? depuisCle(dateSelectionnee).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
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
                MTN {competition} · Saison {annee}
              </div>
              <p style={{ fontSize: '15px', color: CLAIR.doux, maxWidth: '440px', lineHeight: 1.5 }}>
                Les matchs de cette saison ne sont pas encore disponibles sur F237. Ils arrivent bientôt !
              </p>
              <button
                onClick={() => changerSelection(ANNEE_ACTUELLE, comp)}
                style={{
                  marginTop: '6px', padding: '10px 20px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                  backgroundColor: CLAIR.vert, color: '#fff', fontSize: '14px', fontWeight: 700,
                }}>
                Revenir à la saison {ANNEE_ACTUELLE}
              </button>
            </div>
          ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" style={{ alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: CLAIR.doux }}>Chargement...</div>
              ) : matchsAffiches.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '48px 20px', color: CLAIR.doux,
                  backgroundColor: CLAIR.carte, border: `1px dashed ${CLAIR.bord}`, borderRadius: '14px',
                }}>
                  {directSeulement ? 'Aucun match en direct pour le moment.' : 'Aucun match pour cette date.'}
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