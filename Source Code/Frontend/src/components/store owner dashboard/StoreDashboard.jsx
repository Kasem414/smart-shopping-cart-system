import React, { useState } from "react";
import ProductManagement from "./ProductMgt";
import CategoryManagement from "./CategoryMgt";
import { FaBox, FaListUl, FaBars, FaTimes } from "react-icons/fa";

const MainDashboard = () => {
  // State to manage active component and sidebar visibility
  const [activeComponent, setActiveComponent] = useState("products");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Function to toggle sidebar visibility
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        className={`text-white ${sidebarOpen ? "p-4" : "p-2"} ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
        style={{
          // Dynamic width based on sidebar state
          width: sidebarOpen ? "250px" : "60px",
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          background: "linear-gradient(to bottom, #4a4a4a, #2b2b2b)",
          transition: "width 0.3s ease-in-out",
          position: "fixed",
          zIndex: 1000,
        }}
      >
        {/* Sidebar header with toggle button */}
        <div
          className={`d-flex ${
            sidebarOpen ? "justify-content-between" : "justify-content-center"
          } align-items-center mb-4`}
        >
          {sidebarOpen && <h4 className="m-0">Dashboard</h4>}
          <button
            className="btn btn-link text-white p-0"
            onClick={toggleSidebar}
            style={{ fontSize: "1.5rem" }}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Sidebar navigation buttons */}
        <ul className="list-unstyled">
          {/* Products management button */}
          <li className="mb-3">
            <button
              className={`btn ${
                activeComponent === "products"
                  ? "btn-primary"
                  : "btn-outline-light"
              } w-100 ${sidebarOpen ? "text-start" : "justify-content-center"}`}
              onClick={() => setActiveComponent("products")}
              style={{ whiteSpace: "nowrap", overflow: "hidden" }}
            >
              <FaBox className={sidebarOpen ? "me-2" : ""} />
              <span
                style={{
                  opacity: sidebarOpen ? 1 : 0,
                  transition: "opacity 0.1s",
                  transitionDelay: sidebarOpen ? "0.2s" : "0s",
                }}
              >
                Manage Products
              </span>
            </button>
          </li>
          {/* Categories management button */}
          <li>
            <button
              className={`btn ${
                activeComponent === "categories"
                  ? "btn-primary"
                  : "btn-outline-light"
              } w-100 ${sidebarOpen ? "text-start" : "justify-content-center"}`}
              onClick={() => setActiveComponent("categories")}
              style={{ whiteSpace: "nowrap", overflow: "hidden" }}
            >
              <FaListUl className={sidebarOpen ? "me-2" : ""} />
              <span
                style={{
                  opacity: sidebarOpen ? 1 : 0,
                  transition: "opacity 0.1s",
                  transitionDelay: sidebarOpen ? "0.2s" : "0s",
                }}
              >
                Manage Categories
              </span>
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div
        style={{
          // Dynamic margin and width based on sidebar state
          marginLeft: sidebarOpen ? "250px" : "60px",
          width: sidebarOpen ? "calc(100% - 250px)" : "calc(100% - 60px)",
          transition: "all 0.3s ease-in-out",
          minHeight: "100vh",
        }}
      >
        <div className="container-fluid p-4">
          {/* Render active component based on state */}
          {activeComponent === "products" && <ProductManagement />}
          {activeComponent === "categories" && <CategoryManagement />}
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
