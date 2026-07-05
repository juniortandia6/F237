import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, Calendar, Mail, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

function ProfilPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    authService.getProfil()
      .then(data => {
        setProfil(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">Chargement...</p>
      </div>
    );
  }

  if (!profil) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">Impossible de charger le profil.</p>
      </div>
    );
  }

  const fcfaDispo = Math.floor((profil.soldePoints ?? 0) / 1000) * 500;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header profil */}
      <div className="bg-white rounded-2xl p-8 shadow-sm mb-6 flex items-center justify-between"
        style={{ border: '1px solid #f0f0e8' }}>
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="flex items-center justify-center rounded-full font-black text-white text-2xl"
            style={{ width: '72px', height: '72px', backgroundColor: '#1a7a3c' }}>
            {profil.prenom?.[0]}{profil.nom?.[0]}
          </div>
          <div>
            <h1 className="font-black text-gray-900" style={{ fontSize: '28px' }}>
              {profil.prenom} {profil.nom}
            </h1>
            <div className="flex items-center gap-2 text-gray-400 mt-1">
              <Mail size={14} />
              <span style={{ fontSize: '14px' }}>{profil.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 mt-1">
              <Calendar size={14} />
              <span style={{ fontSize: '14px' }}>
                Membre depuis {new Date(profil.dateInscription).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
          style={{ fontSize: '14px' }}>
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center" style={{ border: '1px solid #f0f0e8' }}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl mx-auto mb-3"
            style={{ backgroundColor: '#FCD116' }}>
            <Trophy size={18} color="#000" />
          </div>
          <p className="font-black text-gray-900" style={{ fontSize: '24px' }}>
            {profil.soldePoints?.toLocaleString()}
          </p>
          <p className="text-gray-400 font-semibold uppercase tracking-widest mt-1" style={{ fontSize: '11px' }}>
            Points
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm text-center" style={{ border: '1px solid #f0f0e8' }}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl mx-auto mb-3"
            style={{ backgroundColor: '#1a7a3c' }}>
            <User size={18} color="white" />
          </div>
          <p className="font-black text-gray-900" style={{ fontSize: '24px' }}>
            #{profil.classementGeneral}
          </p>
          <p className="text-gray-400 font-semibold uppercase tracking-widest mt-1" style={{ fontSize: '11px' }}>
            Classement
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm text-center" style={{ border: '1px solid #f0f0e8' }}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl mx-auto mb-3"
            style={{ backgroundColor: '#CE1126' }}>
            <TrendingUp size={18} color="white" />
          </div>
          <p className="font-black text-gray-900" style={{ fontSize: '24px' }}>
            {profil.nbParis}
          </p>
          <p className="text-gray-400 font-semibold uppercase tracking-widest mt-1" style={{ fontSize: '11px' }}>
            Paris
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm text-center" style={{ border: '1px solid #f0f0e8' }}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl mx-auto mb-3"
            style={{ backgroundColor: '#1a3a7a' }}>
            <TrendingUp size={18} color="white" />
          </div>
          <p className="font-black text-gray-900" style={{ fontSize: '24px' }}>
            {profil.nbParis > 0 ? `${profil.tauxReussite}%` : '—'}
          </p>
          <p className="text-gray-400 font-semibold uppercase tracking-widest mt-1" style={{ fontSize: '11px' }}>
            Réussite
          </p>
        </div>
      </div>

      {/* Convertir points */}
      <div className="rounded-2xl p-6 mb-6 flex items-center justify-between"
        style={{ backgroundColor: '#fdf9e8', border: '1px solid #f0e8a0' }}>
        <div>
          <p className="font-black uppercase tracking-wide mb-1" style={{ fontSize: '15px' }}>
            Convertir mes points
          </p>
          <p className="text-gray-500" style={{ fontSize: '13px' }}>1 000 points = 500 FCFA via MTN Mobile Money</p>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-black text-gray-900" style={{ fontSize: '40px' }}>{fcfaDispo}</span>
            <span className="text-gray-500 font-semibold" style={{ fontSize: '16px' }}>FCFA dispo</span>
          </div>
        </div>
        <button
          className="py-3 px-6 rounded-xl font-bold text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: '#1a1a1a', fontSize: '15px' }}>
          Demander un retrait
        </button>
      </div>

      {/* Historique paris */}
      <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #f0f0e8' }}>
        <h2 className="font-black text-gray-900 mb-4" style={{ fontSize: '20px' }}>
          Historique des paris
        </h2>
        {profil.nbParis === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 font-semibold" style={{ fontSize: '15px' }}>
              Vous n'avez pas encore placé de paris.
            </p>
            <p className="text-gray-300 mt-1" style={{ fontSize: '13px' }}>
              Rendez-vous sur la page Jouer pour commencer !
            </p>
          </div>
        ) : (
          <p className="text-gray-400">Historique à venir...</p>
        )}
      </div>
    </div>
  );
}

export default ProfilPage;
