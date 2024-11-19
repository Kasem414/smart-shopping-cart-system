import React, { useCallback, useEffect } from "react";
import styled from "styled-components";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalContent = styled.div`
  background: #f1f5f9;
  border-radius: 0.5rem;
  width: 90vw;
  height: 90vh;
  padding: 1rem;
  position: relative;
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  padding: 0.5rem;
  cursor: pointer;
  z-index: 1;

  &:hover {
    background: #f1f5f9;
  }
`;

const PreviewCanvas = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: auto;
  background: #f1f5f9;
`;

const PreviewItem = styled.div`
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

const PreviewModal = ({ isOpen, onClose, layout, gridSize }) => {
//   const handleKeyDown = useCallback((e) => {
//     // Ignore if focus is in an input field
//     if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
//     if (e.key === 'Escape') {
//         if (showPreview) {
//           setShowPreview(false);
//         } else if (selectedItem) {
//           setSelectedItem(null);
//         }
//         e.preventDefault();
//       }
//   }, [onClose]);

//   useEffect(() => {
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <i className="bi bi-x-lg" />
        </CloseButton>
        <PreviewCanvas>
          {layout.map((item) => (
            <PreviewItem
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
              <i className={item.icon} />
              {item.categories && item.categories.length > 0 && (
                <Categories>
                  {item.categories.map((category, index) => (
                    <CategoryBadge key={index} color={getCategoryColor(index)}>
                      {category}
                    </CategoryBadge>
                  ))}
                </Categories>
              )}
            </PreviewItem>
          ))}
        </PreviewCanvas>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PreviewModal;
