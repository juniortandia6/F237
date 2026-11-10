// f237-frontend/src/pages/admin/AdminArticleEditionPage.jsx
// Création / modification d'un article.
// - /admin/articles/nouveau : nouvel article
// - /admin/articles/:id     : article existant
// Colonne gauche : textes FR / EN (onglets) ou aperçu ; colonne droite :
// publication, catégorie, date, image, adresse (slug).
// Contenu : un paragraphe par bloc, séparés par une LIGNE VIDE (comme l'API).

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, PenLine, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { adminService, TAGS_ARTICLE, dateApi } from '../../services/adminService';
import { rechargerActualites } from '../../hooks/useActualites';
import { IMAGES_DEFAUT } from '../../data/actualites';
import { locale } from '../../i18n';
import { CLAIR, CARTE, TITRE_CARTE } from './styleAdmin';

const LIMITES = { titre: 200, resume: 400 };

const VIDE = {
  slug: '', tag: TAGS_ARTICLE[0], imageUrl: '',
  titreFr: '', resumeFr: '', contenuFr: '',
  titreEn: '', resumeEn: '', contenuEn: '',
  estPublie: false, aLaUne: false, datePublication: '', // '' = date du jour à la publication
};

// Date (UTC de l'API) <-> valeur d'un <input type="datetime-local"> (heure locale)
const deux = (n) => String(n).padStart(2, '0');
function versLocal(iso) {
  const d = dateApi(iso);
  if (!d) return '';
  return `${d.getFullYear()}-${deux(d.getMonth() + 1)}-${deux(d.getDate())}T${deux(d.getHours())}:${deux(d.getMinutes())}`;
}
const depuisLocal = (v) => (v ? new Date(v).toISOString() : null);

// Article de l'API -> formulaire
const versFormulaire = (a) => ({
  slug: a.slug ?? '', tag: a.tag, imageUrl: a.imageUrl ?? '',
  titreFr: a.titreFr ?? '', resumeFr: a.resumeFr ?? '', contenuFr: a.contenuFr ?? '',
  titreEn: a.titreEn ?? '', resumeEn: a.resumeEn ?? '', contenuEn: a.contenuEn ?? '',
  estPublie: a.estPublie, aLaUne: a.aLaUne, datePublication: versLocal(a.datePublication),
});

// Formulaire -> corps POST / PUT
const versCorps = (f) => ({
  slug: f.slug.trim() || null,
  tag: f.tag,
  imageUrl: f.imageUrl.trim() || null,
  titreFr: f.titreFr, resumeFr: f.resumeFr, contenuFr: f.contenuFr,
  titreEn: f.titreEn.trim() || null, resumeEn: f.resumeEn.trim() || null, contenuEn: f.contenuEn.trim() || null,
  estPublie: f.estPublie, aLaUne: f.aLaUne,
  datePublication: depuisLocal(f.datePublication),
});

const paragraphes = (t) => (t ?? '').replace(/\r\n/g, '\n').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

// Problèmes bloquants (mêmes règles que l'API)
function verifier(f) {
  const erreurs = [];
  if (!f.titreFr.trim()) erreurs.push('Le titre français est obligatoire.');
  if (!f.resumeFr.trim()) erreurs.push('Le résumé français est obligatoire.');
  if (!f.contenuFr.trim()) erreurs.push('Le contenu français est obligatoire.');
  if (f.titreFr.trim().length > LIMITES.titre || f.titreEn.trim().length > LIMITES.titre) erreurs.push(`Un titre dépasse ${LIMITES.titre} caractères.`);
  if (f.resumeFr.trim().length > LIMITES.resume || f.resumeEn.trim().length > LIMITES.resume) erreurs.push(`Un résumé dépasse ${LIMITES.resume} caractères.`);
  if (f.imageUrl.trim() && !/^https?:\/\/\S+$/i.test(f.imageUrl.trim())) erreurs.push("L'image doit être une adresse complète (https://...).");
  return erreurs;
}

// ── Champs ──────────────────────────────────────────────────────────────
const STYLE_CHAMP = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px', borderRadius: '10px', border: `1px solid ${CLAIR.bord}`,
  fontSize: '15px', color: CLAIR.texte, backgroundColor: '#fff', outline: 'none', fontFamily: 'inherit',
};

function Champ({ label, aide, max, valeur, children }) {
  const longueur = valeur?.trim().length ?? 0;
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.4px', textTransform: 'uppercase', color: CLAIR.doux, marginBottom: '6px' }}>
        {label}
        {max && <span style={{ color: longueur > max ? CLAIR.rouge : CLAIR.doux, fontWeight: 700 }}>{longueur} / {max}</span>}
      </span>
      {children}
      {aide && <span style={{ display: 'block', fontSize: '12px', color: CLAIR.doux, marginTop: '5px' }}>{aide}</span>}
    </label>
  );
}

function Interrupteur({ actif, onChange, label, aide }) {
  return (
    <button type="button" onClick={() => onChange(!actif)} role="switch" aria-checked={actif}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', width: '100%', padding: '4px 0', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
      <span>
        <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: CLAIR.texte }}>{label}</span>
        {aide && <span style={{ display: 'block', fontSize: '12px', color: CLAIR.doux }}>{aide}</span>}
      </span>
      <span style={{ width: '42px', height: '24px', borderRadius: '999px', backgroundColor: actif ? CLAIR.vert : '#cfd5d2', position: 'relative', flexShrink: 0, transition: 'background-color 0.2s ease' }}>
        <span style={{ position: 'absolute', top: '3px', left: actif ? '21px' : '3px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </span>
    </button>
  );
}

// ── Aperçu (proche de la page article du site) ──────────────────────────
function Apercu({ f, langue, idImage }) {
  const en = langue === 'en';
  const titre = (en && f.titreEn.trim()) || f.titreFr;
  const resume = (en && f.resumeEn.trim()) || f.resumeFr;
  const contenu = paragraphes((en && f.contenuEn.trim()) || f.contenuFr);
  const image = f.imageUrl.trim() || IMAGES_DEFAUT[(idImage ?? 0) % IMAGES_DEFAUT.length];
  const date = f.datePublication ? new Date(f.datePublication) : null;
  const repli = en && (!f.titreEn.trim() || !f.contenuEn.trim());

  return (
    <div style={CARTE}>
      <div style={{ position: 'relative', height: '260px', backgroundColor: '#0f3a25' }}>
        <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.75) 100%)' }} />
        <div style={{ position: 'absolute', left: '24px', right: '24px', bottom: '20px', color: '#fff' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', backgroundColor: '#1f9d55', padding: '4px 10px', borderRadius: '999px' }}>{f.tag}</span>
          <h2 style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.15, margin: '10px 0 6px' }}>{titre || 'Titre de l\'article'}</h2>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>
            {(date ?? new Date()).toLocaleDateString(en ? 'en-GB' : locale(), { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
      <div style={{ padding: '22px 24px 26px' }}>
        {repli && (
          <div style={{ marginBottom: '14px', padding: '9px 12px', borderRadius: '8px', backgroundColor: CLAIR.orangeClair, color: CLAIR.orange, fontSize: '13px', fontWeight: 600 }}>
            Version anglaise incomplète : le site affichera le français à la place.
          </div>
        )}
        <p style={{ fontSize: '17px', fontWeight: 600, color: CLAIR.texte, lineHeight: 1.55, marginBottom: '16px' }}>{resume || 'Résumé de l\'article.'}</p>
        {contenu.length === 0
          ? <p style={{ color: CLAIR.doux, fontSize: '15px' }}>Le contenu apparaîtra ici.</p>
          : contenu.map((p, i) => <p key={i} style={{ fontSize: '15px', color: '#2c312e', lineHeight: 1.7, marginBottom: '12px' }}>{p}</p>)}
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────
export default function AdminArticleEditionPage() {
  const { id } = useParams();                // undefined = nouvel article
  const navigate = useNavigate();
  const [charge, setCharge] = useState(null); // { id, article } chargé depuis l'API
  const [form, setForm] = useState(id ? null : VIDE);
  const [enregistre, setEnregistre] = useState(id ? null : VIDE); // dernière version enregistrée
  const [erreurChargement, setErreurChargement] = useState(null);
  const [langue, setLangue] = useState('fr');
  const [mode, setMode] = useState('edition'); // 'edition' | 'apercu'
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'ok' | 'erreur', texte }

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    adminService.articles.get(id)
      .then(a => {
        if (ignore) return;
        if (!a) { setErreurChargement('Article introuvable.'); return; }
        const f = versFormulaire(a);
        setCharge({ id: a.id, article: a });
        setForm(f);
        setEnregistre(f);
      })
      .catch(e => { if (!ignore) setErreurChargement(e.message); });
    return () => { ignore = true; };
  }, [id]);

  const modifie = useMemo(() => form && enregistre && JSON.stringify(form) !== JSON.stringify(enregistre), [form, enregistre]);
  const erreurs = useMemo(() => (form ? verifier(form) : []), [form]);
  const maj = (champ) => (e) => { const v = e?.target ? e.target.value : e; setForm(f => ({ ...f, [champ]: v })); setMessage(null); };

  const enregistrer = async () => {
    if (erreurs.length) { setMessage({ type: 'erreur', texte: erreurs[0] }); return; }
    setEnvoi(true);
    setMessage(null);
    try {
      const corps = versCorps(form);
      const article = id
        ? await adminService.articles.modifier(id, corps)
        : await adminService.articles.creer(corps);
      const f = versFormulaire(article);
      setCharge({ id: article.id, article });
      setForm(f);
      setEnregistre(f);
      setMessage({ type: 'ok', texte: article.estPublie ? 'Article enregistré et publié sur le site.' : 'Brouillon enregistré.' });
      rechargerActualites();
      if (!id) navigate(`/admin/articles/${article.id}`, { replace: true });
    } catch (e) {
      setMessage({ type: 'erreur', texte: e.message });
    } finally {
      setEnvoi(false);
    }
  };

  if (erreurChargement) {
    return (
      <div style={{ ...CARTE, padding: '30px', textAlign: 'center' }}>
        <p style={{ color: CLAIR.rouge, fontWeight: 700, marginBottom: '14px' }}>{erreurChargement}</p>
        <Link to="/admin/articles" style={{ color: CLAIR.vert, fontWeight: 700 }}>Retour aux articles</Link>
      </div>
    );
  }
  if (!form) return <p style={{ color: CLAIR.doux }}>Chargement…</p>;

  const enCours = langue === 'en';
  const suffixe = enCours ? 'En' : 'Fr';
  const slugPublie = charge?.article?.estPublie ? charge.article.slug : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <Link to="/admin/articles" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: CLAIR.doux, textDecoration: 'none', marginBottom: '6px' }}>
            <ArrowLeft size={14} /> Articles
          </Link>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: CLAIR.texte }}>{id ? 'Modifier l\'article' : 'Nouvel article'}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {modifie && <span style={{ fontSize: '13px', fontWeight: 700, color: CLAIR.orange }}>Modifications non enregistrées</span>}
          {slugPublie && (
            <a href={`/actualites/${slugPublie}`} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '999px', border: `1px solid ${CLAIR.bord}`, backgroundColor: CLAIR.carte, color: CLAIR.texte, fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
              <ExternalLink size={14} /> Voir sur le site
            </a>
          )}
        </div>
      </div>

      {message && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, backgroundColor: message.type === 'ok' ? CLAIR.vertClair : CLAIR.rougeClair, color: message.type === 'ok' ? CLAIR.vert : CLAIR.rouge }}>
          {message.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />} {message.texte}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '20px', alignItems: 'start' }}>
        {/* ── Gauche : textes ou aperçu ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'inline-flex', padding: '4px', borderRadius: '999px', backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}` }}>
              {[{ cle: 'fr', label: 'Français' }, { cle: 'en', label: 'English' }].map(l => (
                <button key={l.cle} type="button" onClick={() => setLangue(l.cle)}
                  style={{ padding: '7px 16px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 800, backgroundColor: langue === l.cle ? CLAIR.vert : 'transparent', color: langue === l.cle ? '#fff' : CLAIR.doux }}>
                  {l.label}
                  {l.cle === 'en' && !form.titreEn.trim() && <span style={{ marginLeft: '6px', color: langue === 'en' ? '#fff' : CLAIR.orange }}>•</span>}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setMode(m => (m === 'edition' ? 'apercu' : 'edition'))}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '999px', border: `1px solid ${CLAIR.bord}`, backgroundColor: CLAIR.carte, color: CLAIR.texte, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
              {mode === 'edition' ? <><Eye size={14} /> Aperçu</> : <><PenLine size={14} /> Modifier</>}
            </button>
          </div>

          {mode === 'apercu' ? (
            <Apercu f={form} langue={langue} idImage={charge?.id} />
          ) : (
            <div style={{ ...CARTE, padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {enCours && (
                <p style={{ fontSize: '13px', color: CLAIR.doux, margin: 0 }}>
                  Facultatif. Si un champ anglais est vide, le site affiche le texte français à la place.
                </p>
              )}
              <Champ label={enCours ? 'Title' : 'Titre'} max={LIMITES.titre} valeur={form[`titre${suffixe}`]}>
                <input value={form[`titre${suffixe}`]} onChange={maj(`titre${suffixe}`)} style={{ ...STYLE_CHAMP, fontSize: '18px', fontWeight: 700 }}
                  placeholder={enCours ? 'Article title' : 'Ex. Coton Sport s\'impose à Douala'} />
              </Champ>
              <Champ label={enCours ? 'Summary' : 'Résumé'} max={LIMITES.resume} valeur={form[`resume${suffixe}`]}
                aide={enCours ? undefined : 'Affiché dans les listes et en haut de l\'article (1 ou 2 phrases).'}>
                <textarea value={form[`resume${suffixe}`]} onChange={maj(`resume${suffixe}`)} rows={3} style={{ ...STYLE_CHAMP, resize: 'vertical', lineHeight: 1.5 }} />
              </Champ>
              <Champ label={enCours ? 'Content' : 'Contenu'} valeur={form[`contenu${suffixe}`]}
                aide={`Laisse une ligne vide entre deux paragraphes · ${paragraphes(form[`contenu${suffixe}`]).length} paragraphe(s)`}>
                <textarea value={form[`contenu${suffixe}`]} onChange={maj(`contenu${suffixe}`)} rows={16} style={{ ...STYLE_CHAMP, resize: 'vertical', lineHeight: 1.6 }} />
              </Champ>
            </div>
          )}
        </div>

        {/* ── Droite : publication et options ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'sticky', top: '90px' }}>
          <div style={CARTE}>
            <div style={TITRE_CARTE}>Publication</div>
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Interrupteur actif={form.estPublie} onChange={maj('estPublie')} label="Publié"
                aide={form.estPublie ? 'Visible sur le site' : 'Brouillon : visible seulement ici'} />
              <Interrupteur actif={form.aLaUne} onChange={maj('aLaUne')} label="À la une" aide="Prioritaire dans le hero de l'accueil" />
              <Champ label="Date de publication" aide={form.datePublication ? undefined : 'Vide = date du jour à la publication'}>
                <input type="datetime-local" value={form.datePublication} onChange={maj('datePublication')} style={STYLE_CHAMP} />
              </Champ>
              <Champ label="Catégorie">
                <select value={form.tag} onChange={maj('tag')} style={{ ...STYLE_CHAMP, cursor: 'pointer' }}>
                  {TAGS_ARTICLE.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Champ>
              <button type="button" onClick={enregistrer} disabled={envoi || (!modifie && !!id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '999px', border: 'none',
                  cursor: envoi || (!modifie && id) ? 'default' : 'pointer', fontSize: '14px', fontWeight: 800,
                  backgroundColor: CLAIR.vert, color: '#fff', opacity: envoi || (!modifie && id) ? 0.55 : 1,
                }}>
                <Save size={16} /> {envoi ? 'Enregistrement…' : form.estPublie ? 'Enregistrer et publier' : 'Enregistrer le brouillon'}
              </button>
              {erreurs.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: CLAIR.orange, lineHeight: 1.5 }}>
                  {erreurs.map(e => <li key={e}>{e}</li>)}
                </ul>
              )}
            </div>
          </div>

          <div style={CARTE}>
            <div style={TITRE_CARTE}>Image</div>
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <img src={form.imageUrl.trim() || IMAGES_DEFAUT[(charge?.id ?? 0) % IMAGES_DEFAUT.length]} alt=""
                style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px', backgroundColor: CLAIR.tuile }} />
              <Champ label="Adresse de l'image" aide="https://... · vide = image par défaut du site">
                <input value={form.imageUrl} onChange={maj('imageUrl')} placeholder="https://" style={STYLE_CHAMP} />
              </Champ>
            </div>
          </div>

          <div style={CARTE}>
            <div style={TITRE_CARTE}>Adresse de l'article</div>
            <div style={{ padding: '14px 18px' }}>
              <Champ label="Slug" aide={id ? 'Le changer casse les liens déjà partagés.' : 'Vide = créé à partir du titre.'}>
                <input value={form.slug} onChange={maj('slug')} placeholder="coton-sport-champion" style={STYLE_CHAMP} />
              </Champ>
              {form.slug.trim() && (
                <div style={{ fontSize: '12px', color: CLAIR.doux, marginTop: '8px', wordBreak: 'break-all' }}>/actualites/{form.slug.trim()}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}