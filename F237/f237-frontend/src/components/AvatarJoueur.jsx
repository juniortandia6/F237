// f237-frontend/src/components/AvatarJoueur.jsx
// Avatar d'un joueur : sa photo si on en a une (avec l'accord du club), sinon un
// buste générique SANS visage reconnaissable, habillé du maillot de son club :
// couleurs du club, numéro (ou initiales) sur la poitrine. Aucune image à charger.
//
//   <AvatarJoueur club="Colombe" nom="M. Williams" numero={9} />          rond (listes)
//   <AvatarJoueur club="Colombe" nom="M. Williams" variante="buste" />     grand buste (cartes)
//
// En variante ronde, le logo du club peut s'afficher en petite pastille (prop logo).

import { useId, useState } from 'react';
import { couleursClub, texteSur, initialesJoueur, useCouleursClubs } from '../data/couleursClubs';

// Buste dessiné en SVG (viewBox 120 x 130), posé sur le bas
function Buste({ principale, secondaire, inscription }) {
  const id = useId().replace(/:/g, '');
  const couleurTexte = texteSur(principale);
  const long = String(inscription).length;
  return (
    <svg viewBox="0 0 120 130" width="100%" height="100%" preserveAspectRatio="xMidYMax meet" aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        {/* Léger volume sur le maillot */}
        <linearGradient id={`volume-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.18" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.10" />
          <stop offset="0.65" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id={`peau-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dde2df" />
          <stop offset="1" stopColor="#c6cdc9" />
        </linearGradient>
        <clipPath id={`maillot-${id}`}>
          <path d="M2 130 C4 103 21 91 42 86 L60 100 L78 86 C99 91 116 103 118 130 Z" />
        </clipPath>
      </defs>

      {/* Maillot aux couleurs du club */}
      <g clipPath={`url(#maillot-${id})`}>
        <rect x="0" y="80" width="120" height="50" fill={principale} />
        {/* Épaules (raglan) dans la couleur secondaire */}
        <path d="M0 98 C14 90 28 86 42 86 L36 97 C24 99 12 104 0 112 Z" fill={secondaire} opacity="0.9" />
        <path d="M120 98 C106 90 92 86 78 86 L84 97 C96 99 108 104 120 112 Z" fill={secondaire} opacity="0.9" />
        <rect x="0" y="80" width="120" height="50" fill={`url(#volume-${id})`} />
      </g>

      {/* Cou (ombre sur le maillot puis peau) */}
      <path d="M45 86 L60 99 L75 86 Q60 92 45 86 Z" fill="rgba(0,0,0,0.18)" />
      <path d="M50 70 h20 v17 q-10 7 -20 0 z" fill="#bfc6c2" />

      {/* Col en V dans la couleur secondaire */}
      <path d="M42 86 L60 101 L78 86" fill="none" stroke={secondaire} strokeWidth="3.4" strokeLinejoin="round" />

      {/* Numéro (ou initiales) sur la poitrine */}
      <text x="60" y="124" textAnchor="middle"
        fontFamily='"Barlow Condensed", Arial, sans-serif' fontWeight="800"
        fontSize={long > 2 ? 16 : 22} fill={couleurTexte} opacity="0.95">
        {inscription}
      </text>

      {/* Tête : silhouette neutre, sans traits (aucune ressemblance) */}
      <ellipse cx="41.5" cy="52" rx="3.2" ry="5.5" fill="#c9d0cc" />
      <ellipse cx="78.5" cy="52" rx="3.2" ry="5.5" fill="#c9d0cc" />
      <ellipse cx="60" cy="49" rx="18" ry="22" fill={`url(#peau-${id})`} />
      <path d="M41.6 45 q-1.6 -23 18.4 -23.6 q19.6 0 18.4 21.4 q-4 -10.5 -18.2 -11 q-12.4 0 -18.6 13.2 z" fill="#aab2ad" />
    </svg>
  );
}

// couleurs = { principale, secondaire } pour forcer des couleurs (aperçu de l'admin)
export default function AvatarJoueur({ photo, logo, club, nom, numero, taille = 96, ombre = true, variante = 'rond', couleurs }) {
  const [photoKo, setPhotoKo] = useState(false);
  const [logoKo, setLogoKo] = useState(false);
  useCouleursClubs(); // se redessine quand les couleurs saisies dans l'admin sont chargées
  const { principale, secondaire } = couleurs ?? couleursClub(club);
  const inscription = numero ?? initialesJoueur(nom);
  const avecPhoto = photo && !photoKo;

  // Variante "buste" : grande image détourée, alignée en bas (cartes de l'accueil)
  if (variante === 'buste') {
    return (
      <span style={{ display: 'block', width: '100%', height: '100%' }}>
        {avecPhoto
          ? <img src={photo} alt="" onError={() => setPhotoKo(true)}
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom' }} />
          : <Buste principale={principale} secondaire={secondaire} inscription={inscription} />}
      </span>
    );
  }

  // Variante ronde (listes, classement des buteurs)
  const badge = Math.max(14, Math.round(taille * 0.32));
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: `${taille}px`, height: `${taille}px`, flexShrink: 0 }}>
      <span style={{
        display: 'block', width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
        background: avecPhoto ? '#f5f6f6' : 'radial-gradient(circle at 50% 30%, #ffffff 0%, #eef1ef 70%)',
        boxShadow: ombre ? '0 6px 18px rgba(0,0,0,0.25)' : `inset 0 0 0 1.5px ${principale}33`,
      }}>
        {avecPhoto
          ? <img src={photo} alt="" onError={() => setPhotoKo(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          // Buste zoomé pour bien voir le maillot dans le petit rond
          : <span style={{ display: 'block', width: '136%', height: '100%', marginLeft: '-18%', paddingTop: '6%', boxSizing: 'border-box' }}>
              <Buste principale={principale} secondaire={secondaire} inscription={inscription} />
            </span>}
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