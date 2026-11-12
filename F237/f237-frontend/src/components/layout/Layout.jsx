// f237-frontend/src/components/layout/Layout.jsx
// Structure commune à toutes les pages : barre de navigation, bandeau des
// scores en direct, contenu de la page, pied de page.
import Navbar, { HAUTEUR_ONGLETS } from './Navbar';
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
      {/* Place réservée sous le pied de page pour la barre d'onglets fixe (téléphone / tablette) */}
      <div className="xl:hidden" aria-hidden="true" style={{ height: `calc(${HAUTEUR_ONGLETS}px + env(safe-area-inset-bottom))`, backgroundColor: theme.bgDeep }} />
    </div>
  );
};

export default Layout;