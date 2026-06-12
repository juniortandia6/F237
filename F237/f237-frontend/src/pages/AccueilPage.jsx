import { Link } from 'react-router-dom';
import stade from '../assets/stade.jpg';
import { Trophy, Dices } from 'lucide-react';

const AccueilPage = () => {
    return (
        <div>
            {/* Hero avec image stade */}
            <div className="rounded-2xl mb-8 text-white overflow-hidden relative" style={{ minHeight: '380px' }}>
                {/* Image de fond */}
                <img src={stade} alt="stade" className="absolute inset-0 w-full h-full object-cover" />
                {/* Overlay sombre */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.3) 100%)' }}></div>

                {/* Contenu */}
                <div className="relative z-10 p-12">
                    {/* Drapeaux camerounais */}
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-7 h-1 rounded-full inline-block" style={{ backgroundColor: '#1a7a3c' }}></span>
                        <span className="w-7 h-1 rounded-full inline-block" style={{ backgroundColor: '#CE1126' }}></span>
                        <span className="w-7 h-1 rounded-full inline-block" style={{ backgroundColor: '#FCD116' }}></span>
                        <span className="text-gray-300 tracking-widest uppercase ml-2" style={{ fontSize: '13px' }}>MTN Elite Leagues — Cameroun</span>
                    </div>

                    <h1 className="font-black uppercase leading-none mb-6" style={{ fontSize: '64px', letterSpacing: '-1px' }}>
                        LE POULS DU<br />FOOTBALL<br />CAMEROUNAIS.
                    </h1>

                    <p className="text-gray-300 mb-8 max-w-lg" style={{ fontSize: '18px' }}>
                        Classements en direct, calendrier des matchs et profils d'équipes pour la MTN Elite One et la MTN Elite Two.
                    </p>

                    <div className="flex gap-4">
                        <Link
                            to="/classement"
                            className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                            style={{ fontSize: '16px' }}
                        >
                            <Trophy size={18} /> Voir le classement
                        </Link>
                        <Link
                            to="/joueur"
                            className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-colors"
                            style={{ backgroundColor: '#FCD116', color: '#000', fontSize: '16px' }}
                        >
                            <Dices size={18} /> Jouer
                        </Link>
                    </div>
                </div>
            </div>

            {/* En direct — pleine largeur */}
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
                <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4" style={{ fontSize: '20px' }}>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"></span>
                    En direct
                </h2>
                <div className="flex items-center justify-between px-6 py-4 rounded-xl" style={{ backgroundColor: '#f5f5f0' }}>
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400 font-semibold" style={{ fontSize: '13px' }}>ELITE ONE</span>
                        <span className="font-semibold text-gray-800" style={{ fontSize: '18px' }}>Cotonsport</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="font-black text-gray-900" style={{ fontSize: '28px' }}>2 : 1</span>
                        <span className="font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full" style={{ fontSize: '13px' }}>● LIVE</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-800" style={{ fontSize: '18px' }}>Victoria United</span>
                    </div>
                </div>
                <p className="text-center text-gray-400 mt-3" style={{ fontSize: '15px' }}>
                    Aucun autre match en direct pour le moment.
                </p>
            </div>

            {/* Grille principale */}
            <div className="grid grid-cols-3 gap-6">
                {/* Colonne gauche — Top 5 */}
                <div className="col-span-1">
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2" style={{ fontSize: '20px' }}>
                                <span className="w-1 h-5 rounded-full inline-block" style={{ backgroundColor: '#1a7a3c' }}></span>
                                Top 5 — Elite One
                            </h2>
                            <Link to="/classement" className="font-medium hover:underline" style={{ color: '#1a7a3c', fontSize: '15px' }}>
                                Voir tout →
                            </Link>
                        </div>
                        {[
                            { pos: 1, nom: 'Victoria United', pts: 13 },
                            { pos: 2, nom: 'Cotonsport', pts: 10 },
                            { pos: 3, nom: 'Stade Renard', pts: 10 },
                            { pos: 4, nom: 'Colombe', pts: 9 },
                            { pos: 5, nom: 'Young Sport Ac.', pts: 8 },
                        ].map((e) => (
                            <div key={e.pos} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 w-4" style={{ fontSize: '17px' }}>{e.pos}</span>
                                    <span className="font-medium text-gray-800" style={{ fontSize: '17px' }}>{e.nom}</span>
                                </div>
                                <span className="font-bold text-gray-900" style={{ fontSize: '17px' }}>{e.pts} pts</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Colonne droite — Prochains matchs + Résultats */}
                <div className="col-span-2 flex flex-col gap-6">
                    {/* Prochains matchs */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2" style={{ fontSize: '20px' }}>
                                <span className="w-1 h-5 rounded-full inline-block" style={{ backgroundColor: '#FCD116' }}></span>
                                Prochains matchs
                            </h2>
                            <Link to="/matchs" className="font-medium hover:underline" style={{ color: '#1a7a3c', fontSize: '15px' }}>
                                Calendrier →
                            </Link>
                        </div>
                        {[
                            { ligue: 'ELITE ONE', dom: 'Cotonsport', ext: 'Stade Renard', date: '15 juin, 16:00' },
                            { ligue: 'ELITE ONE', dom: 'Victoria United', ext: 'Canon', date: '16 juin, 18:00' },
                            { ligue: 'ELITE TWO', dom: 'Tonnerre', ext: 'FAP', date: '17 juin, 15:00' },
                        ].map((m, i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-4 flex-1">
                                    <span className="text-gray-400 font-medium" style={{ fontSize: '13px', minWidth: '80px' }}>{m.ligue}</span>
                                    <span className="font-medium text-gray-800" style={{ fontSize: '17px' }}>{m.dom}</span>
                                    <span className="text-gray-400 font-bold" style={{ fontSize: '15px' }}>—:—</span>
                                    <span className="font-medium text-gray-800" style={{ fontSize: '17px' }}>{m.ext}</span>
                                </div>
                                <span className="text-gray-400" style={{ fontSize: '15px' }}>{m.date}</span>
                            </div>
                        ))}
                    </div>

                    {/* Résultats récents */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4" style={{ fontSize: '20px' }}>
                            <span className="w-1 h-5 rounded-full inline-block bg-red-500"></span>
                            Résultats récents
                        </h2>
                        {[
                            { ligue: 'ELITE ONE', dom: 'Jeunes Fauves', score: '1 : 2', ext: 'Victoria United' },
                            { ligue: 'ELITE ONE', dom: 'Cotonsport', score: '1 : 0', ext: 'Jeunes Fauves' },
                            { ligue: 'ELITE TWO', dom: 'Renaissance', score: '1 : 0', ext: 'Dragon de Yaoundé' },
                        ].map((m, i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-4 flex-1">
                                    <span className="text-gray-400 font-medium" style={{ fontSize: '13px', minWidth: '80px' }}>{m.ligue}</span>
                                    <span className="font-medium text-gray-800" style={{ fontSize: '17px' }}>{m.dom}</span>
                                    <span className="font-black text-gray-900 px-2" style={{ fontSize: '17px' }}>{m.score}</span>
                                    <span className="font-medium text-gray-800" style={{ fontSize: '17px' }}>{m.ext}</span>
                                </div>
                                <span className="font-medium text-gray-400" style={{ fontSize: '15px' }}>TERMINÉ</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccueilPage;