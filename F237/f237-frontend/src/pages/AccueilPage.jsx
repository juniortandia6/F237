import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Trophy, Medal } from 'lucide-react';
import { useLiveScores } from '../hooks/useLiveScores';
import { classementService } from '../services/classementService';
import { matchService } from '../services/matchService';
import theme from '../theme';
import { ACTUALITES, ACTUS_HERO } from '../data/actualites';
import { UTILISER_DEMO, construireMatchsDemo } from '../data/matchsDemo';

// Les 5 actus du hero viennent de la source partagée (src/data/actualites.js)
const ACTUS = ACTUS_HERO;

const DUREE = 5000;

function formatHeure(dateStr) {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
function formatDateCourte(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
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
  const termine = m.statut === 2;
  const live = m.statut === 1;
  const aVenir = m.statut === 0;
  const dom = m.scoreDomicile, ext = m.scoreExterieur;
  const domGagne = (termine || live) && dom > ext;
  const extGagne = (termine || live) && ext > dom;

  return (
    <div
      className="transition-transform duration-200 hover:-translate-y-1"
      style={{
        flex: `0 0 ${LARGEUR_CARTE}px`, scrollSnapAlign: 'start',
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
            Elite One
          </span>
          {live ? (
            <span style={{ fontSize: '11px', fontWeight: 800, color: theme.red, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="animate-pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: theme.red }} />
              EN DIRECT
            </span>
          ) : termine ? (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e8e8e', textTransform: 'uppercase' }}>Terminé</span>
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
          <Link to="/matchs"
            className="transition-colors hover:bg-gray-200"
            style={{
              backgroundColor: '#efefef', color: '#333', fontWeight: 600, fontSize: '14px',
              padding: '8px 12px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
            + Plus
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

// mode : 'live' | 'avenir' | 'termine'
function CarteDirect({ m, mode }) {
  const live = mode === 'live';
  const avenir = mode === 'avenir';
  const dom = m.scoreDomicile, ext = m.scoreExterieur;
  const aScore = dom != null && ext != null;
  const minute = m.minute ?? m.tempsEcoule ?? null;

  return (
    <Link
      to={avenir ? '/jouer' : '/matchs'}
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
          {live ? (minute ? `En direct · ${minute}'` : 'En direct') : avenir ? 'À venir' : 'Terminé'}
        </span>

        <LogoCarte src={m.equipeDomicile?.logoUrl} />

        {avenir ? (
          /* Match à venir : l'heure du coup d'envoi en grand */
          <span style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
            <span style={{ fontWeight: 900, fontSize: '32px', fontFamily: '"Barlow Condensed", Arial, sans-serif', letterSpacing: '1px', lineHeight: 1 }}>
              {formatHeure(m.dateMatch)}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.8, marginTop: '4px' }}>
              {new Date(m.dateMatch).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
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
        Elite One{m.dateMatch ? ` · ${new Date(m.dateMatch).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
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
        {live ? 'Suivre le match' : avenir ? 'Faire un pronostic' : 'Voir le résumé'}
        <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function SectionDirect({ matchsLive, matchsAVenir, matchsTermines, isConnected, demo }) {
  const mode = matchsLive.length > 0 ? 'live' : matchsAVenir.length > 0 ? 'avenir' : 'termine';
  const live = mode === 'live';
  const liste = live ? matchsLive : mode === 'avenir' ? matchsAVenir.slice(0, 8) : matchsTermines.slice(0, 8);
  const TITRES = { live: 'En direct', avenir: 'Prochains matchs', termine: 'Derniers résultats' };
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
      position: 'relative', overflow: 'hidden', padding: '56px 0 64px',
      background: FOND_BANDE,
    }}>
      <EclatsBande />

      {/* En-tête aligné sur le contenu */}
      <div style={{ position: 'relative', maxWidth: '1150px', margin: '0 auto', padding: '0 60px', boxSizing: 'content-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
          <h2 style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            color: '#fff', fontSize: '28px', fontWeight: 400,
            fontFamily: '"Permanent Marker", "Raleway", Arial, sans-serif',
          }}>
            {live && <span className="animate-pulse" style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: theme.red, boxShadow: `0 0 12px ${theme.red}` }} />}
            {TITRES[mode]}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: isConnected ? theme.greenBright : 'rgba(255,255,255,0.5)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: isConnected ? theme.greenBright : 'rgba(255,255,255,0.5)' }} />
              {isConnected ? 'Live connecté' : 'Connexion...'}
            </span>
            <Link to="/matchs" className="flex items-center gap-1 transition-opacity hover:opacity-80"
              style={{ fontSize: '15px', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>
              Tous les matchs <ChevronRight size={18} />
            </Link>
          </div>
        </div>
        {!live && (
          <p style={{ marginTop: '-12px', marginBottom: '20px', fontSize: '14px', color: 'rgba(255,255,255,0.65)' }}>
            Aucun match en cours pour le moment. {mode === 'avenir'
              ? 'Voici les prochaines affiches : les scores apparaîtront ici en direct dès le coup d’envoi.'
              : "Les scores s'afficheront ici en temps réel dès le coup d'envoi."}
            {demo && (
              <span style={{
                marginLeft: '10px', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                backgroundColor: 'rgba(252,209,22,0.18)', color: theme.yellow, letterSpacing: '0.5px',
              }}>
                DÉMO
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
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Aucun match à afficher.</span>
          ) : liste.map((m, i) => (
            <CarteDirect key={m.apiFootballId ?? m.id ?? i} m={m} mode={mode} />
          ))}
        </div>

        {gauche && (
          <button onClick={() => defiler(-1)} aria-label="Précédent" style={FLECHE('left')}>
            <ChevronLeft size={20} color="#222" />
          </button>
        )}
        {droite && liste.length > 0 && (
          <button onClick={() => defiler(1)} aria-label="Suivant" style={FLECHE('right')}>
            <ChevronRight size={20} color="#222" />
          </button>
        )}
      </div>
    </section>
  );
}

// ── Section "Classements" (inspirée de FIBA) ──────────────────────────────
// Onglets Elite One / Elite Two, podium des 3 premiers, puis 4e et 5e
// dans un petit tableau. "Tous les détails" mène au classement complet.

const LIGUES = [
  { cle: 'elite-one', label: 'MTN Elite One', saisonId: 3 },
  { cle: 'elite-two', label: 'MTN Elite Two', saisonId: 4 },
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

function bilan(e) {
  const v = stat(e, 'victoires', 'gagnes', 'win');
  const n = stat(e, 'nuls', 'egalites', 'draw');
  const d = stat(e, 'defaites', 'perdus', 'lose');
  return v != null && n != null && d != null ? `${v}V · ${n}N · ${d}D` : null;
}

function CartePodium({ e, rang }) {
  const med = MEDAILLES[rang];
  const premier = rang === 1;
  return (
    <div
      className="group transition-transform duration-300 hover:-translate-y-1"
      style={{
        flex: 1, alignSelf: 'flex-end',
        backgroundColor: premier ? theme.surfaceHover : theme.surface,
        border: `1px solid ${premier ? 'rgba(245,197,66,0.35)' : theme.border}`,
        borderRadius: '14px',
        padding: premier ? '26px 16px 22px' : '20px 16px 18px',
        minHeight: premier ? '196px' : '168px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '8px',
        boxShadow: premier ? '0 12px 30px rgba(0,0,0,0.30)' : 'none',
        textAlign: 'center',
      }}
    >
      {/* Médaille / trophée */}
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: med.couleur }}>
        {premier ? <Trophy size={26} fill={med.couleur} strokeWidth={1.5} /> : <Medal size={22} strokeWidth={2} />}
        <span style={{ fontSize: '11px', fontWeight: 800, marginTop: '2px' }}>{med.label}</span>
      </span>

      {logoEquipe(e)
        ? <img src={logoEquipe(e)} alt=""
            className="transition-transform duration-300 group-hover:scale-110"
            style={{ width: premier ? '72px' : '56px', height: premier ? '72px' : '56px', objectFit: 'contain' }} />
        : <span style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: theme.border }} />}

      <span style={{ fontSize: premier ? '19px' : '17px', fontWeight: 800, color: theme.text, lineHeight: 1.2 }}>
        {nomEquipe(e)}
      </span>
      <span style={{ fontSize: '13px', color: theme.textMuted }}>
        <strong style={{ color: theme.text }}>{e.points ?? 0} pts</strong>
        {bilan(e) && <> · {bilan(e)}</>}
      </span>
    </div>
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

// Couleurs des cartes (équivalent vert du bordeaux / rose FIBA)
const L = {
  entete: '#14532f',
  vedette: '#d9ece0',
  texte: '#141414',
  doux: '#5f6b64',
  puce: 'rgba(20,83,47,0.12)',
};

function PuceEquipe({ j }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px', maxWidth: '150px',
      backgroundColor: L.puce, borderRadius: '5px', padding: '3px 8px',
      fontSize: '11px', fontWeight: 700, color: L.entete, textTransform: 'uppercase',
    }}>
      {j.logo && <img src={j.logo} alt="" style={{ width: '16px', height: '16px', objectFit: 'contain', flexShrink: 0 }} />}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.equipe}</span>
    </span>
  );
}

function NomDeuxLignes({ nom, grand }) {
  const { prenom, nom: famille } = decouperNom(nom);
  return (
    <div style={{ lineHeight: 1.25, minWidth: 0 }}>
      {prenom && <div style={{ color: L.texte, fontSize: grand ? '16px' : '15px' }}>{prenom}</div>}
      <div style={{ color: L.texte, fontSize: grand ? '17px' : '15px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {famille}
      </div>
    </div>
  );
}

const LARGEUR_LEADER = 320;

const RANGS = ['1er', '2e', '3e'];

// Une carte par buteur : 1er à gauche, puis 2e, 3e... (comme les cartes FIBA)
function CarteButeur({ j, rang }) {
  const premier = rang === 1;
  return (
    <div className="group" style={{
      flex: `0 0 ${LARGEUR_LEADER}px`, scrollSnapAlign: 'start',
      backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden',
      border: '1px solid #e3e3e3', display: 'flex', flexDirection: 'column',
      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* En-tête : rang */}
      <div style={{ backgroundColor: L.entete, padding: '14px 16px', textAlign: 'center' }}>
        <div style={{ color: premier ? theme.yellow : '#fff', fontWeight: 800, fontSize: '15px' }}>
          {RANGS[rang - 1] ?? `${rang}e`}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 700, fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>
          Meilleur buteur
        </div>
      </div>

      {/* Le joueur */}
      <div style={{ position: 'relative', height: '190px', backgroundColor: L.vedette, padding: '16px', overflow: 'hidden' }}>
        {j.logo && (
          <img src={j.logo} alt="" aria-hidden="true"
            className="transition-transform duration-500 group-hover:scale-105"
            style={{ position: 'absolute', right: '-10px', bottom: '-14px', width: '160px', height: '160px', objectFit: 'contain' }} />
        )}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px', height: '100%', maxWidth: '62%' }}>
          <PuceEquipe j={j} />
          <NomDeuxLignes nom={j.nom} grand />
          <span style={{
            marginTop: 'auto', backgroundColor: '#fff', color: L.texte, borderRadius: '6px',
            padding: '4px 12px', fontSize: '22px', fontWeight: 900, boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            fontFamily: '"Barlow Condensed", Arial, sans-serif',
          }}>
            {j.buts} <span style={{ fontSize: '13px', fontWeight: 700, color: L.doux }}>but{j.buts > 1 ? 's' : ''}</span>
          </span>
        </div>
      </div>

      {/* Détail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #ececec' }}>
        {[
          ['Penaltys', j.penaltys],
          ['Matchs avec but', j.matchs],
        ].map(([label, val], i) => (
          <div key={label} style={{ padding: '12px 14px', textAlign: 'center', borderLeft: i ? '1px solid #ececec' : 'none' }}>
            <div style={{ color: L.texte, fontSize: '17px', fontWeight: 800 }}>{val}</div>
            <div style={{ color: L.doux, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlocButeurs({ matchs, live }) {
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
    <div style={{ marginTop: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ color: theme.text, fontSize: '28px', fontWeight: 400, fontFamily: '"Permanent Marker", "Raleway", Arial, sans-serif' }}>
            Meilleurs buteurs
          </h3>
          {live && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '20px',
              backgroundColor: 'rgba(225,37,43,0.15)', color: theme.red, fontSize: '11px', fontWeight: 800, letterSpacing: '0.6px',
            }}>
              <span className="animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: theme.red }} />
              EN DIRECT
            </span>
          )}
        </div>
        <Link to="/classement" className="flex items-center gap-1 transition-opacity hover:opacity-80"
          style={{ fontSize: '15px', fontWeight: 600, color: theme.text, textDecoration: 'none' }}>
          Afficher tout <ChevronRight size={18} />
        </Link>
      </div>

      <div style={{ position: 'relative' }}>
        <div ref={rangeeRef} onScroll={maj}
          style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollbarWidth: 'none', scrollSnapType: 'x mandatory', paddingBottom: '4px' }}>
          {buteurs.length === 0 ? (
            <div style={{ padding: '28px', color: theme.textMuted, fontSize: '14px' }}>Aucun buteur enregistré pour cette compétition.</div>
          ) : buteurs.map((j, i) => (
            <CarteButeur key={`${j.nom}|${j.equipe}`} j={j} rang={i + 1} />
          ))}
        </div>
        {gauche && (
          <button onClick={() => defiler(-1)} aria-label="Précédent" style={FLECHE('left')}>
            <ChevronLeft size={20} color="#222" />
          </button>
        )}
        {droite && (
          <button onClick={() => defiler(1)} aria-label="Suivant" style={FLECHE('right')}>
            <ChevronRight size={20} color="#222" />
          </button>
        )}
      </div>
    </div>
  );
}

// signatureLive change dès qu'un score évolue en direct -> on recharge
// classement + buteurs, sans afficher de "Chargement..." (pas de clignotement)
function SectionClassement({ signatureLive = '', live = false }) {
  const [ligue, setLigue] = useState(LIGUES[0].cle);
  const [donnees, setDonnees] = useState({});      // { 'elite-one': [...], 'elite-two': [...] }
  const [matchsParLigue, setMatchsParLigue] = useState({}); // pour calculer les buteurs
  const [chargement, setChargement] = useState(true);

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
            (a.position ?? 999) - (b.position ?? 999) || (b.points ?? 0) - (a.points ?? 0));
          mt[cle] = matchs ?? [];
        }
        setDonnees(cl);
        setMatchsParLigue(mt);
        setChargement(false);
      });
    return () => { ignore = true; };
  }, [signatureLive]);


  const top5 = (donnees[ligue] ?? []).slice(0, 5);
  const podium = top5.slice(0, 3);
  const suite = top5.slice(3, 5);

  return (
    <section style={{ marginBottom: '56px' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <h2 style={{ color: theme.text, fontSize: '28px', fontWeight: 400, fontFamily: '"Permanent Marker", "Raleway", Arial, sans-serif' }}>
          Classements
        </h2>
        <Link to="/classement" className="flex items-center gap-1 transition-opacity hover:opacity-80"
          style={{ fontSize: '15px', fontWeight: 600, color: theme.text, textDecoration: 'none' }}>
          Tous les détails <ChevronRight size={18} />
        </Link>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '28px', borderBottom: `1px solid ${theme.border}`, marginBottom: '26px' }}>
        {LIGUES.map(l => {
          const actif = l.cle === ligue;
          return (
            <button key={l.cle} onClick={() => setLigue(l.cle)}
              style={{
                padding: '0 4px 12px', marginBottom: '-1px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '15px', fontWeight: actif ? 700 : 500,
                color: actif ? theme.text : theme.textMuted,
                borderBottom: `3px solid ${actif ? theme.greenBright : 'transparent'}`,
                transition: 'color 0.2s ease, border-color 0.2s ease',
              }}>
              {l.label}
            </button>
          );
        })}
      </div>

      {chargement ? (
        <div className="text-center py-10" style={{ fontSize: '14px', color: theme.textFaint }}>Chargement...</div>
      ) : top5.length === 0 ? (
        <div className="text-center py-10" style={{ fontSize: '14px', color: theme.textMuted }}>
          Classement indisponible pour le moment.
        </div>
      ) : (
        <>
          {/* Podium : 2e – 1er – 3e */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '14px' }}>
            {podium[1] && <CartePodium e={podium[1]} rang={2} />}
            {podium[0] && <CartePodium e={podium[0]} rang={1} />}
            {podium[2] && <CartePodium e={podium[2]} rang={3} />}
          </div>

          {/* 4e et 5e */}
          {suite.length > 0 && (
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${theme.border}` }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '48px 1fr 70px 80px', alignItems: 'center',
                padding: '9px 16px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.6px',
                textTransform: 'uppercase', color: '#fff',
                background: `linear-gradient(90deg, ${theme.green} 0%, #14532f 100%)`,
              }}>
                <span>#</span><span>Équipe</span>
                <span style={{ textAlign: 'center' }}>J</span>
                <span style={{ textAlign: 'right' }}>Pts</span>
              </div>
              {suite.map((e, i) => (
                <div key={e.equipeId ?? e.id ?? i}
                  className="transition-colors"
                  style={{
                    display: 'grid', gridTemplateColumns: '48px 1fr 70px 80px', alignItems: 'center',
                    padding: '11px 16px', fontSize: '15px',
                    backgroundColor: i % 2 === 0 ? theme.surface : theme.bg,
                  }}
                  onMouseEnter={ev => { ev.currentTarget.style.backgroundColor = theme.surfaceHover; }}
                  onMouseLeave={ev => { ev.currentTarget.style.backgroundColor = i % 2 === 0 ? theme.surface : theme.bg; }}
                >
                  <span style={{ color: theme.textMuted, fontWeight: 600 }}>{e.position ?? i + 4}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: theme.text, fontWeight: 700, minWidth: 0 }}>
                    {logoEquipe(e) && <img src={logoEquipe(e)} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain', flexShrink: 0 }} />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nomEquipe(e)}</span>
                  </span>
                  <span style={{ textAlign: 'center', color: theme.textMuted }}>
                    {stat(e, 'matchsJoues', 'joues', 'played') ?? '–'}
                  </span>
                  <span style={{ textAlign: 'right', color: theme.text, fontWeight: 800 }}>{e.points ?? 0}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Meilleurs buteurs de la compétition sélectionnée */}
      {!chargement && <BlocButeurs matchs={matchsParLigue[ligue] ?? []} live={live} />}
    </section>
  );
}

// ── Section "Dernières nouvelles" (inspirée de FIBA) ──────────────────────
// Bande pleine largeur aux tons rouges, cartes portrait image + titre,
// qui mènent chacune à la page article.

const LARGEUR_CARTE_NEWS = 220;

function SectionNouvelles() {
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
      background: FOND_BANDE,
    }}>
      <EclatsBande />

      {/* En-tête */}
      <div style={{ position: 'relative', maxWidth: '1150px', margin: '0 auto', padding: '0 60px', boxSizing: 'content-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
          <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: 400, fontFamily: '"Permanent Marker", "Raleway", Arial, sans-serif' }}>
            Dernières nouvelles
          </h2>
          <Link to="/actualites" className="flex items-center gap-1 transition-opacity hover:opacity-80"
            style={{ fontSize: '15px', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>
            Toutes les actualités <ChevronRight size={18} />
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
          {ACTUALITES.map(a => (
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
              }}>{a.tag}</span>
              <span style={{
                position: 'absolute', left: '12px', right: '12px', bottom: '14px',
                color: '#fff', fontSize: '17px', fontWeight: 800, lineHeight: 1.25,
                display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {a.titre}
              </span>
            </Link>
          ))}
        </div>

        {gauche && (
          <button onClick={() => defiler(-1)} aria-label="Précédent" style={FLECHE('left')}>
            <ChevronLeft size={20} color="#222" />
          </button>
        )}
        {droite && (
          <button onClick={() => defiler(1)} aria-label="Suivant" style={FLECHE('right')}>
            <ChevronRight size={20} color="#222" />
          </button>
        )}
      </div>
    </section>
  );
}

const AccueilPage = () => {
  const navigate = useNavigate();
  const { matchsLive, isConnected } = useLiveScores();
  const [matchs, setMatchs] = useState([]);
  const [loadingMatchs, setLoadingMatchs] = useState(true);
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
        return (prev + 1) % ACTUS.length;
      });
    }, DUREE);
  }, []);

  const next = useCallback(() => {
    setActuActive(prev => {
      startTimeRef.current = Date.now();
      setProgress(0);
      return (prev + 1) % ACTUS.length;
    });
  }, []);

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
    matchService.getBySaison(3)
      .then(data => {
        if (!ignore) {
          const aVenir = data.filter(m => m.statut === 0).sort((a, b) => new Date(a.dateMatch) - new Date(b.dateMatch)).slice(0, 5);
          const termines = data.filter(m => m.statut === 2).sort((a, b) => new Date(b.dateMatch) - new Date(a.dateMatch)).slice(0, 8);
          setMatchs([...aVenir, ...termines]);
          setLoadingMatchs(false);
        }
      })
      .catch(() => setLoadingMatchs(false));
    return () => { ignore = true; };
  }, []);

  // Empreinte des scores en direct : change à chaque but -> classement et buteurs se rechargent
  const signatureLive = matchsLive
    .map(m => `${m.apiFootballId ?? m.id}:${m.scoreDomicile ?? 0}-${m.scoreExterieur ?? 0}`)
    .join('|');

  // Prochains matchs : les vrais (statut 0) s'il y en a, sinon la démo
  const vraisAVenir = useMemo(() => matchs.filter(m => m.statut === 0), [matchs]);
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
      <div style={{ position: 'relative', height: '920px', overflow: 'hidden' }}>

        {/* Images fond */}
        {ACTUS.map((a, i) => (
          <img key={i} src={a.img} alt=""
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover',
              opacity: i === actuActive ? 1 : 0,
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

        {/* Contenu : tag + titre + bouton + ticker */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: '230px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 60px',
        }}>
          <div style={{ width: '100%', maxWidth: '1150px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <span style={{
              display: 'inline-block', backgroundColor: theme.red, color: '#fff',
              padding: '4px 16px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px',
              textTransform: 'uppercase', marginBottom: '16px',
            }}>
              {ACTUS[actuActive].tag}
            </span>

            <h2 style={{
              color: '#fff', fontWeight: 400, fontSize: '38px',
              lineHeight: 1.25, maxWidth: '700px', marginBottom: '16px',
              fontFamily: '"Permanent Marker", "Raleway", Arial, sans-serif',
              textShadow: '0 2px 12px rgba(0,0,0,0.45)',
            }}>
              {ACTUS[actuActive].titre}
            </h2>

            <Link to={`/actualites/${ACTUS[actuActive].slug}`}
              className="transition-all hover:brightness-110"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                backgroundColor: theme.red, color: '#fff',
                padding: '10px 24px', borderRadius: '24px',
                fontWeight: 700, fontSize: '13px', textDecoration: 'none',
                textTransform: 'uppercase', marginBottom: '22px',
              }}>
              En savoir plus →
            </Link>

            {/* ── TICKER D'ACTUS ─────────────────────────────────────────── */}
            <div style={{ width: '100%', maxWidth: '1030px' }}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                {ACTUS.map((a, i) => {
                  const active = i === actuActive;
                  return (
                    <div key={i} style={{ flex: '0 0 185px', position: 'relative', height: '2px', borderRadius: '2px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.28)' }}>
                      {active && (
                        <div style={{
                          position: 'absolute', top: 0, left: 0, bottom: 0,
                          borderRadius: '2px',
                          backgroundColor: theme.greenBright,
                          width: `${progress}%`,
                          boxShadow: `0 0 6px ${theme.greenBright}`,
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                {ACTUS.map((a, i) => {
                  const active = i === actuActive;
                  return (
                    <button
                      key={i}
                      // 1er clic : affiche l'actu dans le hero ; clic sur l'actu déjà active : ouvre l'article
                      onClick={() => (active ? navigate(`/actualites/${a.slug}`) : goTo(i))}
                      title={active ? "Lire l'article" : a.titre}
                      style={{
                        flex: '0 0 185px', textAlign: 'left',
                        padding: 0, margin: 0,
                        backgroundColor: 'transparent',
                        border: 'none', cursor: 'pointer',
                      }}
                    >
                      <span style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: '14px',
                        lineHeight: 1.35,
                        fontFamily: '"Raleway", Arial, sans-serif',
                        color: active ? '#ffffff' : 'rgba(235,235,235,0.62)',
                        fontWeight: active ? 700 : 500,
                        textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                        transition: 'color 0.3s ease',
                      }}>
                        {a.titre}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
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
                Matchs
              </span>
              <Link to="/matchs"
                className="flex items-center gap-1 transition-opacity hover:opacity-80"
                style={{ fontSize: '15px', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>
                Tous les matchs <ChevronRight size={18} />
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
                <span style={{ fontSize: '14px', color: theme.textMuted }}>Chargement...</span>
              ) : matchs.length === 0 ? (
                <span style={{ fontSize: '14px', color: theme.textMuted }}>Aucun match pour le moment.</span>
              ) : matchs.map((m, i) => (
                <CarteMatch key={m.id ?? i} m={m} />
              ))}
            </div>

            {peutGauche && (
              <button onClick={() => scrollBarre(-1)} aria-label="Matchs précédents" style={FLECHE('left')}>
                <ChevronLeft size={20} color="#222" />
              </button>
            )}
            {peutDroite && (
              <button onClick={() => scrollBarre(1)} aria-label="Matchs suivants" style={FLECHE('right')}>
                <ChevronRight size={20} color="#222" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── EN DIRECT / DERNIERS RÉSULTATS (bande pleine largeur) ─────── */}
      <SectionDirect
        matchsLive={matchsLive}
        matchsAVenir={matchsAVenir}
        matchsTermines={matchs.filter(m => m.statut === 2)}
        isConnected={isConnected}
        demo={demoActive}
      />

      {/* ── CONTENU ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '56px 60px 8px', boxSizing: 'content-box' }}>

        {/* Classements Elite One / Elite Two */}
        <SectionClassement signatureLive={signatureLive} live={matchsLive.length > 0} />
      </div>

      {/* ── DERNIÈRES NOUVELLES (bande pleine largeur) ──────────────────── */}
      <SectionNouvelles />
    </div>
  );
};

export default AccueilPage;