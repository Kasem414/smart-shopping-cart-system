import React from "react";
import styled from "styled-components";

const ToolBarWrapper = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background: white;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.primary {
    background: green;
    border-color: #008f00;
    color: white;

    &:hover:not(:disabled) {
      background: #008f00;
    }
  }

  &.danger {
    color: #ef4444;
    border-color: #ef4444;

    &:hover:not(:disabled) {
      background: #fee2e2;
    }
  }

  i {
    margin-right: 0.5rem;
  }
`;

const GridSizeInput = styled.input`
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
`;

const ToolBar = ({
  showGrid,
  onToggleGrid,
  gridSize,
  onGridSizeChange,
  onSave,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
}) => {
  return (
    <ToolBarWrapper>
      <Button onClick={onToggleGrid}>
        <i className={`bi bi-grid-${showGrid ? "fill" : "3x3"}`} />
        Grid
      </Button>

      <div>
        <GridSizeInput
          type="number"
          min="20"
          max="100"
          step="10"
          value={gridSize}
          onChange={(e) => onGridSizeChange(Number(e.target.value))}
        />
      </div>

      <Button onClick={onUndo} disabled={!canUndo}>
        <i className="bi bi-arrow-counterclockwise" />
        Undo
      </Button>

      <Button onClick={onRedo} disabled={!canRedo}>
        <i className="bi bi-arrow-clockwise" />
        Redo
      </Button>

      <Button
        onClick={onReset}
        style={{ marginLeft: "1rem" }}
        className="danger"
      >
        <i className="bi bi-trash" />
        Reset
      </Button>

      <Button
        onClick={onSave}
        style={{ marginLeft: "auto" }}
        className="primary"
      >
        <i className="bi bi-save" />
        Save Layout
      </Button>
    </ToolBarWrapper>
  );
};

export default ToolBar;
