// f237-frontend/src/pages/EquipesPage.jsx
// Liste des clubs, inspirée de FIBA :
// - zone haute sombre : titre, choix du championnat, recherche, tri
// - zone basse claire : grille de cartes blanches (logo, nom, ville, rang au classement)

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, ArrowRight, X, CalendarClock } from 'lucide-react';
import { equipeService } from '../services/equipeService';
import { classementService } from '../services/classementService';
import { COMPETITIONS, SAISONS_DB, ANNEE_ACTUELLE, libelleSaison } from '../data/saisons';
import SelecteurSaison from '../components/SelecteurSaison';
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
const CONTENEUR = { position: 'relative', maxWidth: '1150px', margin: '0 auto', padding: '0 60px', boxSizing: 'content-box' };

// Dans la base : division 0 = Elite One, 1 = Elite Two
const DIVISION = { one: 0, two: 1 };

const FOND_BANDE = `linear-gradient(120deg, ${theme.greenDeep} 0%, #12462c 45%, #0f3a25 100%)`;

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

// Initiales + couleur de secours quand un club n'a pas de logo
const initiales = (nom) => (nom ?? '').split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
const COULEURS = ['#1a7a3c', '#CE1126', '#b8960c', '#1a3a7a', '#7a1a6a', '#1a6a7a', '#7a4a1a', '#4a7a1a', '#6a1a1a', '#1a1a7a'];
const couleurDe = (id) => COULEURS[(id ?? 0) % COULEURS.length];
const villeDe = (e) => e.ville ?? e.city ?? null;
const sansAccents = (s) => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const TRIS = [
  { cle: 'classement', label: 'Classement' },
  { cle: 'alpha', label: 'A → Z' },
];

// ── Carte d'un club ─────────────────────────────────────────────────────
function CarteEquipe({ e, rang }) {
  const ville = villeDe(e);
  return (
    <Link
      to={`/equipes/${e.id}`}
      className="group transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      style={{
        position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '16px',
        padding: '26px 18px 0', textDecoration: 'none', overflow: 'hidden',
      }}
    >
      {/* Rang au classement, en haut à gauche */}
      {rang && (
        <span style={{
          position: 'absolute', top: '12px', left: '12px',
          fontFamily: CHIFFRES, fontWeight: 800, fontSize: '15px',
          color: rang.position <= 3 ? '#fff' : CLAIR.doux,
          backgroundColor: rang.position <= 3 ? CLAIR.vert : CLAIR.tuile,
          borderRadius: '8px', padding: '2px 9px',
        }}>
          #{rang.position}
        </span>
      )}

      {e.logoUrl ? (
        <img src={e.logoUrl} alt="" className="transition-transform duration-300 group-hover:scale-110"
          style={{ width: '84px', height: '84px', objectFit: 'contain' }} />
      ) : (
        <span style={{
          width: '84px', height: '84px', borderRadius: '50%', backgroundColor: couleurDe(e.id), color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '22px',
        }}>{initiales(e.nom)}</span>
      )}

      <span style={{ marginTop: '16px', fontSize: '17px', fontWeight: 800, color: CLAIR.texte, lineHeight: 1.25 }}>{e.nom}</span>
      <span style={{ marginTop: '4px', minHeight: '18px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: CLAIR.doux }}>
        {ville && <><MapPin size={13} /> {ville}</>}
      </span>

      {/* Pied de carte : points + lien */}
      <span style={{
        marginTop: '18px', width: 'calc(100% + 36px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '11px 18px', borderTop: `1px solid ${CLAIR.bord}`, backgroundColor: '#fafbfa',
        fontSize: '13px', fontWeight: 700, color: CLAIR.doux,
      }}>
        <span>{rang ? <><strong style={{ color: CLAIR.texte }}>{rang.points}</strong> pts</> : '—'}</span>
        <span className="transition-colors group-hover:text-[#14532f]" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          Voir le club <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </span>
      </span>
    </Link>
  );
}

// ── Page ────────────────────────────────────────────────────────────────
function EquipesPage() {
  const [equipes, setEquipes] = useState([]);
  const [clsEtat, setClsEtat] = useState(null); // { annee, data: { one: [...], two: [...] } }
  const [annee, setAnnee] = useState(ANNEE_ACTUELLE);
  const [loading, setLoading] = useState(true);
  const [comp, setComp] = useState('one');
  const [recherche, setRecherche] = useState('');
  const [tri, setTri] = useState('classement');

  const saisonDispo = !!SAISONS_DB[annee]; // false = saison pas encore importée

  // Liste des clubs (une seule fois)
  useEffect(() => {
    let ignore = false;
    equipeService.getAll()
      .catch(() => [])
      .then(liste => { if (!ignore) { setEquipes(liste); setLoading(false); } });
    return () => { ignore = true; };
  }, []);

  // Classements de la saison choisie (pour afficher le rang de chaque club)
  useEffect(() => {
    const ids = SAISONS_DB[annee];
    if (!ids) return;
    let ignore = false;
    Promise.all(COMPETITIONS.map(c => (ids[c.cle] != null ? classementService.getBySaison(ids[c.cle]).catch(() => []) : Promise.resolve([]))))
      .then(cls => {
        if (!ignore) setClsEtat({ annee, data: Object.fromEntries(COMPETITIONS.map((c, i) => [c.cle, cls[i]])) });
      });
    return () => { ignore = true; };
  }, [annee]);

  const classements = useMemo(() => (clsEtat?.annee === annee ? clsEtat.data : {}), [clsEtat, annee]);

  // Rang de chaque club dans son championnat (par id, sinon par nom)
  const rangs = useMemo(() => {
    const map = new Map();
    for (const liste of Object.values(classements)) {
      [...liste]
        .sort((a, b) => (a.position ?? 999) - (b.position ?? 999) || (b.points ?? 0) - (a.points ?? 0))
        .forEach((l, i) => {
          const info = { position: l.position ?? i + 1, points: l.points ?? 0 };
          const id = l.equipeId ?? l.equipe?.id;
          if (id != null) map.set(`id:${id}`, info);
          if (l.equipe?.nom ?? l.nom) map.set(`nom:${l.equipe?.nom ?? l.nom}`, info);
        });
    }
    return map;
  }, [classements]);
  const rangDe = (e) => rangs.get(`id:${e.id}`) ?? rangs.get(`nom:${e.nom}`) ?? null;

  const competition = COMPETITIONS.find(c => c.cle === comp)?.label ?? '';
  const nbParComp = (cle) => equipes.filter(e => e.division === DIVISION[cle]).length;

  const affichees = equipes
    .filter(e => e.division === DIVISION[comp])
    .filter(e => {
      const q = sansAccents(recherche.trim());
      return !q || sansAccents(e.nom).includes(q) || sansAccents(villeDe(e)).includes(q);
    })
    .sort((a, b) => {
      if (tri === 'classement') {
        const ra = rangDe(a)?.position ?? 999, rb = rangDe(b)?.position ?? 999;
        if (ra !== rb) return ra - rb;
      }
      return a.nom.localeCompare(b.nom, 'fr');
    });

  return (
    <div>
      {/* ── ZONE HAUTE ─────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: FOND_BANDE, padding: '48px 0 40px' }}>
        <EclatsBande />
        <div style={CONTENEUR}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <SelecteurSaison annee={annee} onChange={setAnnee} />
              <h1 style={{ color: '#fff', fontSize: '56px', fontWeight: 400, lineHeight: 1.05, margin: '14px 0 10px', fontFamily: '"Permanent Marker", "Raleway", Arial, sans-serif' }}>
                Équipes
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>
                Tous les clubs de la MTN Elite One et de la MTN Elite Two.
              </p>
            </div>

            <div style={{ display: 'flex', padding: '4px', borderRadius: '999px', backgroundColor: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.12)' }}>
              {COMPETITIONS.map(c => {
                const actif = c.cle === comp;
                return (
                  <button key={c.cle} onClick={() => setComp(c.cle)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 20px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                      fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px',
                      backgroundColor: actif ? '#fff' : 'transparent',
                      color: actif ? '#0f3d26' : 'rgba(255,255,255,0.8)',
                      transition: 'all 0.2s ease',
                    }}>
                    MTN {c.label}
                    {!loading && saisonDispo && (
                      <span style={{
                        fontSize: '11px', fontWeight: 800, padding: '1px 7px', borderRadius: '999px',
                        backgroundColor: actif ? '#e8f3ec' : 'rgba(255,255,255,0.12)',
                        color: actif ? CLAIR.vert : 'rgba(255,255,255,0.8)',
                      }}>{nbParComp(c.cle)}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Barre de recherche + tri */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '30px', flexWrap: 'wrap' }}>
            <div style={{
              flex: '1 1 320px', display: 'flex', alignItems: 'center', gap: '10px',
              backgroundColor: '#fff', borderRadius: '12px', padding: '0 14px', boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
            }}>
              <Search size={18} color={CLAIR.doux} />
              <input
                value={recherche}
                onChange={ev => setRecherche(ev.target.value)}
                placeholder="Rechercher un club ou une ville..."
                aria-label="Rechercher un club"
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', padding: '14px 0', fontSize: '15px', color: CLAIR.texte, background: 'transparent' }}
              />
              {recherche && (
                <button onClick={() => setRecherche('')} aria-label="Effacer"
                  style={{ border: 'none', background: CLAIR.tuile, borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} color={CLAIR.doux} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', backgroundColor: '#fff', borderRadius: '12px', padding: '4px', boxShadow: '0 10px 30px rgba(0,0,0,0.22)' }}>
              {TRIS.map(t => {
                const actif = t.cle === tri;
                return (
                  <button key={t.cle} onClick={() => setTri(t.cle)}
                    style={{
                      padding: '10px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                      fontSize: '14px', fontWeight: 700,
                      backgroundColor: actif ? CLAIR.vert : 'transparent',
                      color: actif ? '#fff' : CLAIR.doux,
                    }}>
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── ZONE BASSE ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: CLAIR.fond, minHeight: '480px', padding: '36px 0 64px' }}>
        <div style={CONTENEUR}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: CLAIR.texte, marginBottom: '18px' }}>
            MTN {competition}
            <span style={{ fontSize: '15px', fontWeight: 600, color: CLAIR.doux, marginLeft: '10px' }}>
              {loading || !saisonDispo ? '' : `${affichees.length} club${affichees.length > 1 ? 's' : ''}`}
            </span>
          </h2>

          {!saisonDispo ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center',
              padding: '56px 24px', backgroundColor: CLAIR.carte, border: `1px dashed ${CLAIR.bord}`, borderRadius: '14px',
            }}>
              <span style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#e8f3ec', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarClock size={26} color={CLAIR.vert} />
              </span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: CLAIR.texte }}>MTN {competition} · Saison {libelleSaison(annee)}</div>
              <p style={{ fontSize: '15px', color: CLAIR.doux, maxWidth: '440px', lineHeight: 1.5 }}>
                Les clubs de cette saison ne sont pas encore disponibles sur F237. Ils arrivent bientôt !
              </p>
              <button onClick={() => setAnnee(ANNEE_ACTUELLE)}
                style={{ marginTop: '6px', padding: '10px 20px', borderRadius: '999px', border: 'none', cursor: 'pointer', backgroundColor: CLAIR.vert, color: '#fff', fontSize: '14px', fontWeight: 700 }}>
                Revenir à la saison {libelleSaison(ANNEE_ACTUELLE)}
              </button>
            </div>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: CLAIR.doux }}>Chargement des équipes...</div>
          ) : affichees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 20px', color: CLAIR.doux, backgroundColor: CLAIR.carte, border: `1px dashed ${CLAIR.bord}`, borderRadius: '14px' }}>
              {recherche ? `Aucun club ne correspond à « ${recherche} ».` : 'Aucun club pour ce championnat.'}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {affichees.map(e => <CarteEquipe key={e.id} e={e} rang={rangDe(e)} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default EquipesPage;