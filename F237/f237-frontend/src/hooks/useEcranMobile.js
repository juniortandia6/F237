// f237-frontend/src/hooks/useEcranMobile.js
// true quand l'écran fait moins de 768px de large (téléphone), mis à jour quand on tourne
// le téléphone ou redimensionne la fenêtre. Sert aux pages écrites en styles en ligne,
// où les classes Tailwind "md:" ne peuvent pas remplacer une valeur.
import { useSyncExternalStore } from 'react';

const REQUETE = '(max-width: 767px)';

function abonner(rappel) {
  const mq = window.matchMedia(REQUETE);
  mq.addEventListener('change', rappel);
  return () => mq.removeEventListener('change', rappel);
}

const lire = () => window.matchMedia(REQUETE).matches;

export function useEcranMobile() {
  return useSyncExternalStore(abonner, lire, () => false);
}