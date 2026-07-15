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
    clearInterval(intervalRef.current);
    setActuActive(index);
    setProgress(0);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setActuActive(prev => {
        startTimeRef.current = Date.now();
        setProgress(0);
        return (prev + 1) % ACTUS.length;
      });
    }, DUREE);
  }, []);

  const next = useCallback(() => {
    setActuActive(prev => {
      startTimeRef.current = Date.now();
      setProgress(0);
      return (prev + 1) % ACTUS.length;
    });
  }, []);

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

        {/* Images fond */}
        {ACTUS.map((a, i) => (
          <img key={i} src={a.img} alt=""
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover',
              opacity: i === actuActive ? 1 : 0,
              transition: 'opacity 0.5s ease',
            }}
          />
        ))}

        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />

        {/* Contenu centré */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: '130px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '0 80px',
          marginTop: '100px',
        }}>
          <span style={{
            display: 'inline-block', backgroundColor: '#fc1621', color: '#000',
            padding: '4px 16px', borderRadius: '20px',
            fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px',
            textTransform: 'uppercase', marginBottom: '20px',
          }}>
            {ACTUS[actuActive].tag}
          </span>

          <h2 style={{
            color: '#fff', fontWeight: 800, fontSize: '44px',
            lineHeight: 1.05, maxWidth: '800px', marginBottom: '28px',
            textTransform: 'uppercase',
            fontFamily: '"Barlow Condensed", "Arial Narrow", Arial, sans-serif',
          }}>
            {ACTUS[actuActive].titre}
          </h2>

          <a href={ACTUS[actuActive].lien} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#fc1621', color: '#000',
            padding: '10px 24px', borderRadius: '24px',
            fontWeight: 700, fontSize: '13px', textDecoration: 'none',
            textTransform: 'uppercase',
          }}>
            En savoir plus →
          </a>
        </div>

        {/* ── MINIATURES STYLE FIBA EXACT ──────────────────────────────────
            - Fond très sombre
            - Barre colorée EN HAUT de l'actu active (progression)
            - Pas de tag visible
            - Titre blanc gras si actif, gris si inactif
            - Séparateurs verticaux fins
        */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          display: 'flex',
          backgroundColor: 'rgba(20,20,20,0.92)',
        }}>
          {ACTUS.map((a, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                flex: 1, textAlign: 'left',
                padding: '16px 20px 18px',
                backgroundColor: 'transparent',
                border: 'none', cursor: 'pointer',
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                position: 'relative',
              }}
            >

              {/* Barre de progression cyan/verte EN HAUT comme FIBA */}
              {i === actuActive && (
                <div style={{
                  position: 'absolute', top: 0, left: 0,
                  height: '3px',
                  backgroundColor: '#eedf0d',
                  width: `${progress}%`,
                  transition: 'width 0.05s linear',
                }} />
              )}

              {/* Titre uniquement — pas de tag comme FIBA */}
              <span style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: '13px',
                color: i === actuActive ? '#ffffff' : 'white',
                fontWeight: i === actuActive ? 600 : 400,
                lineHeight: 1.45,
              }}>
                {a.titre}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── BARRE MATCHS ─────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#b8b6b5', padding: '14px 0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 10px' }}>
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Matchs
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link to="/matchs" style={{ fontSize: '13px', color: '#555', fontWeight: 600, textDecoration: 'none', marginRight: '8px' }}>
              Tous les matchs →
            </Link>
            <button onClick={() => scrollBarre(-1)} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#cfcdcc', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={16} color="#444" />
            </button>
            <button onClick={() => scrollBarre(1)} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#cfcdcc', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={16} color="#444" />
            </button>
          </div>
        </div>

        <div ref={barreRef} style={{ display: 'flex', gap: '12px', padding: '0 24px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {loadingMatchs ? (
            <span style={{ fontSize: '13px', color: '#777' }}>Chargement...</span>
          ) : matchs.map((m, i) => (
            <div key={m.id ?? i} style={{ flexShrink: 0, minWidth: '220px', borderRadius: '12px', backgroundColor: '#cfcdcc', border: '1px solid #b0aeac', padding: '10px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', color: '#777', fontWeight: 700, textTransform: 'uppercase' }}>Elite One</span>
                {m.statut === 1 ? (
                  <span style={{ fontSize: '10px', color: '#e53e3e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', backgroundColor: '#e53e3e', borderRadius: '50%', display: 'inline-block' }} />LIVE
                  </span>
                ) : m.statut === 2 ? (
                  <span style={{ fontSize: '10px', color: '#888', fontWeight: 600 }}>FT</span>
                ) : (
                  <span style={{ fontSize: '10px', color: '#1a7a3c', fontWeight: 600 }}>{formatDateCourte(m.dateMatch)}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.equipeDomicile?.nom}</span>
                  {m.equipeDomicile?.logoUrl && <img src={m.equipeDomicile.logoUrl} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />}
                </div>
                <div style={{ textAlign: 'center', padding: '0 6px' }}>
                  {m.statut === 0 ? (
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#333' }}>—:—</div>
                      <div style={{ fontSize: '9px', color: '#888' }}>{formatHeure(m.dateMatch)}</div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '16px', fontWeight: 900, color: '#1a1a1a' }}>{m.scoreDomicile}:{m.scoreExterieur}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                  {m.equipeExterieur?.logoUrl && <img src={m.equipeExterieur.logoUrl} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />}
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.equipeExterieur?.nom}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENU ──────────────────────────────────────────────────────── */}
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
                <div key={m.apiFootballId ?? i} className="flex items-center justify-between px-6 py-4 rounded-xl" style={{ backgroundColor: '#b5b3b2' }}>
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    {m.equipeDomicile?.logoUrl && <img src={m.equipeDomicile.logoUrl} alt="" className="w-8 h-8 object-contain" />}
                    <span className="font-semibold" style={{ fontSize: '17px', color: '#1a1a1a' }}>{m.equipeDomicile?.nom}</span>
                  </div>
                  <div className="flex flex-col items-center px-6">
                    <span className="font-black" style={{ fontSize: '26px', color: '#1a1a1a' }}>{m.scoreDomicile ?? '–'} : {m.scoreExterieur ?? '–'}</span>
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

        {/* Grille */}
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
                <div key={e.equipeId ?? e.id} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #aaa8a7' }}>
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
