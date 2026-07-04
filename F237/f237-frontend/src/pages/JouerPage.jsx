import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, Users, Plus, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { matchService } from '../services/matchService';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short'
  }) + ', ' + new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit'
  });
}

const JouerPage = () => {
  const [mises, setMises] = useState({});
  const [selectionnes, setSelectionnes] = useState({});
  const [matchsAvenir, setMatchsAvenir] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Charger matchs Elite One à venir
    matchService.getBySaison(3)
      .then(data => {
        const avenir = data
          .filter(m => m.statut === 0)
          .sort((a, b) => new Date(a.dateMatch) - new Date(b.dateMatch));
        setMatchsAvenir(avenir);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selectionnerCote = (matchId, type) => {
    setSelectionnes(prev => ({
      ...prev,
      [matchId]: prev[matchId] === type ? null : type
    }));
  };

  const amis = [
    { nom: 'Eric N.', pts: 1840, initiales: 'EN', couleur: '#1a7a3c' },
    { nom: 'Aicha M.', pts: 1620, initiales: 'AM', couleur: '#CE1126' },
    { nom: 'Junior K.', pts: 1320, initiales: 'JK', couleur: '#FCD116' },
    { nom: 'Moi', pts: user?.soldePoints ?? 0, initiales: user?.prenom?.[0] ?? 'M', couleur: '#333', isMoi: true },
    { nom: 'Patrice D.', pts: 980, initiales: 'PD', couleur: '#1a3a7a' },
  ];

  // ── Si non connecté ───────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-6"
            style={{ backgroundColor: '#f0f9f4', border: '2px solid #c8e6d4' }}>
            <Lock size={36} style={{ color: '#1a7a3c' }} />
          </div>
          <h1 className="font-black text-gray-900 mb-3" style={{ fontSize: '32px' }}>
            Connectez-vous pour jouer
          </h1>
          <p className="text-gray-500 mb-8" style={{ fontSize: '16px' }}>
            Pariez sur les matchs MTN Elite One et Elite Two, grimpez au classement et convertissez vos points en FCFA.
          </p>
          <div className="bg-white rounded-2xl p-5 mb-6 text-left space-y-3"
            style={{ border: '1px solid #f0f0e8' }}>
            {[
              { emoji: '🎁', text: "1 000 points offerts à l'inscription" },
              { emoji: '⚽', text: 'Pariez sur tous les matchs Elite One & Two' },
              { emoji: '🏆', text: 'Grimpez au classement entre amis' },
              { emoji: '💸', text: 'Convertissez vos points en FCFA via Mobile Money' },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <span style={{ fontSize: '20px' }}>{a.emoji}</span>
                <span className="text-gray-700 font-medium" style={{ fontSize: '15px' }}>{a.text}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Link to="/register"
              className="flex-1 py-3 rounded-xl font-bold text-white text-center transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#1a7a3c', fontSize: '16px' }}>
              S'inscrire gratuitement
            </Link>
            <Link to="/login"
              className="flex-1 py-3 rounded-xl font-bold text-gray-700 text-center border border-gray-200 hover:bg-gray-50 transition-colors"
              style={{ fontSize: '16px' }}>
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Si connecté ───────────────────────────────────────────────────────────
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-black mb-2" style={{ fontSize: '40px' }}>Joueur</h1>
        <p className="text-gray-500" style={{ fontSize: '16px' }}>
          Pariez sur les matchs avec vos amis, grimpez au classement, convertissez vos points.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4" style={{ border: '1px solid #f0f0e8' }}>
          <div className="flex items-center justify-center rounded-xl" style={{ width: '48px', height: '48px', backgroundColor: '#FCD116' }}>
            <Trophy size={22} color="#000" />
          </div>
          <div>
            <p className="text-gray-400 font-semibold uppercase tracking-widest" style={{ fontSize: '12px' }}>Mes points</p>
            <p className="font-black text-gray-900" style={{ fontSize: '28px' }}>{user.soldePoints?.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4" style={{ border: '1px solid #f0f0e8' }}>
          <div className="flex items-center justify-center rounded-xl" style={{ width: '48px', height: '48px', backgroundColor: '#1a7a3c' }}>
            <Users size={22} color="white" />
          </div>
          <div>
            <p className="text-gray-400 font-semibold uppercase tracking-widest" style={{ fontSize: '12px' }}>Classement</p>
            <p className="font-black text-gray-900" style={{ fontSize: '28px' }}>#1</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4" style={{ border: '1px solid #f0f0e8' }}>
          <div className="flex items-center justify-center rounded-xl" style={{ width: '48px', height: '48px', backgroundColor: '#CE1126' }}>
            <TrendingUp size={22} color="white" />
          </div>
          <div>
            <p className="text-gray-400 font-semibold uppercase tracking-widest" style={{ fontSize: '12px' }}>Taux de réussite</p>
            <p className="font-black text-gray-900" style={{ fontSize: '28px' }}>—</p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <h2 className="font-black mb-4" style={{ fontSize: '22px' }}>Paris disponibles</h2>

          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
              <Loader2 size={20} className="animate-spin" />
              Chargement des matchs...
            </div>
          ) : matchsAvenir.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm" style={{ border: '1px solid #f0f0e8' }}>
              <p className="text-gray-400 font-semibold" style={{ fontSize: '16px' }}>
                Aucun match à venir pour le moment.
              </p>
              <p className="text-gray-300 mt-1" style={{ fontSize: '14px' }}>
                Revenez bientôt pour parier sur les prochains matchs !
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {matchsAvenir.map(p => (
                <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #f0f0e8' }}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 font-bold uppercase tracking-widest" style={{ fontSize: '12px' }}>
                      ELITE ONE
                    </span>
                    <span className="text-gray-400" style={{ fontSize: '13px' }}>
                      {formatDate(p.dateMatch)}
                    </span>
                  </div>

                  {/* Équipes */}
                  <div className="flex items-center justify-center gap-4 mb-5">
                    {p.equipeDomicile?.logoUrl ? (
                      <img src={p.equipeDomicile.logoUrl} alt="" className="w-9 h-9 object-contain" />
                    ) : (
                      <div className="flex items-center justify-center rounded-full bg-gray-200 font-black text-gray-600"
                        style={{ width: '36px', height: '36px', fontSize: '11px' }}>
                        {p.equipeDomicile?.nom?.substring(0, 2)}
                      </div>
                    )}
                    <span className="font-bold text-gray-900" style={{ fontSize: '17px' }}>
                      {p.equipeDomicile?.nom}
                    </span>
                    <span className="font-bold text-gray-400" style={{ fontSize: '15px' }}>vs</span>
                    <span className="font-bold text-gray-900" style={{ fontSize: '17px' }}>
                      {p.equipeExterieur?.nom}
                    </span>
                    {p.equipeExterieur?.logoUrl ? (
                      <img src={p.equipeExterieur.logoUrl} alt="" className="w-9 h-9 object-contain" />
                    ) : (
                      <div className="flex items-center justify-center rounded-full bg-gray-200 font-black text-gray-600"
                        style={{ width: '36px', height: '36px', fontSize: '11px' }}>
                        {p.equipeExterieur?.nom?.substring(0, 2)}
                      </div>
                    )}
                  </div>

                  {/* Cotes */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: '1 · Domicile', cote: 2.10, type: 'dom' },
                      { label: 'X · Nul', cote: 3.20, type: 'nul' },
                      { label: '2 · Extérieur', cote: 2.80, type: 'ext' },
                    ].map((c) => {
                      const selected = selectionnes[p.id] === c.type;
                      return (
                        <button
                          key={c.type}
                          onClick={() => selectionnerCote(p.id, c.type)}
                          className="rounded-xl p-3 text-left transition-all"
                          style={{
                            border: selected ? '2px solid #1a7a3c' : '1px solid #e8e8e0',
                            backgroundColor: selected ? '#f0f9f4' : '#fafaf8',
                          }}>
                          <p className="text-gray-400 font-semibold uppercase tracking-widest mb-1" style={{ fontSize: '11px' }}>{c.label}</p>
                          <p className="font-black" style={{ fontSize: '22px', color: selected ? '#1a7a3c' : '#111' }}>{c.cote.toFixed(2)}</p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Mise */}
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 font-semibold uppercase tracking-widest" style={{ fontSize: '12px' }}>Mise</span>
                    <input
                      type="range" min="10" max={Math.min(user.soldePoints, 500)}
                      value={mises[p.id] || 50}
                      onChange={e => setMises({ ...mises, [p.id]: Number(e.target.value) })}
                      className="flex-1"
                      style={{ accentColor: '#1a7a3c' }}
                    />
                    <span className="font-bold text-gray-900" style={{ fontSize: '16px' }}>{mises[p.id] || 50} pts</span>
                  </div>

                  {/* Bouton parier */}
                  {selectionnes[p.id] && (
                    <button
                      className="w-full mt-4 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#1a7a3c', fontSize: '15px' }}>
                      Parier {mises[p.id] || 50} pts →{' '}
                      {selectionnes[p.id] === 'dom' ? p.equipeDomicile?.nom : selectionnes[p.id] === 'ext' ? p.equipeExterieur?.nom : 'Nul'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-span-1 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #f0f0e8' }}>
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} color="#666" />
              <h2 className="font-black" style={{ fontSize: '16px' }}>Mes amis</h2>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              {amis.sort((a, b) => b.pts - a.pts).map((a, i) => (
                <div key={i} className={`flex items-center justify-between ${a.isMoi ? 'font-black' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400" style={{ fontSize: '14px', minWidth: '16px' }}>{i + 1}</span>
                    <div className="flex items-center justify-center rounded-full font-black text-white"
                      style={{ width: '32px', height: '32px', backgroundColor: a.couleur, fontSize: '11px' }}>
                      {a.initiales}
                    </div>
                    <span style={{ fontSize: '15px', color: a.isMoi ? '#1a7a3c' : '#333' }}>{a.isMoi ? user.prenom : a.nom}</span>
                  </div>
                  <span className="font-bold" style={{ fontSize: '15px', color: a.isMoi ? '#1a7a3c' : '#666' }}>
                    {a.pts.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#1a7a3c', fontSize: '15px' }}>
              <Plus size={16} /> Inviter un ami
            </button>
          </div>

          <div className="rounded-2xl p-5" style={{ backgroundColor: '#fdf9e8', border: '1px solid #f0e8a0' }}>
            <p className="font-black uppercase tracking-wide mb-1" style={{ fontSize: '14px' }}>Convertir mes points</p>
            <p className="text-gray-500 mb-3" style={{ fontSize: '13px' }}>1 000 points = 500 FCFA</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-black text-gray-900" style={{ fontSize: '36px' }}>
                {Math.floor((user.soldePoints ?? 0) / 1000) * 500}
              </span>
              <span className="text-gray-500 font-semibold" style={{ fontSize: '14px' }}>FCFA dispo</span>
            </div>
            <button className="w-full py-3 rounded-xl font-bold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#1a1a1a', fontSize: '15px' }}>
              Demander un retrait
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JouerPage;
