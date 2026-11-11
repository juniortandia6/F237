// f237-frontend/src/pages/admin/AdminEffectifsPage.jsx
// Effectifs des clubs (l'API-Football n'en fournit pas) :
// - ajouter un joueur, ou plusieurs d'un coup (un par ligne : "9 Mathew Williams")
// - modifier, retirer de l'effectif (départ du club, gardé pour l'historique), réintégrer, supprimer
// Le club choisi est gardé dans l'adresse (?equipe=37).

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, Check, X, UserMinus, UserPlus, ListPlus, AlertTriangle, CheckCircle2, ChevronDown, Download } from 'lucide-react';
import { adminService, dateApi, POSTES, nomJoueur } from '../../services/adminService';
import AvatarJoueur from '../../components/AvatarJoueur';
import { CLAIR, CARTE, TITRE_CARTE, CHIFFRES } from './styleAdmin';

const CHARGE_LE = Date.now();
const RECENT = 200 * 24 * 3600 * 1000;
const GROUPES = [...POSTES, null]; // null = poste non précisé
const LIBELLE_GROUPE = { Gardien: 'Gardiens', Défenseur: 'Défenseurs', Milieu: 'Milieux', Attaquant: 'Attaquants' };

const CHAMP = {
  boxSizing: 'border-box', width: '100%', padding: '9px 10px', borderRadius: '9px', border: `1px solid ${CLAIR.bord}`,
  fontSize: '14px', color: CLAIR.texte, backgroundColor: '#fff', outline: 'none', fontFamily: 'inherit',
};
const BOUTON = (fond, couleur) => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 14px', borderRadius: '999px', border: 'none',
  cursor: 'pointer', fontSize: '13px', fontWeight: 700, backgroundColor: fond, color: couleur, whiteSpace: 'nowrap',
});
const BOUTON_ICONE = { ...BOUTON('transparent', CLAIR.texte), padding: '7px' };

const age = (d) => {
  const n = dateApi(d);
  if (!n) return null;
  return Math.floor((CHARGE_LE - n.getTime()) / (365.25 * 24 * 3600 * 1000));
};
// Date de l'API -> "2001-05-14" pour <input type="date">
const versChampDate = (d) => (d ? String(d).slice(0, 10) : '');
const VIDE = { numero: '', prenom: '', nom: '', poste: '', nationalite: 'Cameroun', dateNaissance: '' };
const versSaisie = (f) => ({
  prenom: f.prenom.trim(), nom: f.nom.trim(), numero: f.numero === '' ? null : Number(f.numero),
  poste: f.poste || null, nationalite: f.nationalite.trim() || null, dateNaissance: f.dateNaissance || null,
});
const depuisJoueur = (j) => ({
  numero: j.numero ?? '', prenom: j.prenom ?? '', nom: j.nom ?? '', poste: j.poste ?? '',
  nationalite: j.nationalite ?? '', dateNaissance: versChampDate(j.dateNaissance),
});

// ── Ligne de saisie (ajout ou modification) ─────────────────────────────
function FormulaireJoueur({ initial, envoi, onValider, onAnnuler, libelle }) {
  const [f, setF] = useState(initial ?? VIDE);
  const maj = (cle) => (e) => setF(x => ({ ...x, [cle]: e.target.value }));
  const valider = (e) => {
    e.preventDefault();
    onValider(versSaisie(f), () => setF(VIDE));
  };
  return (
    <form onSubmit={valider} style={{ display: 'grid', gridTemplateColumns: '58px minmax(0, 1fr) minmax(0, 1.2fr) 120px', gap: '8px', alignItems: 'end' }}>
      <input type="number" min={1} max={99} value={f.numero} onChange={maj('numero')} placeholder="N°" aria-label="Numéro" style={{ ...CHAMP, textAlign: 'center' }} />
      <input value={f.prenom} onChange={maj('prenom')} placeholder="Prénom" aria-label="Prénom" style={CHAMP} />
      <input value={f.nom} onChange={maj('nom')} placeholder="Nom *" aria-label="Nom" required style={CHAMP} autoFocus={!!initial} />
      <select value={f.poste} onChange={maj('poste')} aria-label="Poste" style={{ ...CHAMP, cursor: 'pointer' }}>
        <option value="">Poste</option>
        {POSTES.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <input value={f.nationalite} onChange={maj('nationalite')} placeholder="Nationalité" aria-label="Nationalité" style={{ ...CHAMP, gridColumn: '1 / 3' }} />
      <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', fontWeight: 800, color: CLAIR.doux, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
        Naissance
        <input type="date" value={f.dateNaissance} onChange={maj('dateNaissance')} style={CHAMP} />
      </label>
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
        {onAnnuler && <button type="button" onClick={onAnnuler} style={{ ...BOUTON('transparent', CLAIR.doux), padding: '9px 10px' }}><X size={14} /></button>}
        <button type="submit" disabled={envoi} style={{ ...BOUTON(CLAIR.vert, '#fff'), opacity: envoi ? 0.6 : 1, flex: 1 }}>
          {initial ? <Check size={14} /> : <Plus size={14} />} {libelle}
        </button>
      </div>
    </form>
  );
}

// ── Ligne d'un joueur ───────────────────────────────────────────────────
function LigneJoueur({ j, club, enEdition, aSupprimer, envoi, onEditer, onAnnuler, onEnregistrer, onBasculer, onDemanderSuppression, onSupprimer }) {
  if (enEdition) {
    return (
      <div style={{ padding: '12px 18px', borderTop: `1px solid ${CLAIR.bord}`, backgroundColor: '#f7fbf8' }}>
        <FormulaireJoueur initial={depuisJoueur(j)} envoi={envoi} libelle="Enregistrer" onAnnuler={onAnnuler} onValider={onEnregistrer} />
      </div>
    );
  }
  const a = age(j.dateNaissance);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '40px 34px minmax(0, 1fr) auto', alignItems: 'center', gap: '12px', padding: '9px 18px', borderTop: `1px solid ${CLAIR.bord}`, backgroundColor: aSupprimer ? CLAIR.rougeClair : 'transparent', opacity: j.estActif ? 1 : 0.7 }}>
      <AvatarJoueur club={club} nom={nomJoueur(j)} numero={j.numero ?? undefined} taille={36} gardien={j.poste === 'Gardien'} />
      <span style={{ fontFamily: CHIFFRES, fontSize: '20px', fontWeight: 800, color: j.numero ? CLAIR.vert : '#c9cfcc', textAlign: 'center' }}>{j.numero ?? '–'}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: CLAIR.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {j.prenom && <span style={{ fontWeight: 600 }}>{j.prenom} </span>}{j.nom.toUpperCase()}
        </div>
        <div style={{ fontSize: '12px', color: CLAIR.doux }}>
          {[j.nationalite, a != null && `${a} ans`].filter(Boolean).join(' · ') || '—'}
        </div>
      </div>
      {aSupprimer ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: CLAIR.rouge }}>Supprimer définitivement ?</span>
          <button onClick={onAnnuler} style={BOUTON('transparent', CLAIR.doux)}>Annuler</button>
          <button onClick={onSupprimer} disabled={envoi} style={BOUTON(CLAIR.rouge, '#fff')}>Supprimer</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '2px' }}>
          <button title="Modifier" aria-label="Modifier" onClick={onEditer} style={BOUTON_ICONE}><Pencil size={15} /></button>
          <button title={j.estActif ? 'A quitté le club' : 'Réintégrer dans l\'effectif'} aria-label={j.estActif ? 'Retirer de l\'effectif' : 'Réintégrer'}
            onClick={onBasculer} disabled={envoi} style={{ ...BOUTON_ICONE, color: j.estActif ? CLAIR.orange : CLAIR.vert }}>
            {j.estActif ? <UserMinus size={15} /> : <UserPlus size={15} />}
          </button>
          <button title="Supprimer" aria-label="Supprimer" onClick={onDemanderSuppression} style={{ ...BOUTON_ICONE, color: CLAIR.rouge }}><Trash2 size={15} /></button>
        </div>
      )}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────
export default function AdminEffectifsPage() {
  const [params, setParams] = useSearchParams();
  const [equipes, setEquipes] = useState(null);
  const [donnees, setDonnees] = useState(null);   // { equipeId, joueurs }
  const [version, setVersion] = useState(0);
  const [erreur, setErreur] = useState(null);
  const [message, setMessage] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [mode, setMode] = useState('un');          // 'un' | 'lot'
  const [lot, setLot] = useState({ lignes: '', poste: '', nationalite: 'Cameroun' });
  const [edition, setEdition] = useState(null);    // id du joueur modifié
  const [aSupprimer, setASupprimer] = useState(null);
  const [voirAnciens, setVoirAnciens] = useState(false);

  useEffect(() => {
    let ignore = false;
    adminService.equipes.liste()
      .then(l => { if (!ignore) setEquipes(l); })
      .catch(e => { if (!ignore) setErreur(e.message); });
    return () => { ignore = true; };
  }, []);

  // Clubs de la saison en cours d'abord, puis les autres
  const { actuelles, autres } = useMemo(() => {
    const recente = (e) => e.dernierMatch && dateApi(e.dernierMatch).getTime() > CHARGE_LE - RECENT;
    const tri = (a, b) => (a.division - b.division) || a.nom.localeCompare(b.nom, 'fr');
    const l = equipes ?? [];
    return { actuelles: l.filter(recente).sort(tri), autres: l.filter(e => !recente(e)).sort(tri) };
  }, [equipes]);

  const equipeId = Number(params.get('equipe')) || actuelles[0]?.id || null;
  const equipe = equipes?.find(e => e.id === equipeId) ?? null;

  useEffect(() => {
    if (!equipeId) return;
    let ignore = false;
    adminService.joueurs.liste(equipeId)
      .then(l => { if (!ignore) { setDonnees({ equipeId, joueurs: l }); setErreur(null); } })
      .catch(e => { if (!ignore) setErreur(e.message); });
    return () => { ignore = true; };
  }, [equipeId, version]);

  const joueurs = donnees?.equipeId === equipeId ? donnees.joueurs : null;
  const actifs = (joueurs ?? []).filter(j => j.estActif);
  const anciens = (joueurs ?? []).filter(j => !j.estActif);
  // Numéros portés par plusieurs joueurs actifs
  const compteNumeros = new Map();
  for (const j of actifs) if (j.numero) compteNumeros.set(j.numero, (compteNumeros.get(j.numero) ?? 0) + 1);
  const numerosEnDouble = [...compteNumeros.entries()].filter(([, n]) => n > 1).map(([num]) => num);

  const choisirEquipe = (id) => {
    setEdition(null); setASupprimer(null); setMessage(null); setVoirAnciens(false);
    setParams({ equipe: String(id) }, { replace: true });
  };

  const executer = async (appel, texteOk) => {
    setEnvoi(true);
    setMessage(null);
    try {
      const r = await appel();
      setMessage({ type: 'ok', texte: typeof texteOk === 'function' ? texteOk(r) : texteOk });
      setVersion(v => v + 1);
      return true;
    } catch (e) {
      setMessage({ type: 'erreur', texte: e.message });
      return false;
    } finally {
      setEnvoi(false);
    }
  };

  // Copie de l'effectif de l'API-Football (les joueurs déjà présents sont ignorés)
  const importerApi = () => executer(() => adminService.joueurs.importerApi(equipeId),
    r => r.message ?? `${r.ajoutes} joueur(s) importé(s) depuis l'API-Football${r.ignores ? ` · ${r.ignores} déjà présent(s) ou ignoré(s)` : ''}. Vérifie-les : l'API n'est pas toujours à jour.`);
  const boutonImport = (principal) => (
    <button onClick={importerApi} disabled={envoi}
      style={{ ...(principal ? BOUTON(CLAIR.vert, '#fff') : { ...BOUTON(CLAIR.carte, CLAIR.vert), boxShadow: `inset 0 0 0 1px ${CLAIR.bord}` }), opacity: envoi ? 0.6 : 1 }}>
      <Download size={14} /> {principal ? 'Importer l\'effectif de l\'API-Football' : 'Compléter avec l\'API'}
    </button>
  );

  const groupes = GROUPES
    .map(p => ({ poste: p, liste: actifs.filter(j => (j.poste ?? null) === p) }))
    .filter(g => g.liste.length > 0);

  const ligne = (j) => (
    <LigneJoueur key={j.id} j={j} club={equipe?.nom} envoi={envoi}
      enEdition={edition === j.id} aSupprimer={aSupprimer === j.id}
      onEditer={() => { setEdition(j.id); setASupprimer(null); }}
      onAnnuler={() => { setEdition(null); setASupprimer(null); }}
      onEnregistrer={(saisie) => executer(() => adminService.joueurs.modifier(j.id, saisie), 'Joueur modifié.').then(ok => { if (ok) setEdition(null); })}
      onBasculer={() => executer(
        () => adminService.joueurs.modifier(j.id, { ...versSaisie(depuisJoueur(j)), estActif: !j.estActif }),
        j.estActif ? `${nomJoueur(j)} retiré de l'effectif (gardé dans « Anciens joueurs »).` : `${nomJoueur(j)} réintégré.`)}
      onDemanderSuppression={() => { setASupprimer(j.id); setEdition(null); }}
      onSupprimer={() => executer(() => adminService.joueurs.supprimer(j.id), 'Joueur supprimé.').then(ok => { if (ok) setASupprimer(null); })} />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* En-tête + choix du club */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: CLAIR.texte }}>Effectifs</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {equipe?.logoUrl && <img src={equipe.logoUrl} alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />}
          <select value={equipeId ?? ''} onChange={e => choisirEquipe(Number(e.target.value))} disabled={!equipes}
            style={{ padding: '10px 12px', borderRadius: '10px', border: `1px solid ${CLAIR.bord}`, fontSize: '14px', fontWeight: 700, color: CLAIR.texte, backgroundColor: CLAIR.carte, cursor: 'pointer', minWidth: '240px' }}>
            {!equipes && <option>Chargement…</option>}
            {actuelles.length > 0 && (
              <optgroup label="Saison en cours">
                {actuelles.map(e => <option key={e.id} value={e.id}>{e.nom}{e.division === 1 ? ' (Elite Two)' : ''}</option>)}
              </optgroup>
            )}
            {autres.length > 0 && (
              <optgroup label="Autres clubs">
                {autres.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {erreur && <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: CLAIR.rougeClair, color: CLAIR.rouge, fontSize: '14px', fontWeight: 600 }}>{erreur}</div>}
      {message && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, backgroundColor: message.type === 'ok' ? CLAIR.vertClair : CLAIR.rougeClair, color: message.type === 'ok' ? CLAIR.vert : CLAIR.rouge }}>
          {message.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />} {message.texte}
        </div>
      )}

      {/* Ajout */}
      {equipe && (
        <div style={CARTE}>
          <div style={TITRE_CARTE}>
            Ajouter des joueurs
            <div style={{ display: 'inline-flex', padding: '3px', borderRadius: '999px', backgroundColor: CLAIR.tuile }}>
              {[{ cle: 'un', label: 'Un joueur', Icone: Plus }, { cle: 'lot', label: 'Saisie rapide', Icone: ListPlus }].map(({ cle, label, Icone }) => (
                <button key={cle} onClick={() => setMode(cle)}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, backgroundColor: mode === cle ? CLAIR.carte : 'transparent', color: mode === cle ? CLAIR.texte : CLAIR.doux, boxShadow: mode === cle ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                  <Icone size={13} /> {label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding: '16px 18px' }}>
            {mode === 'un' ? (
              <FormulaireJoueur key={equipeId} envoi={envoi} libelle="Ajouter"
                onValider={(saisie, vider) => executer(() => adminService.joueurs.ajouter(equipeId, saisie), `${nomJoueur(saisie)} ajouté à ${equipe.nom}.`).then(ok => { if (ok) vider(); })} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea value={lot.lignes} onChange={e => setLot(l => ({ ...l, lignes: e.target.value }))} rows={7}
                  placeholder={'Un joueur par ligne, numéro facultatif :\n1 Jean Efala\n9 Mathew Williams\nRaphaël Yapendé'}
                  style={{ ...CHAMP, resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit' }} />
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select value={lot.poste} onChange={e => setLot(l => ({ ...l, poste: e.target.value }))} style={{ ...CHAMP, width: '200px', cursor: 'pointer' }}>
                    <option value="">Poste : non précisé</option>
                    {POSTES.map(p => <option key={p} value={p}>Poste : {p}</option>)}
                  </select>
                  <input value={lot.nationalite} onChange={e => setLot(l => ({ ...l, nationalite: e.target.value }))}
                    placeholder="Nationalité" aria-label="Nationalité de toute la liste" style={{ ...CHAMP, width: '150px' }} />
                  <span style={{ flex: 1, fontSize: '12px', color: CLAIR.doux }}>Le premier mot est le prénom, le reste le nom. Les joueurs déjà présents sont ignorés.</span>
                  <button disabled={envoi || !lot.lignes.trim()}
                    onClick={() => executer(() => adminService.joueurs.ajouterLot(equipeId, lot.lignes, lot.poste || null, lot.nationalite.trim() || null),
                      r => `${r.ajoutes} joueur(s) ajouté(s)${r.ignores?.length ? ` · ${r.ignores.length} ligne(s) ignorée(s) : ${r.ignores.join(', ')}` : ''}.`)
                      .then(ok => { if (ok) setLot(l => ({ ...l, lignes: '' })); })}
                    style={{ ...BOUTON(CLAIR.vert, '#fff'), opacity: envoi || !lot.lignes.trim() ? 0.5 : 1 }}>
                    <ListPlus size={14} /> Ajouter la liste
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Effectif */}
      {equipe && (
        !joueurs ? (
          <p style={{ color: CLAIR.doux }}>Chargement…</p>
        ) : actifs.length === 0 ? (
          <div style={{ ...CARTE, padding: '30px 20px', textAlign: 'center', color: CLAIR.doux, fontSize: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <span>Aucun joueur dans l'effectif de {equipe.nom} pour l'instant.</span>
            <span style={{ fontSize: '13px' }}>Tant que l'effectif est vide ici, la fiche du club affiche celui de l'API-Football (s'il existe). Importe-le pour pouvoir le corriger :</span>
            {boutonImport(true)}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: CLAIR.texte }}>{actifs.length} joueur{actifs.length > 1 ? 's' : ''} dans l'effectif</span>
                {boutonImport(false)}
              </span>
              {numerosEnDouble.length > 0 && (
                <span style={{ fontSize: '12px', fontWeight: 700, color: CLAIR.orange }}>
                  <AlertTriangle size={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> Numéro porté deux fois : {numerosEnDouble.join(', ')}
                </span>
              )}
            </div>
            {groupes.map(g => (
              <div key={g.poste ?? 'aucun'} style={CARTE}>
                <div style={{ padding: '10px 18px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: CLAIR.vert, backgroundColor: CLAIR.vertClair }}>
                  {g.poste ? LIBELLE_GROUPE[g.poste] : 'Poste non précisé'} · {g.liste.length}
                </div>
                {g.liste.map(ligne)}
              </div>
            ))}
          </>
        )
      )}

      {/* Anciens joueurs */}
      {anciens.length > 0 && (
        <div style={CARTE}>
          <button onClick={() => setVoirAnciens(v => !v)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 700, color: CLAIR.doux }}>
            Anciens joueurs · {anciens.length}
            <ChevronDown size={16} style={{ transform: voirAnciens ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
          </button>
          {voirAnciens && anciens.map(ligne)}
        </div>
      )}
    </div>
  );
}