import styled from "styled-components/macro";
import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faTrash,
  faPenAlt,
  faLayerGroup,
  faFile,
  faPlus,
  faUpload,
  faRunning,
  faImage,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "react-query";
import useBuffer from "../hook/buffer";
import useWebSocket from "../hook/websocket";
import { uploadAsset, getResources } from "../api/api";

import { ASSETS, OBJECTS, SCENES } from "../store_constant";

const Sidebar = styled.div`
  background-color: white;
  grid-area: sidebar;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(0, 0, 0, 0.25);
  user-select: none;
  word-break: break-all;
`;

const Category = styled.div`
  padding: 20px;
  background-color: ${({ selected }) => (selected ? "#E4E4E4" : "white")};
  transition: 0.1s all;

  .title {
    font-size: 24px;
    display: flex;
    gap: 10px;
  }

  &:hover {
    background-color: #d4d4d4;
    cursor: pointer;
    transition: 0.1s all;
  }
`;

const List = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Item = styled.span`
  padding-left: 10px;
  display: flex;
  gap: 10px;
  color: #333;
  justify-content: space-between;
  align-items: flex-start;

  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }

  .tooltip {
    opacity: 0.5;
  }

  &:hover .tooltip {
    opacity: 1;
  }

  .tooltip svg:hover {
    transform: scale(1.5);
  }

  & > span {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
`;

function ListStyled({ focus }) {
  const { addBuffer } = useBuffer();
  const { sendJsonMessage } = useWebSocket();
  const fileRef = useRef();
  const { data: items } = useQuery([focus], () => getResources(focus));

  const upload = () => {
    fileRef.current.click();
  };

  const create = () => {
    const name = window.prompt("Enter name");
    if (name)
      sendJsonMessage({
        event: "CREATE_RESOURCE",
        data: { name, resource: focus },
      });
  };

  const onFileChange = async ({
    target: {
      files: [asset],
    },
  }) => {
    const formData = new FormData();
    formData.append("asset", asset);
    uploadAsset(formData);
  };

  const deletion = async (name) => {
    const confirm = window.confirm("Delete comfirmation");
    if (confirm)
      sendJsonMessage({
        event: "DELETE_RESOURCE",
        data: { name, resource: focus },
      });
  };

  const rename = async (name) => {
    const newName = window.prompt("Enter new name");
    if (newName)
      sendJsonMessage({
        event: "RENAME_RESOURCE",
        data: { name, resource: focus, info: { newName: newName } },
      });
  };

  return (
    <List>
      {items?.length > 0 &&
        items.map((item) => (
          <Item key={item.name}>
            <span onClick={() => addBuffer(item.name, focus)}>
              <FontAwesomeIcon icon={faFile} />{" "}
              {item.name}
            </span>
            <span className="tooltip">
              <FontAwesomeIcon
                onClick={() => rename(item.name)}
                icon={faPenAlt}
              />
              <FontAwesomeIcon
                icon={faTrash}
                onClick={() => deletion(item.name)}
                style={{ color: "#800" }}
              />
            </span>
          </Item>
        ))}
      {focus === ASSETS && (
        <Item onClick={upload}>
          <span>
            <FontAwesomeIcon icon={faUpload} /> Upload asset
            <input
              type="file"
              ref={fileRef}
              style={{ display: "none" }}
              onChange={onFileChange}
            />
          </span>
        </Item>
      )}
      <Item onClick={create}>
        <span>
          <FontAwesomeIcon icon={faPlus} /> Create new
        </span>
      </Item>
    </List>
  );
}

function CategoryStyled({ onSelect, title, selected, icon, focus }) {
  return (
    <Category selected={selected} onClick={onSelect}>
      <div className="title">
        <FontAwesomeIcon icon={icon} />
        {title}
      </div>
      {selected && <ListStyled focus={focus} />}
    </Category>
  );
}

function SidebarStyled() {
  const [focus, setFocus] = useState(ASSETS);

  const onSelect = (category) => {
    setFocus(category);
  };

  return (
    <Sidebar>
      <CategoryStyled
        onSelect={() => onSelect(ASSETS)}
        focus={focus}
        icon={faBox}
        selected={focus === ASSETS}
        title="Assets"
      />
      <CategoryStyled
        onSelect={() => onSelect(OBJECTS)}
        focus={focus}
        icon={faRunning}
        selected={focus === OBJECTS}
        title="Objects"
      />
      <CategoryStyled
        onSelect={() => onSelect(SCENES)}
        focus={focus}
        icon={faLayerGroup}
        selected={focus === SCENES}
        title="Scenes"
      />
    </Sidebar>
  );
}

export default SidebarStyled;
