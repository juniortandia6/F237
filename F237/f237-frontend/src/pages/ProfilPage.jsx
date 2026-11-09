// f237-frontend/src/pages/ProfilPage.jsx
// Profil du membre, dans le style des autres pages :
// - bande sombre : avatar, nom, email, date d'inscription + 4 statistiques
// - zone claire : historique des paris + colonne (conversion FCFA, accès rapides)

import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Trophy, TrendingUp, Calendar, Mail, LogOut, Coins, Target, Smartphone,
  Loader2, AlertCircle, ArrowRight, Dices, CalendarDays, ListChecks,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { locale } from '../i18n';
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
const MARQUEUR = 'var(--font-titres)';
const CONTENEUR = { position: 'relative', maxWidth: '1150px', margin: '0 auto', padding: '0 60px', boxSizing: 'content-box' };
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

// Carte blanche avec titre (même composant que sur les fiches club / match)
function Carte({ titre, icone: Icone, children, style }) {
  return (
    <div style={{ backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '16px', overflow: 'hidden', ...style }}>
      {titre && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 20px', borderBottom: `1px solid ${CLAIR.bord}`, fontSize: '16px', fontWeight: 800, color: CLAIR.texte }}>
          {Icone && <Icone size={17} color={CLAIR.vert} />}
          {titre}
        </div>
      )}
      {children}
    </div>
  );
}

// Écran centré (chargement / erreur)
function EcranCentre({ children }) {
  return (
    <div style={{ backgroundColor: CLAIR.fond, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      {children}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────
function ProfilPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // null = chargement en cours ; sinon { profil } ou { erreur: true }
  const [etat, setEtat] = useState(null);

  useEffect(() => {
    if (!user) return;
    let ignore = false;
    authService.getProfil()
      .then(profil => { if (!ignore) setEtat({ profil }); })
      .catch(() => { if (!ignore) setEtat({ erreur: true }); });
    return () => { ignore = true; };
  }, [user]);

  // Pas connecté : direction la page de connexion
  if (!user) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (etat === null) {
    return (
      <EcranCentre>
        <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: CLAIR.doux }}>
          <Loader2 size={18} className="animate-spin" /> {t('profil.chargement')}
        </p>
      </EcranCentre>
    );
  }

  if (etat.erreur || !etat.profil) {
    return (
      <EcranCentre>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={40} color={theme.red} style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '18px', fontWeight: 800, color: CLAIR.texte, marginBottom: '10px' }}>{t('profil.erreur')}</p>
          <Link to="/" style={{ color: CLAIR.vert, fontWeight: 700 }}>← {t('nav.accueil')}</Link>
        </div>
      </EcranCentre>
    );
  }

  const profil = etat.profil;
  const solde = profil.soldePoints ?? 0;
  const fcfa = Math.floor(solde / 1000) * 500;
  const nbParis = profil.nbParis ?? 0;
  const initiales = `${profil.prenom?.[0] ?? ''}${profil.nom?.[0] ?? ''}`.toUpperCase();
  const depuis = profil.dateInscription
    ? new Date(profil.dateInscription).toLocaleDateString(locale(), { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const stats = [
    { icone: Coins, label: t('profil.stats.points'), valeur: solde.toLocaleString(locale()), couleur: theme.yellow, texteIcone: '#3a2c00' },
    { icone: Trophy, label: t('profil.stats.classement'), valeur: profil.classementGeneral ? `#${profil.classementGeneral}` : '—', couleur: theme.greenBright, texteIcone: '#0f3d26' },
    { icone: Target, label: t('profil.stats.paris'), valeur: nbParis, couleur: '#ff6b6f', texteIcone: '#4a0b0d' },
    { icone: TrendingUp, label: t('profil.stats.reussite'), valeur: nbParis > 0 ? `${profil.tauxReussite ?? 0}%` : '—', couleur: '#8fb3ff', texteIcone: '#0d1f4a' },
  ];

  const raccourcis = [
    { to: '/jouer', icone: Dices, label: t('profil.raccourcis.parier') },
    { to: '/matchs', icone: CalendarDays, label: t('profil.raccourcis.calendrier') },
    { to: '/classement', icone: ListChecks, label: t('profil.raccourcis.classement') },
  ];

  return (
    <div>
      {/* ── ZONE HAUTE ─────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: FOND_BANDE, padding: '48px 0 52px' }}>
        <EclatsBande />
        <div style={CONTENEUR}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
            {/* Avatar + identité */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', minWidth: 0 }}>
              <span style={{
                width: '112px', height: '112px', borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${theme.green}, #0f3d26)`,
                border: `3px solid ${theme.yellow}`, boxShadow: '0 14px 34px rgba(0,0,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontFamily: CHIFFRES, fontSize: '44px', fontWeight: 800, letterSpacing: '1px',
              }}>
                {initiales || '?'}
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ color: theme.yellow, fontSize: '13px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {t('profil.surtitre')}
                </p>
                <h1 style={{ color: '#fff', fontSize: '52px', fontWeight: 400, lineHeight: 1.05, fontFamily: MARQUEUR, marginBottom: '12px' }}>
                  {profil.prenom} {profil.nom}
                </h1>
                <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
                  {profil.email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                      <Mail size={15} /> {profil.email}
                    </span>
                  )}
                  {depuis && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                      <Calendar size={15} /> {t('profil.membreDepuis', { date: depuis })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Déconnexion */}
            <button onClick={handleLogout}
              className="transition-colors"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', borderRadius: '999px', cursor: 'pointer',
                border: '1.5px solid rgba(255,255,255,0.45)', background: 'transparent', color: '#fff', fontSize: '14px', fontWeight: 700,
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
              <LogOut size={16} /> {t('profil.deconnexion')}
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
      <section style={{ backgroundColor: CLAIR.fond, minHeight: '420px', padding: '36px 0 64px' }}>
        <div style={CONTENEUR}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]" style={{ alignItems: 'start' }}>

            {/* Historique des paris */}
            <Carte titre={t('profil.historique')} icone={Target}>
              {nbParis === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <span style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#e8f3ec', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Dices size={26} color={CLAIR.vert} />
                  </span>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: CLAIR.texte, marginBottom: '6px' }}>{t('profil.aucunPari')}</p>
                  <p style={{ fontSize: '14px', color: CLAIR.doux, marginBottom: '18px' }}>{t('profil.aucunPariTexte')}</p>
                  <Link to="/jouer" className="transition-all hover:brightness-110"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', borderRadius: '999px',
                      backgroundColor: theme.green, color: '#fff', fontWeight: 800, fontSize: '15px', textDecoration: 'none',
                      boxShadow: '0 8px 20px rgba(31,157,85,0.3)',
                    }}>
                    {t('profil.commencer')} <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <p style={{ padding: '36px 20px', textAlign: 'center', color: CLAIR.doux, fontSize: '14px' }}>
                  {t('profil.historiqueBientot', { count: nbParis })}
                </p>
              )}
            </Carte>

            {/* Colonne de droite */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Conversion en FCFA (même carte que sur Fantasy) */}
              <div style={{ borderRadius: '16px', overflow: 'hidden', background: 'linear-gradient(135deg, #fff8d6, #fdf0b0)', border: '1px solid #f1e2a6' }}>
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 800, color: '#6b5510', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    <Smartphone size={16} /> {t('jouer.convertir')}
                  </div>
                  <p style={{ fontSize: '13px', color: '#8a7330', marginBottom: '12px' }}>{t('jouer.taux')}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontFamily: CHIFFRES, fontSize: '44px', fontWeight: 800, color: '#2b2205', lineHeight: 1 }}>{fcfa.toLocaleString(locale())}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#6b5510' }}>{t('jouer.fcfaDispo')}</span>
                  </div>
                  <button disabled={fcfa === 0} className="transition-all hover:brightness-125"
                    style={{
                      width: '100%', padding: '12px', borderRadius: '999px', border: 'none',
                      cursor: fcfa === 0 ? 'not-allowed' : 'pointer', opacity: fcfa === 0 ? 0.5 : 1,
                      backgroundColor: '#141414', color: '#fff', fontWeight: 800, fontSize: '15px',
                    }}>
                    {t('jouer.retrait')}
                  </button>
                </div>
              </div>

              {/* Accès rapides */}
              <Carte titre={t('profil.accesRapides')}>
                {raccourcis.map(({ to, icone: Icone, label }, i) => (
                  <Link key={to} to={to} className="group transition-colors hover:bg-[#f7f9f8]"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 20px',
                      borderTop: i ? `1px solid ${CLAIR.bord}` : 'none', textDecoration: 'none', color: CLAIR.texte,
                    }}>
                    <span style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#e8f3ec', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icone size={16} color={CLAIR.vert} />
                    </span>
                    <span style={{ flex: 1, fontSize: '15px', fontWeight: 700 }}>{label}</span>
                    <ArrowRight size={15} color={CLAIR.doux} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </Carte>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProfilPage;