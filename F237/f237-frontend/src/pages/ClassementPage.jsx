import { useState, useEffect } from 'react';
import { classementService } from '../services/classementService';

const ClassementPage = () => {
  const [classement, setClassement] = useState([]);
  const [formes, setFormes] = useState({});
  const [loading, setLoading] = useState(true);
  const [saisonId, setSaisonId] = useState(3);

  useEffect(() => {
    const fetchClassement = async () => {
      setLoading(true);
      try {
        const data = await classementService.getBySaison(saisonId);
        setClassement(data);

        const formesData = {};
        await Promise.all(data.map(async (c) => {
          try {
            const forme = await classementService.getForme(c.equipeId, saisonId);
            formesData[c.equipeId] = forme;
          } catch {
            formesData[c.equipeId] = [];
          }
        }));
        setFormes(formesData);
      } catch (error) {
        console.error('Erreur classement:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClassement();
  }, [saisonId]);

  const getFormeColor = (r) => {
    if (r === 'W') return { backgroundColor: '#1a7a3c', color: 'white' };
    if (r === 'L') return { backgroundColor: '#CE1126', color: 'white' };
    return { backgroundColor: '#aaa', color: 'white' };
  };

  const getFormeLabel = (r) => {
    if (r === 'W') return 'W';
    if (r === 'L') return 'L';
    return '—';
  };

  const getZoneColor = (pos) => {
    if (pos <= 3) return '#1a7a3c';
    if (pos >= classement.length - 1) return '#CE1126';
    return 'transparent';
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-bold tracking-widest uppercase mb-2" style={{ color: '#FCD116', fontSize: '13px' }}>
            Saison 2026
          </p>
          <h1 className="font-black uppercase mb-2" style={{ fontSize: '48px', letterSpacing: '-1px' }}>
            Classement
          </h1>
          <p className="text-gray-500" style={{ fontSize: '16px' }}>
            Saison 2026 — mis à jour régulièrement.
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

      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 rounded-full inline-block" style={{ backgroundColor: '#1a7a3c' }}></span>
          <span className="text-gray-500 font-semibold uppercase tracking-widest" style={{ fontSize: '12px' }}>Zone Promotion</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 rounded-full inline-block" style={{ backgroundColor: '#CE1126' }}></span>
          <span className="text-gray-500 font-semibold uppercase tracking-widest" style={{ fontSize: '12px' }}>Zone Relégation</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="grid px-6 py-3 border-b border-gray-100" style={{
          gridTemplateColumns: '40px 1fr 60px 60px 60px 60px 70px 70px 70px 80px 140px',
          fontSize: '12px', color: '#999', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase'
        }}>
          <span>#</span><span>Équipe</span>
          <span className="text-center">J</span><span className="text-center">V</span>
          <span className="text-center">N</span><span className="text-center">D</span>
          <span className="text-center">BP</span><span className="text-center">BC</span>
          <span className="text-center">DB</span><span className="text-center">PTS</span>
          <span className="text-right">Forme</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Chargement...</div>
        ) : classement.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Aucune donnée disponible</div>
        ) : (
          classement.map((c) => (
            <div key={c.id} className="grid px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors items-center"
              style={{ gridTemplateColumns: '40px 1fr 60px 60px 60px 60px 70px 70px 70px 80px 140px' }}>
              <div className="flex items-center gap-2">
                <span className="w-1 h-6 rounded-full" style={{ backgroundColor: getZoneColor(c.position), minWidth: '4px' }}></span>
                <span className="font-bold text-gray-700" style={{ fontSize: '16px' }}>{c.position}</span>
              </div>
              <div className="flex items-center gap-3">
                <img src={c.equipe?.logoUrl} alt={c.equipe?.nom} className="rounded-full object-contain"
                  style={{ width: '32px', height: '32px', backgroundColor: '#f0f0f0', padding: '2px' }} />
                <span className="font-semibold text-gray-900" style={{ fontSize: '16px' }}>{c.equipe?.nom}</span>
              </div>
              <span className="text-center text-gray-600" style={{ fontSize: '16px' }}>{c.matchsJoues}</span>
              <span className="text-center font-medium" style={{ fontSize: '16px', color: '#1a7a3c' }}>{c.victoires}</span>
              <span className="text-center text-gray-500" style={{ fontSize: '16px' }}>{c.nuls}</span>
              <span className="text-center" style={{ fontSize: '16px', color: '#CE1126' }}>{c.defaites}</span>
              <span className="text-center text-gray-600" style={{ fontSize: '16px' }}>{c.butsPour}</span>
              <span className="text-center text-gray-600" style={{ fontSize: '16px' }}>{c.butsContre}</span>
              <span className="text-center font-medium" style={{ fontSize: '16px', color: c.differenceDesButs > 0 ? '#1a7a3c' : c.differenceDesButs < 0 ? '#CE1126' : '#666' }}>
                {c.differenceDesButs > 0 ? `+${c.differenceDesButs}` : c.differenceDesButs}
              </span>
              <span className="text-center font-black text-gray-900" style={{ fontSize: '20px' }}>{c.points}</span>
              <div className="flex items-center justify-end gap-1">
                {(formes[c.equipeId] || []).map((r, i) => (
                  <span key={i} className="flex items-center justify-center font-black"
                    style={{
                      ...getFormeColor(r),
                      width: '22px',
                      height: '22px',
                      fontSize: r === 'D' ? '14px' : '11px',
                      borderRadius: '4px',
                      fontWeight: '900',
                    }}>
                    {getFormeLabel(r)}
                  </span>
                ))}
                {(formes[c.equipeId] || []).length === 0 && (
                  <span className="text-gray-300" style={{ fontSize: '12px' }}>—</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClassementPage;