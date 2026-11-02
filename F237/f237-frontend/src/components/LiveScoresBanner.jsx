// f237-frontend/src/components/LiveScoresBanner.jsx

import { useLiveScores } from "../hooks/useLiveScores";
import { useTranslation } from "react-i18next";
import { Wifi, WifiOff, Radio } from "lucide-react";
import theme from "../theme";

const BANDE = {
  backgroundColor: theme.bgDeep,
  borderBottom: `1px solid ${theme.border}`,
};

function LiveScoresBanner() {
  const { matchsLive, isConnected, aucunMatchLive } = useLiveScores();
  const { t } = useTranslation();

  if (aucunMatchLive || matchsLive.length === 0) {
    return (
      <div className="w-full px-4 py-2 flex items-center gap-2" style={BANDE}>
        {isConnected ? (
          <Wifi size={14} className="flex-shrink-0" style={{ color: theme.greenBright }} />
        ) : (
          <WifiOff size={14} className="flex-shrink-0" style={{ color: theme.textFaint }} />
        )}
        <span className="text-xs font-medium" style={{ color: theme.textMuted }}>
          {isConnected ? t("bandeau.aucunMatch") : t("bandeau.connexion")}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-2 flex items-center gap-2" style={BANDE}>
      <Radio size={14} className="animate-pulse flex-shrink-0" style={{ color: theme.red }} />
      <span className="text-xs font-black uppercase tracking-widest" style={{ color: theme.red }}>
        Live
      </span>
      <span className="text-xs font-medium" style={{ color: theme.textMuted }}>
        · {t("bandeau.enCours", { count: matchsLive.length })}
      </span>
      {isConnected && (
        <span className="ml-auto flex items-center gap-1 text-xs font-medium" style={{ color: theme.greenBright }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ backgroundColor: theme.greenBright }} />
          {t("bandeau.connecte")}
        </span>
      )}
    </div>
  );
}

export default LiveScoresBanner;