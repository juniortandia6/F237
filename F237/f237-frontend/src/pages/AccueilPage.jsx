import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import stade from '../assets/stade.jpg';
import { Trophy, Dices } from 'lucide-react';
import { useLiveScores } from '../hooks/useLiveScores';
import { classementService } from '../services/classementService';
import { matchService } from '../services/matchService';

function StatutLabel({ statut, minuteLive }) {
    if (statut === 1) {
        return (
            <span className="font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full flex items-center gap-1" style={{ fontSize: '13px' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block"></span>
                {minuteLive ? `${minuteLive}'` : 'LIVE'}
            </span>
        );
    }
    if (statut === 2) return <span className="text-gray-400 font-semibold" style={{ fontSize: '13px' }}>FT</span>;
    return <span className="text-gray-400 font-semibold" style={{ fontSize: '13px' }}>À venir</span>;
}

function formatHeure(dateStr) {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateCourte(dateStr) {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

const AccueilPage = () => {
    const { matchsLive, isConnected, aucunMatchLive } = useLiveScores();

    const [top5, setTop5] = useState([]);
    const [prochains, setProchains] = useState([]);
    const [resultats, setResultats] = useState([]);
    const [loadingClassement, setLoadingClassement] = useState(true);
    const [loadingMatchs, setLoadingMatchs] = useState(true);

    // ── Top 5 Elite One ──────────────────────────────────────────────────────
    useEffect(() => {
        let ignore = false;
        classementService.getBySaison(3)
            .then(data => {
                if (!ignore) {
                    setTop5(data.slice(0, 5));
                    setLoadingClassement(false);
                }
            })
            .catch(() => setLoadingClassement(false));
        return () => { ignore = true; };
    }, []);

    // ── Prochains matchs + Résultats récents Elite One ───────────────────────
    useEffect(() => {
        let ignore = false;
        matchService.getBySaison(3)
            .then(data => {
                if (!ignore) {
                    const maintenant = new Date();

                    // Prochains : statut 0 (à venir), triés par date ASC, max 3
                    const aVenir = data
                        .filter(m => m.statut === 0 && new Date(m.dateMatch) >= maintenant)
                        .sort((a, b) => new Date(a.dateMatch) - new Date(b.dateMatch))
                        .slice(0, 3);

                    // Résultats : statut 2 (terminés), triés par date DESC, max 3
                    const termines = data
                        .filter(m => m.statut === 2)
                        .sort((a, b) => new Date(b.dateMatch) - new Date(a.dateMatch))
                        .slice(0, 3);

                    setProchains(aVenir);
                    setResultats(termines);
                    setLoadingMatchs(false);
                }
            })
            .catch(() => setLoadingMatchs(false));
        return () => { ignore = true; };
    }, []);

    return (
        <div>
            {/* Hero */}
            <div className="rounded-2xl mb-8 text-white overflow-hidden relative" style={{ minHeight: '380px' }}>
                <img src={stade} alt="stade" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.3) 100%)' }}></div>
                <div className="relative z-10 p-12">
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
                        <Link to="/classement" className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors" style={{ fontSize: '16px' }}>
                            <Trophy size={18} /> Voir le classement
                        </Link>
                        <Link to="/jouer" className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-colors" style={{ backgroundColor: '#FCD116', color: '#000', fontSize: '16px' }}>
                            <Dices size={18} /> Jouer
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── En direct SignalR ─────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2" style={{ fontSize: '20px' }}>
                        <span className={`w-2 h-2 rounded-full inline-block ${matchsLive.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></span>
                        En direct
                    </h2>
                    <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: isConnected ? '#1a7a3c' : '#999' }}>
                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        {isConnected ? 'Connecté' : 'Connexion...'}
                    </span>
                </div>

                {matchsLive.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {matchsLive.map((m, i) => (
                            <div key={m.apiFootballId ?? i} className="flex items-center justify-between px-6 py-4 rounded-xl" style={{ backgroundColor: '#f5f5f0' }}>
                                <div className="flex items-center gap-3 flex-1 justify-end">
                                    {m.equipeDomicile?.logoUrl && (
                                        <img src={m.equipeDomicile.logoUrl} alt="" className="w-8 h-8 object-contain" />
                                    )}
                                    <span className="font-semibold text-gray-800" style={{ fontSize: '17px' }}>
                                        {m.equipeDomicile?.nom}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center px-6">
                                    <span className="font-black text-gray-900" style={{ fontSize: '26px' }}>
                                        {m.scoreDomicile ?? '–'} : {m.scoreExterieur ?? '–'}
                                    </span>
                                    <StatutLabel statut={m.statut} minuteLive={m.minuteLive} />
                                </div>
                                <div className="flex items-center gap-3 flex-1">
                                    <span className="font-semibold text-gray-800" style={{ fontSize: '17px' }}>
                                        {m.equipeExterieur?.nom}
                                    </span>
                                    {m.equipeExterieur?.logoUrl && (
                                        <img src={m.equipeExterieur.logoUrl} alt="" className="w-8 h-8 object-contain" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-400 py-4" style={{ fontSize: '15px' }}>
                        {aucunMatchLive ? 'Aucun match en direct pour le moment.' : 'Chargement des scores live...'}
                    </p>
                )}
            </div>

            {/* ── Grille principale ─────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-6">

                {/* Top 5 Elite One */}
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

                        {loadingClassement ? (
                            <div className="text-center text-gray-400 py-4" style={{ fontSize: '14px' }}>Chargement...</div>
                        ) : top5.length === 0 ? (
                            <div className="text-center text-gray-400 py-4" style={{ fontSize: '14px' }}>Aucune donnée</div>
                        ) : (
                            top5.map((e) => (
                                <div key={e.equipeId ?? e.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-400 w-4" style={{ fontSize: '15px' }}>{e.position}</span>
                                        {e.equipe?.logoUrl && (
                                            <img src={e.equipe.logoUrl} alt="" className="w-6 h-6 object-contain" />
                                        )}
                                        <span className="font-medium text-gray-800 truncate max-w-32" style={{ fontSize: '15px' }}>
                                            {e.equipe?.nom ?? e.nom}
                                        </span>
                                    </div>
                                    <span className="font-bold text-gray-900" style={{ fontSize: '15px' }}>{e.points} pts</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Prochains matchs + Résultats */}
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

                        {loadingMatchs ? (
                            <div className="text-center text-gray-400 py-4" style={{ fontSize: '14px' }}>Chargement...</div>
                        ) : prochains.length === 0 ? (
                            <div className="text-center text-gray-400 py-4" style={{ fontSize: '14px' }}>Aucun match à venir</div>
                        ) : (
                            prochains.map((m) => (
                                <div key={m.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-4 flex-1">
                                        <span className="text-gray-400 font-medium" style={{ fontSize: '13px', minWidth: '80px' }}>ELITE ONE</span>
                                        <div className="flex items-center gap-2">
                                            {m.equipeDomicile?.logoUrl && (
                                                <img src={m.equipeDomicile.logoUrl} alt="" className="w-5 h-5 object-contain" />
                                            )}
                                            <span className="font-medium text-gray-800" style={{ fontSize: '16px' }}>{m.equipeDomicile?.nom}</span>
                                        </div>
                                        <span className="text-gray-400 font-bold" style={{ fontSize: '15px' }}>—:—</span>
                                        <div className="flex items-center gap-2">
                                            {m.equipeExterieur?.logoUrl && (
                                                <img src={m.equipeExterieur.logoUrl} alt="" className="w-5 h-5 object-contain" />
                                            )}
                                            <span className="font-medium text-gray-800" style={{ fontSize: '16px' }}>{m.equipeExterieur?.nom}</span>
                                        </div>
                                    </div>
                                    <span className="text-gray-400 flex-shrink-0" style={{ fontSize: '14px' }}>
                                        {formatDateCourte(m.dateMatch)}, {formatHeure(m.dateMatch)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Résultats récents */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2" style={{ fontSize: '20px' }}>
                                <span className="w-1 h-5 rounded-full inline-block bg-red-500"></span>
                                Résultats récents
                            </h2>
                            <Link to="/matchs" className="font-medium hover:underline" style={{ color: '#1a7a3c', fontSize: '15px' }}>
                                Voir tout →
                            </Link>
                        </div>

                        {loadingMatchs ? (
                            <div className="text-center text-gray-400 py-4" style={{ fontSize: '14px' }}>Chargement...</div>
                        ) : resultats.length === 0 ? (
                            <div className="text-center text-gray-400 py-4" style={{ fontSize: '14px' }}>Aucun résultat</div>
                        ) : (
                            resultats.map((m) => (
                                <div key={m.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-4 flex-1">
                                        <span className="text-gray-400 font-medium" style={{ fontSize: '13px', minWidth: '80px' }}>ELITE ONE</span>
                                        <div className="flex items-center gap-2">
                                            {m.equipeDomicile?.logoUrl && (
                                                <img src={m.equipeDomicile.logoUrl} alt="" className="w-5 h-5 object-contain" />
                                            )}
                                            <span className="font-medium text-gray-800" style={{ fontSize: '16px' }}>{m.equipeDomicile?.nom}</span>
                                        </div>
                                        <span className="font-black text-gray-900 px-2" style={{ fontSize: '17px' }}>
                                            {m.scoreDomicile} : {m.scoreExterieur}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {m.equipeExterieur?.logoUrl && (
                                                <img src={m.equipeExterieur.logoUrl} alt="" className="w-5 h-5 object-contain" />
                                            )}
                                            <span className="font-medium text-gray-800" style={{ fontSize: '16px' }}>{m.equipeExterieur?.nom}</span>
                                        </div>
                                    </div>
                                    <span className="font-medium text-gray-400 flex-shrink-0" style={{ fontSize: '14px' }}>
                                        {formatDateCourte(m.dateMatch)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccueilPage;