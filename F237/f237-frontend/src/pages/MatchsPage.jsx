import { useState, useEffect, useRef } from 'react';
import { matchService } from '../services/matchService';

const MatchsPage = () => {
  const [matchs, setMatchs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saisonId, setSaisonId] = useState(3);
  const [filtre, setFiltre] = useState('tous');
  const aujourdhuiRef = useRef(null);

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

  useEffect(() => {
    if (!loading && aujourdhuiRef.current) {
      setTimeout(() => {
        aujourdhuiRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [loading]);

  const getStatutLabel = (statut) => {
    if (statut === 2) return { label: 'FT', color: '#999' };
    if (statut === 1) return { label: 'LIVE', color: '#CE1126', pulse: true };
    return { label: 'À venir', color: '#1a7a3c' };
  };

  const filtrerMatchs = (matchs) => {
    const maintenant = new Date();
    const matchsValides = matchs.filter(m => {
      const dateMatch = new Date(m.dateMatch);
      if (dateMatch < maintenant && m.statut === 0 && m.scoreDomicile === null) return false;
      return true;
    });

    if (filtre === 'direct') return matchsValides.filter(m => m.statut === 1);
    if (filtre === 'termine') return matchsValides.filter(m => m.statut === 2);
    if (filtre === 'avenir') return matchsValides.filter(m => m.statut === 0);
    return matchsValides;
  };

  const grouperParDate = (matchs) => {
    const groupes = {};

    matchs.forEach(m => {
      const dateKey = new Date(m.dateMatch).toISOString().split('T')[0];
      const dateLabel = new Date(m.dateMatch).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long'
      }).toUpperCase();

      if (!groupes[dateKey]) groupes[dateKey] = { label: dateLabel, matchs: [] };
      groupes[dateKey].matchs.push(m);
    });

    const avenir = Object.entries(groupes)
      .filter(([, g]) => g.matchs.some(m => m.statut === 0 || m.statut === 1))
      .sort(([a], [b]) => a.localeCompare(b));

    const termines = Object.entries(groupes)
      .filter(([, g]) => g.matchs.every(m => m.statut === 2))
      .sort(([a], [b]) => b.localeCompare(a));

    return [...avenir, ...termines];
  };

  const matchsFiltres = filtrerMatchs(matchs);
  const groupes = grouperParDate(matchsFiltres);

  const aujourd = new Date().toISOString().split('T')[0];
  const dateProche = groupes.find(([dateKey]) => dateKey >= aujourd)?.[0] || groupes[0]?.[0];

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-bold tracking-widest uppercase mb-2" style={{ color: '#FCD116', fontSize: '13px' }}>
            Saison 2026
          </p>
          <h1 className="font-black uppercase mb-2" style={{ fontSize: '48px', letterSpacing: '-1px' }}>
            Matchs
          </h1>
          <p className="text-gray-500" style={{ fontSize: '16px' }}>
            Calendrier complet, scores et matchs en direct.
          </p>
        </div>

        <div className="flex items-center rounded-full p-1 mt-2" style={{ backgroundColor: '#e8e8e3', border: '1px solid #d0d0c8' }}>
          <button onClick={() => setSaisonId(3)} className="px-5 py-2 rounded-full font-bold tracking-widest uppercase transition-all"
            style={{ fontSize: '13px', backgroundColor: saisonId === 3 ? '#1a1a1a' : 'transparent', color: saisonId === 3 ? 'white' : '#666' }}>
            Elite One
          </button>
          <button onClick={() => setSaisonId(4)} className="px-5 py-2 rounded-full font-bold tracking-widest uppercase transition-all"
            style={{ fontSize: '13px', backgroundColor: saisonId === 4 ? '#1a1a1a' : 'transparent', color: saisonId === 4 ? 'white' : '#666' }}>
            Elite Two
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {[
          { key: 'tous', label: 'Tous' },
          { key: 'direct', label: 'En direct' },
          { key: 'termine', label: 'Terminés' },
          { key: 'avenir', label: 'À venir' },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltre(f.key)}
            className="px-4 py-2 rounded-full font-semibold transition-all"
            style={{
              fontSize: '14px',
              backgroundColor: filtre === f.key ? '#1a1a1a' : 'white',
              color: filtre === f.key ? 'white' : '#666',
              border: '1px solid #e0e0d8',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : (
        groupes.map(([dateKey, groupe]) => (
          <div key={dateKey} className="mb-8" ref={dateKey === dateProche ? aujourdhuiRef : null}>
            <div className="flex items-center gap-3 mb-4">
              <p className="font-bold tracking-widest uppercase text-gray-400" style={{ fontSize: '13px' }}>
                {groupe.label}
              </p>
              {dateKey === aujourd && (
                <span className="px-2 py-1 rounded-full font-bold text-white uppercase"
                  style={{ backgroundColor: '#1a7a3c', fontSize: '10px', letterSpacing: '1px' }}>
                  Aujourd'hui
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {groupe.matchs.map(m => {
                const statut = getStatutLabel(m.statut);
                return (
                  <div key={m.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    {/* Ligne principale */}
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div style={{ minWidth: '60px' }}>
                        {statut.pulse ? (
                          <span className="flex items-center gap-1 font-bold" style={{ color: statut.color, fontSize: '13px' }}>
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"></span>LIVE
                          </span>
                        ) : (
                          <span className="font-semibold" style={{ color: statut.color, fontSize: '13px' }}>{statut.label}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <span className="font-semibold text-gray-900" style={{ fontSize: '16px' }}>{m.equipeDomicile?.nom}</span>
                        {m.equipeDomicile?.logoUrl ? (
                          <img src={m.equipeDomicile.logoUrl} alt={m.equipeDomicile.nom} className="object-contain"
                            style={{ width: '36px', height: '36px', backgroundColor: '#f0f0f0', padding: '2px', borderRadius: '50%' }} />
                        ) : (
                          <div className="flex items-center justify-center rounded-full bg-gray-200 font-black text-gray-500"
                            style={{ width: '36px', height: '36px', fontSize: '11px' }}>
                            {m.equipeDomicile?.nom?.substring(0, 2)}
                          </div>
                        )}
                      </div>

                      <div className="px-6 text-center" style={{ minWidth: '100px' }}>
                        {m.statut === 0 ? (
                          <span className="font-bold text-gray-400" style={{ fontSize: '20px' }}>—:—</span>
                        ) : (
                          <span className="font-black text-gray-900" style={{ fontSize: '22px' }}>
                            {m.scoreDomicile} : {m.scoreExterieur}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-1">
                        {m.equipeExterieur?.logoUrl ? (
                          <img src={m.equipeExterieur.logoUrl} alt={m.equipeExterieur.nom} className="object-contain"
                            style={{ width: '36px', height: '36px', backgroundColor: '#f0f0f0', padding: '2px', borderRadius: '50%' }} />
                        ) : (
                          <div className="flex items-center justify-center rounded-full bg-gray-200 font-black text-gray-500"
                            style={{ width: '36px', height: '36px', fontSize: '11px' }}>
                            {m.equipeExterieur?.nom?.substring(0, 2)}
                          </div>
                        )}
                        <span className="font-semibold text-gray-900" style={{ fontSize: '16px' }}>{m.equipeExterieur?.nom}</span>
                      </div>

                      <div style={{ minWidth: '60px', textAlign: 'right' }}>
                        <span className="text-gray-400" style={{ fontSize: '14px' }}>
                          {new Date(m.dateMatch).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Section buteurs */}
                    {m.statut === 2 && m.buts && m.buts.length > 0 && (
                      <div className="px-6 pb-4 border-t border-gray-50">
                        <div className="flex gap-4 pt-3">
                          {/* Buts domicile */}
                          <div className="flex-1 flex flex-col gap-1 items-end">
                            {m.buts
                              .filter(b => b.nomEquipe === m.equipeDomicile?.nom)
                              .map((b, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  {b.nomJoueur && b.nomJoueur !== 'Inconnu' && (
                                    <span className="text-gray-600" style={{ fontSize: '13px' }}>
                                      {b.nomJoueur}
                                      {b.estButCSC && <span className="ml-1" style={{ color: '#CE1126', fontSize: '11px' }}>(CSC)</span>}
                                      {b.estPenalty && <span className="ml-1" style={{ color: '#1a7a3c', fontSize: '11px' }}>(pen.)</span>}
                                    </span>
                                  )}
                                  <span style={{ fontSize: '12px' }}>⚽</span>
                                  <span className="text-gray-400 font-semibold" style={{ fontSize: '12px' }}>{b.minute}'</span>
                                </div>
                              ))}
                          </div>

                          {/* Séparateur central */}
                          <div style={{ width: '100px' }}></div>

                          {/* Buts extérieur */}
                          <div className="flex-1 flex flex-col gap-1">
                            {m.buts
                              .filter(b => b.nomEquipe === m.equipeExterieur?.nom)
                              .map((b, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <span className="text-gray-400 font-semibold" style={{ fontSize: '12px' }}>{b.minute}'</span>
                                  <span style={{ fontSize: '12px' }}>⚽</span>
                                  {b.nomJoueur && b.nomJoueur !== 'Inconnu' && (
                                    <span className="text-gray-600" style={{ fontSize: '13px' }}>
                                      {b.nomJoueur}
                                      {b.estButCSC && <span className="ml-1" style={{ color: '#CE1126', fontSize: '11px' }}>(CSC)</span>}
                                      {b.estPenalty && <span className="ml-1" style={{ color: '#1a7a3c', fontSize: '11px' }}>(pen.)</span>}
                                    </span>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
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