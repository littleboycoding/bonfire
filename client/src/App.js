import styled from "styled-components";

import Statusbar from "./components/Statusbar";
import Sidebar from "./components/Sidebar";
import Tabbar from "./components/Tabbar";
import Editor from "./components/Editor";

const Root = styled.div`
  display: grid;
  grid-template-areas:
    "sidebar tabbar"
    "sidebar editor"
    "status status";
  grid-template-columns: 30% 1fr;
`;

function App() {
  return (
    <Root>
      <Tabbar />
      <Sidebar />
      <Editor />
      <Statusbar />
    </Root>
  );
}

export default App;
