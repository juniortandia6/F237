// f237-frontend/src/pages/JoueurPage.jsx
// Fiche d'un joueur (route /joueurs/:id), dans le style de la fiche club :
// - zone haute sombre : fil d'Ariane, avatar maillot, nom, club, poste, total de buts
// - zone basse claire : buts par saison + liste de tous ses buts (liens vers les matchs) + fiche
// Données : GET /api/clubs/joueurs/:id (buts reliés à l'effectif par ButMatch.JoueurId).

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { locale } from '../i18n';
import { ChevronRight, AlertCircle, Goal, Shirt, Flag, Cake, Shield, CalendarDays, Info } from 'lucide-react';
import { equipeService } from '../services/equipeService';
import { infosSaison, libelleSaison } from '../data/saisons';
import AvatarJoueur from '../components/AvatarJoueur';
import theme from '../theme';

// ── Mêmes couleurs et gabarits que la fiche club ────────────────────────
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
const CONTENEUR = { position: 'relative', maxWidth: '1150px', margin: '0 auto', padding: '0 var(--marge-page)', boxSizing: 'content-box' };
const FOND_BANDE = `linear-gradient(120deg, ${theme.greenDeep} 0%, #12462c 45%, #0f3a25 100%)`;

// Postes saisis dans l'admin -> clés de traduction
const POSTES = { Gardien: 'gardien', Défenseur: 'defenseur', Milieu: 'milieu', Attaquant: 'attaquant' };

const dateCourte = (d) => new Date(d).toLocaleDateString(locale(), { day: '2-digit', month: 'short', year: 'numeric' });

// "MTN Elite One 2026-27" (ou "Saison 12" si la saison n'est pas dans data/saisons.js)
function libelleCompetition(saisonId) {
  const infos = infosSaison(saisonId);
  return infos ? { titre: `MTN ${infos.label}`, saison: libelleSaison(infos.annee), annee: infos.annee } : null;
}

function EclatsBande() {
  return (
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <polygon points="0,600 0,380 260,0 420,0" fill="#1f9d55" opacity="0.22" />
      <polygon points="160,600 520,0 640,0 330,600" fill="#3ccf7a" opacity="0.10" />
      <polygon points="1440,0 1440,260 1180,600 1010,600" fill="#e1252b" opacity="0.16" />
      <polygon points="1300,0 1440,0 1440,90 1240,420" fill="#fcd116" opacity="0.10" />
    </svg>
  );
}

function Carte({ titre, icone: Icone, droite, children }) {
  return (
    <div style={{ backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '14px', overflow: 'hidden' }}>
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

function PetitLogo({ equipe, taille = 26 }) {
  const [ok, setOk] = useState(true);
  return equipe?.logoUrl && ok
    ? <img src={equipe.logoUrl} alt="" onError={() => setOk(false)} style={{ width: taille, height: taille, objectFit: 'contain', flexShrink: 0 }} />
    : <span style={{ width: taille, height: taille, borderRadius: '50%', backgroundColor: CLAIR.tuile, flexShrink: 0 }} />;
}

// ── Buts par saison ─────────────────────────────────────────────────────
function ButsParSaison({ saisons }) {
  const { t } = useTranslation();
  return (
    <Carte titre={t('joueur.parSaison')} icone={CalendarDays}>
      {saisons.length === 0 ? <Vide>{t('joueur.aucunBut')}</Vide> : (
        <div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 110px 60px 60px', gap: '8px', padding: '10px 20px',
            fontSize: '11px', fontWeight: 800, color: CLAIR.doux, letterSpacing: '0.5px', textTransform: 'uppercase',
            borderBottom: `1px solid ${CLAIR.bord}`,
          }}>
            <span>{t('joueur.competition')}</span>
            <span style={{ textAlign: 'center' }}>{t('joueur.matchs')}</span>
            <span style={{ textAlign: 'center' }}>{t('joueur.pen')}</span>
            <span style={{ textAlign: 'center' }}>{t('joueur.buts')}</span>
          </div>
          {saisons.map((s, i) => (
            <div key={s.saisonId} style={{
              display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 110px 60px 60px', gap: '8px', alignItems: 'center',
              padding: '12px 20px', borderTop: i ? `1px solid ${CLAIR.bord}` : 'none',
            }}>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: CLAIR.texte }}>
                  {s.libelle?.titre ?? t('joueur.saisonInconnue', { id: s.saisonId })}
                </span>
                <span style={{ fontSize: '12px', color: CLAIR.doux }}>
                  {s.libelle?.saison}{s.equipe ? ` · ${s.equipe}` : ''}
                </span>
              </span>
              <span style={{ textAlign: 'center', fontSize: '14px', fontWeight: 700, color: CLAIR.doux }}>{s.matchs}</span>
              <span style={{ textAlign: 'center', fontSize: '14px', fontWeight: 700, color: CLAIR.doux }}>{s.penaltys}</span>
              <span style={{ textAlign: 'center', fontFamily: CHIFFRES, fontSize: '24px', fontWeight: 800, color: CLAIR.vert }}>{s.buts}</span>
            </div>
          ))}
        </div>
      )}
    </Carte>
  );
}

// ── Liste des buts (un match peut contenir plusieurs buts du joueur) ────
function ListeButs({ matchs }) {
  const { t } = useTranslation();
  return (
    <Carte titre={t('joueur.sesButs')} icone={Goal}>
      {matchs.length === 0 ? <Vide>{t('joueur.aucunBut')}</Vide> : matchs.map((m, i) => (
        <Link key={m.matchId} to={`/matchs/${m.matchId}`}
          className="transition-colors hover:bg-[#f6f8f7]"
          style={{
            display: 'grid', gridTemplateColumns: '92px minmax(0,1fr) auto', gap: '14px', alignItems: 'center',
            padding: '12px 20px', borderTop: i ? `1px solid ${CLAIR.bord}` : 'none', textDecoration: 'none',
          }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: CLAIR.doux }}>{dateCourte(m.dateMatch)}</span>

          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <PetitLogo equipe={m.equipeDomicile} />
            <span style={{ fontSize: '14px', fontWeight: m.pourDomicile ? 800 : 600, color: CLAIR.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {m.equipeDomicile?.nom}
            </span>
            <span style={{ fontFamily: CHIFFRES, fontSize: '18px', fontWeight: 800, color: CLAIR.texte, padding: '0 4px', flexShrink: 0 }}>
              {m.scoreDomicile ?? '–'}-{m.scoreExterieur ?? '–'}
            </span>
            <span style={{ fontSize: '14px', fontWeight: m.pourDomicile ? 600 : 800, color: CLAIR.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {m.equipeExterieur?.nom}
            </span>
            <PetitLogo equipe={m.equipeExterieur} />
          </span>

          <span style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {m.buts.map(b => (
              <span key={b.id} style={{
                fontSize: '12px', fontWeight: 800, padding: '3px 9px', borderRadius: '999px', whiteSpace: 'nowrap',
                backgroundColor: '#e8f3ec', color: CLAIR.vert,
              }}>
                ⚽ {b.minute > 0 ? `${b.minute}'` : t('joueur.minuteInconnue')}{b.estPenalty ? ` (${t('matchDetail.pen')})` : ''}
              </span>
            ))}
          </span>
        </Link>
      ))}
    </Carte>
  );
}

// ── Fiche (colonne de droite) ───────────────────────────────────────────
function Fiche({ j }) {
  const { t } = useTranslation();
  const lignes = [
    [Shield, t('joueur.fiche.club'), j.equipe && (
      <Link to={`/equipes/${j.equipe.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: CLAIR.vert, fontWeight: 700, textDecoration: 'none' }}>
        <PetitLogo equipe={j.equipe} taille={20} /> {j.equipe.nom}
      </Link>
    )],
    [Goal, t('joueur.fiche.poste'), POSTES[j.poste] && t(`joueur.postes.${POSTES[j.poste]}`)],
    [Shirt, t('joueur.fiche.numero'), j.numero != null ? `#${j.numero}` : null],
    [Flag, t('joueur.fiche.nationalite'), j.nationalite],
    [Cake, t('joueur.fiche.age'), j.age ? t('equipe.ans', { n: j.age }) : null],
  ].filter(([, , v]) => v);

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Carte titre={t('joueur.fiche.titre')}>
        {lignes.map(([Icone, label, valeur], i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 20px', borderTop: i ? `1px solid ${CLAIR.bord}` : 'none' }}>
            <Icone size={16} color={CLAIR.doux} style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: CLAIR.doux, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: CLAIR.texte }}>{valeur}</div>
            </div>
          </div>
        ))}
      </Carte>

      {!j.estActif && (
        <div style={{ display: 'flex', gap: '10px', padding: '14px 16px', borderRadius: '12px', backgroundColor: '#fff7e0', border: '1px solid #f3dfa0', color: '#6b5300', fontSize: '13px' }}>
          <Info size={16} style={{ flexShrink: 0, marginTop: '1px' }} /> {t('joueur.aQuitte')}
        </div>
      )}

      <p style={{ fontSize: '12px', color: CLAIR.doux, lineHeight: 1.5, padding: '0 4px' }}>{t('joueur.noteSources')}</p>
    </aside>
  );
}

// ── Page ────────────────────────────────────────────────────────────────
export default function JoueurPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [etat, setEtat] = useState(null); // { id, data, erreur }

  useEffect(() => {
    let ignore = false;
    equipeService.getJoueur(id)
      .then(data => { if (!ignore) setEtat({ id, data, erreur: null }); })
      .catch(() => { if (!ignore) setEtat({ id, data: null, erreur: 'introuvable' }); });
    return () => { ignore = true; };
  }, [id]);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  const data = etat?.id === id ? etat.data : null;
  const buts = useMemo(() => data?.buts ?? [], [data]);

  // Buts regroupés par match (le plus récent d'abord, déjà trié par l'API)
  const matchs = useMemo(() => {
    const parMatch = new Map();
    for (const b of buts) {
      let m = parMatch.get(b.matchId);
      if (!m) {
        m = {
          matchId: b.matchId, dateMatch: b.dateMatch, saisonId: b.saisonId,
          equipeDomicile: b.equipeDomicile, equipeExterieur: b.equipeExterieur,
          scoreDomicile: b.scoreDomicile, scoreExterieur: b.scoreExterieur,
          pourDomicile: b.nomEquipe === b.equipeDomicile?.nom,
          buts: [],
        };
        parMatch.set(b.matchId, m);
      }
      m.buts.push(b);
    }
    for (const m of parMatch.values()) m.buts.sort((a, b) => a.minute - b.minute);
    return [...parMatch.values()];
  }, [buts]);

  // Totaux par saison, de la plus récente à la plus ancienne.
  // "Matchs" = matchs joués par SON CLUB cette saison-là (les présences du joueur ne sont pas connues) ;
  // la saison la plus récente du club apparaît toujours, même sans but.
  const saisons = useMemo(() => {
    const club = data?.equipe?.nom ?? null;
    const saisonsClub = data?.saisonsClub ?? [];
    const matchsClub = new Map(saisonsClub.map(x => [x.saisonId, x.matchsJoues]));
    const ligne = (saisonId, date) => ({
      saisonId, libelle: libelleCompetition(saisonId), buts: 0, penaltys: 0, matchsAvecBut: 0, equipe: null, date,
    });

    const parSaison = new Map();
    for (const m of matchs) {
      let s = parSaison.get(m.saisonId);
      if (!s) { s = ligne(m.saisonId, m.dateMatch); parSaison.set(m.saisonId, s); }
      s.matchsAvecBut += 1;
      s.buts += m.buts.length;
      s.penaltys += m.buts.filter(b => b.estPenalty).length;
      s.equipe ??= m.buts[0]?.nomEquipe ?? null;
    }
    // Saison en cours du club (la plus récente), même si le joueur n'y a pas encore marqué
    const actuelle = saisonsClub[0];
    if (actuelle && !parSaison.has(actuelle.saisonId)) {
      parSaison.set(actuelle.saisonId, { ...ligne(actuelle.saisonId, actuelle.dernierMatch), equipe: club });
    }

    return [...parSaison.values()]
      .map(s => ({
        ...s,
        // Saison passée avec son club actuel : matchs du club ; avec un autre club : matchs où il a marqué
        matchs: (s.equipe === club || s.equipe == null) && matchsClub.has(s.saisonId) ? matchsClub.get(s.saisonId) : s.matchsAvecBut,
      }))
      .sort((a, b) => (b.libelle?.annee ?? 0) - (a.libelle?.annee ?? 0) || new Date(b.date) - new Date(a.date));
  }, [matchs, data]);

  if (!etat || etat.id !== id) {
    return (
      <div style={{ backgroundColor: CLAIR.fond, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: CLAIR.doux }}>{t('joueur.chargement')}</p>
      </div>
    );
  }

  if (etat.erreur || !data) {
    return (
      <div style={{ backgroundColor: CLAIR.fond, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={40} color={theme.red} style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '18px', fontWeight: 800, color: CLAIR.texte, marginBottom: '10px' }}>{t('joueur.introuvable')}</p>
          <Link to="/equipes" style={{ color: CLAIR.vert, fontWeight: 700 }}>← {t('equipe.toutesEquipes')}</Link>
        </div>
      </div>
    );
  }

  const nomComplet = [data.prenom, data.nom].filter(Boolean).join(' ');
  const saisonRecente = saisons[0];
  const totalPen = buts.filter(b => b.estPenalty).length;
  const eliteOne = data.equipe?.division === 0;

  return (
    <div>
      {/* ── ZONE HAUTE ─────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: FOND_BANDE, padding: '28px 0 48px' }}>
        <EclatsBande />
        <div style={CONTENEUR}>
          {/* Fil d'Ariane */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', flexWrap: 'wrap', marginBottom: '30px' }}>
            {[[t('nav.accueil'), '/'], [t('nav.equipes'), '/equipes'], ...(data.equipe ? [[data.equipe.nom, `/equipes/${data.equipe.id}`]] : [])].map(([label, to]) => (
              <span key={to} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link to={to} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}>
                  {label}
                </Link>
                <ChevronRight size={13} color="rgba(255,255,255,0.45)" />
              </span>
            ))}
            <span style={{ color: '#fff', fontWeight: 700 }}>{nomComplet}</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '28px', flexWrap: 'wrap' }}>
            {/* Avatar + nom */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '26px', minWidth: 0 }}>
              <AvatarJoueur club={data.equipe?.nom} nom={nomComplet} numero={data.numero ?? undefined}
                taille={128} gardien={data.poste === 'Gardien'} />
              <div style={{ minWidth: 0 }}>
                {data.equipe && (
                  <Link to={`/equipes/${data.equipe.id}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '10px', textDecoration: 'none',
                    fontSize: '12px', fontWeight: 800, letterSpacing: '1px', padding: '4px 12px 4px 6px', borderRadius: '999px',
                    backgroundColor: eliteOne ? theme.yellow : 'rgba(255,255,255,0.15)', color: eliteOne ? '#1a1a1a' : '#fff',
                  }}>
                    <PetitLogo equipe={data.equipe} taille={18} /> {data.equipe.nom.toUpperCase()}
                  </Link>
                )}
                {data.prenom && (
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '20px', fontWeight: 600, lineHeight: 1.1 }}>{data.prenom}</div>
                )}
                <h1 style={{ color: '#fff', fontSize: '52px', fontWeight: 400, lineHeight: 1.05, fontFamily: MARQUEUR, margin: '2px 0 12px' }}>
                  {data.nom}
                </h1>
                <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                  {POSTES[data.poste] && <span>{t(`joueur.postes.${POSTES[data.poste]}`)}</span>}
                  {data.numero != null && <span>#{data.numero}</span>}
                  {data.nationalite && <span>{data.nationalite}</span>}
                  {data.age && <span>{t('equipe.ans', { n: data.age })}</span>}
                </div>
              </div>
            </div>

            {/* Buts : saison la plus récente + total, en verre dépoli */}
            <div style={{
              display: 'flex', borderRadius: '16px', overflow: 'hidden',
              backgroundColor: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(6px)',
            }}>
              {[
                [saisonRecente?.libelle ? t('joueur.butsSaison', { saison: saisonRecente.libelle.saison }) : t('joueur.butsSaisonCourt'), saisonRecente?.buts ?? 0],
                [t('joueur.butsTotal'), buts.length],
                [t('joueur.penaltys'), totalPen],
              ].map(([label, val], i) => (
                <div key={label} style={{ padding: '16px 24px', textAlign: 'center', borderLeft: i ? '1px solid rgba(255,255,255,0.14)' : 'none' }}>
                  <div style={{ fontFamily: CHIFFRES, fontSize: '44px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{val}</div>
                  <div style={{ marginTop: '4px', fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.65)', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ZONE BASSE ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: CLAIR.fond, minHeight: '420px', padding: '32px 0 64px' }}>
        <div style={CONTENEUR}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" style={{ alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ButsParSaison saisons={saisons} />
              <ListeButs matchs={matchs} />
            </div>
            <Fiche j={data} />
          </div>
        </div>
      </section>
    </div>
  );
}