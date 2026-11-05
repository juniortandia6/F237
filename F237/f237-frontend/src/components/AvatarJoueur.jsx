// f237-frontend/src/components/AvatarJoueur.jsx
// Avatar d'un joueur : sa photo si on en a une, sinon une silhouette générique
// (dessinée en SVG, aucune image à charger). En option, le logo du club en
// petite pastille dans le coin bas-gauche.
// variante="buste" : grand buste détouré, sans cercle, pour le bas des cartes.

import { useId, useState } from 'react';

function Silhouette() {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        <clipPath id={`rond-${id}`}><circle cx="50" cy="50" r="50" /></clipPath>
        <pattern id={`points-${id}`} width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="4.5" cy="4.5" r="1" fill="#dfe3e1" />
        </pattern>
        <linearGradient id={`maillot-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d5d9d7" />
          <stop offset="1" stopColor="#c3c8c5" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="50" fill="#f5f6f6" />
      <g clipPath={`url(#rond-${id})`}>
        <rect width="100" height="100" fill={`url(#points-${id})`} />
        {/* Cou */}
        <path d="M43 50 h14 v13 q-7 5 -14 0 z" fill="#c4c8c6" />
        {/* Épaules + maillot */}
        <path d="M10 104 C12 80 26 69 41 64 L50 75 L59 64 C74 69 88 80 90 104 Z" fill={`url(#maillot-${id})`} />
        {/* Col en V */}
        <path d="M41 64 L50 76 L59 64" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinejoin="round" />
        {/* Écusson */}
        <path d="M65 78 h8 v5.5 q-4 4.5 -8 0 z" fill="#ffffff" />
        {/* Tête */}
        <ellipse cx="50" cy="37" rx="13.5" ry="16.5" fill="#cdd1cf" />
        {/* Cheveux */}
        <path d="M36.5 34 q-1 -17 14 -17.5 q14.5 0 14 15.5 q-3 -7.5 -13.5 -8 q-9.5 0 -14.5 10 z" fill="#b9bebb" />
      </g>
      <circle cx="50" cy="50" r="48.8" fill="none" stroke="#e1e5e3" strokeWidth="2.4" />
    </svg>
  );
}

// Buste "détouré" (sans cercle), posé sur le bas d'une carte comme les photos FIBA
function Buste() {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 120 130" width="100%" height="100%" preserveAspectRatio="xMidYMax meet" aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`maillot-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef1ef" />
          <stop offset="1" stopColor="#cdd4d0" />
        </linearGradient>
        <linearGradient id={`peau-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dde2df" />
          <stop offset="1" stopColor="#c6cdc9" />
        </linearGradient>
      </defs>
      {/* Épaules + maillot */}
      <path d="M2 130 C4 103 21 91 42 86 L60 100 L78 86 C99 91 116 103 118 130 Z" fill={`url(#maillot-${id})`} />
      {/* Ombre du cou sur le maillot */}
      <path d="M45 86 L60 99 L75 86 Q60 92 45 86 Z" fill="rgba(0,0,0,0.08)" />
      {/* Cou */}
      <path d="M50 70 h20 v17 q-10 7 -20 0 z" fill="#bfc6c2" />
      {/* Oreilles */}
      <ellipse cx="41.5" cy="52" rx="3.2" ry="5.5" fill="#c9d0cc" />
      <ellipse cx="78.5" cy="52" rx="3.2" ry="5.5" fill="#c9d0cc" />
      {/* Tête */}
      <ellipse cx="60" cy="49" rx="18" ry="22" fill={`url(#peau-${id})`} />
      {/* Cheveux */}
      <path d="M41.6 45 q-1.6 -23 18.4 -23.6 q19.6 0 18.4 21.4 q-4 -10.5 -18.2 -11 q-12.4 0 -18.6 13.2 z" fill="#aab2ad" />
      {/* Col en V */}
      <path d="M42 86 L60 101 L78 86" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
      {/* Écusson */}
      <path d="M86 105 h10 v7 q-5 6 -10 0 z" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

export default function AvatarJoueur({ photo, logo, taille = 96, ombre = true, variante = 'rond' }) {
  const [photoKo, setPhotoKo] = useState(false);
  const [logoKo, setLogoKo] = useState(false);

  // Variante "buste" : grande image détourée, alignée en bas (cartes de l'accueil)
  if (variante === 'buste') {
    return (
      <span style={{ display: 'block', width: '100%', height: '100%' }}>
        {photo && !photoKo
          ? <img src={photo} alt="" onError={() => setPhotoKo(true)}
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom' }} />
          : <Buste />}
      </span>
    );
  }

  const badge = Math.max(14, Math.round(taille * 0.32));

  return (
    <span style={{ position: 'relative', display: 'inline-block', width: `${taille}px`, height: `${taille}px`, flexShrink: 0 }}>
      <span style={{
        display: 'block', width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
        backgroundColor: '#f5f6f6',
        boxShadow: ombre ? '0 6px 18px rgba(0,0,0,0.25)' : 'none',
      }}>
        {photo && !photoKo
          ? <img src={photo} alt="" onError={() => setPhotoKo(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Silhouette />}
      </span>

      {logo && !logoKo && (
        <span style={{
          position: 'absolute', left: `-${Math.round(badge * 0.15)}px`, bottom: `-${Math.round(badge * 0.05)}px`,
          width: `${badge}px`, height: `${badge}px`, borderRadius: '50%', backgroundColor: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
        }}>
          <img src={logo} alt="" onError={() => setLogoKo(true)}
            style={{ width: '76%', height: '76%', objectFit: 'contain' }} />
        </span>
      )}
    </span>
  );
}