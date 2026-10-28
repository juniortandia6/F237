import { Link } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useLiveScores } from '../hooks/useLiveScores';
import { classementService } from '../services/classementService';
import { matchService } from '../services/matchService';
import theme from '../theme';
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

// Cartes sombres pour les sections sous le hero
const CARD = {
  backgroundColor: theme.surface,
  border: `1px solid ${theme.border}`,
  borderRadius: '16px',
};
const LIGNE = { borderBottom: `1px solid ${theme.border}` };
const DUREE = 5000;

function formatHeure(dateStr) {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
function formatDateCourte(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function TitreSection({ couleur, children }) {
  return (
    <h2 className="font-bold flex items-center gap-2" style={{ fontSize: '20px', color: theme.text }}>
      <span className="w-1 h-5 rounded-full inline-block" style={{ backgroundColor: couleur }}></span>
      {children}
    </h2>
  );
}

function LienSection({ to, children }) {
  return (
    <Link to={to} className="font-medium hover:underline" style={{ color: theme.greenBright, fontSize: '14px' }}>
      {children}
    </Link>
  );
}

// ── Barre de matchs ─────────────────────────────────────────────────────
const LARGEUR_CARTE = 360;
// La première carte s'aligne sur le contenu du hero (1150px centrés, 60px de marge min)
const DEBUT_RANGEE = 'max(60px, calc((100% - 1150px) / 2))';

const FLECHE = (cote) => ({
  position: 'absolute', top: '50%', [cote]: '18px',
  transform: 'translateY(-60%)',
  width: '40px', height: '40px', borderRadius: '50%',
  backgroundColor: '#fff', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 4px 14px rgba(0,0,0,0.35)', zIndex: 2,
});

// Une ligne d'équipe : logo + nom à gauche, score (+ triangle du vainqueur) à droite
function LigneEquipe({ equipe, score, gagnant, perdant, aVenir }) {
  const couleur = perdant ? '#8e8e8e' : '#141414';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        {equipe?.logoUrl
          ? <img src={equipe.logoUrl} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }} />
          : <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#e6e6e6', flexShrink: 0 }} />}
        <span style={{ fontSize: '16px', fontWeight: 700, color: couleur, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {equipe?.nom ?? '—'}
        </span>
      </div>
      {!aVenir && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span style={{ fontSize: '17px', fontWeight: 800, color: couleur, minWidth: '20px', textAlign: 'right' }}>{score ?? '–'}</span>
          {/* Triangle rouge pointant vers le score gagnant, comme FIBA */}
          <span style={{
            width: 0, height: 0,
            borderTop: '5px solid transparent', borderBottom: '5px solid transparent',
            borderRight: `6px solid ${gagnant ? theme.red : 'transparent'}`,
          }} />
        </div>
      )}
    </div>
  );
}

function CarteMatch({ m }) {
  const termine = m.statut === 2;
  const live = m.statut === 1;
  const aVenir = m.statut === 0;
  const dom = m.scoreDomicile, ext = m.scoreExterieur;
  const domGagne = (termine || live) && dom > ext;
  const extGagne = (termine || live) && ext > dom;

  return (
    <div
      className="transition-transform duration-200 hover:-translate-y-1"
      style={{
        flex: `0 0 ${LARGEUR_CARTE}px`, scrollSnapAlign: 'start',
        display: 'flex', alignItems: 'stretch',
        backgroundColor: '#fff', borderRadius: '12px',
        boxShadow: '0 8px 22px rgba(0,0,0,0.30)',
        padding: '14px 16px',
      }}
    >
      {/* Partie gauche : compétition + statut + 2 équipes */}
      <div style={{ flex: 1, minWidth: 0, paddingRight: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Elite One
          </span>
          {live ? (
            <span style={{ fontSize: '11px', fontWeight: 800, color: theme.red, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="animate-pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: theme.red }} />
              EN DIRECT
            </span>
          ) : termine ? (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e8e8e', textTransform: 'uppercase' }}>Terminé</span>
          ) : (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e8e8e', textTransform: 'uppercase' }}>
              {formatDateCourte(m.dateMatch)}
            </span>
          )}
        </div>
        <LigneEquipe equipe={m.equipeDomicile} score={dom} gagnant={domGagne} perdant={extGagne} aVenir={aVenir} />
        <LigneEquipe equipe={m.equipeExterieur} score={ext} gagnant={extGagne} perdant={domGagne} aVenir={aVenir} />
      </div>

      {/* Partie droite : séparateur + bouton (ou heure si à venir) */}
      <div style={{
        borderLeft: '1px solid #e7e7e7', paddingLeft: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '86px',
      }}>
        {aVenir ? (
          <span style={{
            backgroundColor: '#141414', color: '#fff', fontWeight: 700, fontSize: '15px',
            padding: '8px 12px', borderRadius: '8px',
          }}>
            {formatHeure(m.dateMatch)}
          </span>
        ) : (
          <Link to="/matchs"
            className="transition-colors hover:bg-gray-200"
            style={{
              backgroundColor: '#efefef', color: '#333', fontWeight: 600, fontSize: '14px',
              padding: '8px 12px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
            + Plus
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Section "En direct" (inspirée de "Dernières vidéos" FIBA) ───────────
// Bande pleine largeur en dégradé vert avec éclats géométriques,
// grosses cartes blanches qui défilent, flèches rondes sur les bords.
// S'il n'y a aucun match en direct, la section affiche les derniers résultats.

const LARGEUR_CARTE_DIRECT = 320;

function CarteDirect({ m, live }) {
  const dom = m.scoreDomicile, ext = m.scoreExterieur;
  const aScore = dom != null && ext != null;
  const minute = m.minute ?? m.tempsEcoule ?? null;

  return (
    <Link
      to="/matchs"
      className="group"
      style={{
        flex: `0 0 ${LARGEUR_CARTE_DIRECT}px`, scrollSnapAlign: 'start',
        display: 'flex', flexDirection: 'column',
        backgroundColor: '#fff', borderRadius: '18px', padding: '14px',
        textDecoration: 'none', color: 'inherit',
        boxShadow: '0 10px 28px rgba(0,0,0,0.28)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 18px 36px rgba(0,0,0,0.36)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.28)'; }}
    >
      {/* Vignette : les deux logos + le score, comme une miniature vidéo */}
      <div style={{
        position: 'relative', height: '168px', borderRadius: '10px', overflow: 'hidden',
        background: `linear-gradient(135deg, ${theme.greenDeep} 0%, #14532f 55%, #1d6b3f 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 12px',
      }}>
        {/* Rayures diagonales discrètes */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.12,
          backgroundImage: 'repeating-linear-gradient(115deg, #fff 0 2px, transparent 2px 26px)',
        }} />

        {/* Badge de statut */}
        <span style={{
          position: 'absolute', top: '10px', left: '10px',
          display: 'flex', alignItems: 'center', gap: '6px',
          backgroundColor: live ? theme.red : 'rgba(0,0,0,0.45)', color: '#fff',
          fontSize: '10px', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: '20px',
        }}>
          {live && <span className="animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff' }} />}
          {live ? (minute ? `En direct · ${minute}'` : 'En direct') : 'Terminé'}
        </span>

        <img src={m.equipeDomicile?.logoUrl} alt=""
          className="transition-transform duration-300 group-hover:scale-110"
          style={{ position: 'relative', width: '64px', height: '64px', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }} />

        <span style={{
          position: 'relative', color: '#fff', fontWeight: 900, fontSize: '34px',
          fontFamily: '"Barlow Condensed", Arial, sans-serif', letterSpacing: '1px',
          textShadow: '0 2px 10px rgba(0,0,0,0.4)',
        }}>
          {aScore ? `${dom} - ${ext}` : 'VS'}
        </span>

        <img src={m.equipeExterieur?.logoUrl} alt=""
          className="transition-transform duration-300 group-hover:scale-110"
          style={{ position: 'relative', width: '64px', height: '64px', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }} />
      </div>

      {/* Infos */}
      <span style={{ marginTop: '14px', fontSize: '11px', fontWeight: 700, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Elite One{m.dateMatch ? ` · ${new Date(m.dateMatch).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
      </span>
      <span style={{
        marginTop: '6px', fontSize: '18px', fontWeight: 700, color: '#141414', lineHeight: 1.3,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        minHeight: '47px',
      }}>
        {m.equipeDomicile?.nom ?? '—'} – {m.equipeExterieur?.nom ?? '—'}
      </span>

      {/* Pied de carte */}
      <div style={{
        marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #ececec',
        display: 'flex', alignItems: 'center', gap: '6px', color: '#6b6b6b', fontSize: '14px', fontWeight: 600,
      }}>
        {live ? 'Suivre le match' : 'Voir le résumé'}
        <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function SectionDirect({ matchsLive, matchsTermines, isConnected }) {
  const live = matchsLive.length > 0;
  const liste = live ? matchsLive : matchsTermines.slice(0, 8);
  const rangeeRef = useRef(null);
  const [gauche, setGauche] = useState(false);
  const [droite, setDroite] = useState(true);

  const maj = useCallback(() => {
    const el = rangeeRef.current;
    if (!el) return;
    setGauche(el.scrollLeft > 8);
    setDroite(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    maj();
    window.addEventListener('resize', maj);
    return () => window.removeEventListener('resize', maj);
  }, [liste.length, maj]);

  const defiler = (dir) => rangeeRef.current?.scrollBy({ left: dir * (LARGEUR_CARTE_DIRECT + 16) * 2, behavior: 'smooth' });

  return (
    <section style={{
      position: 'relative', overflow: 'hidden', padding: '56px 0 64px',
      background: `linear-gradient(120deg, ${theme.greenDeep} 0%, #12462c 45%, #0f3a25 100%)`,
    }}>
      {/* Éclats géométriques en arrière-plan (rappel des couleurs du drapeau) */}
      <svg viewBox="0 0 1440 600" preserveAspectRatio="none" aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <polygon points="0,600 0,380 260,0 420,0" fill="#1f9d55" opacity="0.22" />
        <polygon points="160,600 520,0 640,0 330,600" fill="#3ccf7a" opacity="0.10" />
        <polygon points="1440,0 1440,260 1180,600 1010,600" fill="#e1252b" opacity="0.16" />
        <polygon points="1300,0 1440,0 1440,90 1240,420" fill="#fcd116" opacity="0.10" />
        <polygon points="760,600 980,180 1060,180 900,600" fill="#1f9d55" opacity="0.10" />
      </svg>

      {/* En-tête aligné sur le contenu */}
      <div style={{ position: 'relative', maxWidth: '1150px', margin: '0 auto', padding: '0 60px', boxSizing: 'content-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
          <h2 style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            color: '#fff', fontSize: '28px', fontWeight: 400,
            fontFamily: '"Permanent Marker", "Raleway", Arial, sans-serif',
          }}>
            {live && <span className="animate-pulse" style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: theme.red, boxShadow: `0 0 12px ${theme.red}` }} />}
            {live ? 'En direct' : 'Derniers résultats'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: isConnected ? theme.greenBright : 'rgba(255,255,255,0.5)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: isConnected ? theme.greenBright : 'rgba(255,255,255,0.5)' }} />
              {isConnected ? 'Live connecté' : 'Connexion...'}
            </span>
            <Link to="/matchs" className="flex items-center gap-1 transition-opacity hover:opacity-80"
              style={{ fontSize: '15px', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>
              Tous les matchs <ChevronRight size={18} />
            </Link>
          </div>
        </div>
        {!live && (
          <p style={{ marginTop: '-12px', marginBottom: '20px', fontSize: '14px', color: 'rgba(255,255,255,0.65)' }}>
            Aucun match en cours pour le moment. Les scores s'afficheront ici en temps réel dès le coup d'envoi.
          </p>
        )}
      </div>

      {/* Rangée de cartes */}
      <div style={{ position: 'relative' }}>
        <div
          ref={rangeeRef}
          onScroll={maj}
          style={{
            display: 'flex', gap: '16px',
            overflowX: 'auto', scrollbarWidth: 'none',
            scrollSnapType: 'x mandatory',
            paddingLeft: DEBUT_RANGEE, paddingRight: DEBUT_RANGEE, scrollPaddingLeft: DEBUT_RANGEE,
            paddingTop: '6px', paddingBottom: '16px',
          }}
        >
          {liste.length === 0 ? (
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Aucun match à afficher.</span>
          ) : liste.map((m, i) => (
            <CarteDirect key={m.apiFootballId ?? m.id ?? i} m={m} live={live} />
          ))}
        </div>

        {gauche && (
          <button onClick={() => defiler(-1)} aria-label="Précédent" style={FLECHE('left')}>
            <ChevronLeft size={20} color="#222" />
          </button>
        )}
        {droite && liste.length > 0 && (
          <button onClick={() => defiler(1)} aria-label="Suivant" style={FLECHE('right')}>
            <ChevronRight size={20} color="#222" />
          </button>
        )}
      </div>
    </section>
  );
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
  const [peutGauche, setPeutGauche] = useState(false);
  const [peutDroite, setPeutDroite] = useState(true);
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

  // Affiche/masque les flèches selon la position du défilement
  const majFleches = useCallback(() => {
    const el = barreRef.current;
    if (!el) return;
    setPeutGauche(el.scrollLeft > 8);
    setPeutDroite(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    majFleches();
    window.addEventListener('resize', majFleches);
    return () => window.removeEventListener('resize', majFleches);
  }, [matchs, majFleches]);

  // Défile de 2 cartes à la fois
  const scrollBarre = (dir) => {
    if (barreRef.current) barreRef.current.scrollBy({ left: dir * (LARGEUR_CARTE + 16) * 2, behavior: 'smooth' });
  };

  const chargement = (
    <div className="text-center py-4" style={{ fontSize: '14px', color: theme.textFaint }}>Chargement...</div>
  );

  return (
    <div style={{ backgroundColor: theme.bg }}>
      {/* ── HERO PLEINE LARGEUR ───────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: '920px', overflow: 'hidden' }}>

        {/* Images fond */}
        {ACTUS.map((a, i) => (
          <img key={i} src={a.img} alt=""
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover',
              opacity: i === actuActive ? 1 : 0,
              transition: 'opacity 0.6s ease',
            }}
          />
        ))}

        {/* Overlay : léger en haut, puis fondu vers le vert sombre du site
            pour que le hero se fonde dans la page (comme l'aubergine FIBA) */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(180deg,
            rgba(${theme.bgRgb},0.25) 0%,
            rgba(${theme.bgRgb},0.35) 35%,
            rgba(${theme.bgRgb},0.72) 62%,
            ${theme.bg} 92%)`,
        }} />

        {/* Contenu : tag + titre + bouton + ticker */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: '230px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 60px',
        }}>
          <div style={{ width: '100%', maxWidth: '1150px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <span style={{
              display: 'inline-block', backgroundColor: theme.red, color: '#fff',
              padding: '4px 16px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px',
              textTransform: 'uppercase', marginBottom: '16px',
            }}>
              {ACTUS[actuActive].tag}
            </span>

            <h2 style={{
              color: '#fff', fontWeight: 400, fontSize: '38px',
              lineHeight: 1.25, maxWidth: '700px', marginBottom: '16px',
              fontFamily: '"Permanent Marker", "Raleway", Arial, sans-serif',
              textShadow: '0 2px 12px rgba(0,0,0,0.45)',
            }}>
              {ACTUS[actuActive].titre}
            </h2>

            <a href={ACTUS[actuActive].lien}
              className="transition-all hover:brightness-110"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                backgroundColor: theme.red, color: '#fff',
                padding: '10px 24px', borderRadius: '24px',
                fontWeight: 700, fontSize: '13px', textDecoration: 'none',
                textTransform: 'uppercase', marginBottom: '22px',
              }}>
              En savoir plus →
            </a>

            {/* ── TICKER D'ACTUS ─────────────────────────────────────────── */}
            <div style={{ width: '100%', maxWidth: '1030px' }}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                {ACTUS.map((a, i) => {
                  const active = i === actuActive;
                  return (
                    <div key={i} style={{ flex: '0 0 185px', position: 'relative', height: '2px', borderRadius: '2px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.28)' }}>
                      {active && (
                        <div style={{
                          position: 'absolute', top: 0, left: 0, bottom: 0,
                          borderRadius: '2px',
                          backgroundColor: theme.cyan,
                          width: `${progress}%`,
                          boxShadow: `0 0 6px ${theme.cyan}`,
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                {ACTUS.map((a, i) => {
                  const active = i === actuActive;
                  return (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      style={{
                        flex: '0 0 185px', textAlign: 'left',
                        padding: 0, margin: 0,
                        backgroundColor: 'transparent',
                        border: 'none', cursor: 'pointer',
                      }}
                    >
                      <span style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: '14px',
                        lineHeight: 1.35,
                        fontFamily: '"Raleway", Arial, sans-serif',
                        color: active ? '#ffffff' : 'rgba(235,235,235,0.62)',
                        fontWeight: active ? 700 : 500,
                        textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                        transition: 'color 0.3s ease',
                      }}>
                        {a.titre}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── BARRE MATCHS (style FIBA) ────────────────────────────────────
            - En-tête "Matchs / Tous les matchs" aligné sur le contenu du hero
            - Rangée qui défile sur toute la largeur, première carte alignée
              sur le contenu
            - Grosses cartes blanches + flèches rondes posées sur les bords */}
        <div style={{ position: 'absolute', bottom: '36px', left: 0, right: 0 }}>
          <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '0 60px', boxSizing: 'content-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '19px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Matchs
              </span>
              <Link to="/matchs"
                className="flex items-center gap-1 transition-opacity hover:opacity-80"
                style={{ fontSize: '15px', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>
                Tous les matchs <ChevronRight size={18} />
              </Link>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div
              ref={barreRef}
              onScroll={majFleches}
              style={{
                display: 'flex', gap: '16px',
                overflowX: 'auto', scrollbarWidth: 'none',
                scrollSnapType: 'x mandatory',
                paddingLeft: DEBUT_RANGEE, paddingRight: DEBUT_RANGEE,
                scrollPaddingLeft: DEBUT_RANGEE,
                paddingTop: '4px', paddingBottom: '10px',
              }}
            >
              {loadingMatchs ? (
                <span style={{ fontSize: '14px', color: theme.textMuted }}>Chargement...</span>
              ) : matchs.length === 0 ? (
                <span style={{ fontSize: '14px', color: theme.textMuted }}>Aucun match pour le moment.</span>
              ) : matchs.map((m, i) => (
                <CarteMatch key={m.id ?? i} m={m} />
              ))}
            </div>

            {peutGauche && (
              <button onClick={() => scrollBarre(-1)} aria-label="Matchs précédents" style={FLECHE('left')}>
                <ChevronLeft size={20} color="#222" />
              </button>
            )}
            {peutDroite && (
              <button onClick={() => scrollBarre(1)} aria-label="Matchs suivants" style={FLECHE('right')}>
                <ChevronRight size={20} color="#222" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── EN DIRECT / DERNIERS RÉSULTATS (bande pleine largeur) ─────── */}
      <SectionDirect
        matchsLive={matchsLive}
        matchsTermines={matchs.filter(m => m.statut === 2)}
        isConnected={isConnected}
      />

      {/* ── CONTENU ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '56px 24px 64px' }}>

        {/* Grille */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <div className="p-5" style={CARD}>
              <div className="flex items-center justify-between mb-4">
                <TitreSection couleur={theme.green}>Top 5 — Elite One</TitreSection>
                <LienSection to="/classement">Voir tout →</LienSection>
              </div>
              {loadingClassement ? chargement : top5.map((e, idx) => (
                <div key={e.equipeId ?? e.id} className="flex items-center justify-between py-3" style={idx < top5.length - 1 ? LIGNE : undefined}>
                  <div className="flex items-center gap-3">
                    <span className="w-4 font-bold" style={{ fontSize: '15px', color: idx === 0 ? theme.yellow : theme.textFaint }}>{e.position}</span>
                    {e.equipe?.logoUrl && <img src={e.equipe.logoUrl} alt="" className="w-6 h-6 object-contain" />}
                    <span className="font-medium truncate max-w-32" style={{ fontSize: '15px', color: theme.text }}>{e.equipe?.nom ?? e.nom}</span>
                  </div>
                  <span className="font-bold" style={{ fontSize: '15px', color: theme.text }}>{e.points} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2 flex flex-col gap-6">
            <div className="p-5" style={CARD}>
              <div className="flex items-center justify-between mb-4">
                <TitreSection couleur={theme.red}>Résultats récents</TitreSection>
                <LienSection to="/matchs">Voir tout →</LienSection>
              </div>
              {loadingMatchs ? chargement : matchs.filter(m => m.statut === 2).slice(0, 3).map((m, idx, arr) => (
                <div key={m.id} className="flex items-center justify-between py-3" style={idx < arr.length - 1 ? LIGNE : undefined}>
                  <div className="flex items-center gap-4 flex-1">
                    <span className="font-medium" style={{ fontSize: '12px', minWidth: '80px', color: theme.textFaint, letterSpacing: '0.5px' }}>ELITE ONE</span>
                    <div className="flex items-center gap-2">
                      {m.equipeDomicile?.logoUrl && <img src={m.equipeDomicile.logoUrl} alt="" className="w-5 h-5 object-contain" />}
                      <span className="font-medium" style={{ fontSize: '16px', color: theme.text }}>{m.equipeDomicile?.nom}</span>
                    </div>
                    <span className="font-black px-2" style={{ fontSize: '17px', color: theme.text }}>{m.scoreDomicile} : {m.scoreExterieur}</span>
                    <div className="flex items-center gap-2">
                      {m.equipeExterieur?.logoUrl && <img src={m.equipeExterieur.logoUrl} alt="" className="w-5 h-5 object-contain" />}
                      <span className="font-medium" style={{ fontSize: '16px', color: theme.text }}>{m.equipeExterieur?.nom}</span>
                    </div>
                  </div>
                  <span className="font-medium flex-shrink-0" style={{ fontSize: '14px', color: theme.textMuted }}>{formatDateCourte(m.dateMatch)}</span>
                </div>
              ))}
            </div>

            <div className="p-5" style={CARD}>
              <div className="flex items-center justify-between mb-4">
                <TitreSection couleur={theme.yellow}>Prochains matchs</TitreSection>
                <LienSection to="/matchs">Calendrier →</LienSection>
              </div>
              {loadingMatchs ? chargement : matchs.filter(m => m.statut === 0).length === 0 ? (
                <div className="text-center py-4" style={{ fontSize: '14px', color: theme.textMuted }}>Aucun match à venir</div>
              ) : matchs.filter(m => m.statut === 0).slice(0, 3).map((m, idx, arr) => (
                <div key={m.id} className="flex items-center justify-between py-3" style={idx < arr.length - 1 ? LIGNE : undefined}>
                  <div className="flex items-center gap-4 flex-1">
                    <span className="font-medium" style={{ fontSize: '12px', minWidth: '80px', color: theme.textFaint, letterSpacing: '0.5px' }}>ELITE ONE</span>
                    <div className="flex items-center gap-2">
                      {m.equipeDomicile?.logoUrl && <img src={m.equipeDomicile.logoUrl} alt="" className="w-5 h-5 object-contain" />}
                      <span className="font-medium" style={{ fontSize: '16px', color: theme.text }}>{m.equipeDomicile?.nom}</span>
                    </div>
                    <span className="font-bold" style={{ fontSize: '15px', color: theme.textFaint }}>—:—</span>
                    <div className="flex items-center gap-2">
                      {m.equipeExterieur?.logoUrl && <img src={m.equipeExterieur.logoUrl} alt="" className="w-5 h-5 object-contain" />}
                      <span className="font-medium" style={{ fontSize: '16px', color: theme.text }}>{m.equipeExterieur?.nom}</span>
                    </div>
                  </div>
                  <span className="flex-shrink-0" style={{ fontSize: '14px', color: theme.textMuted }}>{formatDateCourte(m.dateMatch)}, {formatHeure(m.dateMatch)}</span>
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