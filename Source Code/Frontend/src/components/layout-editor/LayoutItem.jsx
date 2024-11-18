import React, { useState } from 'react';
import styled from 'styled-components';
import { Rnd } from 'react-rnd';
import ShelfCategoryModal from './components/ShelfCategoryModal';

const ItemContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: ${props => {
    if (props.hasOverlap) return '#fee2e2';
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
    if (props.hasOverlap) return '#ef4444';
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
  transition: ${props => props.isRotating ? 'none' : 'background 0.2s'};
  transform: rotate(${props => props.rotation}deg);

  &:hover {
    background: ${props => props.hasOverlap ? '#fee2e2' : '#f1f5f9'};
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

const ResizeHandlesWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;

const ResizeHandle = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 9px;
    height: 9px;
    background: #3b82f6;
    border: 1px solid white;
    border-radius: 50%;
  }
  
  &.topLeft {
    top: -10px;
    left: -10px;
    cursor: ${props => `${getCursorAngle(props.rotation, 'nw-resize')}`};
  }
  &.topRight {
    top: -10px;
    right: -10px;
    cursor: ${props => `${getCursorAngle(props.rotation, 'ne-resize')}`};
  }
  &.bottomRight {
    bottom: -10px;
    right: -10px;
    cursor: ${props => `${getCursorAngle(props.rotation, 'se-resize')}`};
  }
  &.bottomLeft {
    bottom: -10px;
    left: -10px;
    cursor: ${props => `${getCursorAngle(props.rotation, 'sw-resize')}`};
  }

  &:hover::after {
    transform: translate(-50%, -50%) scale(1.2);
    background: #2563eb;
  }
`;

// Helper function to calculate cursor angle
const getCursorAngle = (rotation, defaultCursor) => {
  const angle = rotation % 360;
  const cursors = ['nw-resize', 'n-resize', 'ne-resize', 'e-resize', 
                   'se-resize', 's-resize', 'sw-resize', 'w-resize'];
  const index = Math.round(angle / 45) % 8;
  
  if (defaultCursor === 'nw-resize') return cursors[index];
  if (defaultCursor === 'ne-resize') return cursors[(index + 2) % 8];
  if (defaultCursor === 'se-resize') return cursors[(index + 4) % 8];
  if (defaultCursor === 'sw-resize') return cursors[(index + 6) % 8];
  return defaultCursor;
};


const RotationHandle = styled.div`
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border: 1px solid white;
  border-radius: 50%;
  cursor: pointer;
  z-index: 2;
  
  &:hover {
    transform: translateX(-50%) scale(1.2);
    background: #2563eb;
  }
`;

const RotationGuide = styled.div`
  position: absolute;
  top: -20px;
  left: 50%;
  width: 1px;
  height: 20px;
  background: #3b82f6;
  transform-origin: bottom;
  opacity: ${props => props.isRotating ? 0.5 : 0};
`;

const LayoutItem = ({
  item,
  gridSize,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  layout,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [rotation, setRotation] = useState(item.rotation || 0);
  const containerRef = React.useRef(null);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (item.type === 'shelf') {
      setShowCategoryModal(true);
    }
  };

  const handleSaveCategories = (categories) => {
    onUpdate({ categories });
  };

  const checkOverlap = (rect1, rect2) => {
    return !(rect1.x + rect1.width <= rect2.x ||
             rect1.x >= rect2.x + rect2.width ||
             rect1.y + rect1.height <= rect2.y ||
             rect1.y >= rect2.y + rect2.height);
  };
  
  const isValidPosition = (newItem, layout, excludeId = null) => {
    const newRect = {
      x: newItem.position_x,
      y: newItem.position_y,
      width: newItem.width * gridSize,
      height: newItem.height * gridSize
    };
  
    return !layout.some(item => 
      item.id !== excludeId && 
      checkOverlap(newRect, {
        x: item.position_x,
        y: item.position_y,
        width: item.width * gridSize,
        height: item.height * gridSize
      })
    );
  };

  const handleRotationStart = (e) => {
    e.stopPropagation();
    setIsRotating(true);
  };

  const handleRotationMove = (e) => {
    if (!isRotating || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI) + 90;
    
    // Add damping to make rotation less sensitive
    const dampingFactor = 0.8;
    angle = angle * dampingFactor + rotation * (1 - dampingFactor);
    
    // Snap to nearest 45 degrees when within 5 degrees
    const snapThreshold = 5;
    const snapAngles = [0, 45, 90, 135, 180, -135, -90, -45];
    
    for (const snapAngle of snapAngles) {
      if (Math.abs(angle - snapAngle) < snapThreshold) {
        angle = snapAngle;
        break;
      }
    }

    setRotation(angle);
  };

  const handleRotationEnd = () => {
    setIsRotating(false);
    onUpdate({ rotation });
  };

  React.useEffect(() => {
    if (isRotating) {
      window.addEventListener('mousemove', handleRotationMove);
      window.addEventListener('mouseup', handleRotationEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleRotationMove);
      window.removeEventListener('mouseup', handleRotationEnd);
    };
  }, [isRotating]);

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
          const newPosition = {
            position_x: Math.round(d.x / gridSize) * gridSize,
            position_y: Math.round(d.y / gridSize) * gridSize
          };
          
          const newItem = {
            ...item,
            ...newPosition
          };
          
          if (isValidPosition(newItem, layout, item.id)) {
            onUpdate(newPosition);
          }
        }}
        onResizeStart={() => setIsResizing(true)}
        onResizeStop={(e, direction, ref, delta, position) => {
          setIsResizing(false);
          const newUpdate = {
            width: Math.round(ref.offsetWidth / gridSize),
            height: Math.round(ref.offsetHeight / gridSize),
            position_x: Math.round(position.x / gridSize) * gridSize,
            position_y: Math.round(position.y / gridSize) * gridSize,
          };
          
          const newItem = {
            ...item,
            ...newUpdate
          };
          
          if (isValidPosition(newItem, layout, item.id)) {
            onUpdate(newUpdate);
          }
        }}
        minWidth={gridSize}
        minHeight={gridSize}
        gridSize={gridSize}
        bounds="parent"
        resizeGrid={[gridSize, gridSize]}
        dragGrid={[gridSize, gridSize]}
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
          ref={containerRef}
          isSelected={isSelected}
          itemType={item.type}
          hasOverlap={!isValidPosition(item, layout, item.id)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onDoubleClick={handleDoubleClick}
          rotation={rotation}
          isRotating={isRotating}
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

          {isSelected && !isRotating && (
            <ResizeHandlesWrapper>
              <ResizeHandle className="topLeft" rotation={rotation} />
              <ResizeHandle className="topRight" rotation={rotation} />
              <ResizeHandle className="bottomRight" rotation={rotation} />
              <ResizeHandle className="bottomLeft" rotation={rotation} />
            </ResizeHandlesWrapper>
          )}
          
          {isSelected && (
            <>
              <RotationHandle
                onMouseDown={handleRotationStart}
              />
              <RotationGuide
                isRotating={isRotating}
                style={{ transform: `rotate(${rotation}deg)` }}
              />
            </>
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