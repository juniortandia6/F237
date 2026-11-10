// f237-frontend/src/pages/admin/AdminMatchEditionPage.jsx
// Corrections d'un match (/admin/matchs/:id) :
// - buteurs : ajouter, modifier, supprimer (penalty, but contre son camp)
// - score à la mi-temps
// - heure du coup d'envoi (heure du Cameroun), ou retour à l'heure de l'API
// Convention des buts : nomEquipe = équipe CRÉDITÉE du but. Pour un CSC, le but
// est rangé chez l'équipe qui en profite, avec le nom du joueur adverse.

import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Check, X, Clock, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { adminService, dateApi } from '../../services/adminService';
import { infosSaison } from '../../data/saisons';
import { etatMatch } from '../../data/statutMatch';
import { estInconnu, butsDe, problemesMatch } from './analyseMatch';
import { CLAIR, CARTE, TITRE_CARTE, CHIFFRES } from './styleAdmin';

const FUSEAU_CAMEROUN = 'Africa/Douala'; // UTC+1, sans heure d'été
const LIBELLE_ETAT = { aVenir: 'À venir', live: 'En direct', termine: 'Terminé', reporte: 'Reporté', annule: 'Annulé', nonDispute: 'Non disputé' };

const CHAMP = {
  boxSizing: 'border-box', padding: '9px 11px', borderRadius: '9px', border: `1px solid ${CLAIR.bord}`,
  fontSize: '14px', color: CLAIR.texte, backgroundColor: '#fff', outline: 'none', fontFamily: 'inherit',
};
const BOUTON = (fond, couleur) => ({
  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '999px', border: 'none',
  cursor: 'pointer', fontSize: '13px', fontWeight: 700, backgroundColor: fond, color: couleur,
});

// Date UTC -> "2026-11-14T15:30" en heure du Cameroun (UTC+1) pour <input type="datetime-local">
function versCameroun(iso) {
  const d = dateApi(iso);
  if (!d) return '';
  const c = new Date(d.getTime() + 3600 * 1000);
  const deux = (n) => String(n).padStart(2, '0');
  return `${c.getUTCFullYear()}-${deux(c.getUTCMonth() + 1)}-${deux(c.getUTCDate())}T${deux(c.getUTCHours())}:${deux(c.getUTCMinutes())}`;
}
const afficherCameroun = (iso) => dateApi(iso)?.toLocaleString('fr-FR', {
  timeZone: FUSEAU_CAMEROUN, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
}) ?? '–';

// ── Formulaire d'un but ─────────────────────────────────────────────────
function FormulaireBut({ initial, nomEquipe, suggestions, suggestionsCsc, onValider, onAnnuler, envoi }) {
  const [nom, setNom] = useState(initial?.nomJoueur && !estInconnu(initial.nomJoueur) ? initial.nomJoueur : '');
  // Minute 0 = minute inconnue (le but compte, sans minute affichée)
  const [inconnue, setInconnue] = useState(initial != null && !(initial.minute > 0));
  const [minute, setMinute] = useState(initial?.minute > 0 ? initial.minute : '');
  const [penalty, setPenalty] = useState(initial?.estPenalty ?? false);
  const [csc, setCsc] = useState(initial?.estButCSC ?? false);
  const idListe = `buteurs-${nomEquipe.replace(/\W/g, '')}-${csc ? 'csc' : 'eq'}`;

  const valider = (e) => {
    e.preventDefault();
    onValider({ nomJoueur: nom.trim(), nomEquipe, minute: inconnue ? 0 : Number(minute), estPenalty: penalty && !csc, estButCSC: csc });
  };

  return (
    <form onSubmit={valider} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', borderRadius: '10px', backgroundColor: CLAIR.tuile }}>
      <div style={{ display: 'grid', gridTemplateColumns: '70px minmax(0, 1fr)', gap: '8px' }}>
        <input type="number" min={1} max={130} required={!inconnue} disabled={inconnue} value={inconnue ? '' : minute} onChange={e => setMinute(e.target.value)}
          placeholder={inconnue ? '–' : 'Min.'} aria-label="Minute" style={{ ...CHAMP, backgroundColor: inconnue ? CLAIR.tuile : '#fff' }} />
        <input required value={nom} onChange={e => setNom(e.target.value)} list={idListe} aria-label="Buteur"
          placeholder={csc ? 'Joueur adverse (contre son camp)' : 'Ex. M. Williams'} style={CHAMP} autoFocus />
        <datalist id={idListe}>
          {(csc ? suggestionsCsc : suggestions).map(n => <option key={n} value={n} />)}
        </datalist>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: CLAIR.texte }}>
          <input type="checkbox" checked={inconnue} onChange={e => setInconnue(e.target.checked)} /> Minute inconnue
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: csc ? CLAIR.doux : CLAIR.texte }}>
          <input type="checkbox" checked={penalty && !csc} disabled={csc} onChange={e => setPenalty(e.target.checked)} /> Penalty
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: CLAIR.texte }}>
          <input type="checkbox" checked={csc} onChange={e => setCsc(e.target.checked)} /> Contre son camp
        </label>
        <span style={{ flex: 1 }} />
        <button type="button" onClick={onAnnuler} style={BOUTON('transparent', CLAIR.doux)}><X size={14} /> Annuler</button>
        <button type="submit" disabled={envoi} style={{ ...BOUTON(CLAIR.vert, '#fff'), opacity: envoi ? 0.6 : 1 }}><Check size={14} /> {initial ? 'Enregistrer' : 'Ajouter'}</button>
      </div>
      {csc && <span style={{ fontSize: '12px', color: CLAIR.doux }}>Le but est compté pour {nomEquipe}. Il n'apparaît pas au classement des buteurs.</span>}
      {inconnue && <span style={{ fontSize: '12px', color: CLAIR.doux }}>Le but compte au classement des buteurs ; sur le site, il s'affiche sans minute.</span>}
    </form>
  );
}

// ── Une colonne de buteurs (une équipe) ─────────────────────────────────
function ColonneButs({ m, equipe, suggestions, suggestionsCsc, action }) {
  const buts = butsDe(m, equipe?.nom);
  const score = equipe?.nom === m.equipeDomicile?.nom ? m.scoreDomicile : m.scoreExterieur;
  const [edition, setEdition] = useState(null); // id du but modifié, ou 'nouveau'
  const [aSupprimer, setASupprimer] = useState(null);
  const complet = score != null && buts.length === score;

  const fin = (ok) => { if (ok) { setEdition(null); setASupprimer(null); } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '8px', borderBottom: `1px solid ${CLAIR.bord}` }}>
        {equipe?.logoUrl && <img src={equipe.logoUrl} alt="" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />}
        <span style={{ flex: 1, fontSize: '15px', fontWeight: 800, color: CLAIR.texte }}>{equipe?.nom}</span>
        {score != null && (
          <span style={{ fontSize: '12px', fontWeight: 800, color: complet ? CLAIR.vert : CLAIR.rouge }}>
            {buts.length} / {score} but{score > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {buts.length === 0 && edition !== 'nouveau' && (
        <p style={{ fontSize: '13px', color: CLAIR.doux, margin: '4px 0' }}>{score ? 'Aucun buteur saisi.' : 'Aucun but.'}</p>
      )}

      {buts.map(b => (edition === b.id ? (
        <FormulaireBut key={b.id} initial={b} nomEquipe={equipe.nom} suggestions={suggestions} suggestionsCsc={suggestionsCsc}
          envoi={action.envoi} onAnnuler={() => setEdition(null)}
          onValider={(saisie) => action.executer(() => adminService.matchs.modifierBut(b.id, saisie), 'But modifié.').then(fin)} />
      ) : (
        <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '9px', backgroundColor: aSupprimer === b.id ? CLAIR.rougeClair : estInconnu(b.nomJoueur) ? '#fff6f6' : 'transparent' }}>
          <span title={b.minute > 0 ? undefined : 'Minute inconnue'} style={{ fontFamily: CHIFFRES, fontSize: '18px', fontWeight: 800, color: b.minute > 0 ? CLAIR.vert : CLAIR.doux, width: '36px' }}>{b.minute > 0 ? `${b.minute}'` : '–'}</span>
          <span style={{ flex: 1, minWidth: 0, fontSize: '14px', fontWeight: 700, color: estInconnu(b.nomJoueur) ? CLAIR.rouge : CLAIR.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {estInconnu(b.nomJoueur) ? 'Buteur inconnu' : b.nomJoueur}
            {b.estPenalty && <span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: 800, color: CLAIR.doux }}>(pen.)</span>}
            {b.estButCSC && <span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: 800, color: CLAIR.rouge }}>(c.s.c.)</span>}
          </span>
          {aSupprimer === b.id ? (
            <>
              <button onClick={() => setASupprimer(null)} style={BOUTON('transparent', CLAIR.doux)}>Annuler</button>
              <button onClick={() => action.executer(() => adminService.matchs.supprimerBut(b.id), 'But supprimé.').then(fin)} style={BOUTON(CLAIR.rouge, '#fff')}>Supprimer</button>
            </>
          ) : (
            <>
              <button title="Modifier" aria-label="Modifier" onClick={() => { setEdition(b.id); setASupprimer(null); }} style={{ ...BOUTON('transparent', CLAIR.texte), padding: '6px' }}><Pencil size={15} /></button>
              <button title="Supprimer" aria-label="Supprimer" onClick={() => setASupprimer(b.id)} style={{ ...BOUTON('transparent', CLAIR.rouge), padding: '6px' }}><Trash2 size={15} /></button>
            </>
          )}
        </div>
      )))}

      {edition === 'nouveau' ? (
        <FormulaireBut nomEquipe={equipe.nom} suggestions={suggestions} suggestionsCsc={suggestionsCsc}
          envoi={action.envoi} onAnnuler={() => setEdition(null)}
          onValider={(saisie) => action.executer(() => adminService.matchs.ajouterBut(m.id, saisie), 'But ajouté.').then(fin)} />
      ) : (
        <button onClick={() => { setEdition('nouveau'); setASupprimer(null); }}
          style={{ ...BOUTON(CLAIR.carte, CLAIR.vert), alignSelf: 'flex-start', boxShadow: `inset 0 0 0 1px ${CLAIR.bord}` }}>
          <Plus size={14} /> But pour {equipe.nom}
        </button>
      )}
    </div>
  );
}

// ── Score à la mi-temps ─────────────────────────────────────────────────
function CarteMiTemps({ m, action }) {
  const [dom, setDom] = useState(m.scoreMiTempsDomicile ?? '');
  const [ext, setExt] = useState(m.scoreMiTempsExterieur ?? '');
  const defini = m.scoreMiTempsDomicile != null && m.scoreMiTempsExterieur != null;
  // Calcul à partir des buts saisis (minute <= 45), pour aider
  const deduit = (equipe) => butsDe(m, equipe?.nom).filter(b => b.minute > 0 && b.minute <= 45).length;
  const minutesInconnues = (m.buts ?? []).some(b => !(b.minute > 0));

  return (
    <div style={CARTE}>
      <div style={TITRE_CARTE}>Score à la mi-temps</div>
      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="number" min={0} max={30} value={dom} onChange={e => setDom(e.target.value)} aria-label={`Mi-temps ${m.equipeDomicile?.nom}`} style={{ ...CHAMP, width: '64px', textAlign: 'center', fontFamily: CHIFFRES, fontSize: '20px', fontWeight: 800 }} />
          <span style={{ fontWeight: 800, color: CLAIR.doux }}>-</span>
          <input type="number" min={0} max={30} value={ext} onChange={e => setExt(e.target.value)} aria-label={`Mi-temps ${m.equipeExterieur?.nom}`} style={{ ...CHAMP, width: '64px', textAlign: 'center', fontFamily: CHIFFRES, fontSize: '20px', fontWeight: 800 }} />
        </div>
        {minutesInconnues && (
          <span style={{ fontSize: '12px', color: CLAIR.orange }}>Des buts n'ont pas de minute : saisis le score à la mi-temps à la main si tu le connais.</span>
        )}
        {(m.buts?.length ?? 0) > 0 && !minutesInconnues && (
          <button type="button" onClick={() => { setDom(deduit(m.equipeDomicile)); setExt(deduit(m.equipeExterieur)); }}
            style={{ ...BOUTON('transparent', CLAIR.vert), padding: 0, alignSelf: 'flex-start' }}>
            Calculer avec les buts saisis ({deduit(m.equipeDomicile)} - {deduit(m.equipeExterieur)})
          </button>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button disabled={action.envoi || dom === '' || ext === ''}
            onClick={() => action.executer(() => adminService.matchs.miTemps(m.id, Number(dom), Number(ext)), 'Score à la mi-temps enregistré.')}
            style={{ ...BOUTON(CLAIR.vert, '#fff'), opacity: dom === '' || ext === '' ? 0.5 : 1 }}>
            <Check size={14} /> Enregistrer
          </button>
          {defini && (
            <button disabled={action.envoi}
              onClick={() => action.executer(() => adminService.matchs.miTemps(m.id, null, null), 'Score à la mi-temps effacé.').then(ok => { if (ok) { setDom(''); setExt(''); } })}
              style={BOUTON('transparent', CLAIR.doux)}>
              Effacer
            </button>
          )}
        </div>
        <span style={{ fontSize: '12px', color: CLAIR.doux }}>Conservé lors des imports tant que l'API n'en fournit pas.</span>
      </div>
    </div>
  );
}

// ── Heure du coup d'envoi ───────────────────────────────────────────────
function CarteHeure({ m, action }) {
  const [valeur, setValeur] = useState(versCameroun(m.dateMatch));
  return (
    <div style={CARTE}>
      <div style={TITRE_CARTE}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={17} color={CLAIR.vert} /> Coup d'envoi</span>
        {m.heureManuelle && <span style={{ fontSize: '11px', fontWeight: 800, color: CLAIR.vert, textTransform: 'uppercase' }}>Corrigée</span>}
      </div>
      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '13px', color: CLAIR.texte, textTransform: 'capitalize' }}>{afficherCameroun(m.dateMatch)}</span>
        <label style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.4px', textTransform: 'uppercase', color: CLAIR.doux }}>
          Heure du Cameroun (UTC+1)
          <input type="datetime-local" value={valeur} onChange={e => setValeur(e.target.value)} style={{ ...CHAMP, width: '100%', marginTop: '6px' }} />
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button disabled={action.envoi || !valeur || valeur === versCameroun(m.dateMatch)}
            onClick={() => action.executer(() => adminService.matchs.corrigerHeure(m.apiFootballId, `${valeur}:00+01:00`), 'Heure corrigée.')}
            style={{ ...BOUTON(CLAIR.vert, '#fff'), opacity: !valeur || valeur === versCameroun(m.dateMatch) ? 0.5 : 1 }}>
            <Check size={14} /> Corriger l'heure
          </button>
          {m.heureManuelle && (
            <button disabled={action.envoi}
              onClick={() => action.executer(() => adminService.matchs.annulerHeure(m.apiFootballId), 'Retour à l\'heure de l\'API.')}
              style={BOUTON('transparent', CLAIR.doux)}>
              Revenir à l'heure de l'API
            </button>
          )}
        </div>
        <span style={{ fontSize: '12px', color: CLAIR.doux }}>Gardée lors des imports, sauf si l'API change elle-même l'heure.</span>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────
export default function AdminMatchEditionPage() {
  const { id } = useParams();
  const location = useLocation();
  const [match, setMatch] = useState(() => (String(location.state?.match?.id) === id ? location.state.match : null));
  const [version, setVersion] = useState(0);
  const [saison, setSaison] = useState(null);     // matchs de la saison (suggestions de noms)
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState(null);

  // GET /api/matchs/{id} ne renvoie ni les équipes ni les buts : on s'en sert seulement
  // pour connaître la saison, puis on prend le match COMPLET dans la liste de la saison
  // (équipes, logos, buts avec leur id). Cette liste sert aussi aux suggestions de noms.
  const saisonConnue = match?.saisonId ?? null;
  useEffect(() => {
    let ignore = false;
    const saisonDuMatch = saisonConnue != null
      ? Promise.resolve(saisonConnue)
      : adminService.matchs.get(id).then(m => m?.saisonId ?? null);
    saisonDuMatch
      .then(sid => {
        if (sid == null) throw new Error('Match introuvable.');
        return adminService.matchs.saison(sid);
      })
      .then(liste => {
        if (ignore) return;
        const complet = liste.find(x => String(x.id) === String(id));
        if (!complet) { setErreur('Match introuvable.'); return; }
        setSaison(liste);
        setMatch(complet);
      })
      .catch(e => { if (!ignore) setErreur(e.message); });
    return () => { ignore = true; };
  }, [id, version, saisonConnue]);

  // Noms déjà utilisés dans la saison, par équipe créditée (hors CSC et inconnus)
  const nomsParEquipe = useMemo(() => {
    const map = new Map();
    for (const m of saison ?? []) for (const b of m.buts ?? []) {
      if (b.estButCSC || estInconnu(b.nomJoueur)) continue;
      if (!map.has(b.nomEquipe)) map.set(b.nomEquipe, new Set());
      map.get(b.nomEquipe).add(b.nomJoueur);
    }
    return map;
  }, [saison]);
  const noms = (equipe) => [...(nomsParEquipe.get(equipe?.nom) ?? [])].sort((a, b) => a.localeCompare(b, 'fr'));

  // Exécute une modification, affiche le message, recharge le match. Renvoie true si ok.
  const action = {
    envoi,
    executer: async (appelApi, texteOk) => {
      setEnvoi(true);
      setMessage(null);
      try {
        await appelApi();
        setMessage({ type: 'ok', texte: texteOk });
        setVersion(v => v + 1);
        return true;
      } catch (e) {
        setMessage({ type: 'erreur', texte: e.message });
        return false;
      } finally {
        setEnvoi(false);
      }
    },
  };

  if (erreur) {
    return (
      <div style={{ ...CARTE, padding: '30px', textAlign: 'center' }}>
        <p style={{ color: CLAIR.rouge, fontWeight: 700, marginBottom: '14px' }}>{erreur}</p>
        <Link to="/admin/matchs" style={{ color: CLAIR.vert, fontWeight: 700 }}>Retour aux matchs</Link>
      </div>
    );
  }
  if (!match) return <p style={{ color: CLAIR.doux }}>Chargement…</p>;

  const infos = infosSaison(match.saisonId);
  const retour = infos ? `/admin/matchs?annee=${infos.annee}&comp=${infos.cle}` : '/admin/matchs';
  const etat = etatMatch(match);
  const joue = etat === 'termine' || etat === 'live';
  const p = problemesMatch(match);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <Link to={retour} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: CLAIR.doux, textDecoration: 'none', marginBottom: '6px' }}>
            <ArrowLeft size={14} /> Matchs
          </Link>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: CLAIR.texte }}>Corriger le match</h2>
        </div>
        <a href={`/matchs/${match.id}`} target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '999px', border: `1px solid ${CLAIR.bord}`, backgroundColor: CLAIR.carte, color: CLAIR.texte, fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
          <ExternalLink size={14} /> Voir sur le site
        </a>
      </div>

      {/* Résumé du match */}
      <div style={{ ...CARTE, padding: '18px 22px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)', alignItems: 'center', gap: '18px' }}>
        {[match.equipeDomicile, null, match.equipeExterieur].map((e, i) => (i === 1 ? (
          <div key="score" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: CHIFFRES, fontSize: '40px', fontWeight: 800, color: CLAIR.texte, lineHeight: 1 }}>
              {joue ? `${match.scoreDomicile ?? 0} - ${match.scoreExterieur ?? 0}` : '–'}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: CLAIR.doux, marginTop: '6px' }}>
              {LIBELLE_ETAT[etat]}{match.journee ? ` · J${match.journee}` : ''}
              {match.scoreMiTempsDomicile != null && ` · MT ${match.scoreMiTempsDomicile}-${match.scoreMiTempsExterieur}`}
            </div>
          </div>
        ) : (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: i === 0 ? 'flex-end' : 'flex-start', flexDirection: i === 0 ? 'row' : 'row-reverse' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: CLAIR.texte, textAlign: i === 0 ? 'right' : 'left' }}>{e?.nom}</span>
            {e?.logoUrl && <img src={e.logoUrl} alt="" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />}
          </div>
        )))}
      </div>

      {message && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, backgroundColor: message.type === 'ok' ? CLAIR.vertClair : CLAIR.rougeClair, color: message.type === 'ok' ? CLAIR.vert : CLAIR.rouge }}>
          {message.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />} {message.texte}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '20px', alignItems: 'start' }}>
        {/* Buteurs */}
        <div style={CARTE}>
          <div style={TITRE_CARTE}>
            Buteurs
            {joue && (p.inconnus + p.manquants + p.enTrop > 0
              ? <span style={{ fontSize: '12px', color: CLAIR.rouge }}>{[p.inconnus && `${p.inconnus} inconnu(s)`, p.manquants && `${p.manquants} à saisir`, p.enTrop && `${p.enTrop} en trop`].filter(Boolean).join(' · ')}</span>
              : <span style={{ fontSize: '12px', color: CLAIR.vert }}>Complet</span>)}
          </div>
          {joue && match.equipeDomicile && match.equipeExterieur ? (
            <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '22px' }}>
              <ColonneButs m={match} equipe={match.equipeDomicile}
                suggestions={noms(match.equipeDomicile)} suggestionsCsc={noms(match.equipeExterieur)} action={action} />
              <ColonneButs m={match} equipe={match.equipeExterieur}
                suggestions={noms(match.equipeExterieur)} suggestionsCsc={noms(match.equipeDomicile)} action={action} />
            </div>
          ) : (
            <p style={{ padding: '18px', fontSize: '14px', color: CLAIR.doux }}>Les buteurs se saisissent une fois le match joué.</p>
          )}
          <p style={{ padding: '0 18px 14px', fontSize: '12px', color: CLAIR.doux, margin: 0 }}>
            Les noms déjà utilisés cette saison sont proposés pendant la saisie : garde la même orthographe pour que les buts s'additionnent au classement.
          </p>
        </div>

        {/* Colonne droite */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {joue && <CarteMiTemps key={`mt-${match.scoreMiTempsDomicile}-${match.scoreMiTempsExterieur}`} m={match} action={action} />}
          <CarteHeure key={`h-${match.dateMatch}`} m={match} action={action} />
        </div>
      </div>
    </div>
  );
}