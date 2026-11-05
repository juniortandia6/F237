// f237-frontend/src/hooks/useActualites.js
// Liste des actualités, chargée une seule fois et partagée entre l'accueil
// (hero + "Dernières nouvelles"), la page /actualites et la page article.
// Rechargée si elle a plus de 5 minutes quand une nouvelle page l'utilise.

import { useEffect, useSyncExternalStore } from 'react';
import { articleService } from '../services/articleService';
import { normaliserArticle } from '../data/actualites';

const DUREE_CACHE = 5 * 60 * 1000;

let etat = { articles: [], chargement: true, erreur: false };
let chargeLe = 0;
let enCours = null;
const abonnes = new Set();

function publier(nouvelEtat) {
  etat = nouvelEtat;
  abonnes.forEach(f => f());
}

/** Recharge la liste depuis l'API (appelé tout seul ; utile aussi après une publication). */
export function rechargerActualites() {
  if (enCours) return enCours;
  enCours = articleService.getAll()
    .then(liste => {
      chargeLe = Date.now();
      publier({ articles: liste.map(normaliserArticle), chargement: false, erreur: false });
    })
    .catch(() => {
      // On garde les articles déjà affichés s'il y en a
      publier({ ...etat, chargement: false, erreur: true });
    })
    .finally(() => { enCours = null; });
  return enCours;
}

const sAbonner = (f) => { abonnes.add(f); return () => abonnes.delete(f); };
const lireEtat = () => etat;

/** { articles, chargement, erreur } */
export function useActualites() {
  const valeur = useSyncExternalStore(sAbonner, lireEtat, lireEtat);

  useEffect(() => {
    if (Date.now() - chargeLe > DUREE_CACHE) rechargerActualites();
  }, []);

  return valeur;
}