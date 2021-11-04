import styled from "styled-components/macro";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faLayerGroup,
  faFile,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import useBuffer from "../hook/buffer";
import { useQuery } from "react-query";

const Sidebar = styled.div`
  background-color: white;
  grid-area: sidebar;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(0, 0, 0, 0.25);
  user-select: none;
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

function apiFetcher({ queryKey: [category] }) {
  return fetch(`http://localhost:8080/api/${category}`).then((res) =>
    res.json()
  );
}

function ListStyled({ focus }) {
  const { addBuffer } = useBuffer();
  const { data, isLoading, error } = useQuery(focus, apiFetcher);

  if (isLoading) return <Item>…</Item>;
  if (error) return error;

  const createNew = () => {
    const name = window.prompt("Enter name");
    if (name) addBuffer(name, focus);
  };

  return (
    <List>
      <Item onClick={createNew}>
        <FontAwesomeIcon icon={faPlus} /> Create new
      </Item>
      {data.map((file) => (
        <Item onClick={() => addBuffer(file, focus)} key={"app"}>
          <FontAwesomeIcon icon={faFile} /> {file}
        </Item>
      ))}
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

const ASSETS = "assets";
const SCENES = "scenes";

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
