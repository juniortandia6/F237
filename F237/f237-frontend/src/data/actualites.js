// f237-frontend/src/data/actualites.js
// Outils communs aux actualités. Les articles eux-mêmes viennent maintenant de
// l'API (/api/articles, voir hooks/useActualites.js et services/articleService.js) :
// plus aucun article de démonstration ici.
//
// Forme d'un article : { id, slug, tag, img, date, aLaUne, titre, resume, contenu?, en? }
// Version anglaise : le bloc `en` (titre, resume, contenu). S'il manque, le français est affiché.

import img1 from '../assets/accueil1.jpg';
import img2 from '../assets/accueil2.jpg';
import img3 from '../assets/accueil3.jpg';
import img4 from '../assets/accueil4.jpg';
import img5 from '../assets/accueil5.jpg';
import i18n, { locale } from '../i18n';

// Images utilisées quand un article n'a pas d'image (et pour le hero sans article)
export const IMAGES_DEFAUT = [img1, img2, img3, img4, img5];

/** Article reçu de l'API -> article prêt à afficher (image par défaut si besoin). */
export const normaliserArticle = (a, i = 0) => ({
  ...a,
  img: a.img || IMAGES_DEFAUT[(a.id ?? i) % IMAGES_DEFAUT.length],
});

/** Les articles du hero de l'accueil : ceux "à la une" d'abord, puis les plus récents (5 max). */
export const articlesHero = (articles) =>
  [...articles.filter(a => a.aLaUne), ...articles.filter(a => !a.aLaUne)].slice(0, 5);

/** Texte d'un article dans la langue active (repli sur le français). champ : 'titre' | 'resume' | 'contenu' */
export const texteActu = (a, champ) =>
  (i18n.resolvedLanguage === 'en' && a?.en?.[champ]) || a?.[champ];

export const formatDateActu = (iso) =>
  new Date(iso).toLocaleDateString(locale(), { day: 'numeric', month: 'long', year: 'numeric' });