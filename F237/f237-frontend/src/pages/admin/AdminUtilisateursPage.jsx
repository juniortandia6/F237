// f237-frontend/src/pages/admin/AdminUtilisateursPage.jsx
// Comptes du site : recherche, activation / désactivation, rôle Admin,
// ajustement des points (avec motif, tracé dans Transactions), historique.
// L'admin connecté ne peut ni se désactiver ni changer son propre rôle.

import { useEffect, useMemo, useState } from 'react';
import { Search, ShieldCheck, Ban, CheckCircle2, AlertTriangle, Trophy, Plus, Minus, UserCheck } from 'lucide-react';
import { adminService, dateApi } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import { locale } from '../../i18n';
import { CLAIR, CARTE, TITRE_CARTE, CHIFFRES } from './styleAdmin';

const FILTRES = [
  { cle: 'tous', label: 'Tous' },
  { cle: 'actifs', label: 'Actifs' },
  { cle: 'desactives', label: 'Désactivés' },
  { cle: 'admins', label: 'Admins' },
];
const BOUTON = (fond, couleur) => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 14px', borderRadius: '999px', border: 'none',
  cursor: 'pointer', fontSize: '13px', fontWeight: 700, backgroundColor: fond, color: couleur, whiteSpace: 'nowrap',
});
const CHAMP = {
  boxSizing: 'border-box', width: '100%', padding: '9px 11px', borderRadius: '9px', border: `1px solid ${CLAIR.bord}`,
  fontSize: '14px', color: CLAIR.texte, backgroundColor: '#fff', outline: 'none', fontFamily: 'inherit',
};

const dateCourte = (d) => dateApi(d)?.toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' }) ?? '–';
const dateHeure = (d) => dateApi(d)?.toLocaleString(locale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) ?? '–';
const points = (n) => (n ?? 0).toLocaleString(locale());

function Initiales({ u, taille = 38 }) {
  const txt = `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase() || '?';
  return (
    <span style={{ width: taille, height: taille, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: taille * 0.38, fontWeight: 800, color: '#fff', backgroundColor: u.estActif ? CLAIR.vert : '#a3aaa6' }}>
      {txt}
    </span>
  );
}

function Pastille({ children, couleur, fond }) {
  return <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.3px', textTransform: 'uppercase', color: couleur, backgroundColor: fond, padding: '3px 7px', borderRadius: '999px', whiteSpace: 'nowrap' }}>{children}</span>;
}

// ── Panneau d'un utilisateur ────────────────────────────────────────────
function DetailUtilisateur({ id, moi, onMaj }) {
  const [detail, setDetail] = useState(null);
  const [version, setVersion] = useState(0);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState(null);
  const [ajustement, setAjustement] = useState({ sens: 1, montant: '', motif: '' });
  const [confirmer, setConfirmer] = useState(null); // 'desactiver' | 'admin' | 'retirerAdmin'

  useEffect(() => {
    let ignore = false;
    adminService.utilisateurs.get(id)
      .then(d => { if (!ignore) setDetail(d); })
      .catch(e => { if (!ignore) setMessage({ type: 'erreur', texte: e.message }); });
    return () => { ignore = true; };
  }, [id, version]);

  const executer = async (appel, texteOk) => {
    setEnvoi(true);
    setMessage(null);
    try {
      const r = await appel();
      onMaj({ id, ...r });
      setMessage({ type: 'ok', texte: texteOk });
      setConfirmer(null);
      setVersion(v => v + 1);
      return true;
    } catch (e) {
      setMessage({ type: 'erreur', texte: e.message });
      return false;
    } finally {
      setEnvoi(false);
    }
  };

  if (!detail) {
    return <div style={{ ...CARTE, padding: '30px', textAlign: 'center', color: message ? CLAIR.rouge : CLAIR.doux, fontSize: '14px' }}>{message?.texte ?? 'Chargement…'}</div>;
  }
  const u = detail;
  const estMoi = u.id === moi;
  const admin = u.role === 'Admin';
  const montant = Number(ajustement.montant);
  const ajustementValide = Number.isInteger(montant) && montant > 0 && montant <= 100000 && ajustement.motif.trim().length >= 3;
  const taux = u.nbParis ? Math.round((u.nbParisGagnes / u.nbParis) * 100) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* En-tête */}
      <div style={{ ...CARTE, padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Initiales u={u} taille={52} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: CLAIR.texte }}>{u.prenom} {u.nom}</span>
            {estMoi && <Pastille couleur={CLAIR.vert} fond={CLAIR.vertClair}>Toi</Pastille>}
            {admin && <Pastille couleur="#7a5c00" fond="#fff6cc">Admin</Pastille>}
            {!u.estActif && <Pastille couleur={CLAIR.rouge} fond={CLAIR.rougeClair}>Désactivé</Pastille>}
          </div>
          <div style={{ fontSize: '13px', color: CLAIR.doux, overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
          <div style={{ fontSize: '12px', color: CLAIR.doux }}>Inscrit le {dateCourte(u.dateInscription)} · Id {u.id}</div>
        </div>
      </div>

      {/* Chiffres */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
        {[
          { valeur: points(u.soldePoints), label: 'Points' },
          { valeur: u.nbParis, label: 'Paris' },
          { valeur: taux == null ? '–' : `${taux} %`, label: 'Réussite' },
        ].map(c => (
          <div key={c.label} style={{ ...CARTE, padding: '12px 14px' }}>
            <div style={{ fontFamily: CHIFFRES, fontSize: '24px', fontWeight: 800, color: CLAIR.texte, lineHeight: 1 }}>{c.valeur}</div>
            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.4px', textTransform: 'uppercase', color: CLAIR.doux, marginTop: '4px' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {message && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, backgroundColor: message.type === 'ok' ? CLAIR.vertClair : CLAIR.rougeClair, color: message.type === 'ok' ? CLAIR.vert : CLAIR.rouge }}>
          {message.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />} {message.texte}
        </div>
      )}

      {/* Compte : activation et rôle */}
      <div style={CARTE}>
        <div style={TITRE_CARTE}>Compte</div>
        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {estMoi ? (
            <p style={{ fontSize: '13px', color: CLAIR.doux, margin: 0 }}>C'est ton compte : tu ne peux ni le désactiver ni changer ton rôle (tu perdrais l'accès à l'admin).</p>
          ) : confirmer ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '10px 12px', borderRadius: '10px', backgroundColor: confirmer === 'desactiver' ? CLAIR.rougeClair : CLAIR.orangeClair }}>
              <span style={{ flex: 1, fontSize: '13px', fontWeight: 700, color: confirmer === 'desactiver' ? CLAIR.rouge : CLAIR.orange }}>
                {confirmer === 'desactiver' && `Désactiver le compte de ${u.prenom} ? Il ne pourra plus se connecter.`}
                {confirmer === 'admin' && `Donner le rôle Admin à ${u.prenom} ? Il aura accès à tout l'espace admin.`}
                {confirmer === 'retirerAdmin' && `Retirer le rôle Admin à ${u.prenom} ?`}
              </span>
              <button onClick={() => setConfirmer(null)} style={BOUTON('transparent', CLAIR.doux)}>Annuler</button>
              <button disabled={envoi}
                onClick={() => (confirmer === 'desactiver'
                  ? executer(() => adminService.utilisateurs.activer(u.id, false), 'Compte désactivé.')
                  : executer(() => adminService.utilisateurs.role(u.id, confirmer === 'admin' ? 'Admin' : 'Utilisateur'),
                    confirmer === 'admin' ? 'Rôle Admin donné (actif à sa prochaine connexion).' : 'Rôle Admin retiré (effectif à sa prochaine connexion).'))}
                style={BOUTON(confirmer === 'desactiver' ? CLAIR.rouge : CLAIR.orange, '#fff')}>
                Confirmer
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {u.estActif ? (
                <button onClick={() => setConfirmer('desactiver')} style={{ ...BOUTON(CLAIR.carte, CLAIR.rouge), boxShadow: `inset 0 0 0 1px ${CLAIR.bord}` }}>
                  <Ban size={14} /> Désactiver le compte
                </button>
              ) : (
                <button disabled={envoi} onClick={() => executer(() => adminService.utilisateurs.activer(u.id, true), 'Compte réactivé.')} style={BOUTON(CLAIR.vert, '#fff')}>
                  <UserCheck size={14} /> Réactiver le compte
                </button>
              )}
              <button onClick={() => setConfirmer(admin ? 'retirerAdmin' : 'admin')} style={{ ...BOUTON(CLAIR.carte, CLAIR.texte), boxShadow: `inset 0 0 0 1px ${CLAIR.bord}` }}>
                <ShieldCheck size={14} /> {admin ? 'Retirer le rôle Admin' : 'Donner le rôle Admin'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ajustement des points */}
      <div style={CARTE}>
        <div style={TITRE_CARTE}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Trophy size={17} color={CLAIR.vert} /> Ajuster les points</span>
        </div>
        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ display: 'inline-flex', padding: '3px', borderRadius: '999px', backgroundColor: CLAIR.tuile, flexShrink: 0 }}>
              {[{ sens: 1, Icone: Plus, label: 'Ajouter' }, { sens: -1, Icone: Minus, label: 'Retirer' }].map(({ sens, Icone, label }) => (
                <button key={sens} onClick={() => setAjustement(a => ({ ...a, sens }))} title={label} aria-label={label}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 11px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, backgroundColor: ajustement.sens === sens ? (sens > 0 ? CLAIR.vert : CLAIR.rouge) : 'transparent', color: ajustement.sens === sens ? '#fff' : CLAIR.doux }}>
                  <Icone size={13} /> {label}
                </button>
              ))}
            </div>
            <input type="number" min={1} max={100000} value={ajustement.montant} onChange={e => setAjustement(a => ({ ...a, montant: e.target.value }))}
              placeholder="Points" aria-label="Nombre de points" style={{ ...CHAMP, fontFamily: CHIFFRES, fontSize: '18px', fontWeight: 800 }} />
          </div>
          <input value={ajustement.motif} onChange={e => setAjustement(a => ({ ...a, motif: e.target.value }))} maxLength={200}
            placeholder="Motif (obligatoire) : ex. compensation match annulé" aria-label="Motif" style={CHAMP} />
          <button disabled={envoi || !ajustementValide}
            onClick={() => executer(() => adminService.utilisateurs.points(u.id, ajustement.sens * montant, ajustement.motif.trim()),
              `${ajustement.sens > 0 ? '+' : '−'}${points(montant)} points pour ${u.prenom}.`)
              .then(ok => { if (ok) setAjustement({ sens: 1, montant: '', motif: '' }); })}
            style={{ ...BOUTON(ajustement.sens > 0 ? CLAIR.vert : CLAIR.rouge, '#fff'), opacity: envoi || !ajustementValide ? 0.5 : 1, alignSelf: 'flex-start' }}>
            {ajustement.sens > 0 ? <Plus size={14} /> : <Minus size={14} />}
            {ajustement.sens > 0 ? 'Ajouter' : 'Retirer'} {ajustementValide ? `${points(montant)} points` : 'des points'}
          </button>
          <span style={{ fontSize: '12px', color: CLAIR.doux }}>Chaque ajustement est enregistré dans l'historique ci-dessous, avec son motif.</span>
        </div>
      </div>

      {/* Historique */}
      <div style={CARTE}>
        <div style={TITRE_CARTE}>Dernières transactions</div>
        {u.transactions?.length ? u.transactions.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 18px', borderTop: i ? `1px solid ${CLAIR.bord}` : 'none' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: CLAIR.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description || t.type}</div>
              <div style={{ fontSize: '11px', color: CLAIR.doux }}>{t.type} · {dateHeure(t.dateTransaction)}</div>
            </div>
            <span style={{ fontFamily: CHIFFRES, fontSize: '17px', fontWeight: 800, color: t.montant >= 0 ? CLAIR.vert : CLAIR.rouge }}>
              {t.montant >= 0 ? '+' : ''}{points(t.montant)}
            </span>
          </div>
        )) : <p style={{ padding: '18px', fontSize: '13px', color: CLAIR.doux, margin: 0 }}>Aucune transaction.</p>}
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────
export default function AdminUtilisateursPage() {
  const { user } = useAuth();
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [filtre, setFiltre] = useState('tous');
  const [recherche, setRecherche] = useState('');
  const [choisi, setChoisi] = useState(null);

  useEffect(() => {
    let ignore = false;
    adminService.utilisateurs.liste()
      .then(l => { if (!ignore) setListe(l); })
      .catch(e => { if (!ignore) setErreur(e.message); });
    return () => { ignore = true; };
  }, []);

  // Mon id, retrouvé par l'e-mail du compte connecté
  const moi = liste?.find(u => u.email?.toLowerCase() === user?.email?.toLowerCase())?.id ?? null;

  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return (liste ?? [])
      .filter(u => filtre === 'tous' || (filtre === 'actifs' ? u.estActif : filtre === 'desactives' ? !u.estActif : u.role === 'Admin'))
      .filter(u => !q || `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(q));
  }, [liste, filtre, recherche]);

  const compte = (cle) => (liste ?? []).filter(u => cle === 'tous' || (cle === 'actifs' ? u.estActif : cle === 'desactives' ? !u.estActif : u.role === 'Admin')).length;
  const maj = (r) => setListe(l => l.map(u => (u.id === r.id ? { ...u, ...r } : u)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 800, color: CLAIR.texte }}>Utilisateurs</h2>

      {erreur && <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: CLAIR.rougeClair, color: CLAIR.rouge, fontSize: '14px', fontWeight: 600 }}>{erreur}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '20px', alignItems: 'start' }}>
        {/* Liste */}
        <div style={CARTE}>
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: `1px solid ${CLAIR.bord}` }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '4px', borderRadius: '12px', backgroundColor: CLAIR.tuile }}>
              {FILTRES.map(f => (
                <button key={f.cle} onClick={() => setFiltre(f.cle)}
                  style={{ padding: '6px 11px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, backgroundColor: filtre === f.cle ? CLAIR.carte : 'transparent', color: filtre === f.cle ? CLAIR.texte : CLAIR.doux, boxShadow: filtre === f.cle ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                  {f.label} <span style={{ color: CLAIR.doux, fontWeight: 600 }}>{liste ? compte(f.cle) : ''}</span>
                </button>
              ))}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '999px', border: `1px solid ${CLAIR.bord}` }}>
              <Search size={15} color={CLAIR.doux} />
              <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Nom ou e-mail"
                style={{ border: 'none', outline: 'none', fontSize: '14px', flex: 1, background: 'transparent', color: CLAIR.texte }} />
            </label>
          </div>
          {!liste && !erreur ? (
            <p style={{ padding: '24px', textAlign: 'center', color: CLAIR.doux, fontSize: '14px' }}>Chargement…</p>
          ) : visibles.length === 0 ? (
            <p style={{ padding: '24px', textAlign: 'center', color: CLAIR.doux, fontSize: '14px' }}>Aucun utilisateur.</p>
          ) : visibles.map(u => {
            const actif = u.id === choisi;
            return (
              <button key={u.id} onClick={() => setChoisi(u.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', border: 'none', borderTop: `1px solid ${CLAIR.bord}`, cursor: 'pointer', textAlign: 'left', backgroundColor: actif ? '#eef6f1' : 'transparent', boxShadow: actif ? `inset 3px 0 0 ${CLAIR.vert}` : 'none', opacity: u.estActif ? 1 : 0.65 }}>
                <Initiales u={u} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: CLAIR.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.prenom} {u.nom}</span>
                    {u.id === moi && <Pastille couleur={CLAIR.vert} fond={CLAIR.vertClair}>Toi</Pastille>}
                    {u.role === 'Admin' && <Pastille couleur="#7a5c00" fond="#fff6cc">Admin</Pastille>}
                    {!u.estActif && <Pastille couleur={CLAIR.rouge} fond={CLAIR.rougeClair}>Désactivé</Pastille>}
                  </span>
                  <span style={{ display: 'block', fontSize: '12px', color: CLAIR.doux, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email} · inscrit le {dateCourte(u.dateInscription)}</span>
                </span>
                <span style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ display: 'block', fontFamily: CHIFFRES, fontSize: '17px', fontWeight: 800, color: CLAIR.texte }}>{points(u.soldePoints)}</span>
                  <span style={{ display: 'block', fontSize: '11px', color: CLAIR.doux }}>{u.nbParis} pari{u.nbParis > 1 ? 's' : ''}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Détail */}
        <div style={{ position: 'sticky', top: '90px' }}>
          {choisi ? (
            <DetailUtilisateur key={choisi} id={choisi} moi={moi} onMaj={maj} />
          ) : (
            <div style={{ ...CARTE, padding: '30px 20px', textAlign: 'center', color: CLAIR.doux, fontSize: '14px' }}>
              Choisis un utilisateur pour voir son détail.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}