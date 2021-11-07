import { WebSocketContext } from "../context/websocket";
import { useContext, useEffect } from "react";
import { useQueryClient } from "react-query";

function useWebSocket() {
  const ws = useContext(WebSocketContext);
  const client = useQueryClient();

  useEffect(() => {
    globalEventHandler(ws.lastJsonMessage, client);
  }, [ws.lastJsonMessage, client]);

  return ws;
}

function globalEventHandler(json, client) {
  switch (json?.event) {
    case "UPDATE_RESOURCES":
      client.setQueryData(json.data.key, (resources = []) => {
        for (let i = 0; i < resources?.length; i++) {
          if (resources[i].name === json.data.item.name) {
            return resources;
          }
        }

        const newResources = [...resources, json.data.item];

        return newResources;
      });
      break;
    default:
      console.log("No event handler for " + json?.event);
      break;
  }
}

export default useWebSocket;
