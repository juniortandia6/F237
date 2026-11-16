// f237-frontend/src/components/Squelette.jsx
// Squelettes de chargement : la page s'affiche tout de suite avec des blocs gris qui pulsent
// (classe .squelette dans index.css), à la forme du contenu qui arrive. Aucune bibliothèque.

// Bloc gris de base. aria-hidden : les lecteurs d'écran lisent le texte "Chargement" du conteneur.
export function Bloc({ w = '100%', h = 12, r = 6, style }) {
  return <span aria-hidden="true" className="squelette" style={{ display: 'block', width: w, height: h, borderRadius: r, flexShrink: 0, ...style }} />;
}

// Conteneur accessible : annonce "Chargement" sans afficher de texte
export function ZoneChargement({ children, style, label = 'Chargement' }) {
  return <div role="status" aria-busy="true" aria-label={label} style={style}>{children}</div>;
}

// Ligne équipe : logo rond + nom (+ score à droite si demandé)
function LigneEquipe({ largeurNom, score }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '26px' }}>
      <Bloc w={24} h={24} r={12} />
      <Bloc w={largeurNom} h={14} />
      {score && <Bloc w={14} h={18} r={4} style={{ marginLeft: 'auto' }} />}
    </div>
  );
}

// Carte de match.
//  variante 'liste'     : page Matchs (carte blanche avec bordure, colonne droite pour l'heure)
//  variante 'carrousel' : accueil, carte de 360 px dans le carrousel
//  variante 'pleine'    : accueil sur téléphone, carte pleine largeur
export function SqueletteCarteMatch({ variante = 'liste', mobile = false, index = 0 }) {
  const noms = [['55%', '42%'], ['48%', '60%'], ['62%', '38%'], ['40%', '52%']][index % 4];
  const liste = variante === 'liste';
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', boxSizing: 'border-box', backgroundColor: '#fff',
      ...(liste
        ? { border: '1px solid #e2e7e4', borderRadius: '14px', padding: mobile ? '14px 14px 14px 16px' : '16px 20px' }
        : { borderRadius: '12px', padding: '14px 16px', boxShadow: '0 8px 22px rgba(0,0,0,0.30)' }),
      ...(variante === 'carrousel' ? { flex: '0 0 360px' } : { width: '100%' }),
    }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Bloc w={liste ? '45%' : '35%'} h={11} />
          <Bloc w={54} h={11} />
        </div>
        <LigneEquipe largeurNom={noms[0]} score={!liste} />
        <LigneEquipe largeurNom={noms[1]} score={!liste} />
      </div>
      <div style={{ width: liste ? (mobile ? '78px' : '120px') : '64px', borderLeft: '1px solid #eef1ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Bloc w={liste ? 64 : 40} h={liste ? 34 : 22} r={8} />
      </div>
    </div>
  );
}

// Case du calendrier (page Matchs) : 104 px comme les vraies dates
export function SqueletteDate() {
  return (
    <div style={{ flex: '0 0 104px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f2f4f3', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', paddingBottom: '12px' }}>
      <Bloc w="100%" h={24} r={0} style={{ opacity: 0.7 }} />
      <Bloc w={34} h={12} />
      <Bloc w={40} h={26} r={6} />
      <Bloc w={30} h={10} />
      <Bloc w={50} h={9} />
    </div>
  );
}

// Lignes de classement (mini-classement de l'accueil)
export function SqueletteLignesClassement({ n = 5 }) {
  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e7e4', backgroundColor: '#fff' }}>
      <div style={{ height: '38px', backgroundColor: '#f2f4f3' }} />
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 14px', height: '46px', borderTop: '1px solid #eef1ef' }}>
          <Bloc w={14} h={12} />
          <Bloc w={24} h={24} r={12} />
          <Bloc w={['45%', '38%', '52%', '33%', '41%'][i % 5]} h={13} />
          <Bloc w={22} h={13} style={{ marginLeft: 'auto' }} />
        </div>
      ))}
    </div>
  );
}

// ── Autres pages ─────────────────────────────────────────────────────────

// Grand tableau de classement (page Classements) : en-tête + n lignes
export function SqueletteTableau({ n = 12, mobile = false }) {
  const colonnes = mobile ? 3 : 8;
  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e7e4', backgroundColor: '#fff' }}>
      <div style={{ height: '42px', backgroundColor: '#f2f4f3' }} />
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', height: '52px', borderTop: '1px solid #eef1ef' }}>
          <Bloc w={18} h={14} />
          <Bloc w={26} h={26} r={13} />
          <Bloc w={['34%', '28%', '40%', '25%', '31%', '37%'][i % 6]} h={14} />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: mobile ? '10px' : '22px' }}>
            {Array.from({ length: colonnes }, (_, c) => <Bloc key={c} w={20} h={13} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

// Liste simple dans une carte (buteurs, lignes de matchs d'une équipe…)
export function SqueletteLignes({ n = 5, avecRond = true }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 18px', height: '54px', borderTop: i ? '1px solid #eef1ef' : 'none' }}>
          {avecRond && <Bloc w={28} h={28} r={14} />}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <Bloc w={['48%', '36%', '55%', '42%', '30%'][i % 5]} h={13} />
            <Bloc w={['26%', '20%', '32%', '24%', '18%'][i % 5]} h={10} />
          </div>
          <Bloc w={34} h={20} r={6} />
        </div>
      ))}
    </div>
  );
}

// Carte de club (page Équipes) : logo rond + nom + petite ligne
export function SqueletteCarteEquipe({ index = 0 }) {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e2e7e4', borderRadius: '14px', padding: '22px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <Bloc w={64} h={64} r={32} />
      <Bloc w={['70%', '55%', '62%', '48%'][index % 4]} h={14} />
      <Bloc w="38%" h={10} />
    </div>
  );
}

// Carte d'article (page Actualités) : image + catégorie + 2 lignes de titre
export function SqueletteCarteArticle({ index = 0 }) {
  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Bloc w="100%" h={180} r={0} style={{ opacity: 0.35 }} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Bloc w={70} h={11} style={{ opacity: 0.35 }} />
        <Bloc w="92%" h={15} style={{ opacity: 0.35 }} />
        <Bloc w={['60%', '74%', '52%'][index % 3]} h={15} style={{ opacity: 0.35 }} />
      </div>
    </div>
  );
}

// Article (page d'un article) : titre + image + paragraphes, sur fond sombre
export function SqueletteArticle() {
  const o = { opacity: 0.35 };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Bloc w={90} h={20} r={999} style={o} />
      <Bloc w="95%" h={30} style={o} />
      <Bloc w="70%" h={30} style={o} />
      <Bloc w={160} h={12} style={o} />
      <Bloc w="100%" h={320} r={14} style={{ ...o, margin: '10px 0' }} />
      {['100%', '96%', '98%', '82%', '100%', '91%', '60%'].map((w, i) => <Bloc key={i} w={w} h={13} style={o} />)}
    </div>
  );
}

// Fiche (joueur, équipe, match) pendant le premier chargement :
// bande sombre avec logo + titre, puis deux cartes claires
export function SqueletteFiche({ fondHaut = '#12462c', fondBas = '#eef1ef' }) {
  const clair = { backgroundColor: 'rgba(255,255,255,0.14)', animation: undefined };
  return (
    <div style={{ backgroundColor: fondBas, minHeight: '60vh' }}>
      <div style={{ backgroundColor: fondHaut, padding: '56px var(--marge-page) 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <Bloc w={96} h={96} r={48} style={clair} />
        <Bloc w={260} h={28} style={clair} />
        <Bloc w={160} h={14} style={clair} />
      </div>
      <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '28px var(--marge-page)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {[4, 3].map((n, i) => (
          <div key={i} style={{ backgroundColor: '#fff', border: '1px solid #e2e7e4', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid #eef1ef' }}><Bloc w={140} h={15} /></div>
            <SqueletteLignes n={n} />
          </div>
        ))}
      </div>
    </div>
  );
}