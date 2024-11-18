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
      
      onAddItem(item, { x, y });
    },
  }), [gridSize, onAddItem]);

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
          />
        ))}
      </Canvas>
    </CanvasContainer>
  );
};

export default LayoutCanvas; 