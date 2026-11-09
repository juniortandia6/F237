// f237-frontend/src/components/layout/Layout.jsx
// Structure commune à toutes les pages : barre de navigation, bandeau des
// scores en direct, contenu de la page, pied de page.
import Navbar from './Navbar';
import LiveScoresBanner from '../LiveScoresBanner';
import Footer from './Footer';
import theme from '../../theme';

const Layout = ({ children }) => {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: 'var(--font-texte)' }}
    >
      <Navbar />
      <LiveScoresBanner />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;