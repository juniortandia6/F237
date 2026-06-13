import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { equipeService } from '../services/equipeService';

const EquipesPage = () => {
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [division, setDivision] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEquipes = async () => {
      setLoading(true);
      try {
        const data = await equipeService.getAll();
        setEquipes(data);
      } catch (error) {
        console.error('Erreur équipes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipes();
  }, []);

  const equipesFiltrees = equipes.filter(e => e.division === division);

  const getInitiales = (nom) => {
    return nom.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
  };

  const couleurs = [
    '#1a7a3c', '#CE1126', '#FCD116', '#1a3a7a', '#7a1a6a',
    '#1a6a7a', '#7a4a1a', '#4a7a1a', '#6a1a1a', '#1a1a7a'
  ];

  const getCouleur = (id) => couleurs[id % couleurs.length];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-bold tracking-widest uppercase mb-2" style={{ color: '#FCD116', fontSize: '13px' }}>
            Saison 2026
          </p>
          <h1 className="font-black uppercase mb-2" style={{ fontSize: '48px', letterSpacing: '-1px' }}>
            Équipes
          </h1>
          <p className="text-gray-500" style={{ fontSize: '16px' }}>
            Tous les clubs des ligues MTN Elite One et Elite Two.
          </p>
        </div>

        {/* Toggle Elite One / Elite Two */}
        <div className="flex items-center rounded-full p-1 mt-2" style={{ backgroundColor: '#e8e8e3', border: '1px solid #d0d0c8' }}>
          <button
            onClick={() => setDivision(0)}
            className="px-5 py-2 rounded-full font-bold tracking-widest uppercase transition-all"
            style={{
              fontSize: '13px',
              backgroundColor: division === 0 ? '#1a1a1a' : 'transparent',
              color: division === 0 ? 'white' : '#666',
            }}
          >
            Elite One
          </button>
          <button
            onClick={() => setDivision(1)}
            className="px-5 py-2 rounded-full font-bold tracking-widest uppercase transition-all"
            style={{
              fontSize: '13px',
              backgroundColor: division === 1 ? '#1a1a1a' : 'transparent',
              color: division === 1 ? 'white' : '#666',
            }}
          >
            Elite Two
          </button>
        </div>
      </div>

      {/* Grid équipes */}
      {loading ? (
        <div className="text-center py-12 text-gray-400" style={{ fontSize: '16px' }}>Chargement...</div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {equipesFiltrees.map(e => (
            <div
              key={e.id}
              onClick={() => navigate(`/equipes/${e.id}`)}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center text-center"
              style={{ border: '1px solid #f0f0e8' }}
            >
              {/* Logo ou avatar */}
              {e.logoUrl ? (
                <img
                  src={e.logoUrl}
                  alt={e.nom}
                  className="object-contain mb-4"
                  style={{ width: '72px', height: '72px' }}
                />
              ) : (
                <div
                  className="flex items-center justify-center rounded-full mb-4 font-black text-white"
                  style={{
                    width: '72px',
                    height: '72px',
                    backgroundColor: getCouleur(e.id),
                    fontSize: '20px'
                  }}
                >
                  {getInitiales(e.nom)}
                </div>
              )}

              {/* Nom */}
              <p className="font-black uppercase text-gray-900 mb-1" style={{ fontSize: '13px', letterSpacing: '0.5px' }}>
                {e.nom}
              </p>

              {/* Badge division */}
              <span
                className="px-3 py-1 rounded-full font-bold uppercase tracking-widest mt-2"
                style={{
                  fontSize: '11px',
                  backgroundColor: division === 0 ? '#e8f5ee' : '#fff3cd',
                  color: division === 0 ? '#1a7a3c' : '#856404'
                }}
              >
                {division === 0 ? 'Elite One' : 'Elite Two'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipesPage;
