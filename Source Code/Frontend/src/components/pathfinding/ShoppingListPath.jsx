import React from "react";
import styled from "styled-components";

const PathContainer = styled.div`
  width: 100%;
  height: 500px;
  position: relative;
  overflow: auto;
  background: #f1f5f9;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin: 2rem 0;
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
  height: 3px;
  background: #3b82f6;
  transform-origin: 0 0;
  z-index: 1;
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

const PathPoint = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  background: ${(props) =>
    props.isStart ? "#10b981" : props.isEnd ? "#ef4444" : "#3b82f6"};
  border-radius: 50%;
  z-index: 2;
`;

const Legend = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const LegendColor = styled.div`
  width: 1rem;
  height: 1rem;
  border-radius: ${(props) => (props.isPath ? "0" : "0.25rem")};
  background: ${(props) => props.color};
  border: 2px solid ${(props) => props.borderColor};
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

const ShoppingListPath = ({ layout, path, gridSize = 50 }) => {
  return (
    <div>
      <Legend>
        <LegendItem>
          <LegendColor color="#f5f3ff" borderColor="#9163cb" />
          <span>Shelf</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#ecfdf5" borderColor="#10b981" />
          <span>Entrance</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#fff7ed" borderColor="#f97316" />
          <span>Checkout Counter</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#3b82f6" borderColor="#3b82f6" isPath />
          <span>Suggested Path</span>
        </LegendItem>
      </Legend>

      <PathContainer>
        {layout.map((item) => (
          <LayoutItem
            key={item.id}
            itemType={item.type}
            style={{
              width: item.width * gridSize,
              height: item.height * gridSize,
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

        {path &&
          path.map((point, index) => {
            if (index < path.length - 1) {
              const start = point;
              const end = path[index + 1];
              const length = Math.sqrt(
                Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
              );
              const angle = Math.atan2(end.y - start.y, end.x - start.x);

              return (
                <PathLine
                  key={`path-${index}`}
                  style={{
                    left: start.x,
                    top: start.y,
                    width: length,
                    transform: `rotate(${angle}rad)`,
                  }}
                />
              );
            }
            return null;
          })}

        {path &&
          path.map((point, index) => (
            <PathPoint
              key={`point-${index}`}
              style={{
                left: point.x - 5,
                top: point.y - 5,
              }}
              isStart={index === 0}
              isEnd={index === path.length - 1}
            />
          ))}
      </PathContainer>
    </div>
  );
};

export default ShoppingListPath;
