import { createContext } from "react";
import useWebSocket from "react-use-websocket";
import { ASSETS_CONTENT, OBJECT } from "../store_constant";
import { useQueryClient } from "react-query";

export const WebSocketContext = createContext();

const RandomName = "__TEST" + Math.floor(Math.random() * 100);
const WS_URL = "ws://localhost:8080/ws";

function WebSocketProvider({ children }) {
  const client = useQueryClient();
  const ws = useWebSocket(WS_URL, {
    onMessage(event) {
      globalEventHandler(JSON.parse(event.data), client);
    },
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

function isObjectExist(client, name, fn) {
  if (client.getQueryData([OBJECT, name])) fn();
}

function isAssetExist(client, name, fn) {
  if (client.getQueryData([ASSETS_CONTENT, name])) fn();
}

function isResourceExist(client, resource, fn) {
  if (client.getQueryData(resource)) fn();
}

function globalEventHandler(json, client) {
  switch (json?.event) {
    // case "INSERT_CHAR":
    //   client.setQueryData([ASSETS_CONTENT, json.data.key], (content) => {
    //     let ctn = content.split("\n");
    //     for (let i = 0; i < json.data.changes.length; i++) {
    //       const change = json.data.changes[i];

    //       const startLine = change.range.startLineNumber - 1;
    //       if (change.range.startLineNumber - change.range.endLineNumber === 0) {
    //         ctn[startLine] =
    //           ctn[startLine].slice(0, change.range.startColumn - 1) +
    //           (change.text === "" ? "" : change.text) +
    //           ctn[startLine].slice(change.range.endColumn - 1);
    //       } else {
    //         ctn.splice(
    //           change.range.startLineNumber - 1,
    //           change.range.endLineNumber - change.range.startLineNumber + 1,
    //           ctn[change.range.startLineNumber - 1].slice(
    //             0,
    //             change.range.startColumn - 1
    //           ) +
    //             change.text +
    //             ctn[change.range.endLineNumber - 1].slice(
    //               change.range.endColumn - 1
    //             )
    //         );
    //       }
    //     }
    //     return ctn.join("\n");
    //   });
    //   break;
    case "CREATE_RESOURCE":
      isResourceExist(client, json.data.resource, () =>
        client.setQueryData(json.data.resource, (resources) => {
          for (let i = 0; i < resources?.length; i++) {
            if (resources[i].name === json.data.name) {
              return resources;
            }
          }

          const newResources = [...resources, { name: json.data.name }];

          return newResources;
        })
      );
      break;
    case "UPDATE_ASSET":
      isAssetExist(client, json.data.name, () =>
        client.setQueryData([ASSETS_CONTENT, json.data.name], () => {
          return json.data.text || "";
        })
      );
      break;
    case "DELETE_RESOURCE":
      isResourceExist(client, json.data.resource, () =>
        client.setQueryData(json.data.resource, (asset) => {
          const newAsset = [];

          for (let i = 0; i < asset.length; i++) {
            if (json.data.name !== asset[i].name) newAsset.push(asset[i]);
          }

          return newAsset;
        })
      );
      break;
    case "RENAME_RESOURCE":
      isResourceExist(client, json.data.resource, () =>
        client.setQueryData(json.data.resource, (asset) => {
          const newAsset = [...asset];

          for (let i = 0; i < newAsset.length; i++) {
            if (json.data.name === newAsset[i].name) {
              newAsset[i].name = json.data.info.newName;
              return newAsset;
            }
          }

          return newAsset;
        })
      );
      break;
    case "UPDATE_OBJECT":
      isObjectExist(client, json.data.name, () => {
        client.setQueryData([OBJECT, json.data.name], (data) => {
          const newData = { ...data };
          newData.object = { ...newData.object, ...json.data };
          return newData;
        });
      });
      break;
    case "UPDATE_ANIMATION_FRAMES":
      isObjectExist(client, json.data.objectName, () =>
        client.setQueryData([OBJECT, json.data.objectName], (data) => {
          const newData = { ...data };
          const i = newData.animations.findIndex(
            (a) => a.name === json.data.name
          );
          newData.animations[i].frames = json.data.frames;
          return newData;
        })
      );
      break;
    case "CREATE_ANIMATION":
      isObjectExist(client, json.data.objectName, () =>
        client.setQueryData([OBJECT, json.data.objectName], (data) => {
          const newData = { ...data };
          newData.animations.push(json.data.animation);

          return newData;
        })
      );
      break;
    case "DELETE_ANIMATION":
      isObjectExist(client, json.data.name, () =>
        client.setQueryData([OBJECT, json.data.name], (data) => {
          const newData = { ...data };
          const i = newData.animations.findIndex(
            (ani) => ani.ID === json.data.id
          );
          newData.animations.splice(i, 1);
          return newData;
        })
      );
      break;
    default:
      console.log("No event handler for " + json?.event);
      break;
  }
}

export { WebSocketProvider };
