import { useState } from 'react';
import { Trophy, TrendingUp, Users, Plus } from 'lucide-react';

const JouerPage = () => {
  const [mises, setMises] = useState({});

  const parisDisponibles = [
    { id: 1, ligue: 'ELITE ONE', date: '15 juin, 16:00', dom: 'Cotonsport', ext: 'Stade Renard', coteDom: 2.10, coteNul: 3.20, coteExt: 2.80 },
    { id: 2, ligue: 'ELITE ONE', date: '16 juin, 18:00', dom: 'Aigle Royal', ext: 'Yong Sports', coteDom: 2.10, coteNul: 3.20, coteExt: 2.80 },
    { id: 3, ligue: 'ELITE TWO', date: '17 juin, 15:00', dom: 'Renaissance FC', ext: 'Panthère SC', coteDom: 2.10, coteNul: 3.20, coteExt: 2.80 },
  ];

  const amis = [
    { nom: 'Eric N.', pts: 1840, initiales: 'EN', couleur: '#1a7a3c' },
    { nom: 'Aicha M.', pts: 1620, initiales: 'AM', couleur: '#CE1126' },
    { nom: 'Junior K.', pts: 1320, initiales: 'JK', couleur: '#FCD116' },
    { nom: 'Moi', pts: 1240, initiales: 'M', couleur: '#333', isMoi: true },
    { nom: 'Patrice D.', pts: 980, initiales: 'PD', couleur: '#1a3a7a' },
  ];

  return (
    <div>
      {/* Header */}
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
            <p className="font-black text-gray-900" style={{ fontSize: '28px' }}>1 240</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4" style={{ border: '1px solid #f0f0e8' }}>
          <div className="flex items-center justify-center rounded-xl" style={{ width: '48px', height: '48px', backgroundColor: '#1a7a3c' }}>
            <Users size={22} color="white" />
          </div>
          <div>
            <p className="text-gray-400 font-semibold uppercase tracking-widest" style={{ fontSize: '12px' }}>Classement</p>
            <p className="font-black text-gray-900" style={{ fontSize: '28px' }}>#12 / 248</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4" style={{ border: '1px solid #f0f0e8' }}>
          <div className="flex items-center justify-center rounded-xl" style={{ width: '48px', height: '48px', backgroundColor: '#CE1126' }}>
            <TrendingUp size={22} color="white" />
          </div>
          <div>
            <p className="text-gray-400 font-semibold uppercase tracking-widest" style={{ fontSize: '12px' }}>Taux de réussite</p>
            <p className="font-black text-gray-900" style={{ fontSize: '28px' }}>64%</p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-3 gap-6">
        {/* Paris disponibles */}
        <div className="col-span-2">
          <h2 className="font-black mb-4" style={{ fontSize: '22px' }}>Paris disponibles</h2>
          <div className="flex flex-col gap-4">
            {parisDisponibles.map(p => (
              <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #f0f0e8' }}>
                {/* Header match */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 font-bold uppercase tracking-widest" style={{ fontSize: '12px' }}>{p.ligue}</span>
                  <span className="text-gray-400" style={{ fontSize: '13px' }}>{p.date}</span>
                </div>

                {/* Équipes */}
                <div className="flex items-center justify-center gap-4 mb-5">
                  <span className="font-bold text-gray-900" style={{ fontSize: '18px' }}>{p.dom}</span>
                  <div className="flex items-center justify-center rounded-full bg-gray-200 font-black text-gray-600" style={{ width: '36px', height: '36px', fontSize: '11px' }}>
                    {p.dom.split(' ').map(w => w[0]).join('').substring(0, 3)}
                  </div>
                  <span className="font-bold text-gray-400" style={{ fontSize: '16px' }}>vs</span>
                  <div className="flex items-center justify-center rounded-full bg-gray-200 font-black text-gray-600" style={{ width: '36px', height: '36px', fontSize: '11px' }}>
                    {p.ext.split(' ').map(w => w[0]).join('').substring(0, 3)}
                  </div>
                  <span className="font-bold text-gray-900" style={{ fontSize: '18px' }}>{p.ext}</span>
                </div>

                {/* Cotes */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: '1 · Domicile', cote: p.coteDom },
                    { label: 'X · Nul', cote: p.coteNul },
                    { label: '2 · Extérieur', cote: p.coteExt },
                  ].map((c, i) => (
                    <button
                      key={i}
                      className="rounded-xl p-3 text-left hover:shadow-md transition-all"
                      style={{ border: '1px solid #e8e8e0', backgroundColor: '#fafaf8' }}
                    >
                      <p className="text-gray-400 font-semibold uppercase tracking-widest mb-1" style={{ fontSize: '11px' }}>{c.label}</p>
                      <p className="font-black text-gray-900" style={{ fontSize: '22px' }}>{c.cote.toFixed(2)}</p>
                    </button>
                  ))}
                </div>

                {/* Mise slider */}
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 font-semibold uppercase tracking-widest" style={{ fontSize: '12px' }}>Mise</span>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    value={mises[p.id] || 50}
                    onChange={e => setMises({ ...mises, [p.id]: e.target.value })}
                    className="flex-1"
                    style={{ accentColor: '#1a7a3c' }}
                  />
                  <span className="font-bold text-gray-900" style={{ fontSize: '16px' }}>{mises[p.id] || 50} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-1 flex flex-col gap-4">
          {/* Mes amis */}
          <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #f0f0e8' }}>
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} color="#666" />
              <h2 className="font-black" style={{ fontSize: '16px' }}>Mes amis</h2>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              {amis.map((a, i) => (
                <div key={i} className={`flex items-center justify-between ${a.isMoi ? 'font-black' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400" style={{ fontSize: '14px', minWidth: '16px' }}>{i + 1}</span>
                    <div
                      className="flex items-center justify-center rounded-full font-black text-white"
                      style={{ width: '32px', height: '32px', backgroundColor: a.couleur, fontSize: '11px' }}
                    >
                      {a.initiales}
                    </div>
                    <span style={{ fontSize: '15px', color: a.isMoi ? '#1a7a3c' : '#333' }}>{a.nom}</span>
                  </div>
                  <span className="font-bold" style={{ fontSize: '15px', color: a.isMoi ? '#1a7a3c' : '#666' }}>{a.pts.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <button
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#1a7a3c', fontSize: '15px' }}
            >
              <Plus size={16} /> Inviter un ami
            </button>
          </div>

          {/* Convertir points */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#fdf9e8', border: '1px solid #f0e8a0' }}>
            <p className="font-black uppercase tracking-wide mb-1" style={{ fontSize: '14px' }}>Convertir mes points</p>
            <p className="text-gray-500 mb-3" style={{ fontSize: '13px' }}>1 000 points = 500 FCFA</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-black text-gray-900" style={{ fontSize: '36px' }}>500</span>
              <span className="text-gray-500 font-semibold" style={{ fontSize: '14px' }}>FCFA dispo</span>
            </div>
            <button
              className="w-full py-3 rounded-xl font-bold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#1a1a1a', fontSize: '15px' }}
            >
              Demander un retrait
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JouerPage;