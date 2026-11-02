import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import AccueilPage from './pages/AccueilPage';
import ClassementPage from './pages/ClassementPage';
import MatchsPage from './pages/MatchsPage';
import MatchDetailPage from './pages/MatchDetailPage';
import EquipesPage from './pages/EquipesPage';
import EquipeDetailPage from './pages/EquipeDetailPage';
import JouerPage from './pages/JouerPage';  
import ActualitesPage from './pages/ActualitesPage';
import ActualiteDetailPage from './pages/ActualiteDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilPage from './pages/ProfilPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<AccueilPage />} />
            <Route path="/classement" element={<ClassementPage />} />
            <Route path="/matchs" element={<MatchsPage />} />
            <Route path="/matchs/:id" element={<MatchDetailPage />} />
            <Route path="/equipes" element={<EquipesPage />} />
            <Route path="/equipes/:id" element={<EquipeDetailPage />} />
            <Route path="/jouer" element={<JouerPage />} />
            <Route path="/actualites" element={<ActualitesPage />} />
            <Route path="/actualites/:slug" element={<ActualiteDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profil" element={<ProfilPage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;