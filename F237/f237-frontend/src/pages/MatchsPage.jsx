import { useState, useEffect } from 'react';
import { matchService } from '../services/matchService';

const MatchsPage = () => {
  const [matchs, setMatchs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saisonId, setSaisonId] = useState(1);
  const [filtre, setFiltre] = useState('tous');

  useEffect(() => {
    const fetchMatchs = async () => {
      setLoading(true);
      try {
        const data = await matchService.getBySaison(saisonId);
        setMatchs(data);
      } catch (error) {
        console.error('Erreur matchs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatchs();
  }, [saisonId]);

  const getStatutLabel = (statut) => {
    if (statut === 2) return { label: 'FT', color: '#999' };
    if (statut === 1) return { label: 'LIVE', color: '#CE1126', pulse: true };
    return { label: 'À venir', color: '#1a7a3c' };
  };

  const filtrerMatchs = (matchs) => {
    if (filtre === 'direct') return matchs.filter(m => m.statut === 1);
    if (filtre === 'termine') return matchs.filter(m => m.statut === 2);
    if (filtre === 'avenir') return matchs.filter(m => m.statut === 0);
    return matchs;
  };

  const grouperParDate = (matchs) => {
    const groupes = {};
    matchs.forEach(m => {
      const date = new Date(m.dateMatch).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long'
      }).toUpperCase();
      if (!groupes[date]) groupes[date] = [];
      groupes[date].push(m);
    });
    return groupes;
  };

  const matchsFiltres = filtrerMatchs(matchs);
  const groupes = grouperParDate(matchsFiltres);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-bold tracking-widest uppercase mb-2" style={{ color: '#FCD116', fontSize: '13px' }}>
            Saison 2024
          </p>
          <h1 className="font-black uppercase mb-2" style={{ fontSize: '48px', letterSpacing: '-1px' }}>
            Matchs
          </h1>
          <p className="text-gray-500" style={{ fontSize: '16px' }}>
            Calendrier complet, scores et matchs en direct.
          </p>
        </div>

        {/* Toggle Elite One / Elite Two */}
        <div className="flex items-center rounded-full p-1 mt-2" style={{ backgroundColor: '#e8e8e3', border: '1px solid #d0d0c8' }}>
          <button
            onClick={() => setSaisonId(1)}
            className="px-5 py-2 rounded-full font-bold tracking-widest uppercase transition-all"
            style={{
              fontSize: '13px',
              backgroundColor: saisonId === 1 ? '#1a1a1a' : 'transparent',
              color: saisonId === 1 ? 'white' : '#666',
            }}
          >
            Elite One
          </button>
          <button
            onClick={() => setSaisonId(2)}
            className="px-5 py-2 rounded-full font-bold tracking-widest uppercase transition-all"
            style={{
              fontSize: '13px',
              backgroundColor: saisonId === 2 ? '#1a1a1a' : 'transparent',
              color: saisonId === 2 ? 'white' : '#666',
            }}
          >
            Elite Two
          </button>
        </div>
      </div>

      {/* Filtres statut */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { key: 'tous', label: 'Tous' },
          { key: 'direct', label: 'En direct' },
          { key: 'termine', label: 'Terminés' },
          { key: 'avenir', label: 'À venir' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFiltre(f.key)}
            className="px-4 py-2 rounded-full font-semibold transition-all"
            style={{
              fontSize: '14px',
              backgroundColor: filtre === f.key ? '#1a1a1a' : 'white',
              color: filtre === f.key ? 'white' : '#666',
              border: '1px solid #e0e0d8',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste matchs groupés par date */}
      {loading ? (
        <div className="text-center py-12 text-gray-400" style={{ fontSize: '16px' }}>Chargement...</div>
      ) : (
        Object.entries(groupes).map(([date, matchsGroupe]) => (
          <div key={date} className="mb-8">
            <p className="font-bold tracking-widest uppercase mb-4 text-gray-400" style={{ fontSize: '13px' }}>
              {date}
            </p>
            <div className="flex flex-col gap-3">
              {matchsGroupe.map(m => {
                const statut = getStatutLabel(m.statut);
                return (
                  <div
                    key={m.id}
                    className="bg-white rounded-2xl px-6 py-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    {/* Statut */}
                    <div style={{ minWidth: '60px' }}>
                      {statut.pulse ? (
                        <span className="flex items-center gap-1 font-bold" style={{ color: statut.color, fontSize: '13px' }}>
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"></span>
                          LIVE
                        </span>
                      ) : (
                        <span className="font-semibold" style={{ color: statut.color, fontSize: '13px' }}>{statut.label}</span>
                      )}
                    </div>

                    {/* Équipe domicile */}
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <span className="font-semibold text-gray-900" style={{ fontSize: '16px' }}>
                        {m.equipeDomicile?.nom}
                      </span>
                      {m.equipeDomicile?.logoUrl ? (
                        <img
                          src={m.equipeDomicile.logoUrl}
                          alt={m.equipeDomicile.nom}
                          className="object-contain"
                          style={{ width: '36px', height: '36px', backgroundColor: '#f0f0f0', padding: '2px', borderRadius: '50%' }}
                        />
                      ) : (
                        <div className="flex items-center justify-center rounded-full bg-gray-200 font-black text-gray-500"
                          style={{ width: '36px', height: '36px', fontSize: '11px' }}>
                          {m.equipeDomicile?.nom?.substring(0, 2)}
                        </div>
                      )}
                    </div>

                    {/* Score */}
                    <div className="px-6 text-center" style={{ minWidth: '100px' }}>
                      {m.statut === 0 ? (
                        <span className="font-bold text-gray-400" style={{ fontSize: '20px' }}>—:—</span>
                      ) : (
                        <span className="font-black text-gray-900" style={{ fontSize: '22px' }}>
                          {m.scoreDomicile} : {m.scoreExterieur}
                        </span>
                      )}
                    </div>

                    {/* Équipe extérieur */}
                    <div className="flex items-center gap-3 flex-1">
                      {m.equipeExterieur?.logoUrl ? (
                        <img
                          src={m.equipeExterieur.logoUrl}
                          alt={m.equipeExterieur.nom}
                          className="object-contain"
                          style={{ width: '36px', height: '36px', backgroundColor: '#f0f0f0', padding: '2px', borderRadius: '50%' }}
                        />
                      ) : (
                        <div className="flex items-center justify-center rounded-full bg-gray-200 font-black text-gray-500"
                          style={{ width: '36px', height: '36px', fontSize: '11px' }}>
                          {m.equipeExterieur?.nom?.substring(0, 2)}
                        </div>
                      )}
                      <span className="font-semibold text-gray-900" style={{ fontSize: '16px' }}>
                        {m.equipeExterieur?.nom}
                      </span>
                    </div>

                    {/* Heure */}
                    <div style={{ minWidth: '60px', textAlign: 'right' }}>
                      <span className="text-gray-400" style={{ fontSize: '14px' }}>
                        {new Date(m.dateMatch).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MatchsPage;