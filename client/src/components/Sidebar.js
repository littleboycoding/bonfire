import styled from "styled-components/macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faLayerGroup } from "@fortawesome/free-solid-svg-icons";

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
  font-size: 24px;
  background-color: ${({ selected }) => (selected ? "#E4E4E4" : "white")};
  transition: 0.1s all;
  display: flex;
  gap: 10px;

  &:hover {
    background-color: #d4d4d4;
    cursor: pointer;
    transition: 0.1s all;
  }
`;

function CategoryStyled({ title, selected, icon }) {
  return (
    <Category selected={selected}>
      <FontAwesomeIcon icon={icon} />
      {title}
    </Category>
  );
}

function SidebarStyled() {
  return (
    <Sidebar>
      <CategoryStyled icon={faBox} selected title="Assets" />
      <CategoryStyled icon={faLayerGroup} title="Scenes" />
    </Sidebar>
  );
}

export default SidebarStyled;
