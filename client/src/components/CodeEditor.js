import styled from "styled-components/macro";
import { useState, useRef } from "react";
import useBuffer from "../hook/buffer";
import { useQuery } from "react-query";

import CodeMirror, { useCodeMirror } from "@uiw/react-codemirror";
import MonacoEditor from "@uiw/react-monacoeditor";
import { javascript } from "@codemirror/lang-javascript";
import { getAssetsContent } from "../api/api";

import { ASSETS_CONTENT } from "../store_constant";
import useWebSocket from "../hook/websocket";

const CodeEditor = styled(CodeMirror)`
  grid-area: editor;
  overflow: auto;
  font-size: 14px;
`;

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

  const onCodeChange = (code, e) => {
    console.log(code, e);

    sendJsonMessage({
      event: "INSERTED_CHAR",
      data: { row: 10, column: 10, char: "a" },
    });
    setCode(code);
  };

  return (
    <MonacoEditor
      height="100%"
      language="typescript"
      value={code}
      // onChange={onCodeChange}
    ></MonacoEditor>
  );
}

export default CodeEditorStyled;
