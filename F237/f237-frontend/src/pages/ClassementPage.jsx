// f237-frontend/src/pages/ClassementPage.jsx
// Classement inspiré de FIBA :
// - zone haute sombre : saison, titre, choix du championnat + carte "Meilleurs buteurs"
// - zone basse claire : tableau du classement (zones, forme récente cliquable)

import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Goal, CalendarClock, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { classementService } from '../services/classementService';
import { matchService } from '../services/matchService';
import { useLiveScores } from '../hooks/useLiveScores';
import { COMPETITIONS, ANNEE_ACTUELLE, SAISONS_DB, libelleSaison } from '../data/saisons';
import SelecteurSaison from '../components/SelecteurSaison';
import theme from '../theme';
import AvatarJoueur from '../components/AvatarJoueur';
import { regrouperButeurs, classerButeurs } from '../data/buteurs';

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
const CONTENEUR = { position: 'relative', maxWidth: '1150px', margin: '0 auto', padding: '0 var(--marge-page)', boxSizing: 'content-box' };

// Zones de fin de saison (labelHaut / labelBas = clés de traduction classement.zones.*) (nombre d'équipes en haut / en bas) — à ajuster selon le règlement
const ZONES = {
  one: { haut: 3, labelHaut: 'africaines', bas: 2, labelBas: 'relegation' },
  two: { haut: 2, labelHaut: 'promotion', bas: 2, labelBas: 'relegation' },
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

// Classement recalculé à partir des matchs terminés (3 pts victoire, 1 pt nul).
// Sert quand API-Football ne fournit pas de classement (ex. Elite Two 2023 et 2024).
function classementDepuisMatchs(matchs) {
  const table = new Map();
  const ligne = (eq) => {
    if (!table.has(eq.nom)) {
      table.set(eq.nom, { equipe: eq, equipeId: eq.id, matchsJoues: 0, victoires: 0, nuls: 0, defaites: 0, butsPour: 0, butsContre: 0, points: 0 });
    }
    return table.get(eq.nom);
  };
  for (const m of matchs) {
    if (m.statut !== 2 || !m.equipeDomicile || !m.equipeExterieur) continue;
    const dom = ligne(m.equipeDomicile), ext = ligne(m.equipeExterieur);
    const sd = m.scoreDomicile ?? 0, se = m.scoreExterieur ?? 0;
    dom.matchsJoues++; ext.matchsJoues++;
    dom.butsPour += sd; dom.butsContre += se;
    ext.butsPour += se; ext.butsContre += sd;
    if (sd > se) { dom.victoires++; dom.points += 3; ext.defaites++; }
    else if (sd < se) { ext.victoires++; ext.points += 3; dom.defaites++; }
    else { dom.nuls++; ext.nuls++; dom.points++; ext.points++; }
  }
  return [...table.values()]
    .sort((a, b) => b.points - a.points
      || (b.butsPour - b.butsContre) - (a.butsPour - a.butsContre)
      || b.butsPour - a.butsPour
      || a.equipe.nom.localeCompare(b.equipe.nom, 'fr'))
    .map((l, i) => ({ ...l, position: i + 1, differenceDesButs: l.butsPour - l.butsContre }));
}

// Évolution de chaque équipe depuis la journée précédente, calculée nous-mêmes
// (le champ "status" de l'API reste souvent bloqué sur "same" pour l'Elite One).
// On compare le classement avec TOUS les matchs terminés au classement d'avant la
// dernière journée (= matchs terminés plus de 3 jours avant le dernier match joué :
// une journée d'Elite One s'étale en général sur 2-3 jours).
// Renvoie Map(nom d'équipe -> 'up' | 'down' | 'same'), vide s'il n'y a pas d'avant.
function evolutionsDepuisMatchs(matchs) {
  const termines = matchs.filter(m => m.statut === 2 && m.equipeDomicile && m.equipeExterieur);
  if (termines.length === 0) return new Map();
  const dernier = Math.max(...termines.map(m => new Date(m.dateMatch).getTime()));
  const seuil = dernier - 3 * 24 * 3600 * 1000;
  const avant = termines.filter(m => new Date(m.dateMatch).getTime() < seuil);
  if (avant.length === 0) return new Map();

  const rangs = (liste) => new Map(classementDepuisMatchs(liste).map(l => [l.equipe.nom, l.position]));
  const maintenant = rangs(termines);
  const precedent = rangs(avant);
  const evolutions = new Map();
  for (const [nom, rang] of maintenant) {
    const ancien = precedent.get(nom);
    if (ancien == null) continue; // pas encore joué avant la dernière journée
    evolutions.set(nom, rang < ancien ? 'up' : rang > ancien ? 'down' : 'same');
  }
  return evolutions;
}

// ── Classement Domicile / Extérieur ──────────────────────────────────────
// L'API ne fournit que le classement global : on recalcule à partir des
// matchs terminés, en ne gardant pour chaque équipe que ses matchs joués
// à domicile (cote = 'domicile') ou à l'extérieur (cote = 'exterieur').
const VUES = ['global', 'domicile', 'exterieur'];

function statsLieu(matchs, nom, cote) {
  const joues = matchs
    .filter(m => m.statut === 2 && (cote === 'domicile' ? m.equipeDomicile?.nom === nom : m.equipeExterieur?.nom === nom))
    .sort((a, b) => new Date(a.dateMatch) - new Date(b.dateMatch));
  const s = { j: 0, v: 0, n: 0, d: 0, bp: 0, bc: 0, pts: 0 };
  for (const m of joues) {
    const pour = (cote === 'domicile' ? m.scoreDomicile : m.scoreExterieur) ?? 0;
    const contre = (cote === 'domicile' ? m.scoreExterieur : m.scoreDomicile) ?? 0;
    s.j++; s.bp += pour; s.bc += contre;
    if (pour > contre) { s.v++; s.pts += 3; } else if (pour < contre) s.d++; else { s.n++; s.pts++; }
  }
  return { ...s, db: s.bp - s.bc, forme: joues.slice(-5) };
}

// Lignes du tableau pour une vue Domicile / Extérieur, à partir des lignes du
// classement global (logo, lien, poule conservés). Le rang est recalculé dans
// chaque poule ; pas de flèche d'évolution ni de description de zone.
function lignesParLieu(lignes, matchs, cote) {
  const parGroupe = new Map();
  for (const l of lignes) {
    const s = statsLieu(matchs, l.nom, cote);
    const ligne = { ...l, ...s, evolution: null, description: null };
    const g = l.groupe ?? '';
    if (!parGroupe.has(g)) parGroupe.set(g, []);
    parGroupe.get(g).push(ligne);
  }
  return [...parGroupe.values()].flatMap(liste => liste
    .sort((x, y) => y.pts - x.pts || y.db - x.db || y.bp - x.bp || x.nom.localeCompare(y.nom, 'fr'))
    .map((l, i) => ({ ...l, position: i + 1 })));
}

// Sélecteur Global / Domicile / Extérieur (zone claire, au-dessus du tableau)
function SelecteurVue({ vue, onChange }) {
  const { t } = useTranslation();
  return (
    <div role="tablist" style={{
      display: 'inline-flex', padding: '4px', borderRadius: '999px',
      backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      {VUES.map(v => {
        const actif = v === vue;
        return (
          <button key={v} role="tab" aria-selected={actif} onClick={() => onChange(v)}
            style={{
              padding: '9px 20px', borderRadius: '999px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase',
              backgroundColor: actif ? CLAIR.vert : 'transparent',
              color: actif ? '#fff' : CLAIR.doux,
              transition: 'all 0.2s ease',
            }}>
            {t(`classement.vue.${v}`)}
          </button>
        );
      })}
    </div>
  );
}

// Meilleurs buteurs à partir des buts des matchs (sans CSC ni buteurs inconnus) : voir data/buteurs.js
const calculerButeurs = (matchs) => classerButeurs(regrouperButeurs(matchs));

// Nom d'un buteur : lien vers sa fiche s'il est relié à l'effectif
function NomJoueur({ j }) {
  const { t } = useTranslation();
  if (!j.joueurId) return j.nom;
  return (
    <Link to={`/joueurs/${j.joueurId}`} title={t('joueur.voirFiche')} className="hover:underline" style={{ color: 'inherit', textDecoration: 'none' }}>
      {j.nom}
    </Link>
  );
}

// ── Carte "Meilleurs buteurs" (dans la zone haute) ──────────────────────
function CarteButeurs({ buteurs, logos, chargement, competition, surligne }) {
  const { t } = useTranslation();
  const [tout, setTout] = useState(false);
  // Joueur venu de l'accueil : on ouvre le top 10 s'il est au-delà du 5e
  const indexSurligne = surligne ? buteurs.findIndex(j => `${j.nom}|${j.equipe}` === surligne) : -1;
  const voirTout = tout || indexSurligne >= 5;
  const liste = buteurs.slice(0, voirTout ? 10 : 5);
  const leader = liste[0];

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.28)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${CLAIR.bord}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '16px', color: CLAIR.texte }}>
          <Goal size={18} color={CLAIR.vert} /> {t('accueil.buteurs.titre')}
        </div>
        <span style={{ fontSize: '11px', fontWeight: 800, color: CLAIR.doux, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{competition}</span>
      </div>

      {chargement ? (
        <p style={{ padding: '36px 18px', textAlign: 'center', color: CLAIR.doux, fontSize: '14px' }}>{t('commun.chargement')}</p>
      ) : !leader ? (
        <p style={{ padding: '36px 18px', textAlign: 'center', color: CLAIR.doux, fontSize: '14px' }}>{t('classement.aucunBut')}</p>
      ) : (
        <>
          {/* Le leader, mis en avant */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', background: 'linear-gradient(90deg, #e8f3ec, #fff)',
            boxShadow: indexSurligne === 0 ? `inset 4px 0 0 ${CLAIR.vert}` : 'none',
          }}>
            <span style={{
              width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#f5c542', color: '#3a2c00',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', flexShrink: 0,
            }}>1</span>
            <AvatarJoueur logo={logos.get(leader.equipe)} club={leader.equipe} nom={leader.nom} taille={52} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: CLAIR.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><NomJoueur j={leader} /></div>
              <div style={{ fontSize: '12px', color: CLAIR.doux }}>
                {leader.equipe} · {t('matchs.nbMatchs', { count: leader.matchs })}{leader.penaltys ? ` · ${leader.penaltys} ${t('matchDetail.pen')}` : ''}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: CHIFFRES, fontSize: '40px', fontWeight: 800, color: CLAIR.vert, lineHeight: 1 }}>{leader.buts}</div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: CLAIR.doux, letterSpacing: '0.5px' }}>{t('classement.butsMaj')}</div>
            </div>
          </div>

          {/* Les suivants */}
          {liste.slice(1).map((j, i) => (
            <div key={`${j.nom}|${j.equipe}`} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 18px', borderTop: `1px solid ${CLAIR.bord}`,
              ...(indexSurligne === i + 1 && { backgroundColor: '#e8f3ec', boxShadow: `inset 4px 0 0 ${CLAIR.vert}` }),
            }}>
              <span style={{ width: '30px', textAlign: 'center', fontWeight: 800, fontSize: '14px', color: CLAIR.doux, flexShrink: 0 }}>{i + 2}</span>
              <AvatarJoueur logo={logos.get(j.equipe)} club={j.equipe} nom={j.nom} taille={36} ombre={false} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: CLAIR.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><NomJoueur j={j} /></div>
                <div style={{ fontSize: '11px', color: CLAIR.doux, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.equipe}</div>
              </div>
              <span style={{ fontFamily: CHIFFRES, fontSize: '22px', fontWeight: 800, color: CLAIR.texte }}>{j.buts}</span>
            </div>
          ))}

          {buteurs.length > 5 && indexSurligne < 5 && (
            <button onClick={() => setTout(x => !x)}
              style={{
                width: '100%', padding: '11px', border: 'none', borderTop: `1px solid ${CLAIR.bord}`, cursor: 'pointer',
                backgroundColor: CLAIR.tuile, color: CLAIR.vert, fontWeight: 700, fontSize: '13px',
              }}>
              {voirTout ? t('classement.voirMoins') : t('classement.voirTop10')}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ── Pastilles de forme (V / N / D), cliquables vers le match ────────────
function Forme({ matchs, nom }) {
  const { t } = useTranslation();
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
            {t(`matchDetail.resultat.${r}`)}
          </Link>
        );
      })}
    </div>
  );
}

// Nom lisible d'un groupe : "Elite One: Championship Round" -> "Championship Round"
const nomGroupe = (g) => (g ?? '').replace(/^[^:]*:\s*/, '').trim();

// Titre traduit d'un groupe : "Group B" -> "Poule B", "Championship Round" -> "Poule pour le titre"...
const titreGroupe = (g, t) => {
  const nom = nomGroupe(g);
  const poule = nom.match(/^group\s+(\w+)$/i);
  if (poule) return t('classement.poule', { l: poule[1].toUpperCase() });
  return t(`classement.groupes.${nom}`, { defaultValue: nom || t('classement.titre') });
};

// Zone d'une ligne : 'haut' (vert), 'bas' (rouge) ou null.
// Si l'API a précisé ce que rapporte chaque place (description), on s'en sert ;
// sinon on applique les règles par défaut de ZONES.
const zoneDe = (l, rang, total, zones, parDescription) => {
  if (parDescription) {
    if (!l.description) return null;
    return /relegation|relégation/i.test(l.description) ? 'bas' : 'haut';
  }
  if (rang <= zones.haut) return 'haut';
  if (rang > total - zones.bas) return 'bas';
  return null;
};
const COULEUR_ZONE = { haut: theme.green, bas: theme.red };

// Flèche d'évolution depuis la journée précédente (donnée "status" de l'API)
const EVOLUTIONS = {
  up: { Icone: ArrowUp, couleur: theme.green },
  down: { Icone: ArrowDown, couleur: theme.red },
  same: { Icone: Minus, couleur: '#a3aaa6' },
};
function Evolution({ valeur }) {
  const { t } = useTranslation();
  const evo = EVOLUTIONS[valeur];
  if (!evo) return <span style={{ width: '14px' }} />;
  const { Icone, couleur } = evo;
  return (
    <span title={t(`classement.evolution.${valeur}`)} aria-label={t(`classement.evolution.${valeur}`)} style={{ display: 'flex', width: '14px' }}>
      <Icone size={14} color={couleur} strokeWidth={2.6} />
    </span>
  );
}

// ── Tableau du classement ───────────────────────────────────────────────
const COLONNES = '76px minmax(200px, 1fr) repeat(4, 46px) repeat(3, 52px) 60px 140px';

function TableauClassement({ lignes, zones, annee, avecZones = true }) {
  const { t } = useTranslation();
  const total = lignes.length;
  const parDescription = lignes.some(l => l.description);
  // Vues Domicile / Extérieur : les zones (titre, relégation) n'ont pas de sens
  const zonesLignes = lignes.map((l, i) => (avecZones ? zoneDe(l, l.position ?? i + 1, total, zones, parDescription) : null));
  const entete = { fontSize: '11px', fontWeight: 800, color: CLAIR.doux, letterSpacing: '0.5px', textAlign: 'center' };

  return (
    <div style={{ backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '14px', overflowX: 'auto' }}>
      <div style={{ minWidth: '900px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: COLONNES, alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${CLAIR.bord}` }}>
          <span style={entete}>#</span>
          <span style={{ ...entete, textAlign: 'left' }}>{t('matchDetail.mt.equipe')}</span>
          {['j', 'v', 'n', 'd', 'bp', 'bc', 'db', 'pts'].map(c => <span key={c} style={entete}>{t(`classement.col.${c}`)}</span>)}
          <span style={{ ...entete, textAlign: 'right' }}>{t('classement.formeMaj')}</span>
        </div>

        {lignes.map((l, i) => {
          const rang = l.position ?? i + 1;
          const couleurZone = COULEUR_ZONE[zonesLignes[i]] ?? 'transparent';
          // Séparateur quand la zone change à la ligne suivante
          const finDeZone = i < total - 1 && zonesLignes[i] !== zonesLignes[i + 1];
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
                borderBottom: finDeZone ? `2px dashed ${CLAIR.bord}` : undefined,
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f7f9f8'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ minWidth: '20px', textAlign: 'right', fontWeight: 800, fontSize: '15px', color: CLAIR.texte }}>{rang}</span>
                <Evolution valeur={l.evolution} />
              </span>

              <Link to={id != null ? `/equipes/${id}?saison=${annee}` : '#'}
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
  const { t } = useTranslation();
  const [annee, setAnnee] = useState(ANNEE_ACTUELLE);
  // ?comp=two&joueur=Nom|Club#buteurs : arrivée depuis une carte buteur de l'accueil
  const [params] = useSearchParams();
  const { hash } = useLocation();
  const [comp, setComp] = useState(() => (params.get('comp') === 'two' ? 'two' : 'one'));
  const joueurVise = params.get('joueur');
  const blocButeursRef = useRef(null);
  const dejaDefile = useRef(false);
  const [donnees, setDonnees] = useState(null); // { cle, classement, matchs }
  const [vue, setVue] = useState('global'); // 'global' | 'domicile' | 'exterieur'
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
  // Pas de classement fourni par l'API -> on le calcule à partir des matchs
  const classementCalcule = donnees?.cle === cle && donnees.classement.length === 0 && donnees.matchs.some(m => m.statut === 2);

  const lignes = useMemo(() => {
    if (donnees?.cle !== cle) return [];
    const source = donnees.classement.length > 0 ? donnees.classement : classementDepuisMatchs(donnees.matchs);
    // Saison en plusieurs poules : on garde l'évolution donnée par l'API ;
    // sinon on la calcule à partir des résultats
    const plusieursGroupes = new Set(source.map(e => e.groupe ?? '')).size > 1;
    const evolutions = plusieursGroupes ? new Map() : evolutionsDepuisMatchs(donnees.matchs);
    const lignes = [...source]
      .sort((a, b) => (a.ordreGroupe ?? 0) - (b.ordreGroupe ?? 0)
        || (a.position ?? 999) - (b.position ?? 999) || (b.points ?? 0) - (a.points ?? 0))
      .map(e => {
        const nom = nomEquipe(e);
        const calc = statsDepuisMatchs(donnees.matchs, nom);
        const bp = stat(e, 'butsPour', 'butsMarques', 'bp', 'goalsFor') ?? calc.bp;
        const bc = stat(e, 'butsContre', 'butsEncaisses', 'bc', 'goalsAgainst') ?? calc.bc;
        return {
          brut: e, nom, logo: logoEquipe(e), position: e.position,
          groupe: e.groupe ?? null, ordreGroupe: e.ordreGroupe ?? 0, description: e.description ?? null,
          evolution: plusieursGroupes ? (e.evolution ?? null) : (evolutions.get(nom) ?? null),
          j: stat(e, 'matchsJoues', 'joues', 'played'),
          v: stat(e, 'victoires', 'gagnes', 'win'),
          n: stat(e, 'nuls', 'egalites', 'draw'),
          d: stat(e, 'defaites', 'perdus', 'lose'),
          bp, bc,
          db: stat(e, 'differenceDesButs', 'differenceButs', 'diffButs', 'goalDifference') ?? bp - bc,
          pts: e.points ?? 0,
          forme: calc.forme,
        };
      });

    // Classement de l'API en retard sur nos résultats (elle met parfois du temps à
    // le recalculer après un match) : pour une saison à un seul tableau, une équipe
    // qui a plus de matchs joués dans nos résultats prend ses stats calculées,
    // puis on refait l'ordre. Le classement officiel reprend la main dès que l'API suit.
    if (plusieursGroupes || donnees.classement.length === 0) return lignes;
    const calcules = new Map(classementDepuisMatchs(donnees.matchs).map(c => [c.equipe.nom, c]));
    let modifie = false;
    const misesAJour = lignes.map(l => {
      const c = calcules.get(l.nom);
      if (!c || c.matchsJoues <= (l.j ?? 0)) return l;
      modifie = true;
      return {
        ...l, j: c.matchsJoues, v: c.victoires, n: c.nuls, d: c.defaites,
        bp: c.butsPour, bc: c.butsContre, db: c.differenceDesButs, pts: c.points,
      };
    });
    if (!modifie) return lignes;
    return misesAJour
      .sort((x, y) => y.pts - x.pts || y.db - x.db || y.bp - x.bp || x.nom.localeCompare(y.nom, 'fr'))
      .map((l, i) => ({ ...l, position: i + 1 }));
  }, [donnees, cle]);

  // Lignes affichées selon la vue choisie (Global / Domicile / Extérieur)
  const lignesVue = useMemo(
    () => (vue === 'global' ? lignes : lignesParLieu(lignes, matchs, vue)),
    [lignes, matchs, vue],
  );

  // Saisons en plusieurs poules / phases : un tableau par groupe (dans l'ordre de l'API)
  const groupes = useMemo(() => {
    const parGroupe = new Map();
    for (const l of lignesVue) {
      const cleGroupe = l.groupe ?? '';
      if (!parGroupe.has(cleGroupe)) parGroupe.set(cleGroupe, []);
      parGroupe.get(cleGroupe).push(l);
    }
    return [...parGroupe.entries()].map(([nom, liste]) => ({ nom, lignes: liste }));
  }, [lignesVue]);

  const buteurs = useMemo(() => calculerButeurs(matchs), [matchs]);

  // Arrivée par #buteurs : on descend jusqu'à la carte une fois les buteurs chargés (une seule fois)
  useEffect(() => {
    if (chargement || dejaDefile.current || hash !== '#buteurs') return;
    dejaDefile.current = true;
    blocButeursRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [chargement, hash]);

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
              <h1 style={{ color: '#fff', fontSize: '56px', fontWeight: 400, lineHeight: 1.05, margin: '14px 0 10px', fontFamily: 'var(--font-titres)' }}>
                {t('classement.titre')}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginBottom: '24px', maxWidth: '420px', lineHeight: 1.5 }}>
                {t('classement.sousTitre', { c: `MTN ${competition}`, s: libelleSaison(annee) })}
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
                <Legende couleur={theme.green}>{t(`classement.zones.${zones.labelHaut}`)}</Legende>
                <Legende couleur={theme.red}>{t(`classement.zones.${zones.labelBas}`)}</Legende>
              </div>
            </div>

            {/* Droite : meilleurs buteurs du championnat choisi */}
            {saisonId != null && (
              <div id="buteurs" ref={blocButeursRef} style={{ scrollMarginTop: '90px' }}>
                <CarteButeurs key={cle} buteurs={buteurs} logos={logos} chargement={chargement}
                  competition={`MTN ${competition}`} surligne={comp === (params.get('comp') === 'two' ? 'two' : 'one') ? joueurVise : null} />
              </div>
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
              <div style={{ fontSize: '20px', fontWeight: 800, color: CLAIR.texte }}>MTN {competition} · {t('saison.saison', { s: libelleSaison(annee) })}</div>
              <p style={{ fontSize: '15px', color: CLAIR.doux, maxWidth: '440px', lineHeight: 1.5 }}>
                {t('classement.saisonIndispo')}
              </p>
              <button onClick={() => setAnnee(ANNEE_ACTUELLE)}
                style={{ marginTop: '6px', padding: '10px 20px', borderRadius: '999px', border: 'none', cursor: 'pointer', backgroundColor: CLAIR.vert, color: '#fff', fontSize: '14px', fontWeight: 700 }}>
                {t('matchs.revenirSaison', { s: libelleSaison(ANNEE_ACTUELLE) })}
              </button>
            </div>
          ) : chargement ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: CLAIR.doux }}>{t('classement.chargement')}</div>
          ) : lignes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: CLAIR.doux, backgroundColor: CLAIR.carte, border: `1px dashed ${CLAIR.bord}`, borderRadius: '14px' }}>
              {t('classement.aucun')}
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <SelecteurVue vue={vue} onChange={setVue} />
                {vue !== 'global' && (
                  <span style={{ fontSize: '13px', color: CLAIR.doux }}>{t(`classement.vueNote.${vue}`)}</span>
                )}
              </div>
              {classementCalcule && vue === 'global' && (
                <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#fdf6dc', border: '1px solid #f1e2a6', color: '#6b5510', fontSize: '13px' }}>
                  {t('classement.calcule')}
                </div>
              )}
              {groupes.length > 1 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {groupes.map(g => (
                    <div key={g.nom}>
                      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: 800, color: CLAIR.texte, marginBottom: '12px' }}>
                        <span style={{ width: '6px', height: '22px', borderRadius: '3px', background: `linear-gradient(${theme.green}, ${theme.red}, ${theme.yellow})` }} />
                        {titreGroupe(g.nom, t)}
                      </h2>
                      <TableauClassement lignes={g.lignes} zones={zones} annee={annee} avecZones={vue === 'global'} />
                    </div>
                  ))}
                </div>
              ) : (
                <TableauClassement lignes={lignesVue} zones={zones} annee={annee} avecZones={vue === 'global'} />
              )}
              <p style={{ marginTop: '12px', fontSize: '12px', color: CLAIR.doux }}>
                {t('classement.legende')}
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default ClassementPage;