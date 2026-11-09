// f237-frontend/src/pages/JouerPage.jsx
// Fantasy / paris, dans le style des autres pages :
// - non connecté : bande sombre avec présentation + boutons
// - connecté : bande sombre (salut + stats) puis zone claire (paris + colonne amis / conversion)

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { locale } from '../i18n';
import { Trophy, TrendingUp, Users, Plus, Loader2, Gift, Target, Coins, Smartphone, ArrowRight, CalendarDays, Clock, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { matchService } from '../services/matchService';
import { COMPETITIONS, SAISONS_DB, ANNEE_ACTUELLE } from '../data/saisons';
import theme from '../theme';

// ── Couleurs de la zone claire (mêmes que les autres pages) ─────────────
const CLAIR = {
  fond: '#eef1ef',
  carte: '#ffffff',
  bord: '#e2e7e4',
  texte: '#141414',
  doux: '#6b7470',
  tuile: '#f2f4f3',
  vert: '#14532f',
};
const CHIFFRES = '"Barlow Condensed", Arial, sans-serif';
const MARQUEUR = 'var(--font-titres)';
const CONTENEUR = { position: 'relative', maxWidth: '1150px', margin: '0 auto', padding: '0 60px', boxSizing: 'content-box' };
const FOND_BANDE = `linear-gradient(120deg, ${theme.greenDeep} 0%, #12462c 45%, #0f3a25 100%)`;

const MISE_MIN = 10;
const MISE_MAX = 500;
const MISE_DEFAUT = 50;

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

const heure = (iso) => new Date(iso).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });
const jourCourt = (iso) => new Date(iso).toLocaleDateString(locale(), { weekday: 'short', day: 'numeric', month: 'short' });

// "sam. 7 nov." ou "sam. 7 – dim. 8 nov."
function plageDates(matchs) {
  const premier = new Date(matchs[0].dateMatch);
  const dernier = new Date(matchs[matchs.length - 1].dateMatch);
  if (premier.toDateString() === dernier.toDateString()) return jourCourt(premier);
  return `${premier.toLocaleDateString(locale(), { weekday: 'short', day: 'numeric' })} – ${jourCourt(dernier)}`;
}

const numeroJournee = (m) => {
  const brut = m.journee ?? m.numeroJournee ?? m.round ?? null;
  const n = typeof brut === 'string' ? parseInt(brut.match(/\d+/)?.[0] ?? '', 10) : brut;
  return Number.isFinite(n) ? n : null;
};

// Les 2 prochaines journées d'une compétition, à partir des matchs à venir.
// Avec le numéro de journée : on le suit. Sinon : une journée = un bloc de matchs
// rapprochés (un nouveau bloc commence 4 jours après le premier match du bloc).
function deuxProchainesJournees(matchs) {
  if (matchs.length === 0) return [];
  if (matchs.every(m => numeroJournee(m) != null)) {
    const numeros = [...new Set(matchs.map(numeroJournee))].sort((a, b) => a - b).slice(0, 2);
    return numeros.map(n => ({ numero: n, matchs: matchs.filter(m => numeroJournee(m) === n) }));
  }
  const blocs = [];
  for (const m of matchs) {
    const dernier = blocs[blocs.length - 1];
    if (dernier && new Date(m.dateMatch) - new Date(dernier.matchs[0].dateMatch) < 4 * 86400000) dernier.matchs.push(m);
    else if (blocs.length < 2) blocs.push({ numero: null, matchs: [m] });
    else break;
  }
  return blocs;
}

function Logo({ equipe, taille = 28 }) {
  return equipe?.logoUrl
    ? <img src={equipe.logoUrl} alt="" style={{ width: taille, height: taille, objectFit: 'contain', flexShrink: 0 }} />
    : <span style={{
        width: taille, height: taille, borderRadius: '50%', backgroundColor: CLAIR.tuile, color: CLAIR.doux, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: taille / 3,
      }}>{equipe?.nom?.substring(0, 2).toUpperCase()}</span>;
}

// Heure | Équipes | Cotes 1 X 2
const GRILLE_PARI = '64px minmax(0,1fr) 300px';

// Cotes de démonstration (à remplacer par les vraies cotes du backend)
// detail = clé de traduction jouer.cotes.<type>
const COTES = [
  { label: '1', cote: 2.10, type: 'dom' },
  { label: 'X', cote: 3.20, type: 'nul' },
  { label: '2', cote: 2.80, type: 'ext' },
];

// ── Une ligne de pari (match + cotes, mise dépliée quand une cote est choisie) ──
function LignePari({ p, selection, onSelection, mise, onMise, solde, premiere }) {
  const { t } = useTranslation();
  const miseMax = Math.max(MISE_MIN, Math.min(solde, MISE_MAX));
  const miseActuelle = Math.min(mise ?? MISE_DEFAUT, miseMax);
  const coteChoisie = COTES.find(c => c.type === selection);
  const gain = coteChoisie ? Math.floor(miseActuelle * coteChoisie.cote) : null;
  const pasAssez = solde < MISE_MIN;
  const nomChoix = selection === 'dom' ? p.equipeDomicile?.nom : selection === 'ext' ? p.equipeExterieur?.nom : t('jouer.matchNul');

  return (
    <div style={{ borderTop: premiere ? 'none' : `1px solid ${CLAIR.bord}`, backgroundColor: selection ? '#f6faf7' : CLAIR.carte, transition: 'background-color 0.2s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: GRILLE_PARI, alignItems: 'center', gap: '16px', padding: '14px 20px' }}>
        {/* Date / heure */}
        <Link to={`/matchs/${p.id}`} style={{ textDecoration: 'none', textAlign: 'center' }} title={t('jouer.voirMatch')}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: CLAIR.doux, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            {new Date(p.dateMatch).toLocaleDateString(locale(), { weekday: 'short', day: 'numeric' })}
          </div>
          <div style={{ fontFamily: CHIFFRES, fontSize: '20px', fontWeight: 800, color: CLAIR.texte, lineHeight: 1.1 }}>{heure(p.dateMatch)}</div>
        </Link>

        {/* Équipes */}
        <Link to={`/matchs/${p.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
          {[p.equipeDomicile, p.equipeExterieur].map((e, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <Logo equipe={e} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: CLAIR.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e?.nom}</span>
            </span>
          ))}
        </Link>

        {/* Cotes 1 / X / 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {COTES.map(c => {
            const actif = selection === c.type;
            return (
              <button key={c.type} onClick={() => onSelection(c.type)}
                className="transition-all hover:-translate-y-px"
                title={t(`jouer.cotes.${c.type}`)}
                style={{
                  padding: '9px 6px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                  border: `1.5px solid ${actif ? theme.green : CLAIR.bord}`,
                  backgroundColor: actif ? theme.green : CLAIR.tuile,
                  color: actif ? '#fff' : CLAIR.texte,
                  boxShadow: actif ? '0 6px 14px rgba(31,157,85,0.28)' : 'none',
                }}>
                <div style={{ fontSize: '11px', fontWeight: 800, opacity: actif ? 0.85 : 0.55 }}>{c.label}</div>
                <div style={{ fontFamily: CHIFFRES, fontSize: '21px', fontWeight: 800, lineHeight: 1.05 }}>{c.cote.toFixed(2)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mise + validation (seulement quand une cote est choisie) */}
      {selection && (
        <div style={{ padding: '0 20px 16px' }}>
          {pasAssez ? (
            <p style={{ fontSize: '13px', color: theme.red, fontWeight: 600 }}>{t('jouer.soldeInsuffisant', { n: MISE_MIN })}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', alignItems: 'center', gap: '16px', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#fff', border: `1px solid ${CLAIR.bord}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: CLAIR.doux, letterSpacing: '0.6px' }}>{t('jouer.miseMaj')}</span>
                <input type="range" min={MISE_MIN} max={miseMax} step={10} value={miseActuelle}
                  onChange={e => onMise(Number(e.target.value))}
                  style={{ flex: 1, accentColor: theme.green }} aria-label={t('jouer.montantMise')} />
                <span style={{ minWidth: '64px', textAlign: 'right', fontFamily: CHIFFRES, fontSize: '20px', fontWeight: 800, color: CLAIR.texte }}>
                  {miseActuelle} <span style={{ fontSize: '13px', color: CLAIR.doux }}>{t('commun.pts')}</span>
                </span>
              </div>
              <button className="transition-all hover:brightness-110"
                style={{
                  padding: '11px 18px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                  backgroundColor: theme.green, color: '#fff', fontSize: '14px', fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap',
                  boxShadow: '0 8px 18px rgba(31,157,85,0.3)',
                }}>
                {t('jouer.parier', { n: miseActuelle, choix: nomChoix })}
                <span style={{ padding: '3px 9px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
                  {t('jouer.gainPotentiel', { n: gain })}
                </span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Une journée d'une compétition ───────────────────────────────────────
function BlocJournee({ competition, journee, rang, enfants }) {
  const { t } = useTranslation();
  const titre = journee.numero != null
    ? t('matchs.journee', { n: journee.numero })
    : rang === 0 ? t('jouer.prochaineJournee') : t('jouer.journeeSuivante');
  return (
    <div style={{ backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(20,40,30,0.04)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
        padding: '12px 20px', background: `linear-gradient(90deg, ${CLAIR.vert}, #1c6b3e)`, color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ padding: '3px 9px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.16)', fontSize: '11px', fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
            MTN {competition}
          </span>
          <span style={{ fontSize: '16px', fontWeight: 800 }}>{titre}</span>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.8)', textTransform: 'capitalize' }}>
          <CalendarDays size={14} /> {plageDates(journee.matchs)}
          <span style={{ padding: '2px 8px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.16)', fontSize: '12px', fontWeight: 700, textTransform: 'none' }}>
            {t('matchs.nbMatchs', { count: journee.matchs.length })}
          </span>
        </span>
      </div>
      {/* En-tête des colonnes */}
      <div style={{ display: 'grid', gridTemplateColumns: GRILLE_PARI, gap: '16px', padding: '8px 20px', borderBottom: `1px solid ${CLAIR.bord}`, backgroundColor: '#fafbfa', fontSize: '11px', fontWeight: 800, color: CLAIR.doux, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
        <span style={{ textAlign: 'center' }}><Clock size={12} style={{ display: 'inline', verticalAlign: '-2px' }} /></span>
        <span>{t('jouer.match')}</span>
        <span style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
          {COTES.map(c => <span key={c.type}>{t(`jouer.cotes.${c.type}`)}</span>)}
        </span>
      </div>
      {enfants}
    </div>
  );
}

// ── Page non connecté ───────────────────────────────────────────────────
// Textes : jouer.avantages.<cle>.titre / .texte
const AVANTAGES = [
  { icone: Gift, cle: 'points' },
  { icone: Target, cle: 'parie' },
  { icone: Trophy, cle: 'grimpe' },
  { icone: Smartphone, cle: 'fcfa' },
];

function Presentation() {
  const { t } = useTranslation();
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: FOND_BANDE, minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center', padding: '56px 0' }}>
      <EclatsBande />
      <div className="grid gap-12 lg:grid-cols-2" style={{ ...CONTENEUR, width: '100%', alignItems: 'center' }}>
        <div>
          <p style={{ color: theme.yellow, fontSize: '13px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
            Fantasy F237
          </p>
          <h1 style={{ color: '#fff', fontSize: '60px', fontWeight: 400, lineHeight: 1.05, marginBottom: '16px', fontFamily: MARQUEUR }}>
            {t('jouer.slogan')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '17px', lineHeight: 1.55, maxWidth: '480px', marginBottom: '30px' }}>
            {t('jouer.intro')}
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/register" className="transition-all hover:brightness-110"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 26px', borderRadius: '999px',
                backgroundColor: theme.green, color: '#fff', fontWeight: 800, fontSize: '16px', textDecoration: 'none',
                boxShadow: '0 8px 20px rgba(31,157,85,0.35)',
              }}>
              {t('jouer.inscrire')} <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="transition-colors"
              style={{
                padding: '14px 26px', borderRadius: '999px', border: '1.5px solid rgba(255,255,255,0.5)',
                color: '#fff', fontWeight: 800, fontSize: '16px', textDecoration: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
              {t('jouer.connecter')}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {AVANTAGES.map(({ icone: Icone, cle }) => (
            <div key={cle} style={{
              padding: '22px', borderRadius: '16px',
              backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', backdropFilter: 'blur(4px)',
            }}>
              <span style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(60,207,122,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Icone size={22} color={theme.greenBright} />
              </span>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>{t(`jouer.avantages.${cle}.titre`)}</div>
              <div style={{ color: 'rgba(255,255,255,0.62)', fontSize: '14px', lineHeight: 1.45 }}>{t(`jouer.avantages.${cle}.texte`)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Page ────────────────────────────────────────────────────────────────
const JouerPage = () => {
  const { t } = useTranslation();
  const [mises, setMises] = useState({});
  const [selectionnes, setSelectionnes] = useState({});
  // [{ cle, label, journees: [{ numero, matchs }] }] : les 2 prochaines journées par compétition
  const [programme, setProgramme] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('tout');
  const { user } = useAuth();

  // Vrais matchs à venir d'Elite One ET d'Elite Two (saison en cours)
  useEffect(() => {
    let ignore = false;
    const ids = SAISONS_DB[ANNEE_ACTUELLE] ?? {};
    Promise.all(COMPETITIONS
      .filter(c => ids[c.cle] != null)
      .map(c => matchService.getBySaison(ids[c.cle])
        .then(data => ({ ...c, matchs: data }))
        .catch(() => ({ ...c, matchs: [] }))))
      .then(listes => {
        if (ignore) return;
        const maintenant = Date.now();
        setProgramme(listes.map(c => {
          // Pas encore joués ET date à venir (les matchs reportés sans nouvelle date sont exclus)
          const avenir = c.matchs
            .filter(m => m.statut === 0 && new Date(m.dateMatch).getTime() > maintenant)
            .sort((a, b) => new Date(a.dateMatch) - new Date(b.dateMatch))
            .map(m => ({ ...m, competition: c.label }));
          return { cle: c.cle, label: c.label, journees: deuxProchainesJournees(avenir) };
        }));
        setLoading(false);
      });
    return () => { ignore = true; };
  }, []);

  const selectionnerCote = (matchId, type) => {
    setSelectionnes(prev => ({ ...prev, [matchId]: prev[matchId] === type ? null : type }));
  };

  if (!user) return <Presentation />;

  const solde = user.soldePoints ?? 0;

  // Blocs affichés selon le filtre : Elite One (J+1, J+2) puis Elite Two (J+1, J+2)
  const blocs = programme
    .filter(c => filtre === 'tout' || c.cle === filtre)
    .flatMap(c => c.journees.map((journee, rang) => ({ comp: c, journee, rang })));
  const nbParis = blocs.reduce((n, b) => n + b.journee.matchs.length, 0);

  // Amis de démonstration (à remplacer par les vrais amis du backend)
  const amis = [
    { nom: 'Eric N.', pts: 1840, initiales: 'EN', couleur: '#1a7a3c' },
    { nom: 'Aicha M.', pts: 1620, initiales: 'AM', couleur: '#CE1126' },
    { nom: 'Junior K.', pts: 1320, initiales: 'JK', couleur: '#b8960c' },
    { nom: user.prenom ?? t('jouer.moi'), pts: solde, initiales: user.prenom?.[0] ?? 'M', couleur: '#141414', isMoi: true },
    { nom: 'Patrice D.', pts: 980, initiales: 'PD', couleur: '#1a3a7a' },
  ].sort((a, b) => b.pts - a.pts);
  const monRang = amis.findIndex(a => a.isMoi) + 1;
  const fcfa = Math.floor(solde / 1000) * 500;

  const stats = [
    { icone: Coins, label: t('jouer.mesPoints'), valeur: solde.toLocaleString(locale()), couleur: theme.yellow, texteIcone: '#3a2c00' },
    { icone: Users, label: t('jouer.rangAmis'), valeur: `#${monRang}`, couleur: theme.greenBright, texteIcone: '#0f3d26' },
    { icone: TrendingUp, label: t('jouer.tauxReussite'), valeur: '—', couleur: '#ff6b6f', texteIcone: '#4a0b0d' },
  ];

  return (
    <div>
      {/* ── ZONE HAUTE ─────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: FOND_BANDE, padding: '48px 0 52px' }}>
        <EclatsBande />
        <div style={CONTENEUR}>
          <p style={{ color: theme.yellow, fontSize: '13px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Fantasy F237
          </p>
          <h1 style={{ color: '#fff', fontSize: '56px', fontWeight: 400, lineHeight: 1.05, marginBottom: '8px', fontFamily: MARQUEUR }}>
            {t('jouer.salut', { prenom: user.prenom })}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', marginBottom: '30px' }}>
            {t('jouer.sousTitre')}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map(({ icone: Icone, label, valeur, couleur, texteIcone }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '16px',
                backgroundColor: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.13)', backdropFilter: 'blur(6px)',
              }}>
                <span style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: couleur, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icone size={22} color={texteIcone} />
                </span>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</div>
                  <div style={{ fontFamily: CHIFFRES, fontSize: '34px', fontWeight: 800, color: '#fff', lineHeight: 1.05 }}>{valeur}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ZONE BASSE ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: CLAIR.fond, minHeight: '480px', padding: '36px 0 64px' }}>
        <div style={CONTENEUR}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]" style={{ alignItems: 'start' }}>

            {/* Paris disponibles : les 2 prochaines journées de chaque compétition */}
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: CLAIR.texte, lineHeight: 1.2 }}>{t('jouer.parisDispo')}</h2>
                  {!loading && (
                    <span style={{ fontSize: '14px', fontWeight: 600, color: CLAIR.doux }}>
                      {t('jouer.deuxJournees')} · {t('matchs.nbMatchs', { count: nbParis })}
                    </span>
                  )}
                </div>
                {/* Filtre compétition */}
                <div style={{ display: 'flex', padding: '4px', borderRadius: '999px', backgroundColor: '#fff', border: `1px solid ${CLAIR.bord}` }}>
                  {[{ cle: 'tout', label: t('jouer.tout') }, ...COMPETITIONS].map(c => {
                    const actif = filtre === c.cle;
                    return (
                      <button key={c.cle} onClick={() => setFiltre(c.cle)}
                        style={{
                          padding: '7px 16px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                          fontSize: '13px', fontWeight: 800,
                          backgroundColor: actif ? CLAIR.vert : 'transparent', color: actif ? '#fff' : CLAIR.doux,
                          transition: 'background-color 0.2s ease, color 0.2s ease',
                        }}>
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '56px 0', color: CLAIR.doux }}>
                  <Loader2 size={20} className="animate-spin" /> {t('jouer.chargement')}
                </div>
              ) : nbParis === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: CLAIR.carte, border: `1px dashed ${CLAIR.bord}`, borderRadius: '16px' }}>
                  <span style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#e8f3ec', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <CalendarDays size={26} color={CLAIR.vert} />
                  </span>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: CLAIR.texte, marginBottom: '6px' }}>{t('jouer.aucunAVenir')}</p>
                  <p style={{ fontSize: '14px', color: CLAIR.doux, marginBottom: '16px' }}>{t('jouer.parisOuvriront')}</p>
                  <Link to="/matchs" style={{ color: CLAIR.vert, fontWeight: 800, fontSize: '14px' }}>{t('jouer.voirCalendrier')} →</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {blocs.map(({ comp, journee, rang }) => (
                    <BlocJournee key={`${comp.cle}-${rang}`} competition={comp.label} journee={journee} rang={rang}
                      enfants={journee.matchs.map((p, i) => (
                        <LignePari key={p.id} p={p} solde={solde} premiere={i === 0}
                          selection={selectionnes[p.id]}
                          onSelection={type => selectionnerCote(p.id, type)}
                          mise={mises[p.id]}
                          onMise={v => setMises(prev => ({ ...prev, [p.id]: v }))}
                        />
                      ))}
                    />
                  ))}
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: CLAIR.doux }}>
                    <Info size={14} /> {t('jouer.cotesIndicatives')}
                    <Link to="/matchs" style={{ marginLeft: 'auto', color: CLAIR.vert, fontWeight: 800, textDecoration: 'none' }}>{t('jouer.voirCalendrier')} →</Link>
                  </p>
                </div>
              )}
            </div>

            {/* Colonne de droite */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Classement entre amis */}
              <div style={{ backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 20px', borderBottom: `1px solid ${CLAIR.bord}`, fontSize: '16px', fontWeight: 800, color: CLAIR.texte }}>
                  <Users size={17} color={CLAIR.vert} /> {t('jouer.mesAmis')}
                </div>
                {amis.map((a, i) => (
                  <div key={a.nom + i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 20px',
                    borderTop: i ? `1px solid ${CLAIR.bord}` : 'none',
                    backgroundColor: a.isMoi ? '#e8f3ec' : 'transparent',
                  }}>
                    <span style={{ width: '18px', fontSize: '13px', fontWeight: 800, color: i < 3 ? CLAIR.vert : CLAIR.doux }}>{i + 1}</span>
                    <span style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: a.couleur, color: '#fff', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {a.initiales}
                    </span>
                    <span style={{ flex: 1, minWidth: 0, fontSize: '15px', fontWeight: a.isMoi ? 800 : 600, color: a.isMoi ? CLAIR.vert : CLAIR.texte }}>
                      {a.nom}{a.isMoi && <span style={{ fontSize: '11px', fontWeight: 700, color: CLAIR.doux }}> ({t('jouer.toi')})</span>}
                    </span>
                    <span style={{ fontFamily: CHIFFRES, fontSize: '19px', fontWeight: 800, color: a.isMoi ? CLAIR.vert : CLAIR.texte }}>{a.pts.toLocaleString(locale())}</span>
                  </div>
                ))}
                <div style={{ padding: '14px 20px', borderTop: `1px solid ${CLAIR.bord}` }}>
                  <button className="transition-all hover:brightness-110"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '999px', border: 'none', cursor: 'pointer', backgroundColor: theme.green, color: '#fff', fontWeight: 800, fontSize: '15px' }}>
                    <Plus size={16} /> {t('jouer.inviter')}
                  </button>
                </div>
              </div>

              {/* Conversion en FCFA */}
              <div style={{ borderRadius: '16px', overflow: 'hidden', background: 'linear-gradient(135deg, #fff8d6, #fdf0b0)', border: '1px solid #f1e2a6' }}>
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 800, color: '#6b5510', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    <Smartphone size={16} /> {t('jouer.convertir')}
                  </div>
                  <p style={{ fontSize: '13px', color: '#8a7330', marginBottom: '12px' }}>{t('jouer.taux')}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontFamily: CHIFFRES, fontSize: '44px', fontWeight: 800, color: '#2b2205', lineHeight: 1 }}>{fcfa.toLocaleString(locale())}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#6b5510' }}>{t('jouer.fcfaDispo')}</span>
                  </div>
                  <button disabled={fcfa === 0} className="transition-all hover:brightness-125"
                    style={{
                      width: '100%', padding: '12px', borderRadius: '999px', border: 'none',
                      cursor: fcfa === 0 ? 'not-allowed' : 'pointer', opacity: fcfa === 0 ? 0.5 : 1,
                      backgroundColor: '#141414', color: '#fff', fontWeight: 800, fontSize: '15px',
                    }}>
                    {t('jouer.retrait')}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JouerPage;