// f237-frontend/src/pages/EquipeDetailPage.jsx
// Fiche d'un club (route /equipes/:id), inspirée de FIBA :
// - zone haute sombre : fil d'Ariane, logo, nom, infos du club, photo du stade en fond
// - barre d'onglets : Aperçu · Matchs · Effectif · Palmarès
// - zone basse claire : contenu de l'onglet + colonne (forme, prochain match, buteurs, fiche)

import { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronRight, MapPin, Calendar, Building2, Users, Trophy, AlertCircle, Goal, ArrowRight,
} from 'lucide-react';
import { equipeService } from '../services/equipeService';
import { matchService } from '../services/matchService';
import { SAISONS_DB, ANNEE_ACTUELLE } from '../data/saisons';
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
const MARQUEUR = '"Permanent Marker", "Raleway", Arial, sans-serif';
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

// ── Données ─────────────────────────────────────────────────────────────
const POSTES_ORDRE = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];
const POSTE_FR = { Goalkeeper: 'Gardiens', Defender: 'Défenseurs', Midfielder: 'Milieux', Attacker: 'Attaquants' };
const POSTE_COURT = { Goalkeeper: 'GB', Defender: 'DEF', Midfielder: 'MIL', Attacker: 'ATT' };
const COULEUR_RESULTAT = { V: theme.green, N: '#a3aaa6', D: theme.red, '?': '#c9cfcc' };

const dateCourte = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
const dateLongue = (d) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const heure = (d) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

// ── Petits composants ───────────────────────────────────────────────────
function Carte({ titre, icone: Icone, droite, children, style }) {
  return (
    <div style={{ backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '14px', overflow: 'hidden', ...style }}>
      {titre && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '14px 20px', borderBottom: `1px solid ${CLAIR.bord}` }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 800, color: CLAIR.texte }}>
            {Icone && <Icone size={17} color={CLAIR.vert} />}
            {titre}
          </span>
          {droite}
        </div>
      )}
      {children}
    </div>
  );
}

function Vide({ children }) {
  return <p style={{ padding: '36px 20px', textAlign: 'center', color: CLAIR.doux, fontSize: '14px' }}>{children}</p>;
}

function PastilleResultat({ r, taille = 26 }) {
  return (
    <span style={{
      width: taille, height: taille, borderRadius: '6px', flexShrink: 0,
      backgroundColor: COULEUR_RESULTAT[r] ?? COULEUR_RESULTAT['?'], color: '#fff',
      fontSize: taille * 0.46, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{r ?? '?'}</span>
  );
}

// Tuile de statistique (les deux premières en vert, comme avant)
function Tuile({ label, valeur, fort }) {
  return (
    <div style={{
      borderRadius: '12px', padding: '14px 8px', textAlign: 'center',
      backgroundColor: fort ? CLAIR.vert : CLAIR.tuile,
      color: fort ? '#fff' : CLAIR.texte,
    }}>
      <div style={{ fontFamily: CHIFFRES, fontSize: '32px', fontWeight: 800, lineHeight: 1 }}>{valeur ?? '—'}</div>
      <div style={{ marginTop: '6px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px', opacity: fort ? 0.85 : 0.6 }}>{label}</div>
    </div>
  );
}

// Ligne d'un match joué (format renvoyé par /equipes/:id -> derniersMatchs)
function LigneMatch({ m, premier }) {
  return (
    <Link to={`/matchs/${m.matchId}`}
      className="transition-colors hover:bg-[#f7f9f8]"
      style={{
        display: 'grid', gridTemplateColumns: '26px 64px minmax(0,1fr) 70px minmax(0,1fr) 18px', alignItems: 'center', gap: '12px',
        padding: '13px 20px', borderTop: premier ? 'none' : `1px solid ${CLAIR.bord}`, textDecoration: 'none', color: CLAIR.texte,
      }}>
      <PastilleResultat r={m.resultat} />
      <span style={{ fontSize: '12px', fontWeight: 600, color: CLAIR.doux }}>{dateCourte(m.dateMatch)}</span>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', minWidth: 0 }}>
        <span style={{ fontSize: '15px', fontWeight: m.estDomicile ? 800 : 500, color: m.estDomicile ? CLAIR.texte : CLAIR.doux, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.equipeDomicile}</span>
        {m.logoDomicile && <img src={m.logoDomicile} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }} />}
      </span>
      <span style={{ fontFamily: CHIFFRES, fontSize: '19px', fontWeight: 800, textAlign: 'center', backgroundColor: CLAIR.tuile, borderRadius: '6px', padding: '2px 0' }}>
        {m.scoreDomicile ?? '–'} - {m.scoreExterieur ?? '–'}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        {m.logoExterieur && <img src={m.logoExterieur} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }} />}
        <span style={{ fontSize: '15px', fontWeight: !m.estDomicile ? 800 : 500, color: !m.estDomicile ? CLAIR.texte : CLAIR.doux, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.equipeExterieur}</span>
      </span>
      <ChevronRight size={16} color={CLAIR.doux} />
    </Link>
  );
}

// Ligne d'un match à venir (format de matchService.getBySaison)
function LigneAVenir({ m, premier }) {
  return (
    <Link to={`/matchs/${m.id}`} state={{ match: m }}
      className="transition-colors hover:bg-[#f7f9f8]"
      style={{
        display: 'grid', gridTemplateColumns: '90px minmax(0,1fr) 70px minmax(0,1fr) 18px', alignItems: 'center', gap: '12px',
        padding: '13px 20px', borderTop: premier ? 'none' : `1px solid ${CLAIR.bord}`, textDecoration: 'none', color: CLAIR.texte,
      }}>
      <span style={{ fontSize: '12px', fontWeight: 600, color: CLAIR.doux, textTransform: 'capitalize' }}>{dateCourte(m.dateMatch)}</span>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', minWidth: 0 }}>
        <span style={{ fontSize: '15px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.equipeDomicile?.nom}</span>
        {m.equipeDomicile?.logoUrl && <img src={m.equipeDomicile.logoUrl} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />}
      </span>
      <span style={{ fontSize: '14px', fontWeight: 800, textAlign: 'center', backgroundColor: CLAIR.texte, color: '#fff', borderRadius: '6px', padding: '4px 0' }}>
        {heure(m.dateMatch)}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        {m.equipeExterieur?.logoUrl && <img src={m.equipeExterieur.logoUrl} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />}
        <span style={{ fontSize: '15px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.equipeExterieur?.nom}</span>
      </span>
      <ChevronRight size={16} color={CLAIR.doux} />
    </Link>
  );
}

// Carte d'un joueur de l'effectif
function CarteJoueur({ j }) {
  const [photoOk, setPhotoOk] = useState(true);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
      backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '12px',
    }}>
      <span style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', backgroundColor: CLAIR.tuile, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: CLAIR.doux }}>
        {j.photo && photoOk
          ? <img src={j.photo} alt="" onError={() => setPhotoOk(false)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : j.nom?.charAt(0)}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: CLAIR.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.nom}</div>
        <div style={{ fontSize: '12px', color: CLAIR.doux }}>
          {[POSTE_COURT[j.poste], j.age && `${j.age} ans`, j.nationalite].filter(Boolean).join(' · ')}
        </div>
      </div>
      {j.numero != null && (
        <span style={{ fontFamily: CHIFFRES, fontSize: '24px', fontWeight: 800, color: '#cfd5d2' }}>{j.numero}</span>
      )}
    </div>
  );
}

// ── Contenu des onglets ─────────────────────────────────────────────────
function OngletApercu({ classement, derniersMatchs }) {
  return (
    <>
      <Carte titre={`Saison ${ANNEE_ACTUELLE}`}>
        {classement ? (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8" style={{ padding: '18px 20px' }}>
            <Tuile label="POS." valeur={`#${classement.position}`} fort />
            <Tuile label="PTS" valeur={classement.points} fort />
            <Tuile label="MJ" valeur={classement.matchsJoues} />
            <Tuile label="V" valeur={classement.victoires} />
            <Tuile label="N" valeur={classement.nuls} />
            <Tuile label="D" valeur={classement.defaites} />
            <Tuile label="BP" valeur={classement.butsPour} />
            <Tuile label="BC" valeur={classement.butsContre} />
          </div>
        ) : <Vide>Pas encore de classement pour ce club cette saison.</Vide>}
      </Carte>

      <Carte titre="Derniers matchs">
        {derniersMatchs.length
          ? derniersMatchs.map((m, i) => <LigneMatch key={m.matchId} m={m} premier={i === 0} />)
          : <Vide>Aucun match joué pour l'instant.</Vide>}
      </Carte>
    </>
  );
}

function OngletMatchs({ derniersMatchs, aVenir }) {
  return (
    <>
      <Carte titre="À venir" droite={<span style={{ fontSize: '12px', fontWeight: 700, color: CLAIR.doux }}>{aVenir.length} match{aVenir.length > 1 ? 's' : ''}</span>}>
        {aVenir.length
          ? aVenir.map((m, i) => <LigneAVenir key={m.id} m={m} premier={i === 0} />)
          : <Vide>Aucun match programmé pour le moment.</Vide>}
      </Carte>
      <Carte titre="Résultats récents">
        {derniersMatchs.length
          ? derniersMatchs.map((m, i) => <LigneMatch key={m.matchId} m={m} premier={i === 0} />)
          : <Vide>Aucun match joué pour l'instant.</Vide>}
      </Carte>
    </>
  );
}

function OngletEffectif({ effectif }) {
  if (effectif.length === 0) {
    return <Carte><Vide>Effectif non disponible dans l'API pour cette saison.</Vide></Carte>;
  }
  const groupes = [
    ...POSTES_ORDRE.map(p => ({ titre: POSTE_FR[p], joueurs: effectif.filter(j => j.poste === p) })),
    { titre: 'Autres', joueurs: effectif.filter(j => !POSTES_ORDRE.includes(j.poste)) },
  ].filter(g => g.joueurs.length > 0);

  return groupes.map(g => (
    <div key={g.titre}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 800, color: CLAIR.vert, letterSpacing: '1px', textTransform: 'uppercase' }}>{g.titre}</h3>
        <span style={{ fontSize: '12px', fontWeight: 800, color: CLAIR.doux, backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '999px', padding: '1px 8px' }}>{g.joueurs.length}</span>
        <span style={{ flex: 1, height: '1px', backgroundColor: CLAIR.bord }} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[...g.joueurs]
          .sort((a, b) => (a.numero ?? 999) - (b.numero ?? 999))
          .map((j, i) => <CarteJoueur key={j.apiId ?? `${j.nom}-${i}`} j={j} />)}
      </div>
    </div>
  ));
}

function OngletPalmares({ palmares }) {
  if (palmares.length === 0) {
    return <Carte><Vide>Aucun titre enregistré dans l'API pour ce club.</Vide></Carte>;
  }
  return (
    <Carte titre={`${palmares.length} titre${palmares.length > 1 ? 's' : ''}`} icone={Trophy}>
      {palmares.map((t, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderTop: i ? `1px solid ${CLAIR.bord}` : 'none' }}>
          <span style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fdf3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Trophy size={19} color="#c9971b" />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: CLAIR.texte }}>{t.ligue}</div>
            <div style={{ fontSize: '12px', color: CLAIR.doux }}>{[t.saison, t.pays].filter(Boolean).join(' · ')}</div>
          </div>
          {t.place && (
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#8a6510', backgroundColor: '#fdf3d0', borderRadius: '999px', padding: '3px 10px' }}>{t.place}</span>
          )}
        </div>
      ))}
    </Carte>
  );
}

// ── Colonne de droite ───────────────────────────────────────────────────
function ColonneDroite({ data, derniersMatchs, prochain, buteurs }) {
  const infos = data.infos ?? {};
  const fiche = [
    [MapPin, 'Ville', infos.ville],
    [Calendar, 'Fondé en', infos.anneeCreation],
    [Building2, 'Stade', infos.stadeNom],
    [Users, 'Capacité', infos.stadeCapacite ? `${infos.stadeCapacite.toLocaleString('fr-FR')} places` : null],
  ].filter(([, , v]) => v);

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Forme récente (du plus ancien au plus récent) */}
      <Carte titre="Forme récente">
        <div style={{ display: 'flex', gap: '8px', padding: '16px 20px' }}>
          {derniersMatchs.length
            ? [...derniersMatchs].reverse().map(m => (
              <Link key={m.matchId} to={`/matchs/${m.matchId}`} title={`${m.equipeDomicile} ${m.scoreDomicile}-${m.scoreExterieur} ${m.equipeExterieur}`}
                className="transition-transform hover:-translate-y-0.5">
                <PastilleResultat r={m.resultat} taille={34} />
              </Link>
            ))
            : <span style={{ fontSize: '13px', color: CLAIR.doux }}>Pas encore de match joué.</span>}
        </div>
      </Carte>

      {/* Prochain match */}
      {prochain && (
        <Link to={`/matchs/${prochain.id}`} state={{ match: prochain }} style={{ textDecoration: 'none' }}>
          <Carte titre="Prochain match" droite={<ArrowRight size={16} color={CLAIR.doux} />}>
            <div style={{ padding: '18px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: CLAIR.doux, textTransform: 'capitalize', marginBottom: '14px' }}>
                {dateLongue(prochain.dateMatch)} · {heure(prochain.dateMatch)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '10px' }}>
                {[prochain.equipeDomicile, null, prochain.equipeExterieur].map((eq, i) => eq === null ? (
                  <span key={i} style={{ fontSize: '13px', fontWeight: 800, color: CLAIR.doux }}>VS</span>
                ) : (
                  <span key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    {eq?.logoUrl
                      ? <img src={eq.logoUrl} alt="" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
                      : <span style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: CLAIR.tuile }} />}
                    <span style={{ fontSize: '13px', fontWeight: 700, color: CLAIR.texte, lineHeight: 1.2 }}>{eq?.nom}</span>
                  </span>
                ))}
              </div>
            </div>
          </Carte>
        </Link>
      )}

      {/* Meilleurs buteurs du club cette saison */}
      <Carte titre="Buteurs du club" icone={Goal}>
        {buteurs.length === 0 ? <Vide>Aucun but enregistré.</Vide> : buteurs.map((j, i) => (
          <div key={j.nom} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', borderTop: i ? `1px solid ${CLAIR.bord}` : 'none' }}>
            <span style={{ width: '18px', fontSize: '13px', fontWeight: 800, color: CLAIR.doux }}>{i + 1}</span>
            <span style={{ flex: 1, minWidth: 0, fontSize: '14px', fontWeight: 700, color: CLAIR.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.nom}</span>
            <span style={{ fontFamily: CHIFFRES, fontSize: '20px', fontWeight: 800, color: CLAIR.vert }}>{j.buts}</span>
          </div>
        ))}
      </Carte>

      {/* Fiche du club */}
      {fiche.length > 0 && (
        <Carte titre="Fiche du club">
          {fiche.map(([Icone, label, valeur], i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 20px', borderTop: i ? `1px solid ${CLAIR.bord}` : 'none' }}>
              <Icone size={16} color={CLAIR.doux} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: CLAIR.doux, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: CLAIR.texte }}>{valeur}</div>
              </div>
            </div>
          ))}
        </Carte>
      )}
    </aside>
  );
}

// ── Page ────────────────────────────────────────────────────────────────
function EquipeDetailPage() {
  const { id } = useParams();
  const [etat, setEtat] = useState(null); // { id, data, matchsSaison, erreur }
  const [ongletChoisi, setOngletChoisi] = useState({ id: null, cle: 'apercu' });
  const [logoOk, setLogoOk] = useState(true);

  // Revient sur "Aperçu" quand on change de club (sans setState dans un effet)
  const onglet = ongletChoisi.id === id ? ongletChoisi.cle : 'apercu';
  const chargement = etat?.id !== id;

  useEffect(() => {
    let ignore = false;
    equipeService.getById(id)
      .then(async (data) => {
        // Matchs de la saison du club : prochains matchs + buteurs du club
        const saisonId = SAISONS_DB[ANNEE_ACTUELLE]?.[data.division === 1 ? 'two' : 'one'];
        const matchsSaison = saisonId != null ? await matchService.getBySaison(saisonId).catch(() => []) : [];
        if (!ignore) setEtat({ id, data, matchsSaison, erreur: null });
      })
      .catch(() => { if (!ignore) setEtat({ id, data: null, matchsSaison: [], erreur: 'Équipe introuvable' }); });
    return () => { ignore = true; };
  }, [id]);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  const data = etat?.data;
  const matchsSaison = useMemo(() => etat?.matchsSaison ?? [], [etat]);

  // Prochains matchs du club (statut 0 = à venir)
  const aVenir = useMemo(() => !data ? [] : matchsSaison
    .filter(m => m.statut === 0 && (m.equipeDomicile?.nom === data.nom || m.equipeExterieur?.nom === data.nom))
    .sort((a, b) => new Date(a.dateMatch) - new Date(b.dateMatch)), [matchsSaison, data]);

  // Buteurs du club (sans CSC ni inconnus), top 5
  const buteurs = useMemo(() => {
    if (!data) return [];
    const compte = new Map();
    for (const m of matchsSaison) for (const b of m.buts ?? []) {
      if (b.nomEquipe !== data.nom || b.estButCSC || !b.nomJoueur || b.nomJoueur === 'Inconnu') continue;
      compte.set(b.nomJoueur, (compte.get(b.nomJoueur) ?? 0) + 1);
    }
    return [...compte].map(([nom, buts]) => ({ nom, buts })).sort((a, b) => b.buts - a.buts).slice(0, 5);
  }, [matchsSaison, data]);

  if (chargement) {
    return (
      <div style={{ backgroundColor: CLAIR.fond, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: CLAIR.doux }}>Chargement du club...</p>
      </div>
    );
  }

  if (etat.erreur || !data) {
    return (
      <div style={{ backgroundColor: CLAIR.fond, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={40} color={theme.red} style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '18px', fontWeight: 800, color: CLAIR.texte, marginBottom: '10px' }}>{etat.erreur ?? 'Équipe introuvable'}</p>
          <Link to="/equipes" style={{ color: CLAIR.vert, fontWeight: 700 }}>← Toutes les équipes</Link>
        </div>
      </div>
    );
  }

  const infos = data.infos ?? {};
  const classement = data.classement;
  const derniersMatchs = data.derniersMatchs ?? [];
  const palmares = data.palmares ?? [];
  const effectif = data.effectif ?? [];
  const eliteOne = data.division === 0;

  const ONGLETS = [
    { cle: 'apercu', label: 'Aperçu' },
    { cle: 'matchs', label: 'Matchs' },
    { cle: 'effectif', label: 'Effectif', nb: effectif.length },
    { cle: 'palmares', label: 'Palmarès', nb: palmares.length },
  ];

  const infoHero = (Icone, texte) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
      <Icone size={15} /> {texte}
    </span>
  );

  return (
    <div>
      {/* ── ZONE HAUTE ─────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: FOND_BANDE, padding: '28px 0 48px' }}>
        {/* Photo du stade, fondue dans le dégradé à droite */}
        {infos.stadeImage && (
          <img src={infos.stadeImage} alt="" aria-hidden="true"
            onError={e => { e.currentTarget.style.display = 'none'; }}
            style={{
              position: 'absolute', top: 0, right: 0, height: '100%', width: '60%', objectFit: 'cover', opacity: 0.35,
              maskImage: 'linear-gradient(to right, transparent, #000 60%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, #000 60%)',
            }} />
        )}
        <EclatsBande />

        <div style={CONTENEUR}>
          {/* Fil d'Ariane */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginBottom: '30px' }}>
            {[['Accueil', '/'], ['Équipes', '/equipes']].map(([label, to]) => (
              <span key={to} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link to={to} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}>
                  {label}
                </Link>
                <ChevronRight size={13} color="rgba(255,255,255,0.45)" />
              </span>
            ))}
            <span style={{ color: '#fff', fontWeight: 700 }}>{data.nom}</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '28px', flexWrap: 'wrap' }}>
            {/* Logo + nom + infos */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '26px', minWidth: 0 }}>
              <span style={{
                width: '128px', height: '128px', borderRadius: '24px', backgroundColor: '#fff', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px', boxShadow: '0 14px 34px rgba(0,0,0,0.3)',
              }}>
                {data.logoUrl && logoOk
                  ? <img src={data.logoUrl} alt={data.nom} onError={() => setLogoOk(false)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <span style={{ fontSize: '44px', fontWeight: 800, color: CLAIR.vert }}>{data.nom?.charAt(0)}</span>}
              </span>
              <div style={{ minWidth: 0 }}>
                <span style={{
                  display: 'inline-block', fontSize: '12px', fontWeight: 800, letterSpacing: '1px', padding: '4px 12px', borderRadius: '999px', marginBottom: '10px',
                  backgroundColor: eliteOne ? theme.yellow : 'rgba(255,255,255,0.15)', color: eliteOne ? '#1a1a1a' : '#fff',
                }}>
                  MTN {eliteOne ? 'ELITE ONE' : 'ELITE TWO'}
                </span>
                <h1 style={{ color: '#fff', fontSize: '52px', fontWeight: 400, lineHeight: 1.05, fontFamily: MARQUEUR, marginBottom: '12px' }}>
                  {data.nom}
                </h1>
                <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
                  {infos.ville && infoHero(MapPin, infos.ville)}
                  {infos.anneeCreation && infoHero(Calendar, `Fondé en ${infos.anneeCreation}`)}
                  {infos.stadeNom && infoHero(Building2, infos.stadeNom)}
                </div>
              </div>
            </div>

            {/* Position + points, en verre dépoli */}
            {classement && (
              <div style={{
                display: 'flex', borderRadius: '16px', overflow: 'hidden',
                backgroundColor: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(6px)',
              }}>
                {[['Position', `#${classement.position}`], ['Points', classement.points]].map(([label, val], i) => (
                  <div key={label} style={{ padding: '16px 26px', textAlign: 'center', borderLeft: i ? '1px solid rgba(255,255,255,0.14)' : 'none' }}>
                    <div style={{ fontFamily: CHIFFRES, fontSize: '44px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{val}</div>
                    <div style={{ marginTop: '4px', fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.65)', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── ONGLETS ────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#fff', borderBottom: `1px solid ${CLAIR.bord}` }}>
        <div style={{ ...CONTENEUR, display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {ONGLETS.map(o => {
            const actif = o.cle === onglet;
            return (
              <button key={o.cle} onClick={() => setOngletChoisi({ id, cle: o.cle })}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap',
                  padding: '16px 10px', margin: '0 6px', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '15px', fontWeight: actif ? 700 : 500, color: actif ? CLAIR.vert : '#4a514d',
                  borderBottom: `3px solid ${actif ? CLAIR.vert : 'transparent'}`,
                }}>
                {o.label}
                {o.nb > 0 && (
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '1px 7px', borderRadius: '999px', backgroundColor: actif ? '#e8f3ec' : CLAIR.tuile, color: actif ? CLAIR.vert : CLAIR.doux }}>{o.nb}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ZONE BASSE ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: CLAIR.fond, minHeight: '420px', padding: '32px 0 64px' }}>
        <div style={CONTENEUR}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" style={{ alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {onglet === 'apercu' && <OngletApercu classement={classement} derniersMatchs={derniersMatchs} />}
              {onglet === 'matchs' && <OngletMatchs derniersMatchs={derniersMatchs} aVenir={aVenir} />}
              {onglet === 'effectif' && <OngletEffectif effectif={effectif} />}
              {onglet === 'palmares' && <OngletPalmares palmares={palmares} />}
            </div>
            <ColonneDroite data={data} derniersMatchs={derniersMatchs} prochain={aVenir[0]} buteurs={buteurs} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default EquipeDetailPage;