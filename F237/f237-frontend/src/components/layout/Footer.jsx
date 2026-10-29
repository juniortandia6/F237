// f237-frontend/src/components/layout/Footer.jsx
// Footer inspiré de FIBA : marque + newsletter + réseaux | liens | compétitions,
// puis barre légale. Icônes réseaux : react-icons (npm install react-icons).

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, Check } from 'lucide-react';
import { FaYoutube, FaInstagram, FaFacebookF, FaXTwitter, FaTiktok, FaWhatsapp } from 'react-icons/fa6';
import LogoF237 from './LogoF237';
import logo from '../../assets/logof.png';
import theme from '../../theme';

// Remplace les "#" par tes vrais comptes quand ils existeront
const RESEAUX = [
  { label: 'YouTube', Icon: FaYoutube, href: '#' },
  { label: 'Instagram', Icon: FaInstagram, href: '#' },
  { label: 'Facebook', Icon: FaFacebookF, href: '#' },
  { label: 'X', Icon: FaXTwitter, href: '#' },
  { label: 'TikTok', Icon: FaTiktok, href: '#' },
  { label: 'WhatsApp', Icon: FaWhatsapp, href: '#' },
];

const LIENS = [
  { label: 'Calendrier et résultats', to: '/matchs' },
  { label: 'Classements', to: '/classement' },
  { label: 'Équipes', to: '/equipes' },
  { label: 'Actualités', to: '/actualites' },
  { label: 'Fantasy & pronostics', to: '/jouer' },
  { label: 'Mon profil', to: '/profil' },
];

const COMPETITIONS = [
  { label: 'MTN Elite One', to: '/classement' },
  { label: 'MTN Elite Two', to: '/classement' },
];

const TITRE_COLONNE = {
  fontSize: '14px', fontWeight: 600, color: theme.textFaint, marginBottom: '14px', letterSpacing: '0.3px',
};

function LigneLien({ to, children }) {
  return (
    <Link to={to} className="group"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
        padding: '13px 0', borderTop: `1px solid ${theme.border}`,
        color: theme.text, fontSize: '16px', fontWeight: 600, textDecoration: 'none',
      }}>
      <span className="transition-transform duration-200 group-hover:translate-x-1">{children}</span>
      <ArrowDownRight size={16}
        className="transition-all duration-200 group-hover:-rotate-45"
        style={{ color: theme.textMuted, flexShrink: 0 }} />
    </Link>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [envoye, setEnvoye] = useState(false);

  // TODO : brancher sur un endpoint backend (ex. POST /api/newsletter) le moment venu
  const envoyer = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setEnvoye(true);
    setEmail('');
  };

  if (envoye) {
    return (
      <p className="flex items-center gap-2" style={{ color: theme.greenBright, fontSize: '14px', fontWeight: 600 }}>
        <Check size={16} /> Merci ! Tu recevras les prochaines nouvelles.
      </p>
    );
  }

  return (
    <form onSubmit={envoyer}
      style={{
        display: 'flex', alignItems: 'center', maxWidth: '320px',
        backgroundColor: theme.surface, border: `1px solid ${theme.borderStrong}`,
        borderRadius: '999px', padding: '4px 4px 4px 16px',
      }}>
      <input
        type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="Ton adresse e-mail" aria-label="Adresse e-mail"
        style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: theme.text, fontSize: '14px' }}
      />
      <button type="submit" aria-label="S'inscrire à la newsletter"
        className="transition-all hover:brightness-110"
        style={{
          width: '36px', height: '36px', borderRadius: '50%', border: 'none', cursor: 'pointer',
          backgroundColor: theme.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
        <ArrowRight size={17} />
      </button>
    </form>
  );
}

function Footer() {
  return (
    <footer style={{ position: 'relative', backgroundColor: theme.bgDeep, overflow: 'hidden' }}>
      {/* Liseré tricolore */}
      <div style={{ display: 'flex', height: '4px' }}>
        <div style={{ flex: 1, backgroundColor: theme.green }} />
        <div style={{ flex: 1, backgroundColor: theme.red }} />
        <div style={{ flex: 1, backgroundColor: theme.yellow }} />
      </div>

      {/* Logo géant en filigrane (très discret, en niveaux de gris) */}
      <img src={logo} alt="" aria-hidden="true" draggable={false} style={{
        position: 'absolute', right: '-40px', bottom: '40px',
        height: '230px', width: 'auto',
        opacity: 0.04, filter: 'grayscale(1) brightness(2)',
        userSelect: 'none', pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', maxWidth: '1150px', margin: '0 auto', padding: '64px 60px 0', boxSizing: 'content-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1.6fr) minmax(0, 1fr)', gap: '56px' }}>

          {/* ── Colonne marque ── */}
          <div>
            <Link to="/" aria-label="Accueil F237"><LogoF237 size={56} /></Link>
            <p style={{ marginTop: '14px', color: theme.textMuted, fontSize: '15px', lineHeight: 1.55, maxWidth: '280px' }}>
              Le pouls du football camerounais : scores en direct, classements et actualités de la MTN Elite One et Elite Two.
            </p>

            <p style={{ ...TITRE_COLONNE, marginTop: '28px', marginBottom: '12px' }}>Reste informé</p>
            <Newsletter />

            <p style={{ ...TITRE_COLONNE, marginTop: '28px', marginBottom: '12px' }}>Médias sociaux</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {RESEAUX.map(({ label, Icon, href }) => (
                <a key={label} href={href} aria-label={label} title={label}
                  target="_blank" rel="noopener noreferrer"
                  className="transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: theme.surface, border: `1px solid ${theme.border}`, color: theme.text,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = theme.green; e.currentTarget.style.borderColor = theme.green; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = theme.surface; e.currentTarget.style.borderColor = theme.border; }}
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Colonne liens ── */}
          <div>
            <p style={TITRE_COLONNE}>Liens</p>
            <div style={{ borderBottom: `1px solid ${theme.border}` }}>
              {LIENS.map(l => <LigneLien key={l.label} to={l.to}>{l.label}</LigneLien>)}
            </div>
          </div>

          {/* ── Colonne compétitions + infos ── */}
          <div>
            <p style={TITRE_COLONNE}>Compétitions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {COMPETITIONS.map(c => (
                <Link key={c.label} to={c.to} className="group"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                    backgroundColor: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '12px',
                    color: theme.text, fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = theme.surfaceHover; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = theme.surface; }}
                >
                  <span style={{ width: '6px', height: '22px', borderRadius: '3px', background: `linear-gradient(${theme.green}, ${theme.red}, ${theme.yellow})` }} />
                  {c.label}
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" style={{ marginLeft: 'auto', color: theme.textMuted }} />
                </Link>
              ))}
            </div>

            <p style={{ ...TITRE_COLONNE, marginTop: '28px' }}></p>
            <p style={{ color: theme.textMuted, fontSize: '14px', lineHeight: 1.6 }}>
              Plateforme indépendante créée par :  {' '}
              <br />
              <a href="https://cyrjunior-tandia.com" target="_blank" rel="noopener noreferrer"
                style={{ color: theme.text, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                Cyr Junior Tandia Mouafou
                <br />
              </a>
              <br />Données fournies par API-Football , plateforme de données sur le football.
            </p>
          </div>
        </div>

        {/* ── Barre légale ── */}
        <div style={{
          marginTop: '56px', padding: '22px 0 28px', borderTop: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <LogoF237 size={26} />
            <span style={{ fontSize: '13px', color: theme.textFaint }}>© {new Date().getFullYear()} F237 · Tous droits réservés</span>
          </div>
          <nav style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            {['Conditions générales', 'Confidentialité', 'Cookies', 'Contact'].map((l, i) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {i > 0 && <span style={{ color: theme.border }}>|</span>}
                <a href="#" className="transition-colors" style={{ fontSize: '13px', color: theme.textMuted, textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.color = theme.text; }}
                  onMouseLeave={e => { e.currentTarget.style.color = theme.textMuted; }}>
                  {l}
                </a>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;