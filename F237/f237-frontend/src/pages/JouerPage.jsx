// f237-frontend/src/pages/JouerPage.jsx
// Fantasy / paris, dans le style des autres pages :
// - non connecté : bande sombre avec présentation + boutons
// - connecté : bande sombre (salut + stats) puis zone claire (paris + colonne amis / conversion)

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, Users, Plus, Loader2, Gift, Target, Coins, Smartphone, ArrowRight, CalendarDays } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { matchService } from '../services/matchService';
import { COMPETITIONS, SAISONS_DB, ANNEE_ACTUELLE } from '../data/saisons';
import theme from '../theme';

// ── Couleurs de la zone claire (mêmes que les autres pages) ─────────────
const CLAIR = {
  fond: '#eef1ef',
  carte: '#ffffff',
  bord: '#e2e7e4',
  texte: '#141414',
  doux: '#6b7470',
  tuile: '#f2f4f3',
  vert: '#14532f',
};
const CHIFFRES = '"Barlow Condensed", Arial, sans-serif';
const MARQUEUR = '"Permanent Marker", "Raleway", Arial, sans-serif';
const CONTENEUR = { position: 'relative', maxWidth: '1150px', margin: '0 auto', padding: '0 60px', boxSizing: 'content-box' };
const FOND_BANDE = `linear-gradient(120deg, ${theme.greenDeep} 0%, #12462c 45%, #0f3a25 100%)`;

const MISE_MIN = 10;
const MISE_MAX = 500;
const MISE_DEFAUT = 50;

function EclatsBande() {
  return (
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <polygon points="0,600 0,380 260,0 420,0" fill="#1f9d55" opacity="0.22" />
      <polygon points="160,600 520,0 640,0 330,600" fill="#3ccf7a" opacity="0.10" />
      <polygon points="1440,0 1440,260 1180,600 1010,600" fill="#e1252b" opacity="0.16" />
      <polygon points="1300,0 1440,0 1440,90 1240,420" fill="#fcd116" opacity="0.10" />
      <polygon points="760,600 980,180 1060,180 900,600" fill="#1f9d55" opacity="0.10" />
    </svg>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
    + ' · ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function Logo({ equipe, taille = 48 }) {
  return equipe?.logoUrl
    ? <img src={equipe.logoUrl} alt="" style={{ width: taille, height: taille, objectFit: 'contain' }} />
    : <span style={{
        width: taille, height: taille, borderRadius: '50%', backgroundColor: CLAIR.tuile, color: CLAIR.doux,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: taille / 3.5,
      }}>{equipe?.nom?.substring(0, 2).toUpperCase()}</span>;
}

// Cotes de démonstration (à remplacer par les vraies cotes du backend)
const COTES = [
  { label: '1', detail: 'Domicile', cote: 2.10, type: 'dom' },
  { label: 'X', detail: 'Nul', cote: 3.20, type: 'nul' },
  { label: '2', detail: 'Extérieur', cote: 2.80, type: 'ext' },
];

// ── Carte d'un pari ─────────────────────────────────────────────────────
function CartePari({ p, selection, onSelection, mise, onMise, solde }) {
  const miseMax = Math.max(MISE_MIN, Math.min(solde, MISE_MAX));
  const miseActuelle = Math.min(mise ?? MISE_DEFAUT, miseMax);
  const coteChoisie = COTES.find(c => c.type === selection);
  const gain = coteChoisie ? Math.floor(miseActuelle * coteChoisie.cote) : null;
  const pasAssez = solde < MISE_MIN;
  const nomChoix = selection === 'dom' ? p.equipeDomicile?.nom : selection === 'ext' ? p.equipeExterieur?.nom : 'Match nul';

  return (
    <div style={{ backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '16px', overflow: 'hidden' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: `1px solid ${CLAIR.bord}`, backgroundColor: '#fafbfa' }}>
        <span style={{ fontSize: '12px', fontWeight: 800, color: '#2c312e', letterSpacing: '0.5px', textTransform: 'uppercase' }}>MTN {p.competition}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: CLAIR.doux, textTransform: 'capitalize' }}>
          <CalendarDays size={14} /> {formatDate(p.dateMatch)}
        </span>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Équipes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
            <Logo equipe={p.equipeDomicile} />
            <span style={{ fontSize: '16px', fontWeight: 800, color: CLAIR.texte }}>{p.equipeDomicile?.nom}</span>
          </div>
          <span style={{ fontFamily: CHIFFRES, fontSize: '22px', fontWeight: 800, color: '#b5bcb8' }}>VS</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
            <Logo equipe={p.equipeExterieur} />
            <span style={{ fontSize: '16px', fontWeight: 800, color: CLAIR.texte }}>{p.equipeExterieur?.nom}</span>
          </div>
        </div>

        {/* Cotes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
          {COTES.map(c => {
            const actif = selection === c.type;
            return (
              <button key={c.type} onClick={() => onSelection(c.type)}
                className="transition-all"
                style={{
                  padding: '12px 10px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
                  border: `2px solid ${actif ? theme.green : CLAIR.bord}`,
                  backgroundColor: actif ? theme.green : CLAIR.tuile,
                  color: actif ? '#fff' : CLAIR.texte,
                }}>
                <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px', opacity: actif ? 0.85 : 0.6 }}>
                  {c.label} · {c.detail.toUpperCase()}
                </div>
                <div style={{ fontFamily: CHIFFRES, fontSize: '26px', fontWeight: 800, lineHeight: 1.1 }}>{c.cote.toFixed(2)}</div>
              </button>
            );
          })}
        </div>

        {/* Mise */}
        {pasAssez ? (
          <p style={{ fontSize: '13px', color: theme.red, fontWeight: 600 }}>Solde insuffisant pour parier ({MISE_MIN} pts minimum).</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: CLAIR.doux, letterSpacing: '0.5px' }}>MISE</span>
            <input
              type="range" min={MISE_MIN} max={miseMax} step={10}
              value={miseActuelle}
              onChange={e => onMise(Number(e.target.value))}
              style={{ flex: 1, accentColor: theme.green }}
              aria-label="Montant de la mise"
            />
            <span style={{ minWidth: '74px', textAlign: 'right', fontFamily: CHIFFRES, fontSize: '22px', fontWeight: 800, color: CLAIR.texte }}>
              {miseActuelle} <span style={{ fontSize: '14px', color: CLAIR.doux }}>pts</span>
            </span>
          </div>
        )}

        {/* Validation */}
        {selection && !pasAssez && (
          <button
            className="transition-all hover:brightness-110"
            style={{
              width: '100%', marginTop: '16px', padding: '14px 18px', borderRadius: '999px', border: 'none', cursor: 'pointer',
              backgroundColor: theme.green, color: '#fff', fontSize: '15px', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
              boxShadow: '0 8px 20px rgba(31,157,85,0.3)',
            }}>
            <span>Parier {miseActuelle} pts sur {nomChoix}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', opacity: 0.9 }}>
              Gain potentiel {gain} pts <ArrowRight size={16} />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Page non connecté ───────────────────────────────────────────────────
const AVANTAGES = [
  { icone: Gift, titre: '1 000 points offerts', texte: "Ton capital de départ dès l'inscription." },
  { icone: Target, titre: 'Parie sur chaque match', texte: 'Tous les matchs d\'Elite One et d\'Elite Two.' },
  { icone: Trophy, titre: 'Grimpe au classement', texte: 'Défie tes amis et les autres fans.' },
  { icone: Smartphone, titre: 'Convertis en FCFA', texte: 'Retire tes gains via Mobile Money.' },
];

function Presentation() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: FOND_BANDE, minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center', padding: '56px 0' }}>
      <EclatsBande />
      <div className="grid gap-12 lg:grid-cols-2" style={{ ...CONTENEUR, width: '100%', alignItems: 'center' }}>
        <div>
          <p style={{ color: theme.yellow, fontSize: '13px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
            Fantasy F237
          </p>
          <h1 style={{ color: '#fff', fontSize: '60px', fontWeight: 400, lineHeight: 1.05, marginBottom: '16px', fontFamily: MARQUEUR }}>
            Pronostique, gagne, grimpe
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '17px', lineHeight: 1.55, maxWidth: '480px', marginBottom: '30px' }}>
            Parie tes points sur les matchs de la MTN Elite One et de la MTN Elite Two, affronte tes amis et convertis tes gains en FCFA.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/register" className="transition-all hover:brightness-110"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 26px', borderRadius: '999px',
                backgroundColor: theme.green, color: '#fff', fontWeight: 800, fontSize: '16px', textDecoration: 'none',
                boxShadow: '0 8px 20px rgba(31,157,85,0.35)',
              }}>
              S'inscrire gratuitement <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="transition-colors"
              style={{
                padding: '14px 26px', borderRadius: '999px', border: '1.5px solid rgba(255,255,255,0.5)',
                color: '#fff', fontWeight: 800, fontSize: '16px', textDecoration: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
              Se connecter
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {AVANTAGES.map(({ icone: Icone, titre, texte }) => (
            <div key={titre} style={{
              padding: '22px', borderRadius: '16px',
              backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', backdropFilter: 'blur(4px)',
            }}>
              <span style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(60,207,122,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Icone size={22} color={theme.greenBright} />
              </span>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>{titre}</div>
              <div style={{ color: 'rgba(255,255,255,0.62)', fontSize: '14px', lineHeight: 1.45 }}>{texte}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Page ────────────────────────────────────────────────────────────────
const JouerPage = () => {
  const [mises, setMises] = useState({});
  const [selectionnes, setSelectionnes] = useState({});
  const [matchsAvenir, setMatchsAvenir] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Matchs à venir d'Elite One ET d'Elite Two (saison par défaut)
  useEffect(() => {
    let ignore = false;
    const ids = SAISONS_DB[ANNEE_ACTUELLE] ?? {};
    Promise.all(COMPETITIONS
      .filter(c => ids[c.cle] != null)
      .map(c => matchService.getBySaison(ids[c.cle])
        .then(data => data.map(m => ({ ...m, competition: c.label })))
        .catch(() => [])))
      .then(listes => {
        if (ignore) return;
        const avenir = listes.flat()
          .filter(m => m.statut === 0)
          .sort((a, b) => new Date(a.dateMatch) - new Date(b.dateMatch));
        setMatchsAvenir(avenir);
        setLoading(false);
      });
    return () => { ignore = true; };
  }, []);

  const selectionnerCote = (matchId, type) => {
    setSelectionnes(prev => ({ ...prev, [matchId]: prev[matchId] === type ? null : type }));
  };

  if (!user) return <Presentation />;

  const solde = user.soldePoints ?? 0;

  // Amis de démonstration (à remplacer par les vrais amis du backend)
  const amis = [
    { nom: 'Eric N.', pts: 1840, initiales: 'EN', couleur: '#1a7a3c' },
    { nom: 'Aicha M.', pts: 1620, initiales: 'AM', couleur: '#CE1126' },
    { nom: 'Junior K.', pts: 1320, initiales: 'JK', couleur: '#b8960c' },
    { nom: user.prenom ?? 'Moi', pts: solde, initiales: user.prenom?.[0] ?? 'M', couleur: '#141414', isMoi: true },
    { nom: 'Patrice D.', pts: 980, initiales: 'PD', couleur: '#1a3a7a' },
  ].sort((a, b) => b.pts - a.pts);
  const monRang = amis.findIndex(a => a.isMoi) + 1;
  const fcfa = Math.floor(solde / 1000) * 500;

  const stats = [
    { icone: Coins, label: 'Mes points', valeur: solde.toLocaleString('fr-FR'), couleur: theme.yellow, texteIcone: '#3a2c00' },
    { icone: Users, label: 'Rang entre amis', valeur: `#${monRang}`, couleur: theme.greenBright, texteIcone: '#0f3d26' },
    { icone: TrendingUp, label: 'Taux de réussite', valeur: '—', couleur: '#ff6b6f', texteIcone: '#4a0b0d' },
  ];

  return (
    <div>
      {/* ── ZONE HAUTE ─────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: FOND_BANDE, padding: '48px 0 52px' }}>
        <EclatsBande />
        <div style={CONTENEUR}>
          <p style={{ color: theme.yellow, fontSize: '13px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Fantasy F237
          </p>
          <h1 style={{ color: '#fff', fontSize: '56px', fontWeight: 400, lineHeight: 1.05, marginBottom: '8px', fontFamily: MARQUEUR }}>
            Salut {user.prenom} !
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', marginBottom: '30px' }}>
            Parie sur les matchs, grimpe au classement de tes amis et convertis tes points.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map(({ icone: Icone, label, valeur, couleur, texteIcone }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '16px',
                backgroundColor: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.13)', backdropFilter: 'blur(6px)',
              }}>
                <span style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: couleur, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icone size={22} color={texteIcone} />
                </span>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</div>
                  <div style={{ fontFamily: CHIFFRES, fontSize: '34px', fontWeight: 800, color: '#fff', lineHeight: 1.05 }}>{valeur}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ZONE BASSE ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: CLAIR.fond, minHeight: '480px', padding: '36px 0 64px' }}>
        <div style={CONTENEUR}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]" style={{ alignItems: 'start' }}>

            {/* Paris disponibles */}
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: CLAIR.texte }}>Paris disponibles</h2>
                {!loading && <span style={{ fontSize: '14px', fontWeight: 600, color: CLAIR.doux }}>{matchsAvenir.length} match{matchsAvenir.length > 1 ? 's' : ''}</span>}
              </div>

              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '56px 0', color: CLAIR.doux }}>
                  <Loader2 size={20} className="animate-spin" /> Chargement des matchs...
                </div>
              ) : matchsAvenir.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: CLAIR.carte, border: `1px dashed ${CLAIR.bord}`, borderRadius: '16px' }}>
                  <span style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#e8f3ec', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <CalendarDays size={26} color={CLAIR.vert} />
                  </span>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: CLAIR.texte, marginBottom: '6px' }}>Aucun match à venir pour le moment</p>
                  <p style={{ fontSize: '14px', color: CLAIR.doux, marginBottom: '16px' }}>Les paris ouvriront dès que les prochains matchs seront programmés.</p>
                  <Link to="/matchs" style={{ color: CLAIR.vert, fontWeight: 800, fontSize: '14px' }}>Voir le calendrier →</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {matchsAvenir.map(p => (
                    <CartePari key={p.id} p={p} solde={solde}
                      selection={selectionnes[p.id]}
                      onSelection={type => selectionnerCote(p.id, type)}
                      mise={mises[p.id]}
                      onMise={v => setMises(prev => ({ ...prev, [p.id]: v }))}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Colonne de droite */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Classement entre amis */}
              <div style={{ backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 20px', borderBottom: `1px solid ${CLAIR.bord}`, fontSize: '16px', fontWeight: 800, color: CLAIR.texte }}>
                  <Users size={17} color={CLAIR.vert} /> Mes amis
                </div>
                {amis.map((a, i) => (
                  <div key={a.nom + i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 20px',
                    borderTop: i ? `1px solid ${CLAIR.bord}` : 'none',
                    backgroundColor: a.isMoi ? '#e8f3ec' : 'transparent',
                  }}>
                    <span style={{ width: '18px', fontSize: '13px', fontWeight: 800, color: i < 3 ? CLAIR.vert : CLAIR.doux }}>{i + 1}</span>
                    <span style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: a.couleur, color: '#fff', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {a.initiales}
                    </span>
                    <span style={{ flex: 1, minWidth: 0, fontSize: '15px', fontWeight: a.isMoi ? 800 : 600, color: a.isMoi ? CLAIR.vert : CLAIR.texte }}>
                      {a.nom}{a.isMoi && <span style={{ fontSize: '11px', fontWeight: 700, color: CLAIR.doux }}> (toi)</span>}
                    </span>
                    <span style={{ fontFamily: CHIFFRES, fontSize: '19px', fontWeight: 800, color: a.isMoi ? CLAIR.vert : CLAIR.texte }}>{a.pts.toLocaleString('fr-FR')}</span>
                  </div>
                ))}
                <div style={{ padding: '14px 20px', borderTop: `1px solid ${CLAIR.bord}` }}>
                  <button className="transition-all hover:brightness-110"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '999px', border: 'none', cursor: 'pointer', backgroundColor: theme.green, color: '#fff', fontWeight: 800, fontSize: '15px' }}>
                    <Plus size={16} /> Inviter un ami
                  </button>
                </div>
              </div>

              {/* Conversion en FCFA */}
              <div style={{ borderRadius: '16px', overflow: 'hidden', background: 'linear-gradient(135deg, #fff8d6, #fdf0b0)', border: '1px solid #f1e2a6' }}>
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 800, color: '#6b5510', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    <Smartphone size={16} /> Convertir mes points
                  </div>
                  <p style={{ fontSize: '13px', color: '#8a7330', marginBottom: '12px' }}>1 000 points = 500 FCFA · via Mobile Money</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontFamily: CHIFFRES, fontSize: '44px', fontWeight: 800, color: '#2b2205', lineHeight: 1 }}>{fcfa.toLocaleString('fr-FR')}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#6b5510' }}>FCFA disponibles</span>
                  </div>
                  <button disabled={fcfa === 0} className="transition-all hover:brightness-125"
                    style={{
                      width: '100%', padding: '12px', borderRadius: '999px', border: 'none',
                      cursor: fcfa === 0 ? 'not-allowed' : 'pointer', opacity: fcfa === 0 ? 0.5 : 1,
                      backgroundColor: '#141414', color: '#fff', fontWeight: 800, fontSize: '15px',
                    }}>
                    Demander un retrait
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JouerPage;