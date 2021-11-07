import styled from "styled-components/macro";
import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
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

  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

function getIconFromMimetype(mimetype) {
  const photo = new RegExp(/video\/.*$/);
  const image = new RegExp(/image\/.*$/);

  if (photo.exec(mimetype)) return faVideo;
  if (image.exec(mimetype)) return faImage;
  return faFile;
}

function ListStyled({ focus }) {
  const { addBuffer } = useBuffer();
  const { sendJsonMessage } = useWebSocket();
  const fileRef = useRef();
  const { data: items } = useQuery([focus], () => getResources(focus));

  const upload = () => {
    fileRef.current.click();
  };

  const create = () => {
    const fileName = window.prompt("Enter name");
    if (fileName) sendJsonMessage({ event: "CREATE_ASSET", data: fileName });
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

  return (
    <List>
      {items?.length > 0 &&
        items.map((item) => (
          <Item onClick={() => addBuffer(item.name, focus)} key={item.name}>
            <FontAwesomeIcon icon={getIconFromMimetype(item.mimetype)} />{" "}
            {item.name}
          </Item>
        ))}
      {focus === ASSETS && (
        <Item onClick={upload}>
          <FontAwesomeIcon icon={faUpload} /> Upload asset
          <input
            type="file"
            ref={fileRef}
            style={{ display: "none" }}
            onChange={onFileChange}
          />
        </Item>
      )}
      <Item onClick={create}>
        <FontAwesomeIcon icon={faPlus} /> Create new
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
