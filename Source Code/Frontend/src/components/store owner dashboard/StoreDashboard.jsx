import React, { useState } from "react";
import styled from "styled-components";
import ProductManagement from "./ProductMgt";
import CategoryManagement from "./CategoryMgt";
import LayoutEditor from "../layout-editor/LayoutEditor";
import { FaBox, FaListUl, FaStore, FaChevronLeft } from "react-icons/fa";

const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
`;

const Sidebar = styled.div`
  background: white;
  border-right: 1px solid #e2e8f0;
  padding: 2rem 0;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
  width: ${props => props.$collapsed ? '80px' : '250px'};
  transition: width 0.3s ease;
  position: relative;
`;

const ToggleButton = styled.button`
  position: absolute;
  right: -12px;
  top: 20px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;

  svg {
    font-size: 0.8rem;
    color: #64748b;
    transition: transform 0.3s ease;
    transform: rotate(${(props) => (props.$collapsed ? "180deg" : "0deg")});
  }

  &:hover {
    background: #f8fafc;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin: 0.5rem 0;
`;

const NavButton = styled.button`
  width: 100%;
  padding: 1rem;
  padding-left: ${props => props.$collapsed ? '1.5rem' : '2rem'};
  border: none;
  background: ${props => props.$active ? '#e2e8f0' : 'transparent'};
  color: ${props => props.$active ? '#1e293b' : '#64748b'};
  font-weight: ${props => props.$active ? '600' : '400'};
  text-align: left;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;

  &:hover {
    background: ${props => props.$active ? '#e2e8f0' : '#f1f5f9'};
    color: #1e293b;
  }

  svg {
    font-size: 1.25rem;
    min-width: 20px;
  }

  span {
    opacity: ${(props) => (props.$collapsed ? "0" : "1")};
    transition: opacity 0.2s ease;
  }
`;

const MainContent = styled.div`
  padding: 2rem;
  flex: 1;
  overflow: hidden;
`;

const StoreDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <DashboardContainer>
      <Sidebar $collapsed={isCollapsed}>
        <ToggleButton
          onClick={() => setIsCollapsed(!isCollapsed)}
          $collapsed={isCollapsed}
        >
          <FaChevronLeft />
        </ToggleButton>
        <NavList>
          <NavItem>
            <NavButton
              $active={activeTab === "products"}
              onClick={() => setActiveTab("products")}
              $collapsed={isCollapsed}
            >
              <FaBox />
              <span>Products</span>
            </NavButton>
          </NavItem>
          <NavItem>
            <NavButton
              $active={activeTab === "categories"}
              onClick={() => setActiveTab("categories")}
              $collapsed={isCollapsed}
            >
              <FaListUl />
              <span>Categories</span>
            </NavButton>
          </NavItem>
          <NavItem>
            <NavButton
              $active={activeTab === "layout"}
              onClick={() => setActiveTab("layout")}
              $collapsed={isCollapsed}
            >
              <FaStore />
              <span>Store Layout</span>
            </NavButton>
          </NavItem>
        </NavList>
      </Sidebar>

      <MainContent>
        {activeTab === "products" && <ProductManagement />}
        {activeTab === "categories" && <CategoryManagement />}
        {activeTab === "layout" && <LayoutEditor />}
      </MainContent>
    </DashboardContainer>
  );
};

export default StoreDashboard;
