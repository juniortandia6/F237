import { Link } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLiveScores } from '../hooks/useLiveScores';
import { classementService } from '../services/classementService';
import { matchService } from '../services/matchService';

import actu1 from '../assets/accueil1.jpg';
import actu2 from '../assets/accueil2.jpg';
import actu3 from '../assets/accueil3.jpg';
import actu4 from '../assets/accueil4.jpg';
import actu5 from '../assets/accueil5.jpg';

const ACTUS = [
  { img: actu1, tag: 'Elite One', titre: 'Colombe s\'envole en tête du classement après une saison exceptionnelle', lien: '#' },
  { img: actu2, tag: 'Elite One', titre: 'Dynamo de Douala confirme ses ambitions avec une série de victoires', lien: '#' },
  { img: actu3, tag: 'Elite Two', titre: 'APEJES Academy domine le Groupe A et vise la montée en Elite One', lien: '#' },
  { img: actu4, tag: 'Elite One', titre: 'Unisport Bafang reste dans la course au titre malgré la concurrence', lien: '#' },
  { img: actu5, tag: 'Transfert', titre: 'Le mercato s\'agite dans les clubs camerounais en vue de la prochaine saison', lien: '#' },
];

const CARD = { backgroundColor: '#bfbdbc', border: '1px solid #b0aeac', borderRadius: '16px' };
const DUREE = 5000;

function formatHeure(dateStr) {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
function formatDateCourte(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

const AccueilPage = () => {
  const { matchsLive, isConnected } = useLiveScores();
  const [top5, setTop5] = useState([]);
  const [matchs, setMatchs] = useState([]);
  const [loadingClassement, setLoadingClassement] = useState(true);
  const [loadingMatchs, setLoadingMatchs] = useState(true);
  const [actuActive, setActuActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const barreRef = useRef(null);
  const intervalRef = useRef(null);
  const progressRef = useRef(null);
  const startTimeRef = useRef(null);

  const goTo = useCallback((index) => {
    setActuActive(index);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, []);

  const next = useCallback(() => {
    setActuActive(prev => {
      const n = (prev + 1) % ACTUS.length;
      startTimeRef.current = Date.now();
      setProgress(0);
      return n;
    });
  }, []);

  // Auto-slide + progress bar
  useEffect(() => {
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(next, DUREE);

    const tick = () => {
      const elapsed = Date.now() - (startTimeRef.current || Date.now());
      setProgress(Math.min((elapsed / DUREE) * 100, 100));
      progressRef.current = requestAnimationFrame(tick);
    };
    progressRef.current = requestAnimationFrame(tick);

    return () => {
      clearInterval(intervalRef.current);
      cancelAnimationFrame(progressRef.current);
    };
  }, [next]);

  useEffect(() => {
    let ignore = false;
    classementService.getBySaison(3)
      .then(data => { if (!ignore) { setTop5(data.slice(0, 5)); setLoadingClassement(false); } })
      .catch(() => setLoadingClassement(false));
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;
    matchService.getBySaison(3)
      .then(data => {
        if (!ignore) {
          const aVenir = data.filter(m => m.statut === 0).sort((a, b) => new Date(a.dateMatch) - new Date(b.dateMatch)).slice(0, 5);
          const termines = data.filter(m => m.statut === 2).sort((a, b) => new Date(b.dateMatch) - new Date(a.dateMatch)).slice(0, 8);
          setMatchs([...aVenir, ...termines]);
          setLoadingMatchs(false);
        }
      })
      .catch(() => setLoadingMatchs(false));
    return () => { ignore = true; };
  }, []);

  const scrollBarre = (dir) => {
    if (barreRef.current) barreRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  return (
    <div>

      {/* ── HERO PLEINE LARGEUR ───────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: '700px', overflow: 'hidden' }}>

        {/* Image fond */}
        {ACTUS.map((a, i) => (
          <img
            key={i}
            src={a.img}
            alt=""
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover',
              opacity: i === actuActive ? 1 : 0,
              transition: 'opacity 0.6s ease',
            }}
          />
        ))}

        {/* Overlay gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 30%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.1) 100%)',
        }} />

        {/* Contenu bas gauche */}
        <div style={{ position: 'absolute', bottom: '120px', left: '48px', right: '48px' }}>
          <span style={{
            display: 'inline-block', backgroundColor: '#FCD116', color: '#000',
            padding: '4px 14px', borderRadius: '20px',
            fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
            textTransform: 'uppercase', marginBottom: '16px',
          }}>
            {ACTUS[actuActive].tag}
          </span>
          <h2 style={{
            color: '#fff', fontWeight: 900, fontSize: '36px',
            lineHeight: 1.15, maxWidth: '650px', marginBottom: '20px',
            textTransform: 'uppercase',
          }}>
            {ACTUS[actuActive].titre}
          </h2>
          <a href={ACTUS[actuActive].lien} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#FCD116', color: '#000',
            padding: '10px 22px', borderRadius: '24px',
            fontWeight: 700, fontSize: '13px', textDecoration: 'none',
          }}>
            Lire plus →
          </a>
        </div>

        {/* Miniatures horizontales en bas */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          display: 'flex',
        }}>
          {ACTUS.map((a, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                flex: 1, textAlign: 'left', padding: '12px 20px 10px',
                backgroundColor: i === actuActive ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.5)',
                border: 'none', cursor: 'pointer',
                borderTop: i === actuActive ? '2px solid #FCD116' : '2px solid transparent',
                transition: 'all 0.3s',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Barre de progression */}
              {i === actuActive && (
                <div style={{
                  position: 'absolute', top: 0, left: 0,
                  height: '2px', backgroundColor: '#FCD116',
                  width: `${progress}%`,
                  transition: 'width 0.1s linear',
                }} />
              )}
              <span style={{
                display: 'block', fontSize: '10px', fontWeight: 700,
                color: '#FCD116', textTransform: 'uppercase',
                letterSpacing: '0.8px', marginBottom: '4px',
              }}>
                {a.tag}
              </span>
              <span style={{
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
                fontSize: '12px', color: i === actuActive ? '#fff' : '#ccc',
                fontWeight: i === actuActive ? 600 : 400, lineHeight: 1.35,
              }}>
                {a.titre}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── BARRE MATCHS HORIZONTALE ─────────────────────────────────────── */}
      <div style={{ backgroundColor: '#b8b6b5', padding: '10px 0 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Matchs — Elite One 2026
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => scrollBarre(-1)} style={{
              width: '28px', height: '28px', borderRadius: '50%',
              backgroundColor: '#cfcdcc', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ChevronLeft size={16} color="#444" />
            </button>
            <button onClick={() => scrollBarre(1)} style={{
              width: '28px', height: '28px', borderRadius: '50%',
              backgroundColor: '#cfcdcc', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ChevronRight size={16} color="#444" />
            </button>
          </div>
        </div>

        <div ref={barreRef} style={{
          display: 'flex', gap: '12px', padding: '0 24px',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {loadingMatchs ? (
            <span style={{ fontSize: '13px', color: '#777' }}>Chargement...</span>
          ) : matchs.map((m, i) => (
            <div key={m.id ?? i} style={{
              flexShrink: 0, minWidth: '220px', borderRadius: '12px',
              backgroundColor: '#cfcdcc', border: '1px solid #b0aeac', padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', color: '#777', fontWeight: 700, textTransform: 'uppercase' }}>Elite One</span>
                {m.statut === 1 ? (
                  <span style={{ fontSize: '10px', color: '#e53e3e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', backgroundColor: '#e53e3e', borderRadius: '50%', display: 'inline-block' }} />
                    LIVE
                  </span>
                ) : m.statut === 2 ? (
                  <span style={{ fontSize: '10px', color: '#888', fontWeight: 600 }}>FT</span>
                ) : (
                  <span style={{ fontSize: '10px', color: '#1a7a3c', fontWeight: 600 }}>{formatDateCourte(m.dateMatch)}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.equipeDomicile?.nom}
                  </span>
                  {m.equipeDomicile?.logoUrl && <img src={m.equipeDomicile.logoUrl} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />}
                </div>
                <div style={{ textAlign: 'center', padding: '0 6px' }}>
                  {m.statut === 0 ? (
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#333' }}>—:—</div>
                      <div style={{ fontSize: '9px', color: '#888' }}>{formatHeure(m.dateMatch)}</div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '16px', fontWeight: 900, color: '#1a1a1a' }}>
                      {m.scoreDomicile}:{m.scoreExterieur}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                  {m.equipeExterieur?.logoUrl && <img src={m.equipeExterieur.logoUrl} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />}
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.equipeExterieur?.nom}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENU CENTRÉ ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>

        {/* En direct */}
        <div className="p-5 mb-6" style={CARD}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold flex items-center gap-2" style={{ fontSize: '20px', color: '#1a1a1a' }}>
              <span className={`w-2 h-2 rounded-full inline-block ${matchsLive.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></span>
              En direct
            </h2>
            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: isConnected ? '#1a7a3c' : '#999' }}>
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              {isConnected ? 'Connecté' : 'Connexion...'}
            </span>
          </div>
          {matchsLive.length > 0 ? (
            <div className="flex flex-col gap-3">
              {matchsLive.map((m, i) => (
                <div key={m.apiFootballId ?? i} className="flex items-center justify-between px-6 py-4 rounded-xl"
                  style={{ backgroundColor: '#b5b3b2' }}>
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    {m.equipeDomicile?.logoUrl && <img src={m.equipeDomicile.logoUrl} alt="" className="w-8 h-8 object-contain" />}
                    <span className="font-semibold" style={{ fontSize: '17px', color: '#1a1a1a' }}>{m.equipeDomicile?.nom}</span>
                  </div>
                  <div className="flex flex-col items-center px-6">
                    <span className="font-black" style={{ fontSize: '26px', color: '#1a1a1a' }}>
                      {m.scoreDomicile ?? '–'} : {m.scoreExterieur ?? '–'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-semibold" style={{ fontSize: '17px', color: '#1a1a1a' }}>{m.equipeExterieur?.nom}</span>
                    {m.equipeExterieur?.logoUrl && <img src={m.equipeExterieur.logoUrl} alt="" className="w-8 h-8 object-contain" />}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4" style={{ fontSize: '15px', color: '#777' }}>Aucun match en direct pour le moment.</p>
          )}
        </div>

        {/* Grille Top 5 + Résultats */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <div className="p-5" style={CARD}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold flex items-center gap-2" style={{ fontSize: '20px', color: '#1a1a1a' }}>
                  <span className="w-1 h-5 rounded-full inline-block" style={{ backgroundColor: '#1a7a3c' }}></span>
                  Top 5 — Elite One
                </h2>
                <Link to="/classement" className="font-medium hover:underline" style={{ color: '#1a7a3c', fontSize: '15px' }}>Voir tout →</Link>
              </div>
              {loadingClassement ? (
                <div className="text-center py-4" style={{ fontSize: '14px', color: '#777' }}>Chargement...</div>
              ) : top5.map((e) => (
                <div key={e.equipeId ?? e.id} className="flex items-center justify-between py-3"
                  style={{ borderBottom: '1px solid #aaa8a7' }}>
                  <div className="flex items-center gap-3">
                    <span className="w-4" style={{ fontSize: '15px', color: '#777' }}>{e.position}</span>
                    {e.equipe?.logoUrl && <img src={e.equipe.logoUrl} alt="" className="w-6 h-6 object-contain" />}
                    <span className="font-medium truncate max-w-32" style={{ fontSize: '15px', color: '#1a1a1a' }}>{e.equipe?.nom ?? e.nom}</span>
                  </div>
                  <span className="font-bold" style={{ fontSize: '15px', color: '#1a1a1a' }}>{e.points} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2 flex flex-col gap-6">
            <div className="p-5" style={CARD}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold flex items-center gap-2" style={{ fontSize: '20px', color: '#1a1a1a' }}>
                  <span className="w-1 h-5 rounded-full inline-block bg-red-500"></span>
                  Résultats récents
                </h2>
                <Link to="/matchs" className="font-medium hover:underline" style={{ color: '#1a7a3c', fontSize: '15px' }}>Voir tout →</Link>
              </div>
              {loadingMatchs ? (
                <div className="text-center py-4" style={{ fontSize: '14px', color: '#777' }}>Chargement...</div>
              ) : matchs.filter(m => m.statut === 2).slice(0, 3).map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #aaa8a7' }}>
                  <div className="flex items-center gap-4 flex-1">
                    <span className="font-medium" style={{ fontSize: '13px', minWidth: '80px', color: '#777' }}>ELITE ONE</span>
                    <div className="flex items-center gap-2">
                      {m.equipeDomicile?.logoUrl && <img src={m.equipeDomicile.logoUrl} alt="" className="w-5 h-5 object-contain" />}
                      <span className="font-medium" style={{ fontSize: '16px', color: '#1a1a1a' }}>{m.equipeDomicile?.nom}</span>
                    </div>
                    <span className="font-black px-2" style={{ fontSize: '17px', color: '#1a1a1a' }}>{m.scoreDomicile} : {m.scoreExterieur}</span>
                    <div className="flex items-center gap-2">
                      {m.equipeExterieur?.logoUrl && <img src={m.equipeExterieur.logoUrl} alt="" className="w-5 h-5 object-contain" />}
                      <span className="font-medium" style={{ fontSize: '16px', color: '#1a1a1a' }}>{m.equipeExterieur?.nom}</span>
                    </div>
                  </div>
                  <span className="font-medium flex-shrink-0" style={{ fontSize: '14px', color: '#777' }}>{formatDateCourte(m.dateMatch)}</span>
                </div>
              ))}
            </div>

            <div className="p-5" style={CARD}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold flex items-center gap-2" style={{ fontSize: '20px', color: '#1a1a1a' }}>
                  <span className="w-1 h-5 rounded-full inline-block" style={{ backgroundColor: '#FCD116' }}></span>
                  Prochains matchs
                </h2>
                <Link to="/matchs" className="font-medium hover:underline" style={{ color: '#1a7a3c', fontSize: '15px' }}>Calendrier →</Link>
              </div>
              {loadingMatchs ? (
                <div className="text-center py-4" style={{ fontSize: '14px', color: '#777' }}>Chargement...</div>
              ) : matchs.filter(m => m.statut === 0).length === 0 ? (
                <div className="text-center py-4" style={{ fontSize: '14px', color: '#777' }}>Aucun match à venir</div>
              ) : matchs.filter(m => m.statut === 0).slice(0, 3).map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #aaa8a7' }}>
                  <div className="flex items-center gap-4 flex-1">
                    <span className="font-medium" style={{ fontSize: '13px', minWidth: '80px', color: '#777' }}>ELITE ONE</span>
                    <div className="flex items-center gap-2">
                      {m.equipeDomicile?.logoUrl && <img src={m.equipeDomicile.logoUrl} alt="" className="w-5 h-5 object-contain" />}
                      <span className="font-medium" style={{ fontSize: '16px', color: '#1a1a1a' }}>{m.equipeDomicile?.nom}</span>
                    </div>
                    <span className="font-bold" style={{ fontSize: '15px', color: '#777' }}>—:—</span>
                    <div className="flex items-center gap-2">
                      {m.equipeExterieur?.logoUrl && <img src={m.equipeExterieur.logoUrl} alt="" className="w-5 h-5 object-contain" />}
                      <span className="font-medium" style={{ fontSize: '16px', color: '#1a1a1a' }}>{m.equipeExterieur?.nom}</span>
                    </div>
                  </div>
                  <span className="flex-shrink-0" style={{ fontSize: '14px', color: '#777' }}>{formatDateCourte(m.dateMatch)}, {formatHeure(m.dateMatch)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccueilPage;
