import { useState } from "react";
import useBuffer from "../hook/buffer";
import { useQuery } from "react-query";

import MonacoEditor from "@monaco-editor/react";
import { getAssetsContent } from "../api/api";

import { ASSETS_CONTENT } from "../store_constant";
import useWebSocket from "../hook/websocket";

function CodeEditorStyled() {
  const { focusPath, closeBuffer } = useBuffer();
  const [code, setCode] = useState("");
  const { sendJsonMessage } = useWebSocket();

  const { isLoading } = useQuery(
    [ASSETS_CONTENT, focusPath],
    getAssetsContent,
    {
      onSuccess(data) {
        setCode(data);
      },
      onError() {
        closeBuffer(focusPath);
      },
    }
  );

  if (isLoading) return "…";

  const onCodeChange = (code) => {
    sendJsonMessage({
      event: "UPDATE_ASSET",
      data: {
        name: focusPath,
        text: code,
      },
    });
    // sendJsonMessage({
    //   event: "INSERT_CHAR",
    //   data: {
    //     key: focusPath,
    //     changes: e.changes.map(({ range, text }) => ({ range, text })),
    //   },
    // });
    setCode(code);
  };

  return (
    <MonacoEditor
      height="100%"
      language="typescript"
      value={code}
      onChange={onCodeChange}
    ></MonacoEditor>
  );
}

export default CodeEditorStyled;
