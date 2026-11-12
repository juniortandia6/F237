// f237-frontend/src/pages/EquipeDetailPage.jsx
// Fiche d'un club (route /equipes/:id), inspirée de FIBA :
// - zone haute sombre : fil d'Ariane, logo, nom, infos du club, photo du stade en fond
// - barre d'onglets : Aperçu · Histoire · Matchs · Effectif · Palmarès
// - zone basse claire : contenu de l'onglet + colonne (forme, prochain match, buteurs, fiche)

import { useEffect, useState, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { locale } from '../i18n';
import {
  ChevronRight, MapPin, Calendar, Building2, Users, Trophy, AlertCircle, Goal, ArrowRight,
  Palette, Star, BookOpen, ExternalLink, Medal, Globe,
} from 'lucide-react';
import { equipeService } from '../services/equipeService';
import { matchService } from '../services/matchService';
import { classementService } from '../services/classementService';
import { COMPETITIONS, SAISONS_DB, ANNEE_ACTUELLE, libelleSaison } from '../data/saisons';
import SelecteurSaison from '../components/SelecteurSaison';
import { getInfosClub } from '../data/clubsInfos';
import theme from '../theme';
import { estAVenir } from '../data/statutMatch';
import AvatarJoueur from '../components/AvatarJoueur';
import { regrouperButeurs, classerButeurs } from '../data/buteurs';

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
// Postes saisis dans l'admin (français) -> clés ci-dessus (celles de l'API-Football)
const POSTE_ADMIN = { Gardien: 'Goalkeeper', Défenseur: 'Defender', Milieu: 'Midfielder', Attaquant: 'Attacker' };
const CHARGE_LE = Date.now();
const ageDepuis = (date) => {
  if (!date) return null;
  const d = new Date(/Z$|[+-]\d\d:\d\d$/.test(date) ? date : `${date}Z`);
  return Number.isNaN(d.getTime()) ? null : Math.floor((CHARGE_LE - d.getTime()) / (365.25 * 24 * 3600 * 1000));
};
// Joueur de l'admin -> même forme que ceux de l'API (nom, poste, age, numero, nationalite)
const versJoueurSite = (j) => ({
  id: j.id,
  nom: [j.prenom, j.nom].filter(Boolean).join(' '),
  poste: POSTE_ADMIN[j.poste] ?? null,
  numero: j.numero ?? null,
  nationalite: j.nationalite ?? null,
  age: j.age ?? ageDepuis(j.dateNaissance),
  f237: true, // joueur de notre base : il a une fiche (/joueurs/:id)
});
// Libellés des postes : equipe.postes.<poste> et equipe.postesCourts.<poste>
const COULEUR_RESULTAT = { V: theme.green, N: '#a3aaa6', D: theme.red, '?': '#c9cfcc' };

const dateCourte = (d) => new Date(d).toLocaleDateString(locale(), { day: '2-digit', month: 'short' });
const dateLongue = (d) => new Date(d).toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long' });
const heure = (d) => new Date(d).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });

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
  const { t } = useTranslation();
  return (
    <span style={{
      width: taille, height: taille, borderRadius: '6px', flexShrink: 0,
      backgroundColor: COULEUR_RESULTAT[r] ?? COULEUR_RESULTAT['?'], color: '#fff',
      fontSize: taille * 0.46, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{r ? t(`matchDetail.resultat.${r}`, { defaultValue: r }) : '?'}</span>
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
// Avatar « maillot » aux couleurs du club (pas de photo de joueur sans accord des clubs)
function CarteJoueur({ j, club }) {
  const { t } = useTranslation();
  // Joueur de notre base : la carte mène à sa fiche ; joueur de l'API : carte simple
  const Conteneur = j.f237 && j.id ? Link : 'div';
  const lien = j.f237 && j.id ? { to: `/joueurs/${j.id}`, className: 'transition-shadow hover:shadow-md' } : {};
  return (
    <Conteneur {...lien} style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', textDecoration: 'none',
      backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '12px',
    }}>
      <AvatarJoueur club={club} nom={j.nom} numero={j.numero ?? undefined} taille={48} gardien={j.poste === 'Goalkeeper'} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: CLAIR.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.nom}</div>
        <div style={{ fontSize: '12px', color: CLAIR.doux }}>
          {[POSTES_ORDRE.includes(j.poste) && t(`equipe.postesCourts.${j.poste}`), j.age && t('equipe.ans', { n: j.age }), j.nationalite].filter(Boolean).join(' · ')}
        </div>
      </div>
      {j.numero != null && (
        <span style={{ fontFamily: CHIFFRES, fontSize: '24px', fontWeight: 800, color: '#cfd5d2' }}>{j.numero}</span>
      )}
    </Conteneur>
  );
}

// ── Contenu des onglets ─────────────────────────────────────────────────
function OngletApercu({ classement, derniersMatchs, annee, chargement }) {
  const { t } = useTranslation();
  if (chargement) return <Carte><Vide>{t('commun.chargement')}</Vide></Carte>;
  return (
    <>
      <Carte titre={t('saison.saison', { s: libelleSaison(annee) })}>
        {classement ? (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8" style={{ padding: '18px 20px' }}>
            <Tuile label={t('equipe.tuiles.pos')} valeur={`#${classement.position}`} fort />
            <Tuile label={t('classement.col.pts')} valeur={classement.points} fort />
            <Tuile label={t('equipe.tuiles.mj')} valeur={classement.matchsJoues} />
            <Tuile label={t('classement.col.v')} valeur={classement.victoires} />
            <Tuile label={t('classement.col.n')} valeur={classement.nuls} />
            <Tuile label={t('classement.col.d')} valeur={classement.defaites} />
            <Tuile label={t('classement.col.bp')} valeur={classement.butsPour} />
            <Tuile label={t('classement.col.bc')} valeur={classement.butsContre} />
          </div>
        ) : <Vide>{t('equipe.pasDeClassement')}</Vide>}
      </Carte>

      <Carte titre={t('equipe.derniersMatchs')}>
        {derniersMatchs.length
          ? derniersMatchs.map((m, i) => <LigneMatch key={m.matchId} m={m} premier={i === 0} />)
          : <Vide>{t('equipe.aucunJoue')}</Vide>}
      </Carte>
    </>
  );
}

function OngletMatchs({ derniersMatchs, aVenir, chargement }) {
  const { t } = useTranslation();
  if (chargement) return <Carte><Vide>{t('commun.chargement')}</Vide></Carte>;
  return (
    <>
      <Carte titre={t('commun.aVenir')} droite={<span style={{ fontSize: '12px', fontWeight: 700, color: CLAIR.doux }}>{t('matchs.nbMatchs', { count: aVenir.length })}</span>}>
        {aVenir.length
          ? aVenir.map((m, i) => <LigneAVenir key={m.id} m={m} premier={i === 0} />)
          : <Vide>{t('equipe.aucunProgramme')}</Vide>}
      </Carte>
      <Carte titre={t('equipe.resultatsRecents')}>
        {derniersMatchs.length
          ? derniersMatchs.map((m, i) => <LigneMatch key={m.matchId} m={m} premier={i === 0} />)
          : <Vide>{t('equipe.aucunJoue')}</Vide>}
      </Carte>
    </>
  );
}

function OngletEffectif({ effectif, club }) {
  const { t } = useTranslation();
  if (effectif.length === 0) {
    return <Carte><Vide>{t('equipe.effectifIndispo')}</Vide></Carte>;
  }
  const groupes = [
    ...POSTES_ORDRE.map(p => ({ titre: t(`equipe.postes.${p}`), joueurs: effectif.filter(j => j.poste === p) })),
    { titre: t('equipe.postes.autres'), joueurs: effectif.filter(j => !POSTES_ORDRE.includes(j.poste)) },
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
          .map((j, i) => <CarteJoueur key={j.id ?? j.apiId ?? `${j.nom}-${i}`} j={j} club={club} />)}
      </div>
    </div>
  ));
}

// Liens vers les sources (obligatoire pour les textes issus de Wikipédia, licence CC BY-SA)
function Sources({ urls }) {
  const { t } = useTranslation();
  if (!urls?.length) return null;
  const libelle = (u) => {
    try { return new URL(u).hostname.replace('www.', ''); } catch { return u; }
  };
  return (
    <p style={{ fontSize: '12px', color: CLAIR.doux, lineHeight: 1.6 }}>
      {t('equipe.sources')}{' '}
      {urls.map((u, i) => (
        <span key={u}>
          {i > 0 && ' · '}
          <a href={u} target="_blank" rel="noopener noreferrer" style={{ color: CLAIR.vert, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            {libelle(u)} <ExternalLink size={11} />
          </a>
        </span>
      ))}
      {urls.some(u => u.includes('wikipedia.org')) && ` — ${t('equipe.licenceWiki')}`}
    </p>
  );
}

function OngletHistoire({ club }) {
  const { t } = useTranslation();
  if (!club) {
    return <Carte><Vide>{t('equipe.histoireBientot')}</Vide></Carte>;
  }
  const enBref = [
    [Calendar, t('equipe.fiche.fondation'), club.fondation],
    [MapPin, t('equipe.fiche.ville'), club.ville],
    [Palette, t('equipe.fiche.couleurs'), club.couleurs],
    [Star, t('equipe.fiche.surnom'), club.surnom],
    [Building2, t('equipe.fiche.stade'), club.stade],
  ].filter(([, , v]) => v);

  return (
    <>
      <Carte titre={club.nomComplet} icone={BookOpen}>
        <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {club.histoire.map((p, i) => (
            <p key={i} style={{ fontSize: '15px', lineHeight: 1.7, color: '#2c312e' }}>{p}</p>
          ))}
        </div>
      </Carte>

      {enBref.length > 0 && (
        <Carte titre={t('equipe.enBref')}>
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {enBref.map(([Icone, label, valeur], i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 20px', borderTop: i > 1 ? `1px solid ${CLAIR.bord}` : 'none' }}>
                <span style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#e8f3ec', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icone size={16} color={CLAIR.vert} />
                </span>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: CLAIR.doux, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: CLAIR.texte }}>{valeur}</div>
                </div>
              </div>
            ))}
          </div>
        </Carte>
      )}

      {club.grandsJoueurs?.length > 0 && (
        <Carte titre={t('equipe.grandsJoueurs')} icone={Star}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '16px 20px' }}>
            {club.grandsJoueurs.map(j => (
              <span key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '999px', backgroundColor: CLAIR.tuile, fontSize: '14px', fontWeight: 700, color: CLAIR.texte }}>
                <span style={{ display: 'flex', width: '18px', height: '12px', borderRadius: '2px', overflow: 'hidden', flexShrink: 0 }} aria-hidden="true">
                  <span style={{ flex: 1, backgroundColor: theme.green }} />
                  <span style={{ flex: 1, backgroundColor: theme.red }} />
                  <span style={{ flex: 1, backgroundColor: theme.yellow }} />
                </span>
                {j}
              </span>
            ))}
          </div>
        </Carte>
      )}

      <Sources urls={club.sources} />
    </>
  );
}

// Une ligne de palmarès : trophée, compétition, nombre, années
function LignePalmares({ p, premier }) {
  const { t } = useTranslation();
  const titre = p.type === 'titre';
  const nombre = p.nombre ?? p.annees?.length ?? 0;
  const Icone = p.continental ? Globe : titre ? Trophy : Medal;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 20px', borderTop: premier ? 'none' : `1px solid ${CLAIR.bord}` }}>
      <span style={{
        width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
        backgroundColor: titre ? '#fdf3d0' : CLAIR.tuile,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icone size={20} color={titre ? '#c9971b' : '#8a918d'} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '16px', fontWeight: 800, color: CLAIR.texte }}>{p.competition}</span>
          {p.continental && <span style={{ fontSize: '10px', fontWeight: 800, color: '#1a3a7a', backgroundColor: '#e3eaf7', padding: '2px 8px', borderRadius: '999px', letterSpacing: '0.5px' }}>{t('equipe.afrique')}</span>}
        </div>
        <div style={{ fontSize: '13px', color: CLAIR.doux, marginTop: '2px' }}>
          {p.libelle ?? (titre ? t('equipe.vainqueur', { count: nombre }) : t('equipe.finaliste', { count: nombre }))}
        </div>
        {p.annees?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
            {p.annees.map(a => (
              <span key={a} style={{
                fontFamily: CHIFFRES, fontSize: '15px', fontWeight: 800, padding: '3px 10px', borderRadius: '6px',
                backgroundColor: titre ? '#fdf3d0' : CLAIR.tuile, color: titre ? '#7a5a08' : '#4a514d',
              }}>{a}</span>
            ))}
          </div>
        )}
      </div>
      <span style={{ fontFamily: CHIFFRES, fontSize: '30px', fontWeight: 800, color: titre ? '#c9971b' : '#b5bcb8', lineHeight: 1 }}>{nombre}</span>
    </div>
  );
}

function OngletPalmares({ palmares, club }) {
  const { t } = useTranslation();
  const local = club?.palmares ?? [];
  const titres = local.filter(p => p.type === 'titre');
  const finales = local.filter(p => p.type !== 'titre');
  const totalTitres = titres.reduce((s, p) => s + (p.nombre ?? p.annees?.length ?? 0), 0);

  if (local.length === 0 && palmares.length === 0) {
    return <Carte><Vide>{t('equipe.aucunTitre')}</Vide></Carte>;
  }

  return (
    <>
      {titres.length > 0 && (
        <Carte titre={t('equipe.titres')} icone={Trophy}
          droite={<span style={{ fontSize: '12px', fontWeight: 800, color: '#7a5a08', backgroundColor: '#fdf3d0', padding: '3px 10px', borderRadius: '999px' }}>{t('equipe.trophees', { count: totalTitres })}</span>}>
          {titres.map((p, i) => <LignePalmares key={p.competition + i} p={p} premier={i === 0} />)}
        </Carte>
      )}

      {finales.length > 0 && (
        <Carte titre={t('equipe.finales')} icone={Medal}>
          {finales.map((p, i) => <LignePalmares key={p.competition + i} p={p} premier={i === 0} />)}
        </Carte>
      )}

      {/* Palmarès renvoyé par l'API (s'il y en a) */}
      {palmares.length > 0 && (
        <Carte titre={t('equipe.selonApi')} icone={Trophy}>
          {palmares.map((x, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderTop: i ? `1px solid ${CLAIR.bord}` : 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: CLAIR.texte }}>{x.ligue}</div>
                <div style={{ fontSize: '12px', color: CLAIR.doux }}>{[x.saison, x.pays].filter(Boolean).join(' · ')}</div>
              </div>
              {x.place && (
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#8a6510', backgroundColor: '#fdf3d0', borderRadius: '999px', padding: '3px 10px' }}>{x.place}</span>
              )}
            </div>
          ))}
        </Carte>
      )}

      {club && <Sources urls={club.sources} />}
    </>
  );
}

// ── Colonne de droite ───────────────────────────────────────────────────
function ColonneDroite({ data, club, derniersMatchs, prochain, buteurs }) {
  const { t } = useTranslation();
  const infos = data.infos ?? {};
  // L'API d'abord, nos fiches clubs (clubsInfos.js) en secours
  const fiche = [
    [MapPin, t('equipe.fiche.ville'), infos.ville ?? club?.ville],
    [Calendar, t('equipe.fiche.fondeEn'), infos.anneeCreation ?? club?.fondation],
    [Building2, t('equipe.fiche.stade'), infos.stadeNom ?? club?.stade],
    [Users, t('equipe.fiche.capacite'), infos.stadeCapacite ? t('equipe.places', { n: infos.stadeCapacite.toLocaleString(locale()) }) : null],
    [Palette, t('equipe.fiche.couleurs'), club?.couleurs],
    [Star, t('equipe.fiche.surnom'), club?.surnom],
  ].filter(([, , v]) => v);

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Forme récente (du plus ancien au plus récent) */}
      <Carte titre={t('matchDetail.formeRecente')}>
        <div style={{ display: 'flex', gap: '8px', padding: '16px 20px' }}>
          {derniersMatchs.length
            ? [...derniersMatchs].reverse().map(m => (
              <Link key={m.matchId} to={`/matchs/${m.matchId}`} title={`${m.equipeDomicile} ${m.scoreDomicile}-${m.scoreExterieur} ${m.equipeExterieur}`}
                className="transition-transform hover:-translate-y-0.5">
                <PastilleResultat r={m.resultat} taille={34} />
              </Link>
            ))
            : <span style={{ fontSize: '13px', color: CLAIR.doux }}>{t('equipe.pasEncoreJoue')}</span>}
        </div>
      </Carte>

      {/* Prochain match */}
      {prochain && (
        <Link to={`/matchs/${prochain.id}`} state={{ match: prochain }} style={{ textDecoration: 'none' }}>
          <Carte titre={t('equipe.prochainMatch')} droite={<ArrowRight size={16} color={CLAIR.doux} />}>
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
      <Carte titre={t('equipe.buteursClub')} icone={Goal}>
        {buteurs.length === 0 ? <Vide>{t('equipe.aucunBut')}</Vide> : buteurs.map((j, i) => (
          <div key={j.cle} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', borderTop: i ? `1px solid ${CLAIR.bord}` : 'none' }}>
            <span style={{ width: '18px', fontSize: '13px', fontWeight: 800, color: CLAIR.doux }}>{i + 1}</span>
            {j.joueurId ? (
              <Link to={`/joueurs/${j.joueurId}`} title={t('joueur.voirFiche')} className="hover:underline"
                style={{ flex: 1, minWidth: 0, fontSize: '14px', fontWeight: 700, color: CLAIR.texte, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {j.nom}
              </Link>
            ) : (
              <span style={{ flex: 1, minWidth: 0, fontSize: '14px', fontWeight: 700, color: CLAIR.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.nom}</span>
            )}
            <span style={{ fontFamily: CHIFFRES, fontSize: '20px', fontWeight: 800, color: CLAIR.vert }}>{j.buts}</span>
          </div>
        ))}
      </Carte>

      {/* Fiche du club */}
      {fiche.length > 0 && (
        <Carte titre={t('equipe.ficheClub')}>
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

// Le club pendant une saison : son championnat, sa ligne de classement et ses matchs
function trouverSaisonClub(donnees, idClub) {
  if (!donnees) return null;
  const estLeClub = (eq) => eq?.id === idClub;
  for (const c of COMPETITIONS) {
    const d = donnees[c.cle];
    const matchs = (d?.matchs ?? []).filter(m => estLeClub(m.equipeDomicile) || estLeClub(m.equipeExterieur));
    const ligne = (d?.classement ?? []).find(l => (l.equipeId ?? l.equipe?.id) === idClub) ?? null;
    if (matchs.length || ligne) return { comp: c.cle, matchs, classement: ligne };
  }
  return { comp: null, matchs: [], classement: null };
}

// ── Page ────────────────────────────────────────────────────────────────
function EquipeDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [parametres, setParametres] = useSearchParams();
  const [etat, setEtat] = useState(null); // { id, data, erreur }
  // Données de la saison choisie (classements + matchs des deux championnats)
  const [saisonEtat, setSaisonEtat] = useState(null); // { annee, one: { classement, matchs }, two: {...} }

  // Saison choisie : dans l'adresse (?saison=2025), sinon la saison en cours
  const saisonUrl = Number(parametres.get('saison'));
  const annee = SAISONS_DB[saisonUrl] ? saisonUrl : ANNEE_ACTUELLE;
  const changerSaison = (a) => setParametres({ saison: String(a) }, { replace: true });
  const [ongletChoisi, setOngletChoisi] = useState({ id: null, cle: 'apercu' });
  const [logoOk, setLogoOk] = useState(true);

  // Revient sur "Aperçu" quand on change de club (sans setState dans un effet)
  const onglet = ongletChoisi.id === id ? ongletChoisi.cle : 'apercu';
  const chargement = etat?.id !== id;

  useEffect(() => {
    let ignore = false;
    equipeService.getById(id)
      .then(data => { if (!ignore) setEtat({ id, data, erreur: null }); })
      .catch(() => { if (!ignore) setEtat({ id, data: null, erreur: 'introuvable' }); });
    return () => { ignore = true; };
  }, [id]);

  // Effectif saisi dans l'admin (prioritaire sur celui de l'API-Football)
  const [effectifF237, setEffectifF237] = useState({ id: null, joueurs: [] });
  useEffect(() => {
    let ignore = false;
    equipeService.getEffectif(id)
      .then(l => { if (!ignore) setEffectifF237({ id, joueurs: Array.isArray(l) ? l : [] }); })
      .catch(() => { if (!ignore) setEffectifF237({ id, joueurs: [] }); });
    return () => { ignore = true; };
  }, [id]);

  // Classements + matchs de la saison choisie, pour les deux championnats
  // (on ne sait pas d'avance dans lequel le club jouait cette saison-là)
  useEffect(() => {
    const ids = SAISONS_DB[annee] ?? {};
    let ignore = false;
    const charger = (service, sid) => (sid != null ? service.getBySaison(sid).catch(() => []) : Promise.resolve([]));
    Promise.all(COMPETITIONS.flatMap(c => [charger(classementService, ids[c.cle]), charger(matchService, ids[c.cle])]))
      .then(res => {
        if (ignore) return;
        setSaisonEtat({
          annee,
          ...Object.fromEntries(COMPETITIONS.map((c, i) => [c.cle, { classement: res[i * 2], matchs: res[i * 2 + 1] }])),
        });
      });
    return () => { ignore = true; };
  }, [annee]);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  const data = etat?.data;
  const idClub = Number(id);
  const donneesSaison = saisonEtat?.annee === annee ? saisonEtat : null;
  const chargementSaison = donneesSaison === null;

  // Le club cette saison : son championnat, sa ligne de classement et ses matchs
  const saisonClub = useMemo(() => trouverSaisonClub(donneesSaison, idClub), [donneesSaison, idClub]);
  const matchsSaison = useMemo(() => saisonClub?.matchs ?? [], [saisonClub]);

  // Matchs joués, du plus récent au plus ancien, au format des lignes de match
  const resultats = useMemo(() => matchsSaison
    .filter(m => m.statut === 2)
    .sort((a, b) => new Date(b.dateMatch) - new Date(a.dateMatch))
    .map(m => {
      const estDomicile = m.equipeDomicile?.id === idClub;
      const pour = estDomicile ? m.scoreDomicile : m.scoreExterieur;
      const contre = estDomicile ? m.scoreExterieur : m.scoreDomicile;
      return {
        matchId: m.id, dateMatch: m.dateMatch, estDomicile,
        equipeDomicile: m.equipeDomicile?.nom, logoDomicile: m.equipeDomicile?.logoUrl,
        equipeExterieur: m.equipeExterieur?.nom, logoExterieur: m.equipeExterieur?.logoUrl,
        scoreDomicile: m.scoreDomicile, scoreExterieur: m.scoreExterieur,
        resultat: pour > contre ? 'V' : pour < contre ? 'D' : 'N',
      };
    }), [matchsSaison, idClub]);

  // Prochains matchs du club (à venir, date pas encore dépassée)
  const aVenir = useMemo(() => matchsSaison
    .filter(estAVenir)
    .sort((a, b) => new Date(a.dateMatch) - new Date(b.dateMatch)), [matchsSaison]);

  // Buteurs du club (sans CSC ni inconnus), top 5 : regroupés par joueur quand le but est relié
  // à l'effectif (même règle que l'accueil et le classement, voir data/buteurs.js)
  const buteurs = useMemo(() => {
    if (!data) return [];
    const butsDuClub = matchsSaison.map(m => ({ ...m, buts: (m.buts ?? []).filter(b => b.nomEquipe === data.nom) }));
    return classerButeurs(regrouperButeurs(butsDuClub)).slice(0, 5);
  }, [matchsSaison, data]);

  if (chargement) {
    return (
      <div style={{ backgroundColor: CLAIR.fond, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: CLAIR.doux }}>{t('equipe.chargement')}</p>
      </div>
    );
  }

  if (etat.erreur || !data) {
    return (
      <div style={{ backgroundColor: CLAIR.fond, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={40} color={theme.red} style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '18px', fontWeight: 800, color: CLAIR.texte, marginBottom: '10px' }}>{t('equipe.introuvable')}</p>
          <Link to="/equipes" style={{ color: CLAIR.vert, fontWeight: 700 }}>← {t('equipe.toutesEquipes')}</Link>
        </div>
      </div>
    );
  }

  const infos = data.infos ?? {};
  const classement = saisonClub?.classement ?? null;
  const derniersMatchs = resultats.slice(0, 5); // Aperçu + forme récente
  const palmares = data.palmares ?? [];
  // Effectif : celui de l'admin s'il a été saisi, sinon celui de l'API-Football
  const saisi = effectifF237.id === id ? effectifF237.joueurs : [];
  const effectif = saisi.length ? saisi.map(versJoueurSite) : (data.effectif ?? []);
  // Championnat de la saison choisie (à défaut, la division actuelle du club)
  const eliteOne = saisonClub?.comp ? saisonClub.comp === 'one' : data.division === 0;
  // Histoire + palmarès (Wikipédia), dans la langue du site ; null si pas encore rédigé
  const club = getInfosClub(data.nom, i18n.resolvedLanguage);
  const nbTitres = (club?.palmares ?? [])
    .filter(p => p.type === 'titre')
    .reduce((s, p) => s + (p.nombre ?? p.annees?.length ?? 0), 0) + palmares.length;

  const ONGLETS = [
    { cle: 'apercu' },
    { cle: 'histoire' },
    { cle: 'matchs' },
    { cle: 'effectif', nb: effectif.length },
    { cle: 'palmares', nb: nbTitres },
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '30px' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            {[[t('nav.accueil'), '/'], [t('nav.equipes'), `/equipes?saison=${annee}`]].map(([label, to]) => (
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
          <SelecteurSaison annee={annee} onChange={changerSaison} />
          </div>

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
                  {(infos.ville ?? club?.ville) && infoHero(MapPin, infos.ville ?? club.ville)}
                  {(infos.anneeCreation ?? club?.fondation) && infoHero(Calendar, t('equipe.fondeEnAnnee', { a: infos.anneeCreation ?? club.fondation }))}
                  {(infos.stadeNom ?? club?.stade) && infoHero(Building2, infos.stadeNom ?? club.stade)}
                  {/* Site officiel du club (clubsInfos.js : siteWeb) */}
                  {club?.siteWeb && (
                    <a href={club.siteWeb} target="_blank" rel="noopener noreferrer"
                      className="transition-colors"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', color: theme.yellow, fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = theme.yellow; }}>
                      <Globe size={15} /> {t('equipe.siteOfficiel')} <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Position + points, en verre dépoli */}
            {classement && (
              <div style={{
                display: 'flex', borderRadius: '16px', overflow: 'hidden',
                backgroundColor: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(6px)',
              }}>
                {[[t('equipe.position'), `#${classement.position}`], [t('equipe.points'), classement.points]].map(([label, val], i) => (
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
                {t(`equipe.onglets.${o.cle}`)}
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
              {onglet === 'apercu' && <OngletApercu classement={classement} derniersMatchs={derniersMatchs} annee={annee} chargement={chargementSaison} />}
              {onglet === 'matchs' && <OngletMatchs derniersMatchs={resultats} aVenir={aVenir} chargement={chargementSaison} />}
              {onglet === 'effectif' && <OngletEffectif effectif={effectif} club={data.nom} />}
              {onglet === 'histoire' && <OngletHistoire club={club} />}
              {onglet === 'palmares' && <OngletPalmares palmares={palmares} club={club} />}
            </div>
            <ColonneDroite data={data} club={club} derniersMatchs={derniersMatchs} prochain={aVenir[0]} buteurs={buteurs} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default EquipeDetailPage;