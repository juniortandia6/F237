// f237-frontend/src/components/LiveScoresBanner.jsx

import { useLiveScores } from "../hooks/useLiveScores";
import { Wifi, WifiOff, Radio } from "lucide-react";

function LiveScoresBanner() {
  const { matchsLive, isConnected, aucunMatchLive } = useLiveScores();

  if (aucunMatchLive || matchsLive.length === 0) {
    return (
      <div className="w-full px-4 py-2 flex items-center gap-2"
        style={{ backgroundColor: '#cfcdcc', borderBottom: '1px solid #b8b6b5' }}>
        {isConnected ? (
          <Wifi size={14} className="text-green-500 flex-shrink-0" />
        ) : (
          <WifiOff size={14} className="flex-shrink-0" style={{ color: '#888' }} />
        )}
        <span className="text-xs font-medium" style={{ color: '#666' }}>
          {isConnected
            ? "Aucun match en cours · Scores mis à jour en temps réel"
            : "Connexion live en cours..."}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-2 flex items-center gap-2"
      style={{ backgroundColor: '#cfcdcc', borderBottom: '1px solid #b8b6b5' }}>
      <Radio size={14} className="text-red-400 animate-pulse flex-shrink-0" />
      <span className="text-xs font-black text-red-400 uppercase tracking-widest">
        Live
      </span>
      <span className="text-xs font-medium" style={{ color: '#555' }}>
        · {matchsLive.length} match{matchsLive.length > 1 ? "s" : ""} en cours
      </span>
      {isConnected && (
        <span className="ml-auto flex items-center gap-1 text-xs text-green-500 font-medium">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />
          Connecté
        </span>
      )}
    </div>
  );
}

export default LiveScoresBanner;
