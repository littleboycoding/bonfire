import styled from "styled-components/macro";

import Statusbar from "./components/Statusbar";
import Sidebar from "./components/Sidebar";
import Tabbar from "./components/Tabbar";
import Editor from "./components/Editor";
import { QueryClientProvider, QueryClient } from "react-query";

import { BufferProvider } from "./context/buffer";

const client = new QueryClient();

const Root = styled.div`
  display: grid;
  grid-template-areas:
    "sidebar tabbar"
    "sidebar editor"
    "status status";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  height: 100vh;
`;

function App() {
  return (
    <Root>
      <QueryClientProvider client={client}>
        <BufferProvider>
          <Tabbar />
          <Editor />
          <Sidebar />
          <Statusbar />
        </BufferProvider>
      </QueryClientProvider>
    </Root>
  );
}

export default App;
