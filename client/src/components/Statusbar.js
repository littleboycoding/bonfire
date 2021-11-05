import styled from "styled-components/macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import useWebSocket from "../hook/websocket";

const GITHUB_URL = "https://github.com/littleboycoding/bonfire";

const Statusbar = styled.div`
  background-color: white;
  grid-area: status;
  padding: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Circle = styled.span`
  color: ${({ online }) => (online ? "green" : "red")}};
`;

function CircleStyled({ online }) {
  return (
    <Circle online={online}>
      <FontAwesomeIcon icon={faCircle} />
    </Circle>
  );
}

const ConnectionStatus = styled.span`
  display: flex;
  gap: 10px;
`;

function ConnectionStatusStyled() {
  const { readyState } = useWebSocket();

  return (
    <ConnectionStatus>
      <CircleStyled online={readyState === 1} />
      {readyState === 1 ? "Connected" : "Disconnected"}
    </ConnectionStatus>
  );
}

const About = styled.a`
  font-weight: 100;
  text-decoration: none;
  color: black;

  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

function StatusbarStyled() {
  return (
    <Statusbar>
      <ConnectionStatusStyled />
      <About href={GITHUB_URL} target="_blank">
        🔥 Bonfire 0.0.1
      </About>
    </Statusbar>
  );
}

export default StatusbarStyled;
