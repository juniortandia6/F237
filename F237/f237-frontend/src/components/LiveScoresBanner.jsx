// f237-frontend/src/components/LiveScoresBanner.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Bande de scores live en temps réel via SignalR.
// Ajoute ce composant en haut de AccueilPage ou dans le Layout (sous la Navbar).
//
// Usage :
//   import LiveScoresBanner from "../components/LiveScoresBanner";
//   <LiveScoresBanner />

import { useLiveScores } from "../hooks/useLiveScores";
import { Wifi, WifiOff, Radio } from "lucide-react";

// Statut en français
function statutLabel(statut) {
  switch (statut) {
    case 0: return "À venir";
    case 1: return "En direct";
    case 2: return "Terminé";
    case 3: return "Annulé";
    default: return "";
  }
}

function MatchLiveCard({ match }) {
  const enCours = match.statut === 1;

  return (
    <div
      className={`flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${
        enCours
          ? "bg-red-50 border-red-200"
          : "bg-white border-gray-200"
      }`}
      style={{ minWidth: 260 }}
    >
      {/* Domicile */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        {match.equipeDomicile?.logoUrl && (
          <img src={match.equipeDomicile.logoUrl} alt="" className="w-6 h-6 object-contain" />
        )}
        <span className="text-sm font-semibold text-gray-800 truncate max-w-24">
          {match.equipeDomicile?.nom ?? "—"}
        </span>
      </div>

      {/* Score + statut */}
      <div className="flex flex-col items-center flex-shrink-0">
        <span className="text-lg font-black text-gray-900 leading-tight">
          {match.scoreDomicile ?? "–"} - {match.scoreExterieur ?? "–"}
        </span>
        <span
          className={`text-[10px] font-bold uppercase tracking-wide ${
            enCours ? "text-red-500 animate-pulse" : "text-gray-400"
          }`}
        >
          {enCours && match.minuteLive
            ? `${match.minuteLive}'`
            : statutLabel(match.statut)}
        </span>
      </div>

      {/* Extérieur */}
      <div className="flex items-center gap-2 flex-1">
        <span className="text-sm font-semibold text-gray-800 truncate max-w-24">
          {match.equipeExterieur?.nom ?? "—"}
        </span>
        {match.equipeExterieur?.logoUrl && (
          <img src={match.equipeExterieur.logoUrl} alt="" className="w-6 h-6 object-contain" />
        )}
      </div>
    </div>
  );
}

export default function LiveScoresBanner() {
  const { matchsLive, isConnected, aucunMatchLive } = useLiveScores();

  // Si pas de matchs live → afficher un indicateur discret
  if (aucunMatchLive || matchsLive.length === 0) {
    return (
      <div className="w-full bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
        {isConnected ? (
          <Wifi size={14} className="text-green-400 flex-shrink-0" />
        ) : (
          <WifiOff size={14} className="text-gray-400 flex-shrink-0" />
        )}
        <span className="text-xs text-gray-400 font-medium">
          {isConnected
            ? "Aucun match en cours · Scores mis à jour en temps réel"
            : "Connexion live en cours..."}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Radio size={14} className="text-red-400 animate-pulse" />
          <span className="text-xs font-black text-red-400 uppercase tracking-widest">
            Live
          </span>
          <span className="text-xs text-gray-500 font-medium">
            · {matchsLive.length} match{matchsLive.length > 1 ? "s" : ""} en cours
          </span>
          {isConnected && (
            <span className="ml-auto flex items-center gap-1 text-[10px] text-green-400">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Connecté
            </span>
          )}
        </div>

        {/* Scroll horizontal des matchs */}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {matchsLive.map((match, i) => (
            <MatchLiveCard key={match.apiFootballId ?? i} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
}
