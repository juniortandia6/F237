// f237-frontend/src/components/layout/Layout.jsx
import Navbar from './Navbar';
import LiveScoresBanner from '../LiveScoresBanner';
import LogoF237 from './LogoF237';
import theme from '../../theme';

const Layout = ({ children }) => {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: 'Raleway, sans-serif' }}
    >
      <Navbar />
      <LiveScoresBanner />

      <main className="flex-1">
        {children}
      </main>

      <footer style={{ backgroundColor: theme.bgDeep, borderTop: `1px solid ${theme.border}` }}>
        {/* Liseré tricolore */}
        <div style={{ display: 'flex', height: '3px' }}>
          <div style={{ flex: 1, backgroundColor: theme.green }} />
          <div style={{ flex: 1, backgroundColor: theme.red }} />
          <div style={{ flex: 1, backgroundColor: theme.yellow }} />
        </div>

        <div
          style={{
            maxWidth: '1150px', margin: '0 auto', padding: '28px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <LogoF237 size={26} />
            <span style={{ fontSize: '13px', color: theme.textMuted }}>
              Le pouls du football camerounais
            </span>
          </div>
          <span style={{ fontSize: '12px', color: theme.textFaint }}>
            © 2026 F237 · Tous droits réservés
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;