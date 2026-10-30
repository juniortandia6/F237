// f237-frontend/src/pages/MatchDetailPage.jsx
// Page d'un match (route /matchs/:id), inspirée de la fiche de match FIBA :
// - zone haute sombre : fil d'Ariane, équipes, gros score, buteurs
// - barre d'onglets blanche : Aperçu · Chronologie · Face-à-face
// - zone basse claire : contenu de l'onglet + colonne "Infos du match"

import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { ChevronRight, ArrowLeft, CalendarDays, Clock, MapPin, Trophy, Hash } from 'lucide-react';
import { matchService } from '../services/matchService';
import { useLiveScores } from '../hooks/useLiveScores';
import { TOUS_LES_SAISON_IDS, infosSaison, libelleSaison } from '../data/saisons';
import theme from '../theme';

// ── Couleurs de la zone claire (mêmes que MatchsPage) ───────────────────
const CLAIR = {
  fond: '#eef1ef',
  carte: '#ffffff',
  bord: '#e2e7e4',
  texte: '#141414',
  doux: '#6b7470',
  perdant: '#9aa19d',
  tuile: '#f2f4f3',
  vert: '#14532f',
};

const CHIFFRES = '"Barlow Condensed", Arial, sans-serif';
const CONTENEUR = { position: 'relative', maxWidth: '1150px', margin: '0 auto', padding: '0 60px', boxSizing: 'content-box' };

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
const abrev = (nom) => (nom ?? '???').replace(/[^A-Za-zÀ-ÿ]/g, '').substring(0, 3).toUpperCase();
const dateLongue = (d) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const heure = (d) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const nomButeur = (b) => (b.nomJoueur && b.nomJoueur !== 'Inconnu' ? b.nomJoueur : 'Buteur inconnu');
const journeeDe = (m) => m.journee ?? m.numeroJournee ?? m.round ?? null;
const stadeDe = (m) => m.stade ?? m.nomStade ?? m.lieu ?? m.venue ?? null;

// Buts d'un côté (nomEquipe = équipe créditée du but, même convention que MatchsPage)
const butsDe = (m, cote) => {
  const nom = cote === 'dom' ? m.equipeDomicile?.nom : m.equipeExterieur?.nom;
  return (m.buts ?? []).filter(b => b.nomEquipe === nom).sort((a, b) => a.minute - b.minute);
};

// Résultat d'un match du point de vue d'une équipe : 'V', 'N' ou 'D'
const resultatPour = (m, nomEquipe) => {
  const estDom = m.equipeDomicile?.nom === nomEquipe;
  const pour = estDom ? m.scoreDomicile : m.scoreExterieur;
  const contre = estDom ? m.scoreExterieur : m.scoreDomicile;
  return pour > contre ? 'V' : pour < contre ? 'D' : 'N';
};
const COULEUR_RESULTAT = { V: theme.green, N: '#9aa19d', D: theme.red };

// ── Logo d'équipe (ou initiales si pas de logo) ─────────────────────────
function Logo({ equipe, taille }) {
  if (equipe?.logoUrl) {
    return <img src={equipe.logoUrl} alt="" style={{ width: taille, height: taille, objectFit: 'contain', flexShrink: 0 }} />;
  }
  return (
    <span style={{
      width: taille, height: taille, borderRadius: '50%', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.12)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: taille / 3.2, fontWeight: 800, color: '#fff',
    }}>{abrev(equipe?.nom)}</span>
  );
}

// ── Équipe dans la zone haute : logo, nom, buteurs ──────────────────────
function EquipeHero({ equipe, buts, alignement }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px', minWidth: 0 }}>
      <Logo equipe={equipe} taille={110} />
      <div style={{ color: '#fff', fontSize: '24px', fontWeight: 800, lineHeight: 1.2 }}>{equipe?.nom ?? '—'}</div>
      {buts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: alignement }}>
          {buts.map((b, i) => (
            <span key={i} style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px' }}>
              ⚽ {nomButeur(b)} {b.minute}'
              {b.estPenalty && <span style={{ color: theme.greenBright, fontWeight: 700 }}> (pen.)</span>}
              {b.estButCSC && <span style={{ color: '#ff8a8d', fontWeight: 700 }}> (CSC)</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Boîte du score au centre ────────────────────────────────────────────
function BoiteScore({ m }) {
  const termine = m.statut === 2, live = m.statut === 1, reporte = m.statut === 3;
  const joue = termine || live;
  const domGagne = joue && m.scoreDomicile > m.scoreExterieur;
  const extGagne = joue && m.scoreExterieur > m.scoreDomicile;

  const bandeau = live
    ? { texte: `EN DIRECT${m.minute ? ` · ${m.minute}'` : ''}`, fond: theme.red, couleur: '#fff' }
    : termine ? { texte: 'TERMINÉ', fond: '#d9dedb', couleur: '#5b625e' }
    : reporte ? { texte: 'REPORTÉ', fond: theme.yellow, couleur: '#1a1a1a' }
    : { texte: 'À VENIR', fond: '#d9dedb', couleur: '#5b625e' };

  // Petit triangle rouge sur le côté du gagnant (comme chez FIBA)
  const triangle = (cote) => ({
    position: 'absolute', top: '38px', [cote]: '-9px', width: 0, height: 0,
    borderTop: '9px solid transparent', borderBottom: '9px solid transparent',
    [cote === 'left' ? 'borderRight' : 'borderLeft']: `9px solid ${theme.red}`,
  });

  return (
    <div style={{ position: 'relative', minWidth: '170px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: '14px 24px 10px', textAlign: 'center', fontFamily: CHIFFRES, fontWeight: 800, color: CLAIR.texte, fontSize: joue ? '56px' : '44px', lineHeight: 1 }}>
          {joue ? `${m.scoreDomicile ?? 0} - ${m.scoreExterieur ?? 0}` : heure(m.dateMatch)}
        </div>
        <div style={{ backgroundColor: bandeau.fond, color: bandeau.couleur, textAlign: 'center', padding: '6px 0', fontSize: '14px', fontWeight: 800, letterSpacing: '1px' }}>
          {live && <span className="animate-pulse" style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#fff', marginRight: '7px', verticalAlign: 'middle' }} />}
          {bandeau.texte}
        </div>
      </div>
      {domGagne && <span style={triangle('left')} />}
      {extGagne && <span style={triangle('right')} />}
    </div>
  );
}

// ── Carte blanche avec titre ────────────────────────────────────────────
function Carte({ titre, children, style }) {
  return (
    <div style={{ backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '14px', overflow: 'hidden', ...style }}>
      {titre && (
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${CLAIR.bord}`, fontSize: '16px', fontWeight: 800, color: CLAIR.texte }}>
          {titre}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Onglet Aperçu : score par mi-temps ──────────────────────────────────
function TableauMiTemps({ m }) {
  const joue = m.statut === 1 || m.statut === 2;
  if (!joue) return null;

  const lignes = [
    { equipe: m.equipeDomicile, buts: butsDe(m, 'dom'), total: m.scoreDomicile ?? 0 },
    { equipe: m.equipeExterieur, buts: butsDe(m, 'ext'), total: m.scoreExterieur ?? 0 },
  ];
  // On ne montre le détail par mi-temps que si les buts enregistrés collent au score
  const fiable = lignes.every(l => l.buts.length === l.total);
  const mt1 = (l) => l.buts.filter(b => b.minute <= 45).length;
  const mt2 = (l) => l.buts.filter(b => b.minute > 45).length;

  const cellule = { padding: '14px 12px', textAlign: 'center', borderLeft: `1px solid ${CLAIR.bord}`, fontSize: '16px' };
  const entete = { ...cellule, padding: '10px 12px', fontSize: '11px', fontWeight: 800, color: CLAIR.doux, letterSpacing: '0.5px' };

  return (
    <Carte>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${CLAIR.bord}` }}>
            <th style={{ ...entete, textAlign: 'left', borderLeft: 'none', paddingLeft: '20px' }}>ÉQUIPE</th>
            <th style={entete}>1RE MT</th>
            <th style={entete}>2E MT</th>
            <th style={entete}>FINAL</th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((l, i) => {
            const autre = lignes[1 - i];
            const gras = (a, b) => ({ fontWeight: a > b ? 800 : 500, color: a > b ? CLAIR.texte : '#4a514d' });
            return (
              <tr key={i} style={{ borderTop: i ? `1px solid ${CLAIR.bord}` : 'none' }}>
                <td style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, color: CLAIR.texte }}>
                  {l.equipe?.logoUrl && <img src={l.equipe.logoUrl} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />}
                  {abrev(l.equipe?.nom)}
                </td>
                <td style={{ ...cellule, ...(fiable ? gras(mt1(l), mt1(autre)) : {}) }}>{fiable ? mt1(l) : '–'}</td>
                <td style={{ ...cellule, ...(fiable ? gras(mt2(l), mt2(autre)) : {}) }}>{fiable ? mt2(l) : '–'}</td>
                <td style={{ ...cellule, fontFamily: CHIFFRES, fontSize: '22px', ...gras(l.total, autre.total) }}>{l.total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Carte>
  );
}

// ── Onglet Aperçu : forme récente (5 derniers matchs de la saison) ──────
function FormeRecente({ m, tous }) {
  const forme = (equipe) => tous
    .filter(x => x.statut === 2 && x.id !== m.id && new Date(x.dateMatch) < new Date(m.dateMatch)
      && (x.equipeDomicile?.nom === equipe?.nom || x.equipeExterieur?.nom === equipe?.nom))
    .sort((a, b) => new Date(b.dateMatch) - new Date(a.dateMatch))
    .slice(0, 5);

  return (
    <Carte titre="Forme récente">
      {[m.equipeDomicile, m.equipeExterieur].map((equipe, i) => {
        const liste = forme(equipe);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '14px 20px', borderTop: i ? `1px solid ${CLAIR.bord}` : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, fontWeight: 700, color: CLAIR.texte }}>
              {equipe?.logoUrl && <img src={equipe.logoUrl} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{equipe?.nom}</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              {liste.length === 0
                ? <span style={{ fontSize: '13px', color: CLAIR.doux }}>Pas encore de match</span>
                : liste.map(x => {
                  const r = resultatPour(x, equipe?.nom);
                  const adv = x.equipeDomicile?.nom === equipe?.nom ? x.equipeExterieur : x.equipeDomicile;
                  return (
                    <Link key={x.id} to={`/matchs/${x.id}`} state={{ match: x }}
                      title={`${x.equipeDomicile?.nom} ${x.scoreDomicile}-${x.scoreExterieur} ${x.equipeExterieur?.nom} (vs ${adv?.nom})`}
                      style={{
                        width: '28px', height: '28px', borderRadius: '6px', backgroundColor: COULEUR_RESULTAT[r],
                        color: '#fff', fontSize: '13px', fontWeight: 800, textDecoration: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      {r}
                    </Link>
                  );
                })}
            </div>
          </div>
        );
      })}
    </Carte>
  );
}

// ── Éléments de la frise chronologique ──────────────────────────────────
function Jalon({ texte }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1, margin: '6px 0' }}>
      <span style={{ backgroundColor: CLAIR.texte, color: '#fff', fontSize: '12px', fontWeight: 800, padding: '5px 14px', borderRadius: '999px', letterSpacing: '0.5px' }}>
        {texte}
      </span>
    </div>
  );
}

function Evenement({ ev }) {
  const gauche = ev.cote === 'dom';
  const bloc = (
    <div style={{ textAlign: gauche ? 'right' : 'left' }}>
      <div style={{ fontWeight: 700, color: CLAIR.texte, fontSize: '15px' }}>
        ⚽ {nomButeur(ev)}
        {ev.estPenalty && <span style={{ color: theme.green, fontSize: '12px', fontWeight: 700 }}> (pen.)</span>}
        {ev.estButCSC && <span style={{ color: theme.red, fontSize: '12px', fontWeight: 700 }}> (CSC)</span>}
      </div>
      <div style={{ fontSize: '12px', color: CLAIR.doux }}>{ev.nomEquipe} · {ev.score}</div>
    </div>
  );
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px 1fr', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
      <div>{gauche && bloc}</div>
      <span style={{
        justifySelf: 'center', width: '48px', height: '48px', borderRadius: '50%',
        backgroundColor: '#fff', border: `2px solid ${gauche ? CLAIR.vert : theme.red}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: CHIFFRES, fontWeight: 800, fontSize: '18px', color: CLAIR.texte,
      }}>{ev.minute}'</span>
      <div>{!gauche && bloc}</div>
    </div>
  );
}

// ── Onglet Chronologie : frise des buts ─────────────────────────────────
function Chronologie({ m }) {
  const joue = m.statut === 1 || m.statut === 2;
  const evenements = [
    ...butsDe(m, 'dom').map(b => ({ ...b, cote: 'dom' })),
    ...butsDe(m, 'ext').map(b => ({ ...b, cote: 'ext' })),
  ].sort((a, b) => a.minute - b.minute);

  if (!joue) {
    return <Carte><p style={{ padding: '40px 20px', textAlign: 'center', color: CLAIR.doux }}>La chronologie sera disponible au coup d'envoi.</p></Carte>;
  }

  // Score courant après chaque but
  let d = 0, e = 0;
  const avecScore = evenements.map(ev => {
    if (ev.cote === 'dom') d++; else e++;
    return { ...ev, score: `${d}-${e}` };
  });
  const premiereMT = avecScore.filter(ev => ev.minute <= 45);
  const deuxiemeMT = avecScore.filter(ev => ev.minute > 45);

  return (
    <Carte>
      {/* En-têtes des deux équipes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px 1fr', gap: '14px', padding: '16px 20px', borderBottom: `1px solid ${CLAIR.bord}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', fontWeight: 800, color: CLAIR.texte }}>
          {m.equipeDomicile?.nom}
          {m.equipeDomicile?.logoUrl && <img src={m.equipeDomicile.logoUrl} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />}
        </div>
        <div />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: CLAIR.texte }}>
          {m.equipeExterieur?.logoUrl && <img src={m.equipeExterieur.logoUrl} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />}
          {m.equipeExterieur?.nom}
        </div>
      </div>

      <div style={{ position: 'relative', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Ligne verticale centrale */}
        <span style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '2px', marginLeft: '-1px', backgroundColor: CLAIR.bord }} />
        <Jalon texte="COUP D'ENVOI" />
        {premiereMT.map((ev, i) => <Evenement key={`a${i}`} ev={ev} />)}
        {(m.statut === 2 || deuxiemeMT.length > 0) && <Jalon texte="MI-TEMPS" />}
        {deuxiemeMT.map((ev, i) => <Evenement key={`b${i}`} ev={ev} />)}
        {m.statut === 2 && <Jalon texte={`FIN DU MATCH · ${m.scoreDomicile}-${m.scoreExterieur}`} />}
        {evenements.length === 0 && (
          <p style={{ textAlign: 'center', color: CLAIR.doux, position: 'relative', zIndex: 1, backgroundColor: '#fff', padding: '8px' }}>
            Aucun but enregistré pour ce match.
          </p>
        )}
      </div>
    </Carte>
  );
}

// ── Onglet Face-à-face ──────────────────────────────────────────────────
function FaceAFace({ m, tous }) {
  const nomA = m.equipeDomicile?.nom, nomB = m.equipeExterieur?.nom;
  const confrontations = tous
    .filter(x => {
      const noms = [x.equipeDomicile?.nom, x.equipeExterieur?.nom];
      return noms.includes(nomA) && noms.includes(nomB);
    })
    .sort((a, b) => new Date(b.dateMatch) - new Date(a.dateMatch));

  const joues = confrontations.filter(x => x.statut === 2);
  const bilan = { A: 0, N: 0, B: 0 };
  for (const x of joues) {
    const r = resultatPour(x, nomA);
    if (r === 'V') bilan.A++; else if (r === 'D') bilan.B++; else bilan.N++;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Carte titre="Bilan des confrontations">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center' }}>
          {[
            [`Victoires ${abrev(nomA)}`, bilan.A, CLAIR.vert],
            ['Nuls', bilan.N, CLAIR.doux],
            [`Victoires ${abrev(nomB)}`, bilan.B, theme.red],
          ].map(([label, val, couleur], i) => (
            <div key={label} style={{ padding: '18px 8px', borderLeft: i ? `1px solid ${CLAIR.bord}` : 'none' }}>
              <div style={{ fontFamily: CHIFFRES, fontSize: '34px', fontWeight: 800, color: couleur }}>{val}</div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: CLAIR.doux, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
      </Carte>

      <Carte titre="Toutes les rencontres">
        {confrontations.map((x, i) => {
          const actuel = x.id === m.id;
          const joue = x.statut === 2 || x.statut === 1;
          return (
            <Link key={x.id} to={`/matchs/${x.id}`} state={{ match: x }}
              style={{
                display: 'grid', gridTemplateColumns: '110px 1fr auto 1fr', alignItems: 'center', gap: '12px',
                padding: '14px 20px', borderTop: i ? `1px solid ${CLAIR.bord}` : 'none', textDecoration: 'none',
                backgroundColor: actuel ? '#e8f3ec' : 'transparent', color: CLAIR.texte,
              }}>
              <span style={{ fontSize: '12px', color: CLAIR.doux, fontWeight: 600 }}>
                {new Date(x.dateMatch).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
              <span style={{ textAlign: 'right', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.equipeDomicile?.nom}</span>
              <span style={{ fontFamily: CHIFFRES, fontWeight: 800, fontSize: '18px', backgroundColor: CLAIR.tuile, borderRadius: '6px', padding: '3px 12px', minWidth: '62px', textAlign: 'center' }}>
                {joue ? `${x.scoreDomicile} - ${x.scoreExterieur}` : heure(x.dateMatch)}
              </span>
              <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.equipeExterieur?.nom}</span>
            </Link>
          );
        })}
      </Carte>

      <p style={{ fontSize: '12px', color: CLAIR.doux }}>
        Basé sur les saisons disponibles sur F237. L'historique s'enrichira avec les saisons précédentes.
      </p>
    </div>
  );
}

// ── Colonne de droite : infos du match ──────────────────────────────────
function InfosMatch({ m, saison }) {
  const journee = journeeDe(m);
  const stade = stadeDe(m);
  const lignes = [
    [Trophy, 'Compétition', saison ? `MTN ${saison.label}` : '—'],
    [CalendarDays, 'Saison', saison ? libelleSaison(saison.annee) : '—'],
    journee && [Hash, 'Journée', journee],
    [CalendarDays, 'Date', dateLongue(m.dateMatch)],
    [Clock, "Coup d'envoi", heure(m.dateMatch)],
    stade && [MapPin, 'Stade', stade],
  ].filter(Boolean);

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Carte>
        <div style={{ backgroundColor: CLAIR.vert, color: '#fff', padding: '12px 18px', fontWeight: 800, fontSize: '15px' }}>Infos du match</div>
        {lignes.map(([Icone, label, valeur], i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 18px', borderTop: i ? `1px solid ${CLAIR.bord}` : 'none' }}>
            <Icone size={16} color={CLAIR.doux} style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: CLAIR.doux, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: CLAIR.texte, textTransform: label === 'Date' ? 'capitalize' : 'none' }}>{valeur}</div>
            </div>
          </div>
        ))}
      </Carte>

      {m.statut === 0 && (
        <Carte style={{ padding: '18px' }}>
          <div style={{ fontWeight: 800, fontSize: '16px', color: CLAIR.texte, marginBottom: '6px' }}>Ton pronostic ?</div>
          <p style={{ fontSize: '13px', color: CLAIR.doux, marginBottom: '14px', lineHeight: 1.5 }}>
            Mise tes points sur le résultat avant le coup d'envoi.
          </p>
          <Link to="/jouer" style={{
            display: 'block', textAlign: 'center', backgroundColor: CLAIR.vert, color: '#fff',
            padding: '11px', borderRadius: '999px', fontWeight: 700, fontSize: '14px', textDecoration: 'none',
          }}>
            Pronostiquer
          </Link>
        </Carte>
      )}

      <Link to="/matchs" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: CLAIR.vert, fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Retour au calendrier
      </Link>
    </aside>
  );
}

// ── Page ────────────────────────────────────────────────────────────────
const ONGLETS = [
  { cle: 'apercu', label: 'Aperçu' },
  { cle: 'chrono', label: 'Chronologie' },
  { cle: 'h2h', label: 'Face-à-face' },
];

function MatchDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { matchsLive } = useLiveScores();
  const [donnees, setDonnees] = useState(null); // { tous: [...] } une fois chargé
  const [ongletChoisi, setOngletChoisi] = useState({ id: null, cle: 'apercu' });

  // Revient sur "Aperçu" quand on change de match (sans setState dans un effet)
  const onglet = ongletChoisi.id === id ? ongletChoisi.cle : 'apercu';
  const choisirOnglet = (cle) => setOngletChoisi({ id, cle });

  // Charge les matchs de toutes les saisons connues (pour retrouver le match,
  // calculer la forme récente et le face-à-face)
  useEffect(() => {
    let ignore = false;
    Promise.all(TOUS_LES_SAISON_IDS.map(sid =>
      matchService.getBySaison(sid)
        .then(liste => liste.map(m => ({ ...m, saisonId: m.saisonId ?? sid })))
        .catch(() => [])
    )).then(listes => {
      if (ignore) return;
      // Sans doublons (un même match ne doit apparaître qu'une fois)
      const parId = new Map();
      for (const m of listes.flat()) if (!parId.has(m.id)) parId.set(m.id, m);
      setDonnees({ tous: [...parId.values()] });
    });
    return () => { ignore = true; };
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  // Le match : depuis les données chargées, sinon celui passé par la page Matchs
  const depuisNavigation = location.state?.match && String(location.state.match.id) === id ? location.state.match : null;
  const brut = donnees?.tous.find(m => String(m.id) === id) ?? depuisNavigation;

  // Applique le score en direct (SignalR) si le match est en cours
  const m = useMemo(() => {
    if (!brut) return null;
    const l = brut.apiFootballId != null ? matchsLive?.find(x => x.apiFootballId === brut.apiFootballId) : null;
    return l ? { ...brut, statut: 1, scoreDomicile: l.scoreDomicile, scoreExterieur: l.scoreExterieur, minute: l.minute ?? brut.minute } : brut;
  }, [brut, matchsLive]);

  // Matchs de la même saison (pour la forme récente)
  const tousSaison = useMemo(
    () => (donnees?.tous ?? []).filter(x => !m || x.saisonId === m.saisonId),
    [donnees, m],
  );

  if (!m) {
    return (
      <div style={{ backgroundColor: CLAIR.fond, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        {donnees ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '20px', fontWeight: 800, color: CLAIR.texte, marginBottom: '12px' }}>Match introuvable</p>
            <Link to="/matchs" style={{ color: CLAIR.vert, fontWeight: 700 }}>← Retour au calendrier</Link>
          </div>
        ) : (
          <p style={{ color: CLAIR.doux }}>Chargement du match...</p>
        )}
      </div>
    );
  }

  const saison = infosSaison(m.saisonId);
  const journee = journeeDe(m);
  const stade = stadeDe(m);

  return (
    <div>
      {/* ── ZONE HAUTE ─────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: FOND_BANDE, padding: '28px 0 56px' }}>
        <EclatsBande />
        <div style={CONTENEUR}>
          {/* Fil d'Ariane */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginBottom: '28px' }}>
            {[['Accueil', '/'], ['Matchs', '/matchs']].map(([label, to]) => (
              <span key={to} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link to={to} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}>
                  {label}
                </Link>
                <ChevronRight size={13} color="rgba(255,255,255,0.45)" />
              </span>
            ))}
            <span style={{ color: '#fff', fontWeight: 700 }}>{abrev(m.equipeDomicile?.nom)} vs {abrev(m.equipeExterieur?.nom)}</span>
          </nav>

          {/* Compétition + date / stade */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
              {journee ? `Journée ${journee} · ` : ''}{saison ? `MTN ${saison.label}` : 'Match'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginTop: '4px', textTransform: 'capitalize' }}>
              {dateLongue(m.dateMatch)}{stade ? ` · ${stade}` : ''}
            </div>
          </div>

          {/* Équipes + score */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'start', gap: '40px', maxWidth: '860px', margin: '0 auto' }}>
            <EquipeHero equipe={m.equipeDomicile} buts={butsDe(m, 'dom')} alignement="center" />
            <div style={{ paddingTop: '14px' }}><BoiteScore m={m} /></div>
            <EquipeHero equipe={m.equipeExterieur} buts={butsDe(m, 'ext')} alignement="center" />
          </div>
        </div>
      </section>

      {/* ── ONGLETS ────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#fff', borderBottom: `1px solid ${CLAIR.bord}` }}>
        <div style={{ ...CONTENEUR, display: 'flex', gap: '8px' }}>
          {ONGLETS.map(o => {
            const actif = o.cle === onglet;
            return (
              <button key={o.cle} onClick={() => choisirOnglet(o.cle)}
                style={{
                  padding: '16px 10px', margin: '0 6px', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '15px', fontWeight: actif ? 700 : 500,
                  color: actif ? CLAIR.vert : '#4a514d',
                  borderBottom: `3px solid ${actif ? CLAIR.vert : 'transparent'}`,
                }}>
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ZONE BASSE ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: CLAIR.fond, minHeight: '420px', padding: '32px 0 64px' }}>
        <div style={CONTENEUR}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" style={{ alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {onglet === 'apercu' && (
                <>
                  <TableauMiTemps m={m} />
                  <FormeRecente m={m} tous={tousSaison} />
                </>
              )}
              {onglet === 'chrono' && <Chronologie m={m} />}
              {onglet === 'h2h' && <FaceAFace m={m} tous={donnees?.tous ?? [m]} />}
            </div>
            <InfosMatch m={m} saison={saison} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default MatchDetailPage;