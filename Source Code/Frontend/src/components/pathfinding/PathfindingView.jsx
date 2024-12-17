import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";

const ViewContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: #f1f5f9;
  padding: 1rem;
  position: relative;
  overflow: hidden;
`;

const Canvas = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: auto;
  background: #f1f5f9;
`;

const LayoutItem = styled.div`
  position: absolute;
  background: ${(props) => {
    switch (props.itemType) {
      case "shelf":
        return "#f5f3ff";
      case "entrance":
        return "#ecfdf5";
      case "checkoutCounter":
        return "#fff7ed";
      case "aisle":
        return "#f3f4f6";
      default:
        return "white";
    }
  }};
  border: 2px solid
    ${(props) => {
      switch (props.itemType) {
        case "shelf":
          return "#9163cb";
        case "entrance":
          return "#10b981";
        case "checkoutCounter":
          return "#f97316";
        case "aisle":
          return "#9ca3af";
        default:
          return "#94a3b8";
      }
    }};
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(${(props) => props.rotation}deg);
`;

const PathLine = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const CategoryBadge = styled.span`
  background: ${(props) => props.color || "#3b82f6"};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.6rem;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const Categories = styled.div`
  position: absolute;
  top: 5px;
  left: 0;
  right: 0;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
  padding: 0.25rem;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const getCategoryColor = (index) => {
  const colors = [
    "#3b82f6",
    "#10b981",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#6366f1",
  ];
  return colors[index % colors.length];
};

const PathfindingView = ({ productId, isShoppingList = false }) => {
  const [layout, setLayout] = useState(null);
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLayoutAndPath = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          setError('Please log in to view the shopping route');
          setLoading(false);
          return;
        }

        // Fetch store layout
        const layoutResponse = await axios.get('http://127.0.0.1:8000/store/layout/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setLayout(layoutResponse.data);

        // Fetch path based on whether it's a shopping list or single product
        const pathEndpoint = isShoppingList 
          ? 'http://127.0.0.1:8000/shopping-list-path/'
          : `http://127.0.0.1:8000/shortest-path/${productId}/`;

        const pathResponse = await axios.get(pathEndpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (pathResponse.data.error) {
          setError(pathResponse.data.error);
        } else {
          setPath(pathResponse.data.path);
          console.log(pathResponse.data.path);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load path');
      } finally {
        setLoading(false);
      }
    };

    fetchLayoutAndPath();
  }, [productId, isShoppingList]);

  const renderPath = () => {
    if (!path) return null;

    return (
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <path
          d={`M ${path.map(([x, y]) => `${x} ${y}`).join(" L ")}`}
          stroke="#ef4444"
          strokeWidth="3"
          fill="none"
          strokeDasharray="5,5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Add markers for start and end points */}
        {path.length > 0 && (
          <>
            <circle cx={path[0][0]} cy={path[0][1]} r="5" fill="#10b981" />
            <circle
              cx={path[path.length - 1][0]}
              cy={path[path.length - 1][1]}
              r="5"
              fill="#ef4444"
            />
          </>
        )}
      </svg>
    );
  };

  if (loading) {
    return (
      <LoadingOverlay>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </LoadingOverlay>
    );
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  if (!layout) {
    return <div className="alert alert-warning">No layout data available</div>;
  }

  return (
    <ViewContainer>
      <Canvas>
        {layout.items.map((item) => (
          <LayoutItem
            key={item.id}
            itemType={item.type}
            style={{
              width: item.width * layout.gridSize,
              height: item.height * layout.gridSize,
              left: item.position_x,
              top: item.position_y,
            }}
            rotation={item.rotation || 0}
          >
            <i
              className={`bi bi-${
                item.type === "shelf"
                  ? "grid-3x3"
                  : item.type === "entrance"
                  ? "door-open"
                  : item.type === "checkoutCounter"
                  ? "cart"
                  : "layout-three-columns"
              }`}
            />
            {item.categories && item.categories.length > 0 && (
              <Categories>
                {item.categories.map((category, index) => (
                  <CategoryBadge key={index} color={getCategoryColor(index)}>
                    {category}
                  </CategoryBadge>
                ))}
              </Categories>
            )}
          </LayoutItem>
        ))}
        {renderPath()}
      </Canvas>
    </ViewContainer>
  );
};

export default PathfindingView;
