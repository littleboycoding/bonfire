import { createContext } from "react";
import useWebSocket from "react-use-websocket";

export const WebSocketContext = createContext();

const RandomName = "__TEST" + Math.floor(Math.random() * 100);

function WebSocketProvider({ children }) {
  const ws = useWebSocket("ws://localhost:8080/ws", {
    queryParams: {
      name: RandomName,
    },
    shouldReconnect: () => true,
    reconnectInterval: 1000,
  });

  return (
    <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
  );
}

export { WebSocketProvider };
