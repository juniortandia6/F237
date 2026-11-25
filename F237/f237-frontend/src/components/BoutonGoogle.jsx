// f237-frontend/src/components/BoutonGoogle.jsx
// Bouton officiel « Continuer avec Google » (Google Identity Services).
// Le script de Google est chargé une seule fois, à la demande. Quand la personne choisit son compte,
// Google renvoie un jeton d'identité (credential) que l'on transmet à onJeton : c'est l'API F237
// qui le vérifie (POST /api/auth/google) et qui donne ensuite le token F237 habituel.
// Sans VITE_GOOGLE_CLIENT_ID dans le .env, le bouton ne s'affiche pas (rien ne casse).

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const CLIENT_ID = import.meta.env?.VITE_GOOGLE_CLIENT_ID ?? '';
const URL_SCRIPT = 'https://accounts.google.com/gsi/client';

let chargementScript = null;
function chargerScriptGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (chargementScript) return chargementScript;
  chargementScript = new Promise((resoudre, rejeter) => {
    const script = document.createElement('script');
    script.src = URL_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => resoudre();
    script.onerror = () => { chargementScript = null; rejeter(new Error('script Google indisponible')); };
    document.head.appendChild(script);
  });
  return chargementScript;
}

/**
 * onJeton(credential) : appelé avec le jeton Google ; doit renvoyer une promesse.
 * texte : 'continue_with' (par défaut) ou 'signup_with'.
 */
export default function BoutonGoogle({ onJeton, texte = 'continue_with' }) {
  const { t, i18n } = useTranslation();
  const conteneur = useRef(null);
  const rappel = useRef(onJeton);
  const [indisponible, setIndisponible] = useState(false);

  // Toujours la dernière version du rappel, sans réinitialiser le bouton à chaque rendu
  useEffect(() => { rappel.current = onJeton; }, [onJeton]);

  useEffect(() => {
    if (!CLIENT_ID) return undefined;
    let annule = false;
    chargerScriptGoogle()
      .then(() => {
        if (annule || !conteneur.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (reponse) => rappel.current?.(reponse.credential),
          ux_mode: 'popup',
          context: texte === 'signup_with' ? 'signup' : 'signin',
        });
        conteneur.current.innerHTML = '';
        window.google.accounts.id.renderButton(conteneur.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: texte,
          logo_alignment: 'center',
          locale: i18n.language?.startsWith('en') ? 'en' : 'fr',
          width: Math.min(conteneur.current.offsetWidth || 360, 400),
        });
      })
      .catch(() => { if (!annule) setIndisponible(true); });
    return () => { annule = true; };
  }, [texte, i18n.language]);

  if (!CLIENT_ID) return null;

  return (
    <div>
      <div ref={conteneur} style={{ display: 'flex', justifyContent: 'center', minHeight: '44px' }} />
      {indisponible && (
        <p style={{ fontSize: '12px', color: '#6b7470', textAlign: 'center', marginTop: '6px' }}>
          {t('auth.google.indisponible')}
        </p>
      )}
    </div>
  );
}

/** Séparateur « ou » entre le bouton Google et le formulaire (rien si Google n'est pas configuré). */
export function SeparateurOu() {
  const { t } = useTranslation();
  if (!CLIENT_ID) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '18px 0', color: '#6b7470', fontSize: '13px', fontWeight: 600 }}>
      <span style={{ flex: 1, height: '1px', backgroundColor: '#dfe5e1' }} />
      {t('auth.google.ou')}
      <span style={{ flex: 1, height: '1px', backgroundColor: '#dfe5e1' }} />
    </div>
  );
}