// f237-frontend/src/components/layout/LogoF237.jsx
// Logo officiel F237 (image). Utilisé dans la navbar et le footer.
// ⚠️ Le fichier doit être dans src/assets/. Si ton logo est un .svg ou un .jpg,
//    change simplement l'extension dans l'import ci-dessous.

import logo from '../../assets/logof.png';

// size = hauteur du logo en pixels (la largeur suit automatiquement)
function LogoF237({ size = 36 }) {
  return (
    <img
      src={logo}
      alt="F237"
      draggable={false}
      style={{ height: `${size}px`, width: 'auto', display: 'block', userSelect: 'none' }}
    />
  );
}

export default LogoF237;