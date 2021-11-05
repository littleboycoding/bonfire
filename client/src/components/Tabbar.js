import styled from "styled-components/macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle, faPlay } from "@fortawesome/free-solid-svg-icons";

import useBuffer from "../hook/buffer";

const Tabbar = styled.div`
  user-select: none;
  grid-area: tabbar;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.25);

  .sep {
    display: flex;
  }
`;

const Tab = styled.div`
  min-width: 100px;
  background-color: ${({ selected }) => (selected ? "#E4E4E4" : "white")};
  white-space: nowrap;

  &:hover {
    background-color: #d4d4d4;
    cursor: pointer;
  }

  display: flex;
  gap: 10px;
  justify-content: space-between;
  align-items: center;

  div.back {
    padding: 20px;
  }

  .close {
    margin-right: 20px;
  }

  .close:hover {
    color: #800;
  }
`;

const Button = styled.a`
  padding: 20px;
  background-color: ${({ selected }) => (selected ? "#E4E4E4" : "white")};
  color: green;

  &:hover {
    background-color: #d4d4d4;
    cursor: pointer;
    color: darkgreen;
  }

  display: flex;
  justify-content: center;
  align-items: center;
`;

function TabStyled({ selected, buffer }) {
  const { closeBuffer, focusBuffer } = useBuffer();

  return (
    <Tab selected={selected}>
      <div className="back" id="back" onClick={() => focusBuffer(buffer.path)}>
        {buffer.path}
      </div>
      <FontAwesomeIcon
        className="close"
        onClick={() => closeBuffer(buffer.path)}
        icon={faTimesCircle}
      />
    </Tab>
  );
}

function TabList() {
  const { buffers, focusPath } = useBuffer();

  return buffers.map((buf) => (
    <TabStyled key={buf.path} buffer={buf} selected={buf.path === focusPath} />
  ));
}

function TabbarStyled() {
  return (
    <Tabbar>
      <div className="sep">
        <TabList />
      </div>
      <div className="sep">
        <Button href="/preview" target="_blank">
          <FontAwesomeIcon icon={faPlay} />
        </Button>
      </div>
    </Tabbar>
  );
}

export default TabbarStyled;
