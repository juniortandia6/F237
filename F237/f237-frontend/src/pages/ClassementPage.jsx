// f237-frontend/src/pages/ClassementPage.jsx
// Classement inspiré de FIBA :
// - zone haute sombre : saison, titre, choix du championnat + carte "Meilleurs buteurs"
// - zone basse claire : tableau du classement (zones, forme récente cliquable)

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Goal, CalendarClock } from 'lucide-react';
import { classementService } from '../services/classementService';
import { matchService } from '../services/matchService';
import { useLiveScores } from '../hooks/useLiveScores';
import { COMPETITIONS, ANNEE_ACTUELLE, SAISONS_DB } from '../data/saisons';
import SelecteurSaison from '../components/SelecteurSaison';
import theme from '../theme';

// ── Couleurs de la zone claire (mêmes que MatchsPage) ───────────────────
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
const CONTENEUR = { position: 'relative', maxWidth: '1150px', margin: '0 auto', padding: '0 60px', boxSizing: 'content-box' };

// Zones de fin de saison (nombre d'équipes en haut / en bas) — à ajuster selon le règlement
const ZONES = {
  one: { haut: 3, labelHaut: 'Compétitions africaines', bas: 2, labelBas: 'Relégation' },
  two: { haut: 2, labelHaut: 'Promotion en Elite One', bas: 2, labelBas: 'Relégation' },
};

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

// ── Petits utilitaires ──────────────────────────────────────────────────
// Lit une statistique quel que soit le nom exact du champ renvoyé par l'API
const stat = (e, ...noms) => {
  for (const n of noms) if (e?.[n] != null) return e[n];
  return null;
};
const nomEquipe = (e) => e?.equipe?.nom ?? e?.nom ?? e?.nomEquipe ?? '—';
const logoEquipe = (e) => e?.equipe?.logoUrl ?? e?.logoUrl;
const idEquipe = (e) => e?.equipeId ?? e?.equipe?.id ?? e?.id;

const resultatPour = (m, nom) => {
  const estDom = m.equipeDomicile?.nom === nom;
  const pour = estDom ? m.scoreDomicile : m.scoreExterieur;
  const contre = estDom ? m.scoreExterieur : m.scoreDomicile;
  return pour > contre ? 'V' : pour < contre ? 'D' : 'N';
};
const COULEUR_RESULTAT = { V: theme.green, N: '#a3aaa6', D: theme.red };

// Statistiques d'une équipe calculées à partir des matchs terminés
// (sert de secours si le classement ne renvoie pas BP / BC, et pour la forme)
function statsDepuisMatchs(matchs, nom) {
  const joues = matchs
    .filter(m => m.statut === 2 && (m.equipeDomicile?.nom === nom || m.equipeExterieur?.nom === nom))
    .sort((a, b) => new Date(a.dateMatch) - new Date(b.dateMatch));
  let bp = 0, bc = 0;
  for (const m of joues) {
    const estDom = m.equipeDomicile?.nom === nom;
    bp += (estDom ? m.scoreDomicile : m.scoreExterieur) ?? 0;
    bc += (estDom ? m.scoreExterieur : m.scoreDomicile) ?? 0;
  }
  return { bp, bc, forme: joues.slice(-5) }; // les 5 derniers, du plus ancien au plus récent
}

// Meilleurs buteurs à partir des buts des matchs (sans CSC ni buteurs inconnus)
function calculerButeurs(matchs) {
  const parJoueur = new Map();
  for (const m of matchs) {
    for (const b of m.buts ?? []) {
      if (b.estButCSC || !b.nomJoueur || b.nomJoueur === 'Inconnu') continue;
      const cle = `${b.nomJoueur}|${b.nomEquipe}`;
      const j = parJoueur.get(cle) ?? { nom: b.nomJoueur, equipe: b.nomEquipe, buts: 0, penalties: 0, matchs: new Set() };
      j.buts++;
      if (b.estPenalty) j.penalties++;
      j.matchs.add(m.id);
      parJoueur.set(cle, j);
    }
  }
  return [...parJoueur.values()]
    .map(j => ({ ...j, matchs: j.matchs.size }))
    .sort((a, b) => b.buts - a.buts || a.penalties - b.penalties || a.nom.localeCompare(b.nom));
}

// ── Carte "Meilleurs buteurs" (dans la zone haute) ──────────────────────
function CarteButeurs({ buteurs, logos, chargement, competition }) {
  const [tout, setTout] = useState(false);
  const liste = buteurs.slice(0, tout ? 10 : 5);
  const leader = liste[0];

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.28)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${CLAIR.bord}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '16px', color: CLAIR.texte }}>
          <Goal size={18} color={CLAIR.vert} /> Meilleurs buteurs
        </div>
        <span style={{ fontSize: '11px', fontWeight: 800, color: CLAIR.doux, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{competition}</span>
      </div>

      {chargement ? (
        <p style={{ padding: '36px 18px', textAlign: 'center', color: CLAIR.doux, fontSize: '14px' }}>Chargement...</p>
      ) : !leader ? (
        <p style={{ padding: '36px 18px', textAlign: 'center', color: CLAIR.doux, fontSize: '14px' }}>Aucun but enregistré pour l'instant.</p>
      ) : (
        <>
          {/* Le leader, mis en avant */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', background: 'linear-gradient(90deg, #e8f3ec, #fff)' }}>
            <span style={{
              width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#f5c542', color: '#3a2c00',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', flexShrink: 0,
            }}>1</span>
            {logos.get(leader.equipe)
              ? <img src={logos.get(leader.equipe)} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain', flexShrink: 0 }} />
              : <span style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: CLAIR.tuile, flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: CLAIR.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leader.nom}</div>
              <div style={{ fontSize: '12px', color: CLAIR.doux }}>
                {leader.equipe} · {leader.matchs} match{leader.matchs > 1 ? 's' : ''}{leader.penalties ? ` · ${leader.penalties} pen.` : ''}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: CHIFFRES, fontSize: '40px', fontWeight: 800, color: CLAIR.vert, lineHeight: 1 }}>{leader.buts}</div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: CLAIR.doux, letterSpacing: '0.5px' }}>BUTS</div>
            </div>
          </div>

          {/* Les suivants */}
          {liste.slice(1).map((j, i) => (
            <div key={`${j.nom}|${j.equipe}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 18px', borderTop: `1px solid ${CLAIR.bord}` }}>
              <span style={{ width: '30px', textAlign: 'center', fontWeight: 800, fontSize: '14px', color: CLAIR.doux, flexShrink: 0 }}>{i + 2}</span>
              {logos.get(j.equipe)
                ? <img src={logos.get(j.equipe)} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }} />
                : <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: CLAIR.tuile, flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: CLAIR.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.nom}</div>
                <div style={{ fontSize: '11px', color: CLAIR.doux, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.equipe}</div>
              </div>
              <span style={{ fontFamily: CHIFFRES, fontSize: '22px', fontWeight: 800, color: CLAIR.texte }}>{j.buts}</span>
            </div>
          ))}

          {buteurs.length > 5 && (
            <button onClick={() => setTout(t => !t)}
              style={{
                width: '100%', padding: '11px', border: 'none', borderTop: `1px solid ${CLAIR.bord}`, cursor: 'pointer',
                backgroundColor: CLAIR.tuile, color: CLAIR.vert, fontWeight: 700, fontSize: '13px',
              }}>
              {tout ? 'Voir moins' : 'Voir le top 10'}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ── Pastilles de forme (V / N / D), cliquables vers le match ────────────
function Forme({ matchs, nom }) {
  if (matchs.length === 0) return <span style={{ color: CLAIR.doux, fontSize: '12px' }}>—</span>;
  return (
    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
      {matchs.map(m => {
        const r = resultatPour(m, nom);
        return (
          <Link key={m.id} to={`/matchs/${m.id}`} state={{ match: m }}
            title={`${m.equipeDomicile?.nom} ${m.scoreDomicile}-${m.scoreExterieur} ${m.equipeExterieur?.nom}`}
            className="transition-transform hover:-translate-y-0.5"
            style={{
              width: '22px', height: '22px', borderRadius: '5px', backgroundColor: COULEUR_RESULTAT[r],
              color: '#fff', fontSize: '11px', fontWeight: 800, textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            {r}
          </Link>
        );
      })}
    </div>
  );
}

// ── Tableau du classement ───────────────────────────────────────────────
const COLONNES = '56px minmax(200px, 1fr) repeat(4, 46px) repeat(3, 52px) 60px 140px';

function TableauClassement({ lignes, zones }) {
  const total = lignes.length;
  const entete = { fontSize: '11px', fontWeight: 800, color: CLAIR.doux, letterSpacing: '0.5px', textAlign: 'center' };

  return (
    <div style={{ backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '14px', overflowX: 'auto' }}>
      <div style={{ minWidth: '900px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: COLONNES, alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${CLAIR.bord}` }}>
          <span style={entete}>#</span>
          <span style={{ ...entete, textAlign: 'left' }}>ÉQUIPE</span>
          {['J', 'V', 'N', 'D', 'BP', 'BC', 'DB', 'PTS'].map(c => <span key={c} style={entete}>{c}</span>)}
          <span style={{ ...entete, textAlign: 'right' }}>FORME</span>
        </div>

        {lignes.map((l, i) => {
          const rang = l.position ?? i + 1;
          const enHaut = rang <= zones.haut;
          const enBas = rang > total - zones.bas;
          const couleurZone = enHaut ? theme.green : enBas ? theme.red : 'transparent';
          const id = idEquipe(l.brut);
          const nombre = (v, couleur) => (
            <span style={{ textAlign: 'center', fontSize: '15px', color: couleur ?? '#3d4441' }}>{v ?? '–'}</span>
          );

          return (
            <div key={`${l.nom}-${rang}`}
              className="transition-colors"
              style={{
                display: 'grid', gridTemplateColumns: COLONNES, alignItems: 'center',
                padding: '12px 16px', borderTop: i ? `1px solid ${CLAIR.bord}` : 'none',
                boxShadow: `inset 4px 0 0 ${couleurZone}`,
                // Séparateurs de zone, comme chez FIBA
                borderBottom: rang === zones.haut || rang === total - zones.bas ? `2px dashed ${CLAIR.bord}` : undefined,
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f7f9f8'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span style={{ textAlign: 'center', fontWeight: 800, fontSize: '15px', color: CLAIR.texte }}>{rang}</span>

              <Link to={id != null ? `/equipes/${id}` : '#'}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, textDecoration: 'none', color: CLAIR.texte }}>
                {l.logo
                  ? <img src={l.logo} alt="" style={{ width: '30px', height: '30px', objectFit: 'contain', flexShrink: 0 }} />
                  : <span style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: CLAIR.tuile, flexShrink: 0 }} />}
                <span style={{ fontSize: '16px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.nom}</span>
              </Link>

              {nombre(l.j)}
              {nombre(l.v, theme.green)}
              {nombre(l.n)}
              {nombre(l.d, theme.red)}
              {nombre(l.bp)}
              {nombre(l.bc)}
              {nombre(l.db == null ? null : l.db > 0 ? `+${l.db}` : l.db, l.db > 0 ? theme.green : l.db < 0 ? theme.red : undefined)}
              <span style={{ textAlign: 'center', fontFamily: CHIFFRES, fontSize: '22px', fontWeight: 800, color: CLAIR.texte }}>{l.pts}</span>
              <Forme matchs={l.forme} nom={l.nom} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Légende des zones (zone haute) ─────────────────────────────────────
function Legende({ couleur, children }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
      <span style={{ width: '4px', height: '16px', borderRadius: '2px', backgroundColor: couleur }} />
      {children}
    </span>
  );
}

// ── Page ────────────────────────────────────────────────────────────────
function ClassementPage() {
  const [annee, setAnnee] = useState(ANNEE_ACTUELLE);
  const [comp, setComp] = useState('one');
  const [donnees, setDonnees] = useState(null); // { cle, classement, matchs }
  const { matchsLive } = useLiveScores();

  const saisonId = SAISONS_DB[annee]?.[comp] ?? null; // null = saison pas encore importée
  const cle = `${annee}-${comp}`;
  const chargement = saisonId != null && donnees?.cle !== cle;
  const competition = COMPETITIONS.find(c => c.cle === comp)?.label ?? '';
  const zones = ZONES[comp];

  // Change dès qu'un score évolue en direct -> on recharge classement et buteurs
  const signatureLive = (matchsLive ?? []).map(l => `${l.apiFootballId}:${l.scoreDomicile}-${l.scoreExterieur}`).join('|');

  useEffect(() => {
    if (saisonId == null) return;
    let ignore = false;
    Promise.all([
      classementService.getBySaison(saisonId).catch(() => []),
      matchService.getBySaison(saisonId).catch(() => []),
    ]).then(([classement, matchs]) => {
      if (!ignore) setDonnees({ cle: `${annee}-${comp}`, classement, matchs });
    });
    return () => { ignore = true; };
  }, [saisonId, annee, comp, signatureLive]);

  const matchs = useMemo(() => (donnees?.cle === cle ? donnees.matchs : []), [donnees, cle]);

  // Lignes du tableau : stats du classement, complétées par les matchs si besoin
  const lignes = useMemo(() => {
    if (donnees?.cle !== cle) return [];
    return [...donnees.classement]
      .sort((a, b) => (a.position ?? 999) - (b.position ?? 999) || (b.points ?? 0) - (a.points ?? 0))
      .map(e => {
        const nom = nomEquipe(e);
        const calc = statsDepuisMatchs(donnees.matchs, nom);
        const bp = stat(e, 'butsPour', 'butsMarques', 'bp', 'goalsFor') ?? calc.bp;
        const bc = stat(e, 'butsContre', 'butsEncaisses', 'bc', 'goalsAgainst') ?? calc.bc;
        return {
          brut: e, nom, logo: logoEquipe(e), position: e.position,
          j: stat(e, 'matchsJoues', 'joues', 'played'),
          v: stat(e, 'victoires', 'gagnes', 'win'),
          n: stat(e, 'nuls', 'egalites', 'draw'),
          d: stat(e, 'defaites', 'perdus', 'lose'),
          bp, bc,
          db: stat(e, 'differenceButs', 'diffButs', 'goalDifference') ?? bp - bc,
          pts: e.points ?? 0,
          forme: calc.forme,
        };
      });
  }, [donnees, cle]);

  const buteurs = useMemo(() => calculerButeurs(matchs), [matchs]);

  // Logos des équipes par nom (pour la carte des buteurs)
  const logos = useMemo(() => {
    const map = new Map();
    for (const m of matchs) {
      if (m.equipeDomicile?.logoUrl) map.set(m.equipeDomicile.nom, m.equipeDomicile.logoUrl);
      if (m.equipeExterieur?.logoUrl) map.set(m.equipeExterieur.nom, m.equipeExterieur.logoUrl);
    }
    return map;
  }, [matchs]);

  return (
    <div>
      {/* ── ZONE HAUTE ─────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: FOND_BANDE, padding: '48px 0 56px' }}>
        <EclatsBande />
        <div style={CONTENEUR}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px]" style={{ alignItems: 'center' }}>
            {/* Gauche : saison, titre, championnat, légende */}
            <div>
              <SelecteurSaison annee={annee} onChange={setAnnee} />
              <h1 style={{ color: '#fff', fontSize: '56px', fontWeight: 400, lineHeight: 1.05, margin: '14px 0 10px', fontFamily: '"Permanent Marker", "Raleway", Arial, sans-serif' }}>
                Classement
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginBottom: '24px', maxWidth: '420px', lineHeight: 1.5 }}>
                MTN {competition}, saison {annee}. Mis à jour automatiquement après chaque match.
              </p>

              <div style={{ display: 'inline-flex', padding: '4px', borderRadius: '999px', backgroundColor: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.12)', marginBottom: '24px' }}>
                {COMPETITIONS.map(c => {
                  const actif = c.cle === comp;
                  return (
                    <button key={c.cle} onClick={() => setComp(c.cle)}
                      style={{
                        padding: '10px 22px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                        fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px',
                        backgroundColor: actif ? '#fff' : 'transparent',
                        color: actif ? '#0f3d26' : 'rgba(255,255,255,0.8)',
                        transition: 'all 0.2s ease',
                      }}>
                      MTN {c.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <Legende couleur={theme.green}>{zones.labelHaut}</Legende>
                <Legende couleur={theme.red}>{zones.labelBas}</Legende>
              </div>
            </div>

            {/* Droite : meilleurs buteurs du championnat choisi */}
            {saisonId != null && (
              <CarteButeurs key={cle} buteurs={buteurs} logos={logos} chargement={chargement} competition={`MTN ${competition}`} />
            )}
          </div>
        </div>
      </section>

      {/* ── ZONE BASSE ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: CLAIR.fond, minHeight: '420px', padding: '36px 0 64px' }}>
        <div style={CONTENEUR}>
          {saisonId == null ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center',
              padding: '56px 24px', backgroundColor: CLAIR.carte, border: `1px dashed ${CLAIR.bord}`, borderRadius: '14px',
            }}>
              <span style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#e8f3ec', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarClock size={26} color={CLAIR.vert} />
              </span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: CLAIR.texte }}>MTN {competition} · Saison {annee}</div>
              <p style={{ fontSize: '15px', color: CLAIR.doux, maxWidth: '440px', lineHeight: 1.5 }}>
                Le classement de cette saison n'est pas encore disponible sur F237. Il arrive bientôt !
              </p>
              <button onClick={() => setAnnee(ANNEE_ACTUELLE)}
                style={{ marginTop: '6px', padding: '10px 20px', borderRadius: '999px', border: 'none', cursor: 'pointer', backgroundColor: CLAIR.vert, color: '#fff', fontSize: '14px', fontWeight: 700 }}>
                Revenir à la saison {ANNEE_ACTUELLE}
              </button>
            </div>
          ) : chargement ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: CLAIR.doux }}>Chargement du classement...</div>
          ) : lignes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: CLAIR.doux, backgroundColor: CLAIR.carte, border: `1px dashed ${CLAIR.bord}`, borderRadius: '14px' }}>
              Aucun classement disponible pour le moment.
            </div>
          ) : (
            <>
              <TableauClassement lignes={lignes} zones={zones} />
              <p style={{ marginTop: '12px', fontSize: '12px', color: CLAIR.doux }}>
                J : joués · V : victoires · N : nuls · D : défaites · BP : buts pour · BC : buts contre · DB : différence de buts · Forme : 5 derniers matchs (clique pour voir le match)
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default ClassementPage;