// f237-frontend/src/pages/admin/AdminEquipesPage.jsx
// Équipes : logo (téléversement ou retour au logo de l'API) et couleurs du maillot
// (utilisées par les avatars des joueurs). À gauche la liste, à droite l'équipe choisie.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Upload, RotateCcw, Check, AlertTriangle, CheckCircle2, ImageOff, Palette } from 'lucide-react';
import { adminService, dateApi } from '../../services/adminService';
import { couleursParDefaut, chargerCouleursClubs } from '../../data/couleursClubs';
import AvatarJoueur from '../../components/AvatarJoueur';
import { locale } from '../../i18n';
import { CLAIR, CARTE, TITRE_CARTE } from './styleAdmin';

const CHARGE_LE = Date.now();
const RECENT = 200 * 24 * 3600 * 1000; // équipe "active" = un match dans les ~6 derniers mois
const DIVISIONS = { 0: 'Elite One', 1: 'Elite Two' };
const FILTRES = [
  { cle: 'actives', label: 'Saison en cours' },
  { cle: 'sansLogo', label: 'Sans logo' },
  { cle: 'doublons', label: 'Doublons' },
  { cle: 'toutes', label: 'Toutes' },
];
const TYPES_IMAGE = ['image/png', 'image/jpeg', 'image/webp'];
const TAILLE_MAX = 2 * 1024 * 1024;

const normaliser = (s) => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/\b(fc|sc|as|club|de|du|la|le)\b/g, '').replace(/[^a-z0-9]/g, '');
const recente = (e) => e.dernierMatch && dateApi(e.dernierMatch).getTime() > CHARGE_LE - RECENT;

const BOUTON = (fond, couleur) => ({
  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '999px', border: 'none',
  cursor: 'pointer', fontSize: '13px', fontWeight: 700, backgroundColor: fond, color: couleur,
});

function Logo({ url, taille }) {
  const [ko, setKo] = useState(false);
  if (!url || ko) {
    return (
      <span style={{ width: taille, height: taille, borderRadius: '50%', backgroundColor: CLAIR.tuile, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <ImageOff size={taille * 0.45} color="#a3aaa6" />
      </span>
    );
  }
  return <img src={url} alt="" onError={() => setKo(true)} style={{ width: taille, height: taille, objectFit: 'contain', flexShrink: 0 }} />;
}

function Pastille({ children, couleur, fond }) {
  return <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.3px', textTransform: 'uppercase', color: couleur, backgroundColor: fond, padding: '3px 7px', borderRadius: '999px', whiteSpace: 'nowrap' }}>{children}</span>;
}

// ── Panneau d'édition d'une équipe ──────────────────────────────────────
function EditeurEquipe({ e, doublons, onMaj }) {
  const defaut = couleursParDefaut(e.nom);
  const [principale, setPrincipale] = useState(e.couleurPrincipale ?? defaut.principale);
  const [secondaire, setSecondaire] = useState(e.couleurSecondaire ?? defaut.secondaire);
  const [fichier, setFichier] = useState(null);       // { file, apercu }
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState(null);
  const champFichier = useRef(null);

  // Libère l'aperçu local de l'image choisie
  useEffect(() => () => { if (fichier?.apercu) URL.revokeObjectURL(fichier.apercu); }, [fichier]);

  const couleursValides = /^#[0-9a-f]{6}$/i.test(principale) && /^#[0-9a-f]{6}$/i.test(secondaire);
  const couleursChangees = principale.toLowerCase() !== (e.couleurPrincipale ?? defaut.principale)
    || secondaire.toLowerCase() !== (e.couleurSecondaire ?? defaut.secondaire);

  const executer = async (appel, texteOk, apres) => {
    setEnvoi(true);
    setMessage(null);
    try {
      const r = await appel();
      onMaj({ ...e, ...r });
      apres?.();
      setMessage({ type: 'ok', texte: texteOk });
    } catch (err) {
      setMessage({ type: 'erreur', texte: err.message });
    } finally {
      setEnvoi(false);
    }
  };

  const choisir = (ev) => {
    const f = ev.target.files?.[0];
    ev.target.value = '';
    if (!f) return;
    if (!TYPES_IMAGE.includes(f.type)) { setMessage({ type: 'erreur', texte: 'Format non accepté : PNG, JPG ou WebP.' }); return; }
    if (f.size > TAILLE_MAX) { setMessage({ type: 'erreur', texte: 'Image trop lourde (2 Mo maximum).' }); return; }
    setMessage(null);
    setFichier({ file: f, apercu: URL.createObjectURL(f) });
  };

  const champCouleur = (valeur, setValeur, label) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <input type="color" value={/^#[0-9a-f]{6}$/i.test(valeur) ? valeur : '#000000'} onChange={ev => setValeur(ev.target.value)}
        style={{ width: '42px', height: '42px', padding: 0, border: `1px solid ${CLAIR.bord}`, borderRadius: '10px', cursor: 'pointer', background: 'none' }} />
      <span style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
        <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.4px', textTransform: 'uppercase', color: CLAIR.doux }}>{label}</span>
        <input value={valeur} onChange={ev => setValeur(ev.target.value.trim())} maxLength={7}
          style={{ width: '100%', boxSizing: 'border-box', padding: '7px 10px', borderRadius: '8px', border: `1px solid ${/^#[0-9a-f]{6}$/i.test(valeur) ? CLAIR.bord : CLAIR.rouge}`, fontSize: '14px', fontFamily: 'monospace', color: CLAIR.texte }} />
      </span>
    </label>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* En-tête */}
      <div style={{ ...CARTE, padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Logo url={e.logoUrl} taille={56} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '18px', fontWeight: 800, color: CLAIR.texte }}>{e.nom}</div>
          <div style={{ fontSize: '12px', color: CLAIR.doux }}>
            {DIVISIONS[e.division] ?? `Division ${e.division}`} · {e.nbMatchs} match{e.nbMatchs > 1 ? 's' : ''}
            {e.dernierMatch && ` · dernier le ${dateApi(e.dernierMatch).toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' })}`}
            {' '}· Id {e.id}
          </div>
        </div>
      </div>

      {doublons.length > 0 && (
        <div style={{ padding: '11px 14px', borderRadius: '10px', backgroundColor: CLAIR.orangeClair, color: CLAIR.orange, fontSize: '13px', fontWeight: 600, display: 'flex', gap: '8px' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>Doublon possible : {doublons.map(d => `${d.nom} (Id ${d.id}, ${d.nbMatchs} matchs)`).join(', ')}. Fusionner deux équipes déplace leurs matchs : on le fera en SQL, ensemble.</span>
        </div>
      )}

      {message && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, backgroundColor: message.type === 'ok' ? CLAIR.vertClair : CLAIR.rougeClair, color: message.type === 'ok' ? CLAIR.vert : CLAIR.rouge }}>
          {message.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />} {message.texte}
        </div>
      )}

      {/* Logo */}
      <div style={CARTE}>
        <div style={TITRE_CARTE}>
          Logo
          {e.logoManuel && <Pastille couleur={CLAIR.vert} fond={CLAIR.vertClair}>Personnalisé</Pastille>}
        </div>
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px', padding: '18px', borderRadius: '12px', background: 'repeating-conic-gradient(#f2f4f3 0% 25%, #ffffff 0% 50%) 50% / 18px 18px' }}>
            <Logo key={e.logoUrl} url={e.logoUrl} taille={96} />
            {fichier && (
              <>
                <span style={{ fontSize: '20px', color: CLAIR.doux }}>→</span>
                <img src={fichier.apercu} alt="" style={{ width: 96, height: 96, objectFit: 'contain' }} />
              </>
            )}
          </div>
          <input ref={champFichier} type="file" accept="image/png,image/jpeg,image/webp" onChange={choisir} style={{ display: 'none' }} />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {fichier ? (
              <>
                <button disabled={envoi} onClick={() => executer(() => adminService.equipes.televerserLogo(e.id, fichier.file), 'Logo mis à jour sur tout le site.', () => setFichier(null))}
                  style={{ ...BOUTON(CLAIR.vert, '#fff'), opacity: envoi ? 0.6 : 1 }}>
                  <Upload size={14} /> {envoi ? 'Envoi…' : 'Utiliser ce logo'}
                </button>
                <button onClick={() => setFichier(null)} style={BOUTON('transparent', CLAIR.doux)}>Annuler</button>
              </>
            ) : (
              <button onClick={() => champFichier.current?.click()} style={{ ...BOUTON(CLAIR.carte, CLAIR.vert), boxShadow: `inset 0 0 0 1px ${CLAIR.bord}` }}>
                <Upload size={14} /> Choisir une image
              </button>
            )}
            {e.logoManuel && !fichier && (
              <button disabled={envoi} onClick={() => executer(() => adminService.equipes.retablirLogo(e.id), 'Retour au logo de l\'API.')} style={BOUTON('transparent', CLAIR.doux)}>
                <RotateCcw size={14} /> Revenir au logo de l'API
              </button>
            )}
          </div>
          <span style={{ fontSize: '12px', color: CLAIR.doux }}>PNG (fond transparent de préférence), JPG ou WebP · 2 Mo max. Les imports ne remplacent jamais un logo personnalisé.</span>
        </div>
      </div>

      {/* Couleurs */}
      <div style={CARTE}>
        <div style={TITRE_CARTE}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Palette size={17} color={CLAIR.vert} /> Couleurs du maillot</span>
          {e.couleurPrincipale
            ? <Pastille couleur={CLAIR.vert} fond={CLAIR.vertClair}>Personnalisées</Pastille>
            : <Pastille couleur={CLAIR.doux} fond={CLAIR.tuile}>Par défaut</Pastille>}
        </div>
        <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 150px', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {champCouleur(principale, setPrincipale, 'Principale (maillot)')}
            {champCouleur(secondaire, setSecondaire, 'Secondaire (col, épaules)')}
          </div>
          {/* Aperçu de l'avatar avec les couleurs choisies */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '120px', height: '130px', borderRadius: '12px', background: 'linear-gradient(160deg, #1a5c38, #0f3a25)', overflow: 'hidden' }}>
              {couleursValides && <AvatarJoueur club={e.nom} nom="M. Williams" numero={9} variante="buste" couleurs={{ principale, secondaire }} />}
            </div>
            {couleursValides && <AvatarJoueur club={e.nom} nom="M. Williams" taille={40} couleurs={{ principale, secondaire }} />}
          </div>
        </div>
        <div style={{ padding: '0 18px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button disabled={envoi || !couleursValides || !couleursChangees}
            onClick={() => executer(() => adminService.equipes.couleurs(e.id, principale, secondaire), 'Couleurs enregistrées.', () => chargerCouleursClubs(true))}
            style={{ ...BOUTON(CLAIR.vert, '#fff'), opacity: envoi || !couleursValides || !couleursChangees ? 0.5 : 1 }}>
            <Check size={14} /> Enregistrer les couleurs
          </button>
          {e.couleurPrincipale && (
            <button disabled={envoi}
              onClick={() => executer(() => adminService.equipes.couleurs(e.id, null, null), 'Retour aux couleurs par défaut.', () => { setPrincipale(defaut.principale); setSecondaire(defaut.secondaire); chargerCouleursClubs(true); })}
              style={BOUTON('transparent', CLAIR.doux)}>
              <RotateCcw size={14} /> Couleurs par défaut
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────
export default function AdminEquipesPage() {
  const [equipes, setEquipes] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [filtre, setFiltre] = useState('actives');
  const [recherche, setRecherche] = useState('');
  const [choisie, setChoisie] = useState(null); // id

  useEffect(() => {
    let ignore = false;
    adminService.equipes.liste()
      .then(l => { if (!ignore) setEquipes(l); })
      .catch(e => { if (!ignore) setErreur(e.message); });
    return () => { ignore = true; };
  }, []);

  // Équipes au nom (presque) identique
  const groupesDoublons = useMemo(() => {
    const map = new Map();
    for (const e of equipes ?? []) {
      const cle = normaliser(e.nom);
      if (!map.has(cle)) map.set(cle, []);
      map.get(cle).push(e);
    }
    return map;
  }, [equipes]);
  const doublonsDe = (e) => (groupesDoublons.get(normaliser(e.nom)) ?? []).filter(x => x.id !== e.id);

  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return (equipes ?? [])
      .filter(e => {
        if (filtre === 'actives') return recente(e);
        if (filtre === 'sansLogo') return !e.logoUrl;
        if (filtre === 'doublons') return (groupesDoublons.get(normaliser(e.nom))?.length ?? 0) > 1;
        return true;
      })
      .filter(e => !q || e.nom.toLowerCase().includes(q))
      .sort((a, b) => (a.division - b.division) || a.nom.localeCompare(b.nom, 'fr'));
  }, [equipes, filtre, recherche, groupesDoublons]);

  const equipeChoisie = equipes?.find(e => e.id === choisie) ?? null;
  const maj = (nouvelle) => setEquipes(l => l.map(e => (e.id === nouvelle.id ? { ...e, ...nouvelle } : e)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 800, color: CLAIR.texte }}>Équipes</h2>

      {erreur && <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: CLAIR.rougeClair, color: CLAIR.rouge, fontSize: '14px', fontWeight: 600 }}>{erreur}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '20px', alignItems: 'start' }}>
        {/* Liste */}
        <div style={CARTE}>
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: `1px solid ${CLAIR.bord}` }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '4px', borderRadius: '12px', backgroundColor: CLAIR.tuile }}>
              {FILTRES.map(f => (
                <button key={f.cle} onClick={() => setFiltre(f.cle)}
                  style={{ padding: '6px 11px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, backgroundColor: filtre === f.cle ? CLAIR.carte : 'transparent', color: filtre === f.cle ? CLAIR.texte : CLAIR.doux, boxShadow: filtre === f.cle ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                  {f.label}
                </button>
              ))}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '999px', border: `1px solid ${CLAIR.bord}` }}>
              <Search size={15} color={CLAIR.doux} />
              <input value={recherche} onChange={ev => setRecherche(ev.target.value)} placeholder="Chercher une équipe"
                style={{ border: 'none', outline: 'none', fontSize: '14px', flex: 1, background: 'transparent', color: CLAIR.texte }} />
            </label>
          </div>
          {!equipes && !erreur ? (
            <p style={{ padding: '24px', textAlign: 'center', color: CLAIR.doux, fontSize: '14px' }}>Chargement…</p>
          ) : visibles.length === 0 ? (
            <p style={{ padding: '24px', textAlign: 'center', color: CLAIR.doux, fontSize: '14px' }}>Aucune équipe.</p>
          ) : visibles.map((e, i) => {
            const actif = e.id === choisie;
            const prec = visibles[i - 1];
            return (
              <div key={e.id}>
                {(!prec || prec.division !== e.division) && (
                  <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: CLAIR.vert, backgroundColor: CLAIR.vertClair }}>
                    {DIVISIONS[e.division] ?? `Division ${e.division}`}
                  </div>
                )}
                <button onClick={() => setChoisie(e.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', border: 'none', borderTop: `1px solid ${CLAIR.bord}`, cursor: 'pointer', textAlign: 'left', backgroundColor: actif ? '#eef6f1' : 'transparent', boxShadow: actif ? `inset 3px 0 0 ${CLAIR.vert}` : 'none' }}>
                  <Logo url={e.logoUrl} taille={30} />
                  <span style={{ flex: 1, minWidth: 0, fontSize: '14px', fontWeight: 700, color: CLAIR.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.nom}</span>
                  {/* Pastille des couleurs du maillot */}
                  {(() => {
                    const c = e.couleurPrincipale ? { principale: e.couleurPrincipale, secondaire: e.couleurSecondaire } : couleursParDefaut(e.nom);
                    return <span title={e.couleurPrincipale ? 'Couleurs personnalisées' : 'Couleurs par défaut'} style={{ width: '18px', height: '18px', borderRadius: '50%', background: `linear-gradient(135deg, ${c.principale} 50%, ${c.secondaire} 50%)`, border: `1px solid ${CLAIR.bord}`, opacity: e.couleurPrincipale ? 1 : 0.45, flexShrink: 0 }} />;
                  })()}
                  {!e.logoUrl && <Pastille couleur={CLAIR.rouge} fond={CLAIR.rougeClair}>sans logo</Pastille>}
                  {doublonsDe(e).length > 0 && <Pastille couleur={CLAIR.orange} fond={CLAIR.orangeClair}>doublon ?</Pastille>}
                </button>
              </div>
            );
          })}
        </div>

        {/* Édition */}
        <div style={{ position: 'sticky', top: '90px' }}>
          {equipeChoisie ? (
            <EditeurEquipe key={equipeChoisie.id} e={equipeChoisie} doublons={doublonsDe(equipeChoisie)} onMaj={maj} />
          ) : (
            <div style={{ ...CARTE, padding: '30px 20px', textAlign: 'center', color: CLAIR.doux, fontSize: '14px' }}>
              Choisis une équipe dans la liste pour modifier son logo ou ses couleurs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}