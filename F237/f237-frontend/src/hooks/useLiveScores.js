// f237-frontend/src/hooks/useLiveScores.js

import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

const HUB_URL = "http://localhost:5257/hubs/scores";

/**
 * Hook qui se connecte au hub SignalR et reçoit les scores live.
 * @returns {{ matchsLive: Array, isConnected: boolean, aucunMatchLive: boolean }}
 */
export function useLiveScores() {
  const [matchsLive, setMatchsLive] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [aucunMatchLive, setAucunMatchLive] = useState(false);
  const connectionRef = useRef(null);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.ServerSentEvents |
          signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on("ScoresLiveMaj", (matchs) => {
      setMatchsLive(matchs);
      setAucunMatchLive(false);
    });

    connection.on("AucunMatchLive", () => {
      setMatchsLive([]);
      setAucunMatchLive(true);
    });

    connection.onreconnecting(() => setIsConnected(false));
    connection.onreconnected(() => setIsConnected(true));
    connection.onclose(() => setIsConnected(false));

    connection.start()
      .then(() => setIsConnected(true))
      .catch(() => setIsConnected(false));

    connectionRef.current = connection;

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
  }, []);

  return { matchsLive, isConnected, aucunMatchLive };
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