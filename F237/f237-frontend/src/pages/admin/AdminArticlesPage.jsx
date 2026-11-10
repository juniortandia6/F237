// f237-frontend/src/pages/admin/AdminArticlesPage.jsx
// Liste des articles (publiés et brouillons) : recherche, filtre, publication
// en un clic, suppression avec confirmation, lien vers l'édition.

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, ExternalLink, Star, RefreshCw } from 'lucide-react';
import { adminService, versSaisie, dateApi } from '../../services/adminService';
import { rechargerActualites } from '../../hooks/useActualites';
import { IMAGES_DEFAUT } from '../../data/actualites';
import { locale } from '../../i18n';
import { CLAIR, CARTE } from './styleAdmin';

const FILTRES = [
  { cle: 'tous', label: 'Tous' },
  { cle: 'publies', label: 'Publiés' },
  { cle: 'brouillons', label: 'Brouillons' },
];

const formatDate = (s) => dateApi(s)?.toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' }) ?? '–';

function Pastille({ children, fond, couleur }) {
  return (
    <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.4px', textTransform: 'uppercase', backgroundColor: fond, color: couleur, padding: '3px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

function BoutonIcone({ titre, onClick, children, danger, disabled }) {
  return (
    <button title={titre} aria-label={titre} onClick={onClick} disabled={disabled}
      style={{
        width: '34px', height: '34px', borderRadius: '8px', border: `1px solid ${CLAIR.bord}`, backgroundColor: CLAIR.carte,
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: disabled ? 'default' : 'pointer',
        color: danger ? CLAIR.rouge : CLAIR.texte, opacity: disabled ? 0.5 : 1,
      }}>
      {children}
    </button>
  );
}

function LigneArticle({ a, occupe, aSupprimer, onBasculer, onDemanderSuppression, onAnnulerSuppression, onSupprimer }) {
  const image = a.imageUrl || IMAGES_DEFAUT[a.id % IMAGES_DEFAUT.length];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '84px minmax(0, 1fr) auto', gap: '16px', alignItems: 'center', padding: '14px 18px', borderTop: `1px solid ${CLAIR.bord}`, backgroundColor: aSupprimer ? CLAIR.rougeClair : 'transparent' }}>
      <img src={image} alt="" style={{ width: '84px', height: '56px', objectFit: 'cover', borderRadius: '8px', backgroundColor: CLAIR.tuile }} />

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
          {a.estPublie
            ? <Pastille fond={CLAIR.vertClair} couleur={CLAIR.vert}>Publié</Pastille>
            : <Pastille fond={CLAIR.orangeClair} couleur={CLAIR.orange}>Brouillon</Pastille>}
          {a.aLaUne && <Pastille fond="#fff6cc" couleur="#7a5c00"><Star size={10} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '3px' }} />À la une</Pastille>}
          <span style={{ fontSize: '12px', fontWeight: 700, color: CLAIR.doux }}>{a.tag} · {formatDate(a.datePublication)}</span>
          {!a.titreEn && <span style={{ fontSize: '11px', color: CLAIR.orange }}>· pas de version anglaise</span>}
        </div>
        <Link to={`/admin/articles/${a.id}`} style={{ display: 'block', fontSize: '15px', fontWeight: 800, color: CLAIR.texte, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {a.titreFr}
        </Link>
        <div style={{ fontSize: '13px', color: CLAIR.doux, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.resumeFr}</div>
      </div>

      {aSupprimer ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: CLAIR.rouge }}>Supprimer définitivement ?</span>
          <button onClick={onAnnulerSuppression} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: CLAIR.doux }}>Annuler</button>
          <button onClick={onSupprimer} disabled={occupe}
            style={{ padding: '8px 14px', borderRadius: '999px', border: 'none', cursor: 'pointer', backgroundColor: CLAIR.rouge, color: '#fff', fontSize: '13px', fontWeight: 700 }}>
            Supprimer
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BoutonIcone titre={a.estPublie ? 'Repasser en brouillon' : 'Publier'} onClick={onBasculer} disabled={occupe}>
            {occupe ? <RefreshCw size={15} className="animate-spin" /> : a.estPublie ? <EyeOff size={15} /> : <Eye size={15} />}
          </BoutonIcone>
          {a.estPublie && (
            <a href={`/actualites/${a.slug}`} target="_blank" rel="noreferrer" title="Voir sur le site" aria-label="Voir sur le site"
              style={{ width: '34px', height: '34px', borderRadius: '8px', border: `1px solid ${CLAIR.bord}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CLAIR.texte }}>
              <ExternalLink size={15} />
            </a>
          )}
          <Link to={`/admin/articles/${a.id}`} title="Modifier" aria-label="Modifier"
            style={{ width: '34px', height: '34px', borderRadius: '8px', border: `1px solid ${CLAIR.bord}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CLAIR.texte }}>
            <Pencil size={15} />
          </Link>
          <BoutonIcone titre="Supprimer" onClick={onDemanderSuppression} danger disabled={occupe}>
            <Trash2 size={15} />
          </BoutonIcone>
        </div>
      )}
    </div>
  );
}

export default function AdminArticlesPage() {
  const [version, setVersion] = useState(0);
  const [articles, setArticles] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [filtre, setFiltre] = useState('tous');
  const [recherche, setRecherche] = useState('');
  const [occupe, setOccupe] = useState(null);      // id de l'article en cours de modification
  const [aSupprimer, setASupprimer] = useState(null);

  useEffect(() => {
    let ignore = false;
    adminService.articles.liste()
      .then(l => { if (!ignore) { setArticles(l); setErreur(null); } })
      .catch(e => { if (!ignore) setErreur(e.message); });
    return () => { ignore = true; };
  }, [version]);

  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return (articles ?? [])
      .filter(a => filtre === 'tous' || (filtre === 'publies' ? a.estPublie : !a.estPublie))
      .filter(a => !q || `${a.titreFr} ${a.titreEn ?? ''} ${a.resumeFr} ${a.tag}`.toLowerCase().includes(q))
      .sort((x, y) => (dateApi(y.datePublication) ?? 0) - (dateApi(x.datePublication) ?? 0));
  }, [articles, filtre, recherche]);

  const compte = (cle) => (articles ?? []).filter(a => cle === 'tous' || (cle === 'publies' ? a.estPublie : !a.estPublie)).length;

  // Publier / dépublier : on renvoie l'article complet avec le statut inversé.
  // Publication d'un brouillon sans date choisie -> l'API met la date du jour.
  const basculer = async (a) => {
    setOccupe(a.id);
    try {
      const publier = !a.estPublie;
      const modifie = await adminService.articles.modifier(a.id, versSaisie(a, {
        estPublie: publier,
        datePublication: publier ? null : a.datePublication,
      }));
      setArticles(liste => liste.map(x => (x.id === a.id ? modifie : x)));
      rechargerActualites(); // le site public se met à jour tout de suite
    } catch (e) {
      setErreur(e.message);
    } finally {
      setOccupe(null);
    }
  };

  const supprimer = async (a) => {
    setOccupe(a.id);
    try {
      await adminService.articles.supprimer(a.id);
      setArticles(liste => liste.filter(x => x.id !== a.id));
      setASupprimer(null);
      rechargerActualites();
    } catch (e) {
      setErreur(e.message);
    } finally {
      setOccupe(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: CLAIR.texte }}>Articles</h2>
        <Link to="/admin/articles/nouveau"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '999px', backgroundColor: CLAIR.vert, color: '#fff', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
          <Plus size={16} /> Nouvel article
        </Link>
      </div>

      {erreur && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: CLAIR.rougeClair, color: CLAIR.rouge, fontSize: '14px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          {erreur}
          <button onClick={() => { setErreur(null); setVersion(v => v + 1); }} style={{ border: 'none', background: 'none', color: CLAIR.rouge, fontWeight: 800, cursor: 'pointer' }}>Réessayer</button>
        </div>
      )}

      <div style={CARTE}>
        {/* Filtres + recherche */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 18px', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', padding: '4px', borderRadius: '999px', backgroundColor: CLAIR.tuile }}>
            {FILTRES.map(f => {
              const actif = f.cle === filtre;
              return (
                <button key={f.cle} onClick={() => setFiltre(f.cle)}
                  style={{ padding: '7px 14px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, backgroundColor: actif ? CLAIR.carte : 'transparent', color: actif ? CLAIR.texte : CLAIR.doux, boxShadow: actif ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                  {f.label} <span style={{ color: CLAIR.doux, fontWeight: 600 }}>{articles ? compte(f.cle) : ''}</span>
                </button>
              );
            })}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '999px', border: `1px solid ${CLAIR.bord}`, minWidth: '260px' }}>
            <Search size={15} color={CLAIR.doux} />
            <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Rechercher un article"
              style={{ border: 'none', outline: 'none', fontSize: '14px', flex: 1, background: 'transparent', color: CLAIR.texte }} />
          </label>
        </div>

        {!articles && !erreur ? (
          <p style={{ padding: '30px 18px', textAlign: 'center', color: CLAIR.doux, fontSize: '14px', borderTop: `1px solid ${CLAIR.bord}` }}>Chargement…</p>
        ) : visibles.length === 0 ? (
          <p style={{ padding: '30px 18px', textAlign: 'center', color: CLAIR.doux, fontSize: '14px', borderTop: `1px solid ${CLAIR.bord}` }}>
            {articles?.length ? 'Aucun article ne correspond.' : 'Aucun article pour l\'instant.'}
          </p>
        ) : (
          visibles.map(a => (
            <LigneArticle key={a.id} a={a}
              occupe={occupe === a.id}
              aSupprimer={aSupprimer === a.id}
              onBasculer={() => basculer(a)}
              onDemanderSuppression={() => setASupprimer(a.id)}
              onAnnulerSuppression={() => setASupprimer(null)}
              onSupprimer={() => supprimer(a)} />
          ))
        )}
      </div>
    </div>
  );
}