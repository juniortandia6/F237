import Navbar from './Navbar';
import LiveScoresBanner from '../LiveScoresBanner';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f0', fontFamily: 'Raleway, sans-serif' }}>
      <Navbar />
      <LiveScoresBanner />
      <main className="max-w-screen-2xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="text-center text-gray-400 py-6 border-t border-gray-200" style={{ fontSize: '16px' }}>
        © 2026 F237 · MTN Elite One & Elite Two
      </footer>
    </div>
  );
};

export default Layout;
