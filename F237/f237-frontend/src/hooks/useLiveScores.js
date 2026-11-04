// f237-frontend/src/hooks/useLiveScores.js
//
// Scores en direct via SignalR.
// UNE SEULE connexion pour tout le site, partagée par tous les composants
// (bandeau, accueil, page Matchs, page d'un match...). Avant, chaque composant
// ouvrait sa propre connexion et repartait de zéro à chaque changement de page :
// la minute arrivait en retard ou disparaissait.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import * as signalR from "@microsoft/signalr";

const HUB_URL = "http://localhost:5257/hubs/scores";

// ── Connexion partagée ─────────────────────────────────────────────────
let etat = { matchsLive: [], isConnected: false, aucunMatchLive: false };
const abonnes = new Set();
let connexion = null;
let arretPrevu = null;

const majEtat = (changements) => {
  etat = { ...etat, ...changements };
  abonnes.forEach((f) => f());
};

function demarrerConnexion() {
  if (connexion) return;
  connexion = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      transport:
        signalR.HttpTransportType.WebSockets |
        signalR.HttpTransportType.ServerSentEvents |
        signalR.HttpTransportType.LongPolling,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  connexion.on("ScoresLiveMaj", (matchs) => majEtat({ matchsLive: matchs, aucunMatchLive: false }));
  connexion.on("AucunMatchLive", () => majEtat({ matchsLive: [], aucunMatchLive: true }));

  // Pendant une coupure on garde les derniers scores affichés (pas d'écran vide)
  connexion.onreconnecting(() => majEtat({ isConnected: false }));
  connexion.onreconnected(() => majEtat({ isConnected: true }));
  connexion.onclose(() => majEtat({ isConnected: false }));

  connexion.start()
    .then(() => majEtat({ isConnected: true }))
    .catch(() => majEtat({ isConnected: false }));
}

function abonner(callback) {
  abonnes.add(callback);
  // Un composant (re)s'abonne : on annule un arrêt programmé
  if (arretPrevu) { clearTimeout(arretPrevu); arretPrevu = null; }
  demarrerConnexion();
  return () => {
    abonnes.delete(callback);
    // Plus personne n'écoute : on coupe, avec un délai pour survivre aux changements de page
    if (abonnes.size === 0) {
      arretPrevu = setTimeout(() => {
        connexion?.stop();
        connexion = null;
        arretPrevu = null;
      }, 5000);
    }
  };
}

const lireEtat = () => etat;

/**
 * Scores en direct de tous les matchs.
 * @returns {{ matchsLive: Array, isConnected: boolean, aucunMatchLive: boolean }}
 */
export function useLiveScores() {
  return useSyncExternalStore(abonner, lireEtat, lireEtat);
}

/**
 * Hook pour suivre UN match spécifique en temps réel.
 * @param {number} matchId
 * @returns {{ matchLive: Object|null, isConnected: boolean }}
 */
export function useMatchLive(matchId) {
  const [matchLive, setMatchLive] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef(null);

  useEffect(() => {
    if (!matchId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on("MatchMaj", (match) => setMatchLive(match));
    connection.onreconnected(() => {
      connection.invoke("RejoindreMatch", matchId).catch(() => {});
      setIsConnected(true);
    });

    connection.start()
      .then(() => {
        setIsConnected(true);
        return connection.invoke("RejoindreMatch", matchId);
      })
      .catch(() => setIsConnected(false));

    connectionRef.current = connection;

    return () => {
      connection.invoke("QuitterMatch", matchId).catch(() => {});
      connection.stop();
      connectionRef.current = null;
    };
  }, [matchId]);

  return { matchLive, isConnected };
}