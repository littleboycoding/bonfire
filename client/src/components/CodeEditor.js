import styled from "styled-components/macro";
import { useState } from "react";
import useBuffer from "../hook/buffer";
import { useQuery } from "react-query";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { getContent } from "../api/api"

const CodeEditor = styled(CodeMirror)`
  grid-area: editor;
  overflow: auto;
  font-size: 14px;
`;

function CodeEditorStyled() {
  const { focusPath } = useBuffer();
  const [code, setCode] = useState("");

  const { isLoading, error } = useQuery(
    ["ASSET_CONTENT", focusPath],
    getContent,
    {
      onSuccess(data) {
        setCode(data);
      },
    }
  );

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
