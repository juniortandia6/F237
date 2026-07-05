import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/transparent-logo.png';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    Home, LayoutList, Trophy, Dices, MoreHorizontal,
    UserCircle, Globe, ChevronDown, Shield
} from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [lang, setLang] = useState('FR');
    const { user, logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { to: '/', label: 'Accueil', Icon: Home },
        { to: '/matchs', label: 'Matchs', Icon: LayoutList },
        { to: '/classement', label: 'Classements', Icon: Trophy },
        { to: '/equipes', label: 'Équipes', Icon: Shield },
        { to: '/jouer', label: 'Fantasy', Icon: Dices },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav
            className="sticky top-0 z-50 flex items-center justify-between px-8"
            style={{ height: '68px', backgroundColor: '#cfcdcc', borderBottom: '1px solid #b8b6b5' }}
        >
            {/* Logo */}
            <div style={{ height: '68px', overflow: 'hidden', display: 'flex', alignItems: 'center', minWidth: '120px' }}>
                <img src={logo} alt="F237" style={{ height: '110px', width: 'auto', marginTop: '20px' }} />
            </div>

            {/* Navigation centrée */}
            <div className="flex items-center">
                {navItems.map(({ to, label, Icon }) => {
                    const active = isActive(to);
                    return (
                        <Link
                            key={to}
                            to={to}
                            className="flex flex-col items-center justify-center px-5 transition-all"
                            style={{
                                height: '68px',
                                color: active ? '#1a1a1a' : '#555453',
                                borderBottom: active ? '3px solid #1a7a3c' : '3px solid transparent',
                                minWidth: '80px',
                            }}
                        >
                            <Icon size={20} style={{ marginBottom: '3px' }} />
                            <span className="font-semibold" style={{ fontSize: '12px', letterSpacing: '0.3px' }}>
                                {label}
                            </span>
                        </Link>
                    );
                })}

                <button
                    className="flex flex-col items-center justify-center px-5 transition-all"
                    style={{ height: '68px', color: '#555453', minWidth: '60px' }}
                >
                    <MoreHorizontal size={20} style={{ marginBottom: '3px' }} />
                    <span className="font-semibold" style={{ fontSize: '12px' }}>Plus</span>
                </button>
            </div>

            {/* Droite */}
            <div className="flex items-center gap-3" style={{ minWidth: '200px', justifyContent: 'flex-end' }}>
                {user ? (
                    <>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: '#bfbdbc', border: '1px solid #a8a6a5' }}>
                            <Trophy size={13} style={{ color: '#1a7a3c' }} />
                            <span className="font-bold text-sm" style={{ color: '#1a7a3c' }}>
                                {user.soldePoints?.toLocaleString()} pts
                            </span>
                        </div>

                        <Link
                            to="/profil"
                            className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all hover:opacity-90"
                            style={{ backgroundColor: '#1a7a3c', color: '#fff', fontSize: '13px' }}
                        >
                            <UserCircle size={16} />
                            {user.prenom}
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="font-semibold transition-colors hover:text-gray-900"
                            style={{ color: '#555453', fontSize: '13px' }}
                        >
                            Quitter
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all hover:opacity-90"
                            style={{ backgroundColor: '#1a7a3c', color: '#fff', fontSize: '13px' }}
                        >
                            <UserCircle size={16} />
                            Se connecter
                        </Link>

                        <Link
                            to="/register"
                            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-colors"
                            style={{ border: '1px solid #555453', color: '#1a1a1a', fontSize: '13px' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1a1a1a'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#1a1a1a'; }}
                        >
                            S'inscrire
                        </Link>
                    </>
                )}

                <button
                    onClick={() => setLang(lang === 'FR' ? 'EN' : 'FR')}
                    className="flex items-center gap-1 font-semibold transition-colors hover:text-gray-900"
                    style={{ color: '#555453', fontSize: '13px' }}
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
