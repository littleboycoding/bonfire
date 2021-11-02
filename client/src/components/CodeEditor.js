import styled from "styled-components/macro";
import { useState, useEffect, useRef } from "react";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

const CodeEditor = styled(CodeMirror)`
  grid-area: editor;
  overflow: auto;
  font-size: 14px;
`;

const EXAMPLE_CODE = `const hello = 'world';

if (hello) {
	console.log(hello)
}`;

function CodeEditorStyled(props) {
  const [code, setCode] = useState(EXAMPLE_CODE);

  const onCodeChange = ({ target }) => {
    setCode(target.value);
  };

  return (
    <CodeEditor
      theme="light"
      height="100%"
      extensions={[javascript()]}
      value={code}
      onChange={onCodeChange}
    ></CodeEditor>
  );
}

export default CodeEditorStyled;
