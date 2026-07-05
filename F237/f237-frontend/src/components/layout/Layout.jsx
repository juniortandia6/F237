import Navbar from './Navbar';
import LiveScoresBanner from '../LiveScoresBanner';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#cfcdcc', fontFamily: 'Raleway, sans-serif' }}>
      <Navbar />
      <LiveScoresBanner />
      <main>
        {children}
      </main>
      <footer className="text-center py-6" style={{ fontSize: '14px', color: '#888', borderTop: '1px solid #b8b6b5' }}>
        © 2026 F237 · MTN Elite One & Elite Two
      </footer>
    </div>
  );
};

export default Layout;
