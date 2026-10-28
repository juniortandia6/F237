// f237-frontend/src/components/layout/Layout.jsx
import Navbar from './Navbar';
import LiveScoresBanner from '../LiveScoresBanner';
import Footer from './Footer';
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

      <Footer />
    </div>
  );
};

export default Layout;