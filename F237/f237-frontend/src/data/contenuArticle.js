// f237-frontend/src/data/contenuArticle.js
// Outils du corps d'un article (sans composant React), partagés par
// components/ContenuArticle.jsx, la page article et l'aperçu de l'admin.
// Séparés du composant pour que le rechargement à chaud de Vite (Fast Refresh) fonctionne.

export const COULEURS_ARTICLE = {
  texte: '#1b2420',
  corps: '#2c312e',
  doux: '#6b7570',
  bandeau: '#ececec',
  vert: '#1f9d55',
};

export const ADRESSE_SURE = /^(https?:\/\/\S+|\/(?!\/)[A-Za-z0-9/_\-.%]+)$/i;

/** Découpe un paragraphe en blocs typés. Un paragraphe "## Titre\nTexte" donne 2 blocs. */
export function analyserBlocs(paragraphes) {
  const blocs = [];
  for (const p of paragraphes ?? []) {
    const lignes = String(p).split('\n');
    let reste = [];
    const viderReste = () => {
      if (reste.length) blocs.push({ type: 'texte', texte: reste.join(' ').trim() });
      reste = [];
    };
    for (const brute of lignes) {
      const ligne = brute.trim();
      const titre = /^#{2,3}\s+(.+)$/.exec(ligne);
      const image = /^!\[([^\]]*)\]\((\S+)\)$/.exec(ligne);
      if (titre) { viderReste(); blocs.push({ type: 'titre', texte: titre[1].trim() }); }
      else if (image && ADRESSE_SURE.test(image[2])) { viderReste(); blocs.push({ type: 'image', legende: image[1].trim(), src: image[2] }); }
      else if (/^>\s?/.test(ligne)) { viderReste(); blocs.push({ type: 'citation', texte: ligne.replace(/^>\s?/, '') }); }
      else if (ligne) reste.push(ligne);
    }
    viderReste();
  }
  // Citations consécutives regroupées
  return blocs.reduce((acc, b) => {
    const prec = acc[acc.length - 1];
    if (b.type === 'citation' && prec?.type === 'citation') prec.texte += ' ' + b.texte;
    else acc.push({ ...b });
    return acc;
  }, []);
}

/** Identifiant d'ancre stable pour un intertitre. */
export const ancre = (texte, i) =>
  'section-' + i + '-' + texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

/** Intertitres de l'article, pour le sommaire : [{ id, texte }] */
export const sectionsDe = (paragraphes) =>
  analyserBlocs(paragraphes)
    .map((b, i) => (b.type === 'titre' ? { id: ancre(b.texte, i), texte: b.texte } : null))
    .filter(Boolean);

/** Nombre de minutes de lecture (≈ 200 mots/minute, 1 minimum). */
export function minutesLecture(...textes) {
  const mots = textes.flat().filter(Boolean).join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(mots / 200));
}