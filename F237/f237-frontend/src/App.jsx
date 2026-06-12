import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AccueilPage from './pages/AccueilPage';
import ClassementPage from './pages/ClassementPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<AccueilPage />} />
          <Route path="/classement" element={<ClassementPage />} />
          <Route path="/matchs" element={<h1 className="text-3xl font-bold text-gray-900">Matchs</h1>} />
          <Route path="/equipes" element={<h1 className="text-3xl font-bold text-gray-900">Équipes</h1>} />
          <Route path="/jouer" element={<h1 className="text-3xl font-bold text-gray-900">Jouer</h1>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;