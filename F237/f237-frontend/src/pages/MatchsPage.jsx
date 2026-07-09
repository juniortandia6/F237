import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { matchService } from '../services/matchService';

const MatchsPage = () => {
  const [matchs, setMatchs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saisonId, setSaisonId] = useState(3);
  const [dateSelectionnee, setDateSelectionnee] = useState(null);
  const calRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    matchService.getBySaison(saisonId)
      .then(data => {
        if (!ignore) {
          setMatchs(data);
          setLoading(false);
          const aujourd = new Date().toISOString().split('T')[0];
          const dates = [...new Set(data.map(m => new Date(m.dateMatch).toISOString().split('T')[0]))].sort();
          const proche = dates.find(d => d >= aujourd) ?? dates[dates.length - 1];
          setDateSelectionnee(proche);
        }
      })
      .catch(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [saisonId]);

  const getStatutLabel = (statut) => {
    if (statut === 2) return { label: 'FT', color: '#999' };
    if (statut === 1) return { label: 'LIVE', color: '#CE1126', pulse: true };
    return { label: 'À venir', color: '#1a7a3c' };
  };

  const datesUniques = [...new Set(matchs.map(m => new Date(m.dateMatch).toISOString().split('T')[0]))].sort();
  const matchsDuJour = matchs.filter(m => new Date(m.dateMatch).toISOString().split('T')[0] === dateSelectionnee);
  const aujourd = new Date().toISOString().split('T')[0];

  const scrollCal = (dir) => {
    if (calRef.current) calRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  const formatJour = (dateStr) => {
    const d = new Date(dateStr);
    return {
      annee: d.getFullYear(),
      jourSemaine: d.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase(),
      jour: String(d.getDate()).padStart(2, '0'),
      mois: d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
    };
  };

  // SVG pattern géométrique style FIBA
  const patternStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Crect x='2' y='2' width='18' height='10' rx='2' fill='%23b8b0a0' opacity='0.4'/%3E%3Crect x='24' y='2' width='10' height='10' rx='2' fill='%23b8b0a0' opacity='0.25'/%3E%3Crect x='38' y='2' width='20' height='10' rx='2' fill='%23b8b0a0' opacity='0.3'/%3E%3Crect x='2' y='16' width='10' height='18' rx='2' fill='%23b8b0a0' opacity='0.25'/%3E%3Crect x='16' y='16' width='26' height='10' rx='2' fill='%23b8b0a0' opacity='0.2'/%3E%3Crect x='46' y='16' width='12' height='18' rx='2' fill='%23b8b0a0' opacity='0.3'/%3E%3Crect x='2' y='38' width='30' height='10' rx='2' fill='%23b8b0a0' opacity='0.2'/%3E%3Crect x='36' y='38' width='10' height='10' rx='2' fill='%23b8b0a0' opacity='0.35'/%3E%3Crect x='50' y='38' width='8' height='10' rx='2' fill='%23b8b0a0' opacity='0.2'/%3E%3Crect x='2' y='52' width='8' height='6' rx='2' fill='%23b8b0a0' opacity='0.3'/%3E%3Crect x='14' y='52' width='20' height='6' rx='2' fill='%23b8b0a0' opacity='0.2'/%3E%3Crect x='38' y='52' width='20' height='6' rx='2' fill='%23b8b0a0' opacity='0.25'/%3E%3C/g%3E%3C/svg%3E")`,
    backgroundSize: '120px 120px',
  };

  return (
    <div>
      {/* ── ZONE HAUTE — fond géométrique + calendrier ────────────────────── */}
      <div style={{ backgroundColor: '#cfcdcc', ...patternStyle, padding: '40px 0 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="font-bold tracking-widest uppercase mb-2" style={{ color: '#8B6914', fontSize: '13px' }}>
                Saison 2026
              </p>
              <h1 className="font-black uppercase mb-2" style={{ fontSize: '48px', letterSpacing: '-1px', color: '#1a1a1a' }}>
                Matchs
              </h1>
            </div>

            <div className="flex items-center rounded-full p-1 mt-2" style={{ backgroundColor: '#b8b6b5', border: '1px solid #a8a6a5' }}>
              <button onClick={() => setSaisonId(3)}
                className="px-5 py-2 rounded-full font-bold tracking-widest uppercase transition-all"
                style={{ fontSize: '13px', backgroundColor: saisonId === 3 ? '#1a1a1a' : 'transparent', color: saisonId === 3 ? 'white' : '#555' }}>
                Elite One
              </button>
              <button onClick={() => setSaisonId(4)}
                className="px-5 py-2 rounded-full font-bold tracking-widest uppercase transition-all"
                style={{ fontSize: '13px', backgroundColor: saisonId === 4 ? '#1a1a1a' : 'transparent', color: saisonId === 4 ? 'white' : '#555' }}>
                Elite Two
              </button>
            </div>
          </div>

          {/* Calendrier blanc */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0d8' }}>
            <div className="flex items-center px-4 py-4 gap-2">
              <button onClick={() => scrollCal(-1)}
                style={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f0eeec', border: '1px solid #ddd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={18} color="#444" />
              </button>

              <div ref={calRef} style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', flex: 1 }}>
                {datesUniques.map(date => {
                  const { annee, jourSemaine, jour, mois } = formatJour(date);
                  const isActive = date === dateSelectionnee;
                  const isAujourd = date === aujourd;

                  return (
                    <button
                      key={date}
                      onClick={() => setDateSelectionnee(date)}
                      style={{
                        flexShrink: 0, width: '80px', padding: '10px 8px',
                        borderRadius: '12px', border: 'none', cursor: 'pointer',
                        textAlign: 'center',
                        backgroundColor: isActive ? '#8B6914' : '#f0eeec',
                        color: isActive ? '#fff' : '#444',
                        transition: 'all 0.2s', position: 'relative',
                      }}
                    >
                      <div style={{ fontSize: '10px', fontWeight: 600, marginBottom: '2px', opacity: 0.8 }}>{annee}</div>
                      <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>{jourSemaine}</div>
                      <div style={{ fontSize: '22px', fontWeight: 900, lineHeight: 1 }}>{jour}</div>
                      <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>{mois}</div>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: isActive ? '#FCD116' : '#bbb', margin: '4px auto 0' }} />
                      {isAujourd && !isActive && (
                        <div style={{
                          position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)',
                          backgroundColor: '#1a7a3c', color: '#fff',
                          fontSize: '8px', fontWeight: 700, padding: '1px 6px',
                          borderRadius: '10px', whiteSpace: 'nowrap',
                        }}>
                          Auj.
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <button onClick={() => scrollCal(1)}
                style={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f0eeec', border: '1px solid #ddd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={18} color="#444" />
              </button>
            </div>

            {/* Barre bas calendrier */}
            <div className="flex items-center justify-between px-6 py-3"
              style={{ borderTop: '1px solid #e8e8e0', backgroundColor: '#f5f5f0' }}>
              <span style={{ fontSize: '13px', color: '#555', fontWeight: 600 }}>
                {dateSelectionnee ? new Date(dateSelectionnee).toLocaleDateString('fr-FR', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                }) : ''}
              </span>
              {matchsDuJour.filter(m => m.statut === 1).length > 0 && (
                <span style={{ color: '#CE1126', fontWeight: 700, fontSize: '12px' }}>
                  ● {matchsDuJour.filter(m => m.statut === 1).length} Live
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Espace bas zone haute */}
        <div style={{ height: '32px' }} />
      </div>

      {/* ── ZONE BASSE — fond clair + matchs ─────────────────────────────── */}
      <div style={{ backgroundColor: '#e8e6e5', minHeight: '400px', padding: '32px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          {loading ? (
            <div className="text-center py-12" style={{ color: '#777' }}>Chargement...</div>
          ) : matchsDuJour.length === 0 ? (
            <div className="text-center py-12" style={{ color: '#777' }}>Aucun match pour cette date.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {matchsDuJour.map(m => {
                const statut = getStatutLabel(m.statut);
                return (
                  <div key={m.id} className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0d8' }}>
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
                        <span className="font-semibold" style={{ fontSize: '16px', color: '#1a1a1a' }}>{m.equipeDomicile?.nom}</span>
                        {m.equipeDomicile?.logoUrl ? (
                          <img src={m.equipeDomicile.logoUrl} alt="" className="object-contain"
                            style={{ width: '36px', height: '36px', backgroundColor: '#f0f0f0', padding: '2px', borderRadius: '50%' }} />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: '#555' }}>
                            {m.equipeDomicile?.nom?.substring(0, 2)}
                          </div>
                        )}
                      </div>

                      <div className="px-6 text-center" style={{ minWidth: '100px' }}>
                        {m.statut === 0 ? (
                          <div>
                            <span className="font-bold" style={{ fontSize: '20px', color: '#555' }}>—:—</span>
                            <p style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                              {new Date(m.dateMatch).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ) : (
                          <span className="font-black" style={{ fontSize: '22px', color: '#1a1a1a' }}>
                            {m.scoreDomicile} : {m.scoreExterieur}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-1">
                        {m.equipeExterieur?.logoUrl ? (
                          <img src={m.equipeExterieur.logoUrl} alt="" className="object-contain"
                            style={{ width: '36px', height: '36px', backgroundColor: '#f0f0f0', padding: '2px', borderRadius: '50%' }} />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: '#555' }}>
                            {m.equipeExterieur?.nom?.substring(0, 2)}
                          </div>
                        )}
                        <span className="font-semibold" style={{ fontSize: '16px', color: '#1a1a1a' }}>{m.equipeExterieur?.nom}</span>
                      </div>

                      <div style={{ minWidth: '60px', textAlign: 'right' }}>
                        <span style={{ fontSize: '14px', color: '#888' }}>
                          {new Date(m.dateMatch).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {m.statut === 2 && m.buts && m.buts.length > 0 && (
                      <div className="px-6 pb-4" style={{ borderTop: '1px solid #f0f0e8' }}>
                        <div className="flex gap-4 pt-3">
                          <div className="flex-1 flex flex-col gap-1 items-end">
                            {m.buts.filter(b => b.nomEquipe === m.equipeDomicile?.nom).map((b, i) => (
                              <div key={i} className="flex items-center gap-2">
                                {b.nomJoueur && b.nomJoueur !== 'Inconnu' && (
                                  <span style={{ fontSize: '13px', color: '#555' }}>
                                    {b.nomJoueur}
                                    {b.estButCSC && <span style={{ color: '#CE1126', fontSize: '11px' }}> (CSC)</span>}
                                    {b.estPenalty && <span style={{ color: '#1a7a3c', fontSize: '11px' }}> (pen.)</span>}
                                  </span>
                                )}
                                <span style={{ fontSize: '12px' }}>⚽</span>
                                <span style={{ fontSize: '12px', color: '#888', fontWeight: 600 }}>{b.minute}'</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ width: '100px' }}></div>
                          <div className="flex-1 flex flex-col gap-1">
                            {m.buts.filter(b => b.nomEquipe === m.equipeExterieur?.nom).map((b, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span style={{ fontSize: '12px', color: '#888', fontWeight: 600 }}>{b.minute}'</span>
                                <span style={{ fontSize: '12px' }}>⚽</span>
                                {b.nomJoueur && b.nomJoueur !== 'Inconnu' && (
                                  <span style={{ fontSize: '13px', color: '#555' }}>
                                    {b.nomJoueur}
                                    {b.estButCSC && <span style={{ color: '#CE1126', fontSize: '11px' }}> (CSC)</span>}
                                    {b.estPenalty && <span style={{ color: '#1a7a3c', fontSize: '11px' }}> (pen.)</span>}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchsPage;
