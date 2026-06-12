import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AccueilPage from './pages/AccueilPage';
import ClassementPage from './pages/ClassementPage';
import MatchsPage from './pages/MatchsPage';
import EquipesPage from './pages/EquipesPage';
import JouerPage from './pages/JouerPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<AccueilPage />} />
          <Route path="/classement" element={<ClassementPage />} />
          <Route path="/matchs" element={<MatchsPage />} />
          <Route path="/equipes" element={<EquipesPage />} />
          <Route path="/jouer" element={<JouerPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;