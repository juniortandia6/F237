// f237-frontend/src/components/layout/LogoF237.jsx
// Logo F237 en texte : F blanc + 2 vert + 3 rouge + 7 jaune.
// Remplace logo2.png (fond blanc + F noir, illisible sur fond sombre).

import theme from '../../theme';

function LogoF237({ size = 30 }) {
  const lettre = (char, color) => (
    <span style={{ color }}>{char}</span>
  );

  return (
    <span
      style={{
        fontFamily: '"Barlow Condensed", "Arial Narrow", Arial, sans-serif',
        fontWeight: 800,
        fontSize: `${size}px`,
        letterSpacing: '-0.5px',
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'baseline',
        userSelect: 'none',
      }}
      aria-label="F237"
    >
      {lettre('F', '#ffffff')}
      {lettre('2', theme.greenBright)}
      {lettre('3', theme.red)}
      {lettre('7', theme.yellow)}
    </span>
  );
}

export default LogoF237;