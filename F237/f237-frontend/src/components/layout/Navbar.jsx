// f237-frontend/src/components/layout/Navbar.jsx
// Grand écran (≥ 1280px) : logo | 6 onglets centrés | admin, points, profil, langue.
// Téléphone et tablette (inspiré de l'appli FIBA) :
// - barre du haut minimaliste : logo | langue + compte ;
// - barre d'onglets fixée en bas : Accueil, Matchs, Classements, Équipes, Plus ;
// - "Plus" ouvre un panneau : Fantasy, Actualités, et le compte (profil, admin, déconnexion).
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import {
    Home, LayoutList, Trophy, Dices, Newspaper,
    UserCircle, Globe, ChevronDown, Shield, Check, LayoutDashboard,
    MoreHorizontal, LogOut, ChevronRight
} from 'lucide-react';
import LogoF237 from './LogoF237';
import { LANGUES, locale } from '../../i18n';
import theme from '../../theme';

const HAUTEUR = 68;          // barre sur grand écran
const HAUTEUR_MOBILE = 60;   // barre du haut sur téléphone / tablette
export const HAUTEUR_ONGLETS = 64; // barre d'onglets du bas (Layout réserve cette place sous le pied de page)

// ── Menu de choix de la langue (FR / EN) ────────────────────────────────
const SelecteurLangue = () => {
    const { t, i18n } = useTranslation();
    const [ouvert, setOuvert] = useState(false);
    const ref = useRef(null);
    const actuelle = LANGUES.find(l => l.code === i18n.resolvedLanguage) ?? LANGUES[0];

    // Ferme le menu au clic ailleurs ou avec Échap
    useEffect(() => {
        if (!ouvert) return;
        const clic = (e) => { if (!ref.current?.contains(e.target)) setOuvert(false); };
        const touche = (e) => { if (e.key === 'Escape') setOuvert(false); };
        document.addEventListener('mousedown', clic);
        document.addEventListener('keydown', touche);
        return () => {
            document.removeEventListener('mousedown', clic);
            document.removeEventListener('keydown', touche);
        };
    }, [ouvert]);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOuvert(o => !o)}
                aria-haspopup="listbox"
                aria-expanded={ouvert}
                aria-label={t('nav.langue')}
                className="flex items-center gap-1 font-semibold transition-colors"
                style={{ color: ouvert ? theme.text : theme.textMuted, fontSize: '13px', padding: '8px 2px' }}
                onMouseEnter={e => { e.currentTarget.style.color = theme.text; }}
                onMouseLeave={e => { if (!ouvert) e.currentTarget.style.color = theme.textMuted; }}
            >
                <Globe size={15} />
                {actuelle.court}
                <ChevronDown size={13} style={{ transition: 'transform 0.2s ease', transform: ouvert ? 'rotate(180deg)' : 'none' }} />
            </button>

            {ouvert && (
                <ul role="listbox" style={{
                    position: 'absolute', top: 'calc(100% + 12px)', right: 0, zIndex: 60, minWidth: '170px',
                    listStyle: 'none', margin: 0, padding: '6px',
                    backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
                }}>
                    {LANGUES.map(l => {
                        const actif = l.code === actuelle.code;
                        return (
                            <li key={l.code}>
                                <button
                                    role="option"
                                    aria-selected={actif}
                                    lang={l.code}
                                    onClick={() => { i18n.changeLanguage(l.code); setOuvert(false); }}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                                        padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left',
                                        backgroundColor: actif ? '#e8f3ec' : 'transparent',
                                        color: '#141414', fontSize: '14px', fontWeight: actif ? 800 : 600,
                                    }}
                                    onMouseEnter={e => { if (!actif) e.currentTarget.style.backgroundColor = '#f2f4f3'; }}
                                    onMouseLeave={e => { if (!actif) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#6b7470', width: '20px' }}>{l.court}</span>
                                        {l.nom}
                                    </span>
                                    {actif && <Check size={15} color="#14532f" />}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

// Points du joueur (pastille jaune)
const PastillePoints = ({ points }) => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>
            <Trophy size={13} style={{ color: theme.yellow }} />
            <span className="font-bold text-sm" style={{ color: theme.yellow }}>
                {t('nav.pts', { n: (points ?? 0).toLocaleString(locale()) })}
            </span>
        </div>
    );
};

// ── Panneau du menu mobile ──────────────────────────────────────────────
const MenuMobile = ({ navItems, isActive, user, estAdmin, onLogout }) => {
    // Les onglets déjà présents dans la barre du bas ne sont pas répétés ici
    const { t } = useTranslation();
    const ligne = (actif) => ({
        display: 'flex', alignItems: 'center', gap: '14px', minHeight: '52px', padding: '0 14px',
        borderRadius: '12px', textDecoration: 'none', fontSize: '16px', fontWeight: 700,
        color: actif ? theme.text : theme.textMuted,
        backgroundColor: actif ? theme.surface : 'transparent',
    });

    return (
        <div
            className="xl:hidden"
            style={{
                position: 'fixed', top: HAUTEUR_MOBILE, left: 0, right: 0, zIndex: 49,
                bottom: `calc(${HAUTEUR_ONGLETS}px + env(safe-area-inset-bottom))`,
                backgroundColor: theme.bgDeep, overflowY: 'auto', overscrollBehavior: 'contain',
                padding: '14px 16px 32px',
            }}
        >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {navItems.map(({ to, label, Icon }) => {
                    const actif = isActive(to);
                    return (
                        <Link key={to} to={to} style={ligne(actif)} aria-current={actif ? 'page' : undefined}>
                            <Icon size={20} style={{ color: actif ? theme.greenBright : 'inherit' }} />
                            {label}
                            <ChevronRight size={18} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                        </Link>
                    );
                })}
            </nav>

            <div style={{ height: '1px', backgroundColor: theme.border, margin: '16px 0' }} />

            {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '0 4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 800, color: theme.text }}>
                            <UserCircle size={22} style={{ color: theme.greenBright }} /> {user.prenom}
                        </span>
                        <PastillePoints points={user.soldePoints} />
                    </div>
                    <Link to="/profil" style={ligne(isActive('/profil'))}>
                        <UserCircle size={20} /> {t('nav.monProfil')}
                        <ChevronRight size={18} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                    </Link>
                    {estAdmin && (
                        <Link to="/admin" style={{ ...ligne(isActive('/admin')), color: theme.yellow }}>
                            <LayoutDashboard size={20} /> Admin
                            <ChevronRight size={18} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                        </Link>
                    )}
                    <button onClick={onLogout} style={{ ...ligne(false), border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                        <LogOut size={20} /> {t('nav.quitter')}
                    </button>
                </div>
            ) : (
                <Link to="/login"
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', minHeight: '52px',
                        borderRadius: '999px', backgroundColor: theme.green, color: '#fff',
                        fontSize: '16px', fontWeight: 800, textDecoration: 'none',
                    }}>
                    <UserCircle size={20} /> {t('nav.connexion')}
                </Link>
            )}
        </div>
    );
};

// Un onglet de la barre du bas : icône + libellé, couleur verte quand actif
const Onglet = ({ to, label, Icon, actif, onClick, ariaExpanded }) => {
    const style = {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px',
        height: HAUTEUR_ONGLETS, textDecoration: 'none', border: 'none', background: 'none', cursor: 'pointer',
        color: actif ? theme.greenBright : theme.textMuted, minWidth: 0,
    };
    const contenu = (
        <>
            <Icon size={22} strokeWidth={actif ? 2.4 : 2} />
            <span style={{ fontSize: '11px', fontWeight: actif ? 800 : 600, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 2px' }}>
                {label}
            </span>
        </>
    );
    return to
        ? <Link to={to} style={style} aria-current={actif ? 'page' : undefined}>{contenu}</Link>
        : <button type="button" onClick={onClick} style={style} aria-expanded={ariaExpanded}>{contenu}</button>;
};

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user, estAdmin, logout } = useAuth();

    // Menu mobile : ouvert "sur" une page ; changer de page le referme tout seul
    const [menuOuvertSur, setMenuOuvertSur] = useState(null);
    const menuOuvert = menuOuvertSur === location.pathname;
    const basculerMenu = () => setMenuOuvertSur(menuOuvert ? null : location.pathname);

    // Menu ouvert : la page derrière ne défile plus ; Échap le referme
    useEffect(() => {
        if (!menuOuvert) return;
        const avant = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const touche = (e) => { if (e.key === 'Escape') setMenuOuvertSur(null); };
        document.addEventListener('keydown', touche);
        return () => {
            document.body.style.overflow = avant;
            document.removeEventListener('keydown', touche);
        };
    }, [menuOuvert]);

    // "/" seulement sur l'accueil ; les autres onglets restent actifs sur leurs
    // sous-pages (ex. /actualites/mon-article, /equipes/12)
    const isActive = (path) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    const navItems = [
        { to: '/', label: t('nav.accueil'), Icon: Home },
        { to: '/matchs', label: t('nav.matchs'), Icon: LayoutList },
        { to: '/classement', label: t('nav.classements'), Icon: Trophy },
        { to: '/equipes', label: t('nav.equipes'), Icon: Shield },
        { to: '/jouer', label: t('nav.fantasy'), Icon: Dices },
        { to: '/actualites', label: t('nav.actualites'), Icon: Newspaper },
    ];

    const handleLogout = () => {
        setMenuOuvertSur(null);
        logout();
        navigate('/');
    };

    return (
        <>
            <nav
                className="sticky top-0 z-50"
                style={{
                    backgroundColor: theme.nav,
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderBottom: `1px solid ${theme.border}`,
                }}
            >
                {/* ── Téléphone / tablette ─────────────────────────────── */}
                <div className="flex xl:hidden items-center justify-between" style={{ height: HAUTEUR_MOBILE, padding: '0 var(--marge-page)' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center' }} aria-label={`${t('nav.accueil')} F237`}>
                        <LogoF237 size={34} />
                    </Link>
                    <div className="flex items-center gap-3">
                        {user && <span className="hidden sm:block"><PastillePoints points={user.soldePoints} /></span>}
                        <SelecteurLangue />
                        {/* Compte : profil si connecté, sinon connexion */}
                        <Link
                            to={user ? '/profil' : '/login'}
                            aria-label={user ? t('nav.monProfil') : t('nav.connexion')}
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                backgroundColor: user ? theme.green : theme.surfaceHover, color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <UserCircle size={22} />
                        </Link>
                    </div>
                </div>

                {/* ── Grand écran ─────────────────────────────────────── */}
                <div className="hidden xl:flex items-center justify-between px-8" style={{ height: HAUTEUR }}>
                    {/* Logo */}
                    <Link to="/" style={{ paddingLeft: '80px', display: 'flex', alignItems: 'center', minWidth: '120px' }}>
                        <LogoF237 size={40} />
                    </Link>

                    {/* Navigation centrée */}
                    <div className="flex items-center">
                        {navItems.map(({ to, label, Icon }) => {
                            const active = isActive(to);
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className="flex flex-col items-center justify-center px-5 transition-colors"
                                    style={{
                                        height: HAUTEUR,
                                        color: active ? theme.text : theme.textMuted,
                                        borderBottom: active ? `3px solid ${theme.greenBright}` : '3px solid transparent',
                                        minWidth: '80px',
                                    }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.color = theme.text; }}
                                    onMouseLeave={e => { if (!active) e.currentTarget.style.color = theme.textMuted; }}
                                >
                                    <Icon size={20} style={{ marginBottom: '3px', color: active ? theme.greenBright : 'inherit' }} />
                                    <span className="font-semibold" style={{ fontSize: '12px', letterSpacing: '0.3px' }}>
                                        {label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Droite */}
                    <div className="flex items-center gap-3" style={{ minWidth: '200px', justifyContent: 'flex-end', paddingRight: '50px' }}>
                        {user ? (
                            <>
                                {/* Lien vers l'espace admin, visible seulement par les admins */}
                                {estAdmin && (
                                    <Link
                                        to="/admin"
                                        title="Espace admin"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-colors"
                                        style={{
                                            fontSize: '13px',
                                            color: isActive('/admin') ? '#1a1a1a' : theme.yellow,
                                            backgroundColor: isActive('/admin') ? theme.yellow : 'transparent',
                                            border: `1px solid ${theme.yellow}66`,
                                        }}
                                    >
                                        <LayoutDashboard size={14} />
                                        Admin
                                    </Link>
                                )}

                                <PastillePoints points={user.soldePoints} />

                                <Link
                                    to="/profil"
                                    className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all hover:brightness-110"
                                    style={{ backgroundColor: theme.green, color: '#fff', fontSize: '13px' }}
                                >
                                    <UserCircle size={16} />
                                    {user.prenom}
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="font-semibold transition-colors"
                                    style={{ color: theme.textMuted, fontSize: '13px' }}
                                    onMouseEnter={e => { e.currentTarget.style.color = theme.text; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = theme.textMuted; }}
                                >
                                    {t('nav.quitter')}
                                </button>
                            </>
                        ) : (
                            /* Bouton unique "Connexion" (style FIBA) — l'inscription
                               se fait depuis la page de connexion */
                            <Link
                                to="/login"
                                className="flex items-center gap-2 rounded-full font-semibold transition-colors"
                                style={{
                                    backgroundColor: theme.surfaceHover,
                                    color: theme.text,
                                    fontSize: '15px',
                                    padding: '9px 20px 9px 12px',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = theme.green; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = theme.surfaceHover; }}
                            >
                                <UserCircle size={22} fill="#fff" color={theme.surfaceHover} strokeWidth={1.8} />
                                {t('nav.connexion')}
                            </Link>
                        )}

                        <SelecteurLangue />
                    </div>
                </div>
            </nav>

            {menuOuvert && (
                <MenuMobile navItems={navItems.slice(4)} isActive={isActive} user={user} estAdmin={estAdmin} onLogout={handleLogout} />
            )}

            {/* ── Barre d'onglets du bas (téléphone / tablette) ───────── */}
            <nav
                className="xl:hidden"
                aria-label={t('nav.navigation')}
                style={{
                    position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
                    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                    height: `calc(${HAUTEUR_ONGLETS}px + env(safe-area-inset-bottom))`,
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    backgroundColor: theme.bgDeep, borderTop: `1px solid ${theme.border}`,
                }}
            >
                {navItems.slice(0, 4).map(({ to, label, Icon }) => (
                    <Onglet key={to} to={to} label={label} Icon={Icon} actif={!menuOuvert && isActive(to)} />
                ))}
                <Onglet
                    label={t('nav.plus')} Icon={MoreHorizontal} onClick={basculerMenu}
                    actif={menuOuvert || ['/jouer', '/actualites', '/profil', '/admin'].some(isActive)}
                    ariaExpanded={menuOuvert}
                />
            </nav>
        </>
    );
};

export default Navbar;