import React, { useState } from 'react';
import styled from 'styled-components';
import { Rnd } from 'react-rnd';
import ShelfCategoryModal from './components/ShelfCategoryModal';

const ItemContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: ${props => {
    if (props.isSelected) return '#e2e8f0';
    switch (props.itemType) {
      case 'shelf':
        return '#f5f3ff'; //light violet
      case 'entrance':
        return '#ecfdf5'; //light green
      case 'checkoutCounter':
        return '#fff7ed'; // Warm orange/peach
      case 'aisle':
        return '#f3f4f6'; // Light gray
      default:
        return 'white';
    }
  }};
  border: 2px solid ${props => {
    if (props.isSelected) return '#3b82f6';
    switch (props.itemType) {
      case 'shelf':
        return '#9163cb'; // Darker violet
      case 'entrance':
        return '#10b981'; // Darker green
      case 'checkoutCounter':
        return '#f97316'; // Orange
      case 'aisle':
        return '#9ca3af'; // Medium gray
      default:
        return '#94a3b8';
    }
  }};
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  transition: background 0.2s;

  &:hover {
    background: #f1f5f9;
  }
`;


const CategoryBadge = styled.span`
  background: ${props => props.color || '#3b82f6'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.6rem;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  i {
    font-size: 0.875rem;
  }
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

const getCategoryColor = (index) => {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#ef4444', // red
    '#6366f1', // indigo
  ];
  return colors[index % colors.length];
};

const ResizeHandle = styled.div`
  position: absolute;
  width: 9px;
  height: 9px;
  background: #3b82f6;
  border: 1px solid white;
  border-radius: 50%;
  z-index: 1;
  
  &:hover {
    transform: scale(1.2);
    background: #2563eb;
  }

  &.topLeft {
    top: 7px;
    left: 7px;
    cursor: nw-resize;
  }
  &.topRight {
    top: 7px;
    right: 7px;
    cursor: ne-resize;
  }
  &.bottomRight {
    bottom: 7px;
    right: 7px;
    cursor: se-resize;
  }
  &.bottomLeft {
    bottom: 7px;
    left: 7px;
    cursor: sw-resize;
  }
`;

const LayoutItem = ({
  item,
  gridSize,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (item.type === 'shelf') {
      setShowCategoryModal(true);
    }
  };

  const handleSaveCategories = (categories) => {
    onUpdate({ categories });
  };

  return (
    <>
      <Rnd
        size={{
          width: item.width * gridSize,
          height: item.height * gridSize,
        }}
        position={{
          x: item.position_x,
          y: item.position_y,
        }}
        onDragStop={(e, d) => {
          onUpdate({
            position_x: Math.round(d.x / gridSize) * gridSize,
            position_y: Math.round(d.y / gridSize) * gridSize,
          });
        }}
        onResizeStart={() => setIsResizing(true)}
        onResizeStop={(e, direction, ref, delta, position) => {
          setIsResizing(false);
          onUpdate({
            width: Math.round(ref.offsetWidth / gridSize),
            height: Math.round(ref.offsetHeight / gridSize),
            position_x: Math.round(position.x / gridSize) * gridSize,
            position_y: Math.round(position.y / gridSize) * gridSize,
          });
        }}
        minWidth={gridSize}
        minHeight={gridSize}
        gridSize={gridSize}
        bounds="parent"
        resizeGrid={[gridSize, gridSize]}
        dragGrid={[gridSize, gridSize]}
        resizeHandleComponent={{
          topLeft: isSelected && <ResizeHandle className="topLeft" />,
          topRight: isSelected && <ResizeHandle className="topRight" />,
          bottomRight: isSelected && <ResizeHandle className="bottomRight" />,
          bottomLeft: isSelected && <ResizeHandle className="bottomLeft" />
        }}
        enableResizing={{
          top: false,
          right: false,
          bottom: false,
          left: false,
          topRight: isSelected,
          bottomRight: isSelected,
          bottomLeft: isSelected,
          topLeft: isSelected
        }}
      >
        <ItemContainer
          isSelected={isSelected}
          itemType={item.type}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onDoubleClick={handleDoubleClick}
        >
          <i className={item.icon} />
          {item.categories && item.categories.length > 0 && (
            <Categories>
              {item.categories.map((category, index) => (
                <CategoryBadge 
                  key={index}
                  color={getCategoryColor(index)}
                >
                  {category}
                </CategoryBadge>
              ))}
            </Categories>
          )}
         
        </ItemContainer>
      </Rnd>

      <ShelfCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categories={item.categories || []}
        onSave={handleSaveCategories}
      />
    </>
  );
};

export default LayoutItem; 