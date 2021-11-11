import styled from "styled-components/macro";
import { QueryClientProvider, QueryClient } from "react-query";

import Statusbar from "./components/Statusbar";
import Sidebar from "./components/Sidebar";
import Tabbar from "./components/Tabbar";
import Editor from "./components/Editor";

import { BufferProvider } from "./context/buffer";
import { WebSocketProvider } from "./context/websocket";

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
    <>
      <Tabbar />
      <Editor />
      <Sidebar />
      <Statusbar />
    </>
  );
}

function RootStyled() {
  return (
    <Root>
      <QueryClientProvider client={client}>
        <WebSocketProvider>
          <BufferProvider>
            <App />
          </BufferProvider>
        </WebSocketProvider>
      </QueryClientProvider>
    </Root>
  );
}

export default RootStyled;
