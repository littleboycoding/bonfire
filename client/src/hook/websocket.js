import { WebSocketContext } from "../context/websocket";
import { useContext } from "react";

function useWebSocket() {
  const ws = useContext(WebSocketContext);

  return ws;
}

export default useWebSocket;
