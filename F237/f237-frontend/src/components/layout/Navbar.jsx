import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/transparent-logo.png';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Trophy, Home, Calendar, Shield, Dices, User } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [lang, setLang] = useState('FR');
    const { user, logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    const navLink = (to, label, Icon) => (
        <Link
            to={to}
            className={`flex items-center gap-1.5 text-base font-semibold px-4 py-2 rounded-full transition-colors ${
                isActive(to)
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
            }`}
        >
            <Icon size={15} />
            {label}
        </Link>
    );

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-50 overflow-hidden" style={{ height: '64px' }}>
            {/* Logo */}
            <div style={{ height: '80px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                <img src={logo} alt="F237" style={{ height: '130px', width: 'auto', marginTop: '25px' }} />
            </div>

            {/* Liens */}
            <div className="flex items-center gap-1">
                {navLink('/', 'Accueil', Home)}
                {navLink('/classement', 'Classement', Trophy)}
                {navLink('/matchs', 'Matchs', Calendar)}
                {navLink('/equipes', 'Équipes', Shield)}
                {navLink('/jouer', 'Jouer', Dices)}
            </div>

            {/* Droite : auth + langue */}
            <div className="flex items-center gap-2">
                {user ? (
                    <>
                        {/* Points */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: '#f0f9f4', border: '1px solid #c8e6d4' }}>
                            <Trophy size={14} style={{ color: '#1a7a3c' }} />
                            <span className="font-bold text-sm" style={{ color: '#1a7a3c' }}>
                                {user.soldePoints?.toLocaleString()} pts
                            </span>
                        </div>

                        {/* Lien vers le profil */}
                        <Link
                            to="/profil"
                            className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            <User size={14} />
                            {user.prenom}
                        </Link>

                        {/* Déconnexion */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-100 transition-colors"
                        >
                            <LogOut size={14} />
                            Déconnexion
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="text-sm font-semibold text-gray-600 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                            Se connecter
                        </Link>
                        <Link
                            to="/register"
                            className="text-sm font-semibold text-white px-4 py-2 rounded-full transition-opacity hover:opacity-90"
                            style={{ backgroundColor: '#1a7a3c' }}
                        >
                            S'inscrire
                        </Link>
                    </>
                )}

                {/* Langue */}
                <button
                    onClick={() => setLang(lang === 'FR' ? 'EN' : 'FR')}
                    className="flex items-center gap-2 text-base font-semibold text-gray-600 border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-100"
                >
                    🌐 {lang}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
