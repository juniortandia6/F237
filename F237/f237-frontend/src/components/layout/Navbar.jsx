// f237-frontend/src/components/layout/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    Home, LayoutList, Trophy, Dices, Newspaper,
    UserCircle, Globe, ChevronDown, Shield
} from 'lucide-react';
import LogoF237 from './LogoF237';
import theme from '../../theme';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [lang, setLang] = useState('FR');
    const { user, logout } = useAuth();

    // "/" seulement sur l'accueil ; les autres onglets restent actifs sur leurs
    // sous-pages (ex. /actualites/mon-article, /equipes/12)
    const isActive = (path) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    const navItems = [
        { to: '/', label: 'Accueil', Icon: Home },
        { to: '/matchs', label: 'Matchs', Icon: LayoutList },
        { to: '/classement', label: 'Classements', Icon: Trophy },
        { to: '/equipes', label: 'Équipes', Icon: Shield },
        { to: '/jouer', label: 'Fantasy', Icon: Dices },
        { to: '/actualites', label: 'Actualités', Icon: Newspaper },
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
                                {user.soldePoints?.toLocaleString()} pts
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
                            Quitter
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
                        Connexion
                    </Link>
                )}

                <button
                    onClick={() => setLang(lang === 'FR' ? 'EN' : 'FR')}
                    className="flex items-center gap-1 font-semibold transition-colors"
                    style={{ color: theme.textMuted, fontSize: '13px' }}
                    onMouseEnter={e => { e.currentTarget.style.color = theme.text; }}
                    onMouseLeave={e => { e.currentTarget.style.color = theme.textMuted; }}
                >
                    <Globe size={15} />
                    {lang}
                    <ChevronDown size={13} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;