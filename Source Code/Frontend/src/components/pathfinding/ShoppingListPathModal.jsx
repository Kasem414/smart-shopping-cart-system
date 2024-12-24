import React from "react";
import styled from "styled-components";
import ShoppingListPath from "./ShoppingListPath";

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
  z-index: 1001;

  &:hover {
    background: #f1f5f9;
  }
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

const ErrorMessage = styled.div`
  text-align: center;
  color: #ef4444;
  padding: 2rem;
`;

const ShoppingListPathModal = ({
  isOpen,
  onClose,
  layout,
  path,
  gridSize,
  isLoading,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <i className="bi bi-x-lg" />
        </CloseButton>

        {isLoading && (
          <LoadingOverlay>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </LoadingOverlay>
        )}

        {error && (
          <ErrorMessage>
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </ErrorMessage>
        )}

        {!isLoading && !error && layout && path && (
          <ShoppingListPath layout={layout} path={path} gridSize={gridSize} />
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default ShoppingListPathModal;
