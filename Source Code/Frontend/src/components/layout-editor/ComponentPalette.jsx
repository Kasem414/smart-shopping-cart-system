import React from 'react';
import styled from 'styled-components';
import { useDrag } from 'react-dnd';

const PaletteContainer = styled.div`
  background: white;
  border-right: 1px solid #e2e8f0;
  padding: 1rem;
  overflow-y: auto;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
`;

const CategoryTitle = styled.h3`
  font-size: 0.875rem;
  color: #64748b;
  text-transform: uppercase;
  margin: 2rem 0 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;

  &:first-child {
    margin-top: 0;
  }
`;

const DraggableItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin: 0.5rem 0;
  background: ${props => props.isDragging ? '#f1f5f9' : 'white'};
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  cursor: move;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  i {
    font-size: 1.25rem;
    color: #64748b;
  }
`;

const ItemLabel = styled.span`
  font-size: 0.875rem;
  color: #475569;
`;

const DraggableComponent = ({ item }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'LAYOUT_ITEM',
    item: { ...item },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <DraggableItem 
      ref={drag} 
      isDragging={isDragging}
      data-bs-toggle="tooltip"
      data-bs-placement="right"
      title={item.description}
    >
      <i className={item.icon} />
      <ItemLabel>{item.label}</ItemLabel>
    </DraggableItem>
  );
};

// Define available components
const components = {
  fixtures: [
    {
      type: 'aisle',
      label: 'Aisle',
      icon: 'bi bi-layout-three-columns',
      description: 'Standard shopping aisle',
      width: 2,
      height: 6,
    },
    {
      type: 'shelf',
      label: 'Shelf Unit',
      icon: 'bi bi-grid-3x3',
      description: 'Storage shelving unit',
      width: 2,
      height: 2,
    },
  ],
  entrances: [
    {
      type: 'entrance',
      label: 'Entrance',
      icon: 'bi bi-door-open',
      description: 'Store entrance/exit',
      width: 2,
      height: 1,
    },

  ],
  checkoutCounter: [
    {
      type: 'checkoutCounter',
      label: 'Checkout Counter',
      icon: 'bi bi-cart',
      description: 'Checkout counter',
      width: 1,
      height: 1,
    }
  ],
};

const ComponentPalette = () => {
  return (
    <PaletteContainer>
      <CategoryTitle>Store Fixtures</CategoryTitle>
      {components.fixtures.map((item) => (
        <DraggableComponent key={item.type} item={item} />
      ))}

      <CategoryTitle>Entrances & Exits</CategoryTitle>
      {components.entrances.map((item) => (
        <DraggableComponent key={item.type} item={item} />
      ))}

      <CategoryTitle>Checkout Counters</CategoryTitle>
      {components.checkoutCounter.map((item) => (
        <DraggableComponent key={item.type} item={item} />
      ))}

    </PaletteContainer>
  );
};

export default ComponentPalette; 