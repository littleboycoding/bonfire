import styled from "styled-components/macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

const GITHUB_URL = "https://github.com/littleboycoding/bonfire"

const Statusbar = styled.div`
  background-color: white;
  grid-area: status;
  padding: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Circle = styled(FontAwesomeIcon).attrs(() => ({
  icon: faCircle,
}))`
  color: ${({ online }) => (online ? "green" : "red")}};
`;

const ConnectionStatus = styled.span`
  display: flex;
  gap: 10px;
`;

function ConnectionStatusStyled() {
  return (
    <ConnectionStatus>
      <Circle online={true} />
      Connected
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
