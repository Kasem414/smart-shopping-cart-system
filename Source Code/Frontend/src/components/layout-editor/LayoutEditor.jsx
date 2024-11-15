import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styled from 'styled-components';
import ComponentPalette from './ComponentPalette';
import LayoutCanvas from './LayoutCanvas';
import ToolBar from './ToolBar';
import { useLayoutHistory } from './hooks/useLayoutHistory';

const EditorContainer = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr;
  gap: 1rem;
  height: 100vh;
  padding: 0 1rem;
  background-color: #f8fafc;
`;

const ToolBarContainer = styled.div`
  grid-column: 1 / -1;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const LayoutEditor = () => {
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(50);
  const [selectedItem, setSelectedItem] = useState(null);
  const [layout, setLayout] = useState([]);
  const { undo, redo, canUndo, canRedo, addToHistory, reset } = useLayoutHistory(layout);

  const handleAddItem = useCallback((item, position) => {
    const newItem = {
      ...item,
      id: `${item.type}-${Date.now()}`,
      position_x: position.x,
      position_y: position.y,
      categories: item.type === 'shelf' ? [] : undefined,
    };

    setLayout(prev => {
      const newLayout = [...prev, newItem];
      addToHistory(newLayout);
      return newLayout;
    });
  }, [addToHistory]);

  const handleUpdateItem = useCallback((id, updates) => {
    setLayout(prev => {
      const newLayout = prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      addToHistory(newLayout);
      return newLayout;
    });
  }, [addToHistory]);

  const handleDeleteItem = useCallback((id) => {
    setLayout(prev => {
      const newLayout = prev.filter(item => item.id !== id);
      addToHistory(newLayout);
      return newLayout;
    });
  }, [addToHistory]);

  const handleSaveLayout = useCallback(async () => {
    try {
      const layoutData = {
        items: layout.map((item) => ({
          id: parseInt(item.id.split("-")[1]),
          type: item.type,
          position_x: item.position_x,
          position_y: item.position_y,
          width: item.width,
          height: item.height,
          categories: item.type === "shelf" ? item.categories : [],
        })),
        gridSize,
        lastModified: new Date().toISOString(),
      };
      
      const response = await fetch('http://127.0.0.1:8000/layouts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(layoutData),
      });

      if (!response.ok) {
        throw new Error('Failed to save layout');
      }

      console.log('Layout saved successfully:', layoutData);
    } catch (error) {
      console.error('Error saving layout:', error);
    }
  }, [layout, gridSize]);

  const handleUndo = useCallback(() => {
    const previousState = undo();
    setLayout(previousState);
  }, [undo]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    setLayout(nextState);
  }, [redo]);

  const handleReset = useCallback(() => {
    const emptyState = reset();
    setLayout(emptyState);
  }, [reset]);

  return (
    <DndProvider backend={HTML5Backend}>
      <EditorContainer>
        <ToolBarContainer>
          <ToolBar
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
            gridSize={gridSize}
            onGridSizeChange={setGridSize}
            onSave={handleSaveLayout}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onReset={handleReset}
          />
        </ToolBarContainer>
        
        <ComponentPalette />
        
        <LayoutCanvas
          showGrid={showGrid}
          gridSize={gridSize}
          layout={layout}
          selectedItem={selectedItem}
          onSelectItem={setSelectedItem}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
        />
      </EditorContainer>
    </DndProvider>
  );
};

export default LayoutEditor; 