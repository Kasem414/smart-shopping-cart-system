import React from 'react';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';
import LayoutItem from './LayoutItem';

const CanvasContainer = styled.div`
  position: relative;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: auto;
  height: calc(100vh - 120px);
`;

const Grid = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: ${props => props.gridSize}px ${props => props.gridSize}px;
  background-image: ${props => props.showGrid
    ? `linear-gradient(to right, #f1f5f9 1px, transparent 1px),
       linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)`
    : 'none'};
  pointer-events: none;
`;

const Canvas = styled.div`
  position: relative;
  width: 2000px;
  height: 2000px;
`;

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
    width: newItem.width * 50, // using default gridSize
    height: newItem.height * 50
  };

  return !layout.some(item => 
    item.id !== excludeId && 
    checkOverlap(newRect, {
      x: item.position_x,
      y: item.position_y,
      width: item.width * 50,
      height: item.height * 50
    })
  );
};

const LayoutCanvas = ({
  showGrid,
  gridSize,
  layout,
  selectedItem,
  onSelectItem,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [, drop] = useDrop(() => ({
    accept: 'LAYOUT_ITEM',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasRect = document.getElementById('layout-canvas').getBoundingClientRect();
      
      const x = Math.round((offset.x - canvasRect.left) / gridSize) * gridSize;
      const y = Math.round((offset.y - canvasRect.top) / gridSize) * gridSize;
      
      const newItem = {
        ...item,
        position_x: x,
        position_y: y
      };

      if (isValidPosition(newItem, layout)) {
        onAddItem(item, { x, y });
      }
    },
  }), [gridSize, onAddItem, layout]);

  const handleCanvasClick = (e) => {
    if (e.target === e.currentTarget) {
      onSelectItem(null);
    }
  };

  return (
    <CanvasContainer>
      <Canvas 
        id="layout-canvas" 
        ref={drop}
        onClick={handleCanvasClick}
      >
        <Grid showGrid={showGrid} gridSize={gridSize} />
        
        {layout.map((item) => (
          <LayoutItem
            key={item.id}
            item={item}
            gridSize={gridSize}
            isSelected={selectedItem?.id === item.id}
            onSelect={() => onSelectItem(item)}
            onUpdate={(updates) => onUpdateItem(item.id, updates)}
            onDelete={() => onDeleteItem(item.id)}
            layout={layout}
          />
        ))}
      </Canvas>
    </CanvasContainer>
  );
};

export default LayoutCanvas; 