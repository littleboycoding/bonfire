import styled from "styled-components/macro";
import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faLayerGroup,
  faFile,
  faPlus,
  faRunning,
} from "@fortawesome/free-solid-svg-icons";
import { useQuery, useQueryClient } from "react-query";
import useBuffer from "../hook/buffer";
import useWebSocket from "../hook/websocket";
import { getAssets, getScenes, uploadAsset } from "../api/api";

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

function ListStyled({ focus }) {
  const { addBuffer } = useBuffer();
  const client = useQueryClient();
  const data = client.getQueryData(focus);
  const { lastJsonMessage } = useWebSocket();
  const fileRef = useRef();

  useEffect(() => {
    if (lastJsonMessage?.event === "CREATE_ASSET") {
      client.setQueryData("ASSETS", (assets) => {
        for (let i = 0; i < assets?.length; i++) {
          if (assets[i].Name === lastJsonMessage.data.Name) {
            return assets;
          }
        }

        const newAssets = [
          ...assets,
          {
            Filename: lastJsonMessage.data.Name,
            Mimetype: lastJsonMessage.data.Mimetype,
          },
        ];

        return newAssets;
      });
    }
  }, [lastJsonMessage, client]);

  const createNew = () => {
    fileRef.current.click();
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
      {data?.length > 0 &&
        data.map((asset) => (
          <Item
            onClick={() => addBuffer(asset.Filename, focus)}
            key={asset.Filename}
          >
            <FontAwesomeIcon icon={faFile} /> {asset.Filename}
          </Item>
        ))}
      <Item onClick={createNew}>
        <FontAwesomeIcon icon={faPlus} /> Create new
        <input
          type="file"
          ref={fileRef}
          style={{ display: "none" }}
          onChange={onFileChange}
        />
      </Item>
    </List>
  );
}

function CategoryStyled({ onSelect, title, selected, icon, focus, items }) {
  return (
    <Category selected={selected} onClick={onSelect}>
      <div className="title">
        <FontAwesomeIcon icon={icon} />
        {title}
      </div>
      {selected && <ListStyled focus={focus} items={items} />}
    </Category>
  );
}

const ASSETS = "ASSETS";
const SCENES = "SCENES";
const OBJECTS = "OBJECTS";

function SidebarStyled() {
  const [focus, setFocus] = useState(ASSETS);
  const { isLoading: isAssetsLoading } = useQuery(ASSETS, getAssets);
  const { isLoading: isScenesLoading } = useQuery(SCENES, getScenes);

  if (isAssetsLoading || isScenesLoading) return null;

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
