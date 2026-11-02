// f237-frontend/src/components/layout/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import {
    Home, LayoutList, Trophy, Dices, Newspaper,
    UserCircle, Globe, ChevronDown, Shield, Check
} from 'lucide-react';
import LogoF237 from './LogoF237';
import { LANGUES, locale } from '../../i18n';
import theme from '../../theme';

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
                style={{ color: ouvert ? theme.text : theme.textMuted, fontSize: '13px' }}
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

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user, logout } = useAuth();

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
        logout();
        navigate('/');
    };

    return (
        <nav
            className="sticky top-0 z-50 flex items-center justify-between px-8"
            style={{
                height: '68px',
                backgroundColor: theme.nav,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderBottom: `1px solid ${theme.border}`,
            }}
        >
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
                                height: '68px',
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
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}>
                            <Trophy size={13} style={{ color: theme.yellow }} />
                            <span className="font-bold text-sm" style={{ color: theme.yellow }}>
                                {t('nav.pts', { n: (user.soldePoints ?? 0).toLocaleString(locale()) })}
                            </span>
                        </div>

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
        </nav>
    );
};

export default Navbar;