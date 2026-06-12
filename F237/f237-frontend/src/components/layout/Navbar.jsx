import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/transparent-logo.png';
import { useState } from 'react';

const Navbar = () => {
    const location = useLocation();
    const [lang, setLang] = useState('FR');

    const isActive = (path) => location.pathname === path;

    const navLink = (to, label) => (
        <Link
            to={to}
            className={`text-base font-semibold px-4 py-2 rounded-full transition-colors ${isActive(to)
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
        >
            {label}
        </Link>
    );

    return (
        <nav className="bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-50 overflow-hidden" style={{ height: '64px' }}>
            {/* Logo */}
            <div style={{ height: '80px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                <img src={logo} alt="F237" style={{ height: '130px', width: 'auto', marginTop: '25px' }} />
            </div>

            {/* Liens */}
            <div className="flex items-center gap-1">
                {navLink('/', 'Accueil')}
                {navLink('/classement', 'Classement')}
                {navLink('/matchs', 'Matchs')}
                {navLink('/equipes', 'Équipes')}
                {navLink('/jouer', 'Jouer')}
            </div>

            {/* Bouton langue */}
            <button
                onClick={() => setLang(lang === 'FR' ? 'EN' : 'FR')}
                className="flex items-center gap-2 text-base font-semibold text-gray-600 border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-100"
            >
                🌐 {lang}
            </button>
        </nav>
    );
};

export default Navbar;