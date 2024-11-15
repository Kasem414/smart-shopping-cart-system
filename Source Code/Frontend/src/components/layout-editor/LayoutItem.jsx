import React, { useState } from 'react';
import styled from 'styled-components';
import { Rnd } from 'react-rnd';
import ShelfCategoryModal from './components/ShelfCategoryModal';

const ItemContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: ${props => props.isSelected ? '#e2e8f0' : 'white'};
  border: 2px solid ${props => props.isSelected ? '#3b82f6' : '#94a3b8'};
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

const ItemLabel = styled.div`
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;

  ${ItemContainer}:hover & {
    opacity: 1;
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
      >
        <ItemContainer
          isSelected={isSelected}
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
          {isSelected && !isResizing && (
            <DeleteButton onClick={onDelete}>
              <i className="bi bi-x" />
            </DeleteButton>
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