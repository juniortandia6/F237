import { useState, useEffect } from 'react';
import { classementService } from '../services/classementService';

const ClassementPage = () => {
  const [classement, setClassement] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saisonId, setSaisonId] = useState(1);

  useEffect(() => {
    const fetchClassement = async () => {
      setLoading(true);
      try {
        const data = await classementService.getBySaison(saisonId);
        setClassement(data);
      } catch (error) {
        console.error('Erreur classement:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClassement();
  }, [saisonId]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Classement MTN Elite</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setSaisonId(1)}
          className={`px-4 py-2 rounded font-medium ${saisonId === 1 ? 'bg-green-600' : 'bg-gray-700'}`}
        >
          Elite One
        </button>
        <button
          onClick={() => setSaisonId(2)}
          className={`px-4 py-2 rounded font-medium ${saisonId === 2 ? 'bg-green-600' : 'bg-gray-700'}`}
        >
          Elite Two
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Chargement...</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Équipe</th>
              <th className="p-3 text-center">MJ</th>
              <th className="p-3 text-center">V</th>
              <th className="p-3 text-center">N</th>
              <th className="p-3 text-center">D</th>
              <th className="p-3 text-center">BP</th>
              <th className="p-3 text-center">BC</th>
              <th className="p-3 text-center">DB</th>
              <th className="p-3 text-center font-bold text-white">Pts</th>
            </tr>
          </thead>
          <tbody>
            {classement.map((c, index) => (
              <tr key={c.id} className={`border-b border-gray-800 hover:bg-gray-800 ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'}`}>
                <td className="p-3 text-gray-400">{c.position}</td>
                <td className="p-3 flex items-center gap-2">
                  <img src={c.equipe?.logoUrl} alt={c.equipe?.nom} className="h-6 w-6 object-contain" />
                  {c.equipe?.nom}
                </td>
                <td className="p-3 text-center">{c.matchsJoues}</td>
                <td className="p-3 text-center text-green-400">{c.victoires}</td>
                <td className="p-3 text-center text-yellow-400">{c.nuls}</td>
                <td className="p-3 text-center text-red-400">{c.defaites}</td>
                <td className="p-3 text-center">{c.butsPour}</td>
                <td className="p-3 text-center">{c.butsContre}</td>
                <td className="p-3 text-center">{c.differenceDesButs}</td>
                <td className="p-3 text-center font-bold text-white">{c.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ClassementPage;