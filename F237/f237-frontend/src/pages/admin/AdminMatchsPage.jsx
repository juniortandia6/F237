// f237-frontend/src/pages/admin/AdminMatchsPage.jsx
// Liste des matchs d'une saison pour l'admin, avec ce qu'il reste à corriger
// (buteurs inconnus, buts non saisis, score à la mi-temps absent, heure corrigée).
// Un clic ouvre la page du match (/admin/matchs/:id).

import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ChevronRight, Clock } from 'lucide-react';
import { adminService, dateApi } from '../../services/adminService';
import { SAISONS_DB, SAISON_EN_COURS, COMPETITIONS, libelleSaison } from '../../data/saisons';
import { etatMatch } from '../../data/statutMatch';
import { locale } from '../../i18n';
import { problemesMatch } from './analyseMatch';
import { CLAIR, CARTE, CHIFFRES } from './styleAdmin';

const FILTRES = [
  { cle: 'aCorriger', label: 'À corriger' },
  { cle: 'termines', label: 'Terminés' },
  { cle: 'tous', label: 'Tous' },
];
const ANNEES = Object.keys(SAISONS_DB).map(Number).sort((a, b) => b - a);
const LIBELLE_ETAT = { aVenir: 'À venir', enAttente: 'Résultat en attente', live: 'En direct', reporte: 'Reporté', annule: 'Annulé', nonDispute: 'Non disputé' };

const formatDate = (s) => dateApi(s)?.toLocaleDateString(locale(), { weekday: 'short', day: 'numeric', month: 'short' }) ?? '';

function Badge({ children, couleur, fond }) {
  return <span style={{ fontSize: '11px', fontWeight: 800, color: couleur, backgroundColor: fond, padding: '3px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>{children}</span>;
}

function Equipe({ e, droite }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, justifyContent: droite ? 'flex-start' : 'flex-end', flexDirection: droite ? 'row' : 'row-reverse' }}>
      {e?.logoUrl ? <img src={e.logoUrl} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }} /> : <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: CLAIR.tuile, flexShrink: 0 }} />}
      <span style={{ fontSize: '14px', fontWeight: 700, color: CLAIR.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e?.nom}</span>
    </span>
  );
}

function LigneMatch({ m }) {
  const p = problemesMatch(m);
  const etat = etatMatch(m);
  const joue = etat === 'termine' || etat === 'live';
  return (
    <Link to={`/admin/matchs/${m.id}`} state={{ match: m }}
      style={{ display: 'grid', gridTemplateColumns: '92px minmax(0, 1fr) 70px minmax(0, 1fr) 230px 18px', alignItems: 'center', gap: '12px', padding: '12px 18px', borderTop: `1px solid ${CLAIR.bord}`, textDecoration: 'none' }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f7f9f8'; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
      <span style={{ fontSize: '12px', fontWeight: 700, color: CLAIR.doux, textTransform: 'capitalize' }}>{formatDate(m.dateMatch)}</span>
      <Equipe e={m.equipeDomicile} />
      <span style={{ textAlign: 'center', fontFamily: CHIFFRES, fontSize: '20px', fontWeight: 800, color: joue ? CLAIR.texte : CLAIR.doux }}>
        {joue ? `${m.scoreDomicile ?? 0} - ${m.scoreExterieur ?? 0}` : '–'}
      </span>
      <Equipe e={m.equipeExterieur} droite />
      <span style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {!joue && <Badge couleur={CLAIR.doux} fond={CLAIR.tuile}>{LIBELLE_ETAT[etat]}</Badge>}
        {p.inconnus > 0 && <Badge couleur={CLAIR.rouge} fond={CLAIR.rougeClair}>{p.inconnus} inconnu{p.inconnus > 1 ? 's' : ''}</Badge>}
        {p.manquants > 0 && <Badge couleur={CLAIR.rouge} fond={CLAIR.rougeClair}>{p.manquants} but{p.manquants > 1 ? 's' : ''} à saisir</Badge>}
        {p.enTrop > 0 && <Badge couleur={CLAIR.rouge} fond={CLAIR.rougeClair}>{p.enTrop} but{p.enTrop > 1 ? 's' : ''} en trop</Badge>}
        {p.miTemps && <Badge couleur={CLAIR.orange} fond={CLAIR.orangeClair}>mi-temps ?</Badge>}
        {m.heureManuelle && <Badge couleur={CLAIR.vert} fond={CLAIR.vertClair}><Clock size={10} style={{ display: 'inline', verticalAlign: '-1px' }} /> heure corrigée</Badge>}
        {joue && p.total === 0 && <Badge couleur={CLAIR.vert} fond={CLAIR.vertClair}>complet</Badge>}
      </span>
      <ChevronRight size={16} color={CLAIR.doux} />
    </Link>
  );
}

export default function AdminMatchsPage() {
  const [params, setParams] = useSearchParams();
  const annee = Number(params.get('annee')) || SAISON_EN_COURS;
  const comp = params.get('comp') === 'two' ? 'two' : 'one';
  const filtre = FILTRES.some(f => f.cle === params.get('filtre')) ? params.get('filtre') : 'aCorriger';
  const saisonId = SAISONS_DB[annee]?.[comp] ?? null;

  const [donnees, setDonnees] = useState(null); // { saisonId, matchs }
  const [erreur, setErreur] = useState(null);
  const [recherche, setRecherche] = useState('');

  // Choix gardés dans l'adresse : on retrouve la même liste en revenant d'un match
  const changer = (cle, valeur) => setParams(p => { const n = new URLSearchParams(p); n.set(cle, valeur); return n; }, { replace: true });

  useEffect(() => {
    if (saisonId == null) return;
    let ignore = false;
    adminService.matchs.saison(saisonId)
      .then(l => { if (!ignore) { setDonnees({ saisonId, matchs: l }); setErreur(null); } })
      .catch(e => { if (!ignore) setErreur(e.message); });
    return () => { ignore = true; };
  }, [saisonId]);

  const matchs = useMemo(() => (donnees?.saisonId === saisonId ? donnees.matchs : null), [donnees, saisonId]);

  const visibles = useMemo(() => {
    if (!matchs) return [];
    const q = recherche.trim().toLowerCase();
    return matchs
      .filter(m => filtre === 'tous' || (filtre === 'termines' ? m.statut === 2 : problemesMatch(m).total > 0))
      .filter(m => !q || `${m.equipeDomicile?.nom} ${m.equipeExterieur?.nom}`.toLowerCase().includes(q))
      .sort((a, b) => (filtre === 'tous'
        ? dateApi(a.dateMatch) - dateApi(b.dateMatch)
        : dateApi(b.dateMatch) - dateApi(a.dateMatch)));
  }, [matchs, filtre, recherche]);

  // Regroupement par journée (ou "Sans journée")
  const groupes = useMemo(() => {
    const map = new Map();
    for (const m of visibles) {
      const cle = m.journee ?? 0;
      if (!map.has(cle)) map.set(cle, []);
      map.get(cle).push(m);
    }
    return [...map.entries()];
  }, [visibles]);

  const nbACorriger = matchs?.filter(m => problemesMatch(m).total > 0).length ?? 0;
  const SELECT = { padding: '9px 12px', borderRadius: '10px', border: `1px solid ${CLAIR.bord}`, fontSize: '14px', fontWeight: 700, color: CLAIR.texte, backgroundColor: CLAIR.carte, cursor: 'pointer' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 800, color: CLAIR.texte }}>Matchs et buteurs</h2>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={annee} onChange={e => changer('annee', e.target.value)} style={SELECT}>
          {ANNEES.map(a => <option key={a} value={a}>Saison {libelleSaison(a)}</option>)}
        </select>
        <select value={comp} onChange={e => changer('comp', e.target.value)} style={SELECT}>
          {COMPETITIONS.filter(c => SAISONS_DB[annee]?.[c.cle] != null).map(c => <option key={c.cle} value={c.cle}>MTN {c.label}</option>)}
        </select>
        <div style={{ display: 'inline-flex', padding: '4px', borderRadius: '999px', backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}` }}>
          {FILTRES.map(f => (
            <button key={f.cle} onClick={() => changer('filtre', f.cle)}
              style={{ padding: '7px 14px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, backgroundColor: filtre === f.cle ? CLAIR.vert : 'transparent', color: filtre === f.cle ? '#fff' : CLAIR.doux }}>
              {f.label}{f.cle === 'aCorriger' && matchs ? ` ${nbACorriger}` : ''}
            </button>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '999px', border: `1px solid ${CLAIR.bord}`, backgroundColor: CLAIR.carte, marginLeft: 'auto', minWidth: '220px' }}>
          <Search size={15} color={CLAIR.doux} />
          <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Chercher une équipe"
            style={{ border: 'none', outline: 'none', fontSize: '14px', flex: 1, background: 'transparent', color: CLAIR.texte }} />
        </label>
      </div>

      {comp === 'two' && (
        <p style={{ fontSize: '13px', color: CLAIR.doux, margin: 0 }}>
          L'API ne fournit pas les buteurs de l'Elite Two : ils ne peuvent être saisis qu'ici.
        </p>
      )}

      {erreur && <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: CLAIR.rougeClair, color: CLAIR.rouge, fontSize: '14px', fontWeight: 600 }}>{erreur}</div>}

      {saisonId == null ? (
        <div style={{ ...CARTE, padding: '30px', textAlign: 'center', color: CLAIR.doux }}>Cette saison n'est pas importée.</div>
      ) : !matchs && !erreur ? (
        <p style={{ color: CLAIR.doux }}>Chargement…</p>
      ) : groupes.length === 0 ? (
        <div style={{ ...CARTE, padding: '30px', textAlign: 'center', color: CLAIR.doux }}>
          {filtre === 'aCorriger' ? 'Rien à corriger : tous les matchs terminés sont complets.' : 'Aucun match.'}
        </div>
      ) : (
        groupes.map(([journee, liste]) => (
          <div key={journee} style={CARTE}>
            <div style={{ padding: '11px 18px', fontSize: '13px', fontWeight: 800, letterSpacing: '0.4px', textTransform: 'uppercase', color: CLAIR.vert, backgroundColor: CLAIR.vertClair }}>
              {journee ? `Journée ${journee}` : 'Sans journée'} · {liste.length} match{liste.length > 1 ? 's' : ''}
            </div>
            {liste.map(m => <LigneMatch key={m.id} m={m} />)}
          </div>
        ))
      )}
    </div>
  );
}