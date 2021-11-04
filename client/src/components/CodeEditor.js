import styled from "styled-components/macro";
import { useState } from "react";
import useBuffer from "../hook/buffer";
import { useQuery } from "react-query";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

const CodeEditor = styled(CodeMirror)`
  grid-area: editor;
  overflow: auto;
  font-size: 14px;
`;

function apiFetcher({ queryKey }) {
  return fetch(`http://localhost:8080/api/${queryKey[0]}/${queryKey[1]}`).then((res) =>
    res.text()
  );
}

function CodeEditorStyled() {
  const { buffers, focusPath } = useBuffer();
  const [code, setCode] = useState("");
  const buffer = buffers.find((buf) => buf.path === focusPath);

  const { isLoading, error } = useQuery([buffer.type, focusPath], apiFetcher, {
    onSuccess(data) {
      setCode(data);
    },
  });

  if (isLoading) return "…";
  if (error) return error;

  const onCodeChange = (code) => {
    setCode(code);
  };

  return (
    <CodeEditor
      height="100%"
      extensions={[javascript()]}
      value={code}
      onChange={onCodeChange}
    ></CodeEditor>
  );
}

export default CodeEditorStyled;
