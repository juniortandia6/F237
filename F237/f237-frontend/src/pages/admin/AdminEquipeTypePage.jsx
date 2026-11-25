// f237-frontend/src/pages/admin/AdminEquipeTypePage.jsx
// Générateur du visuel « Équipe type de la journée » (remplace outils/equipe-type.html) :
// - choix de la compétition, de la journée, du système de jeu et de la source ;
// - 11 joueurs : club (liste des équipes) + nom (proposé depuis l'effectif du club) ;
// - aperçu en direct, puis téléchargement du PNG (2400 × 1350) ou copie dans le presse-papiers.
// Les maillots prennent les couleurs des clubs (admin → Équipes). Aucune photo de joueur.
// Le brouillon est gardé dans ce navigateur pour ne rien perdre en changeant de page.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Copy, RotateCcw, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { adminService, nomJoueur } from '../../services/adminService';
import { couleursClub, useCouleursClubs } from '../../data/couleursClubs';
import { CLAIR, CARTE, TITRE_CARTE } from './styleAdmin';
import { FORMATIONS, libellesLignes, dessinerEquipeType, chargerPolices, LARGEUR, HAUTEUR } from './visuelEquipeType';

const CLE_BROUILLON = 'f237_equipe_type_brouillon';
const COMPETITIONS = [
  { valeur: 'MTN Elite One', division: 0 },
  { valeur: 'MTN Elite Two', division: 1 },
];
const SOURCE_DEFAUT = 'Sélection officielle publiée par MTN Elite One';

const CHAMP = {
  boxSizing: 'border-box', width: '100%', padding: '9px 10px', borderRadius: '9px', border: `1px solid ${CLAIR.bord}`,
  fontSize: '14px', color: CLAIR.texte, backgroundColor: '#fff', outline: 'none', fontFamily: 'inherit',
};
const BOUTON = (fond, couleur) => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 16px', borderRadius: '999px', border: 'none',
  cursor: 'pointer', fontSize: '13px', fontWeight: 700, backgroundColor: fond, color: couleur, whiteSpace: 'nowrap',
});
const ETIQUETTE = { display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', fontWeight: 700, color: CLAIR.doux };

const videJoueurs = () => Array.from({ length: 11 }, () => ({ nom: '', equipeId: '' }));
const brouillonVide = () => ({ competition: 'MTN Elite One', journee: '', source: SOURCE_DEFAUT, formation: '4-3-3', joueurs: videJoueurs() });

function lireBrouillon() {
  try {
    const b = JSON.parse(localStorage.getItem(CLE_BROUILLON) ?? 'null');
    if (b && Array.isArray(b.joueurs) && b.joueurs.length === 11 && FORMATIONS[b.formation]) return { ...brouillonVide(), ...b };
  } catch { /* stockage indisponible ou brouillon abîmé : on repart de zéro */ }
  return brouillonVide();
}

/** "Journée 8" -> "equipe-type-journee-8.png" */
function nomFichier(journee) {
  const slug = (journee || 'journee').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `equipe-type-${slug || 'journee'}.png`;
}

export default function AdminEquipeTypePage() {
  useCouleursClubs(); // redessine quand les couleurs de la base arrivent
  const [b, setB] = useState(lireBrouillon);
  const [equipes, setEquipes] = useState([]);
  const [effectifs, setEffectifs] = useState({});     // equipeId -> [noms]
  const [erreur, setErreur] = useState(null);
  const [message, setMessage] = useState(null);
  const [policesPretes, setPolicesPretes] = useState(false);
  const canvasRef = useRef(null);

  // Équipes actives, toutes divisions (un joueur d'Elite Two peut être cité dans un visuel Elite One… rarement)
  useEffect(() => {
    adminService.equipes.liste()
      .then(l => setEquipes(l.filter(e => e.estActive).sort((x, y) => x.nom.localeCompare(y.nom, 'fr'))))
      .catch(e => setErreur(e.message));
    chargerPolices().then(() => setPolicesPretes(true));
  }, []);

  // Brouillon gardé dans le navigateur
  useEffect(() => {
    try { localStorage.setItem(CLE_BROUILLON, JSON.stringify(b)); } catch { /* stockage plein ou bloqué */ }
  }, [b]);

  // Effectif d'un club, chargé la première fois qu'on le choisit
  const clubsChoisis = useMemo(() => [...new Set(b.joueurs.map(j => j.equipeId).filter(Boolean))], [b.joueurs]);
  useEffect(() => {
    clubsChoisis.filter(id => !effectifs[id]).forEach(id => {
      setEffectifs(prec => ({ ...prec, [id]: [] }));
      adminService.joueurs.liste(id)
        .then(l => setEffectifs(prec => ({ ...prec, [id]: l.filter(j => j.estActif).map(nomJoueur).sort((x, y) => x.localeCompare(y, 'fr')) })))
        .catch(() => { /* pas d'effectif : saisie libre */ });
    });
  }, [clubsChoisis, effectifs]);

  const division = COMPETITIONS.find(c => c.valeur === b.competition)?.division ?? 0;
  const equipesTriees = useMemo(
    () => [...equipes].sort((x, y) => ((x.division === division ? 0 : 1) - (y.division === division ? 0 : 1)) || x.nom.localeCompare(y.nom, 'fr')),
    [equipes, division],
  );
  const parId = useMemo(() => new Map(equipes.map(e => [String(e.id), e])), [equipes]);

  // Données prêtes pour le dessin
  const donnees = useMemo(() => ({
    competition: b.competition,
    journee: b.journee,
    source: b.source,
    formation: b.formation,
    joueurs: b.joueurs.map(j => {
      const equipe = parId.get(String(j.equipeId));
      const couleurs = equipe ? couleursClub(equipe.nom) : null;
      return { nom: j.nom, club: equipe?.nom ?? '', principale: couleurs?.principale, secondaire: couleurs?.secondaire };
    }),
  }), [b, parId]);

  // Aperçu redessiné à chaque modification (échelle 2 : net sur écran haute densité, identique au PNG)
  useEffect(() => {
    if (canvasRef.current) dessinerEquipeType(canvasRef.current, donnees, 2);
  }, [donnees, policesPretes]);

  const maj = (champ, valeur) => setB(prec => ({ ...prec, [champ]: valeur }));
  const majJoueur = (i, champ, valeur) => setB(prec => ({
    ...prec, joueurs: prec.joueurs.map((j, k) => (k === i ? { ...j, [champ]: valeur } : j)),
  }));

  const manquants = b.joueurs.filter(j => !j.nom.trim()).length;
  const sansClub = b.joueurs.filter(j => j.nom.trim() && !j.equipeId).length;

  const afficher = (texte) => { setMessage(texte); setErreur(null); setTimeout(() => setMessage(null), 4000); };

  const telecharger = () => {
    canvasRef.current.toBlob(blob => {
      if (!blob) { setErreur("Impossible de créer l'image."); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = nomFichier(b.journee);
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      afficher(`Image téléchargée : ${nomFichier(b.journee)}`);
    }, 'image/png');
  };

  const copier = () => {
    canvasRef.current.toBlob(async blob => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        afficher('Image copiée : colle-la directement dans ta publication (Ctrl+V).');
      } catch {
        setErreur("Copie refusée par le navigateur : utilise « Télécharger le PNG ».");
      }
    }, 'image/png');
  };

  const reinitialiser = () => {
    if (b.joueurs.some(j => j.nom.trim()) && !window.confirm('Effacer les 11 joueurs et repartir de zéro ?')) return;
    setB({ ...brouillonVide(), competition: b.competition, source: b.source });
  };

  // Joueurs regroupés par ligne de la formation (gardien → attaque)
  const lignes = FORMATIONS[b.formation];
  const libelles = libellesLignes(lignes);
  const groupes = lignes.map((nb, i) => {
    const debut = lignes.slice(0, i).reduce((s, x) => s + x, 0);
    return { libelle: libelles[i], indices: Array.from({ length: nb }, (_, k) => debut + k) };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: CLAIR.texte, margin: 0 }}>Équipe type</h2>
        <p style={{ fontSize: '14px', color: CLAIR.doux, margin: '4px 0 0' }}>
          Remplis les 11 joueurs : l'aperçu se met à jour, puis télécharge l'image pour tes réseaux ou un article.
        </p>
      </div>

      {erreur && (
        <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', backgroundColor: CLAIR.rougeClair, color: CLAIR.rouge, fontWeight: 700, fontSize: '14px' }}>
          <AlertTriangle size={18} /> {erreur}
        </div>
      )}
      {message && (
        <div role="status" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', backgroundColor: CLAIR.vertClair, color: CLAIR.vert, fontWeight: 700, fontSize: '14px' }}>
          <CheckCircle2 size={18} /> {message}
        </div>
      )}

      {/* Aperçu */}
      <div style={CARTE}>
        <div style={TITRE_CARTE}>
          Aperçu
          <span style={{ fontSize: '12px', color: CLAIR.doux, fontWeight: 600 }}>{LARGEUR} × {HAUTEUR} (PNG en double résolution)</span>
        </div>
        <div style={{ padding: '16px', backgroundColor: '#0b0f0d' }}>
          <canvas ref={canvasRef} role="img" aria-label={`Équipe type ${b.journee || ''} en ${b.formation}`}
            style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: `${LARGEUR} / ${HAUTEUR}`, borderRadius: '6px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '14px 18px', borderTop: `1px solid ${CLAIR.bord}` }}>
          <button onClick={telecharger} style={BOUTON(CLAIR.vert, '#fff')}><Download size={15} /> Télécharger le PNG</button>
          {typeof ClipboardItem !== 'undefined' && (
            <button onClick={copier} style={{ ...BOUTON('#fff', CLAIR.texte), border: `1px solid ${CLAIR.bord}` }}><Copy size={15} /> Copier l'image</button>
          )}
          <button onClick={reinitialiser} style={BOUTON('transparent', CLAIR.doux)}><RotateCcw size={15} /> Nouvelle équipe</button>
          <span style={{ flex: 1 }} />
          {manquants > 0
            ? <span style={{ fontSize: '13px', fontWeight: 700, color: CLAIR.orange }}>{manquants} joueur{manquants > 1 ? 's' : ''} sans nom</span>
            : sansClub > 0
              ? <span style={{ fontSize: '13px', fontWeight: 700, color: CLAIR.orange }}>{sansClub} joueur{sansClub > 1 ? 's' : ''} sans club</span>
              : <span style={{ fontSize: '13px', fontWeight: 700, color: CLAIR.vert }}>11 joueurs : prêt à publier</span>}
        </div>
      </div>

      {/* Réglages */}
      <div style={CARTE}>
        <div style={TITRE_CARTE}>Réglages</div>
        <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <label style={ETIQUETTE}>Compétition
            <select value={b.competition} onChange={e => maj('competition', e.target.value)} style={CHAMP}>
              {COMPETITIONS.map(c => <option key={c.valeur} value={c.valeur}>{c.valeur}</option>)}
            </select>
          </label>
          <label style={ETIQUETTE}>Journée
            <input value={b.journee} onChange={e => maj('journee', e.target.value)} placeholder="Journée 8" maxLength={40} style={CHAMP} />
          </label>
          <label style={ETIQUETTE}>Système de jeu
            <select value={b.formation} onChange={e => maj('formation', e.target.value)} style={CHAMP}>
              {Object.keys(FORMATIONS).map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <label style={{ ...ETIQUETTE, gridColumn: '1 / -1' }}>Source (affichée en bas à gauche)
            <input value={b.source} onChange={e => maj('source', e.target.value)} maxLength={120} style={CHAMP} />
          </label>
        </div>
      </div>

      {/* Joueurs, ligne par ligne */}
      <div style={CARTE}>
        <div style={TITRE_CARTE}>
          Les 11 joueurs
          <span style={{ fontSize: '12px', color: CLAIR.doux, fontWeight: 600 }}>du gardien vers l'attaque, de haut en bas sur le terrain</span>
        </div>
        <div style={{ padding: '6px 18px 16px' }}>
          {groupes.map(g => (
            <div key={g.libelle + g.indices[0]} style={{ paddingTop: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase', color: CLAIR.doux, marginBottom: '8px' }}>
                {g.libelle}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {g.indices.map(i => {
                  const j = b.joueurs[i];
                  const equipe = parId.get(String(j.equipeId));
                  const couleurs = equipe ? couleursClub(equipe.nom) : null;
                  const idListe = `effectif-${i}`;
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '22px minmax(160px, 1fr) minmax(180px, 1.3fr)', gap: '10px', alignItems: 'center' }}>
                      <span title={equipe ? `Couleurs de ${equipe.nom}` : 'Choisis un club'} aria-hidden="true"
                        style={{ width: '18px', height: '18px', borderRadius: '5px', border: `1px solid ${CLAIR.bord}`,
                          background: couleurs ? `linear-gradient(135deg, ${couleurs.principale} 0 60%, ${couleurs.secondaire} 60%)` : CLAIR.tuile }} />
                      <select value={j.equipeId} onChange={e => majJoueur(i, 'equipeId', e.target.value)} aria-label={`Club du joueur ${i + 1}`} style={CHAMP}>
                        <option value="">Club…</option>
                        {equipesTriees.map((e, k) => {
                          const autre = e.division !== division;
                          const precedente = equipesTriees[k - 1];
                          return (
                            <option key={e.id} value={e.id}>
                              {autre && (!precedente || precedente.division === division) ? '── ' : ''}{e.nom}{autre ? ' (autre division)' : ''}
                            </option>
                          );
                        })}
                      </select>
                      <input value={j.nom} onChange={e => majJoueur(i, 'nom', e.target.value)} list={idListe} maxLength={40}
                        placeholder={equipe ? 'Nom (effectif proposé)' : 'Nom du joueur'} aria-label={`Nom du joueur ${i + 1}`} style={CHAMP} />
                      <datalist id={idListe}>
                        {(effectifs[j.equipeId] ?? []).map(n => <option key={n} value={n} />)}
                      </datalist>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mode d'emploi pour un article */}
      <div style={{ display: 'flex', gap: '10px', padding: '14px 16px', borderRadius: '12px', backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, fontSize: '13px', color: CLAIR.doux, lineHeight: 1.5 }}>
        <Info size={18} style={{ flexShrink: 0, color: CLAIR.vert, marginTop: '1px' }} />
        <span>
          Pour un article : place le PNG téléchargé dans <code>public/actualites/</code>, puis mets
          {' '}<code>/actualites/{nomFichier(b.journee)}</code> comme image de l'article (ou dans le contenu avec
          {' '}<code>![Équipe type](/actualites/{nomFichier(b.journee)})</code>). Cite toujours la source de la sélection.
          Un nom trop long est coupé avec « … » : préfère « B. Fopa » à un nom complet de 25 lettres.
        </span>
      </div>
    </div>
  );
}