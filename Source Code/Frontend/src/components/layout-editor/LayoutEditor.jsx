import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styled from 'styled-components';
import ComponentPalette from './ComponentPalette';
import LayoutCanvas from './LayoutCanvas';
import ToolBar from './ToolBar';
import { useLayoutHistory } from './hooks/useLayoutHistory';
import PreviewModal from './components/PreviewModal';

const COMPONENT_ICONS = {
  shelf: 'bi bi-grid-3x3',
  entrance: 'bi bi-door-open',
  checkoutCounter: 'bi bi-cart',
  aisle: 'bi bi-layout-three-columns',
  // Add any other component types with their Bootstrap icon classes
};

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

const Message = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  background-color: ${({ $success }) => ($success ? '#4caf50' : '#f44336')};
  color: white;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  transition: opacity 0.3s ease;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  visibility: ${({ $isVisible }) => ($isVisible ? 'visible' : 'hidden')};
  pointer-events: none;
`;

const DraggableItem = styled.div`
  /* ... other styles ... */
  opacity: ${({ $isDragging }) => ($isDragging ? 0.5 : 1)};
  cursor: ${({ $isDragging }) => ($isDragging ? 'grabbing' : 'grab')};
`;

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const DialogContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
  z-index: 10000;
`;

const DialogTitle = styled.h2`
  margin: 0 0 1rem 0;
  color: #1a1a1a;
  font-size: 1.5rem;
`;

const DialogText = styled.p`
  margin: 0 0 1.5rem 0;
  color: #4a5568;
`;

const DialogButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
  }
`;

const CancelButton = styled(Button)`
  background-color: #e2e8f0;
  color: #4a5568;

  &:hover {
    background-color: #cbd5e0;
  }
`;

const ConfirmButton = styled(Button)`
  background-color: #ef4444;
  color: white;

  &:hover {
    background-color: #dc2626;
  }
`;

const LayoutEditor = () => {
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(50);
  const [selectedItem, setSelectedItem] = useState(null);
  const [layout, setLayout] = useState([]);
  const { undo, redo, canUndo, canRedo, addToHistory, reset } = useLayoutHistory(layout);
  const [clipboard, setClipboard] = useState(null);
  const [message, setMessage] = useState({ text: '', success: false, visible: false });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  //fetch layout from backend
  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/layouts/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch layout');
        }

        const data = await response.json();
        setLayout(data.items.map(item => ({
          ...item,
          id: `${item.type}-${item.id}`,
          icon: COMPONENT_ICONS[item.type] || 'bi bi-box'
        })));
        setGridSize(data.gridSize);
      } catch (error) {
        console.error('Error fetching layout:', error);
      }
    };

    fetchLayout();
  }, []);



  // add item to layout
  const handleAddItem = useCallback((item, position) => {
    const newItem = {
      ...item,
      id: `${item.type}-${Date.now()}`,
      position_x: position.x,
      position_y: position.y,
      categories: item.type === 'shelf' ? [] : undefined,
      rotation: item.rotation || 0,
    };

    setLayout(prev => {
      const newLayout = [...prev, newItem];
      addToHistory(newLayout);
      return newLayout;
    });
  }, [addToHistory]);



  // update item in layout
  const handleUpdateItem = useCallback((id, updates) => {
    setLayout(prev => {
      const newLayout = prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      addToHistory(newLayout);
      return newLayout;
    });
  }, [addToHistory]);



  // delete item from layout
  const handleDeleteItem = useCallback((id) => {
    setLayout(prev => {
      const newLayout = prev.filter(item => item.id !== id);
      addToHistory(newLayout);
      return newLayout;
    });
  }, [addToHistory]);



  // save layout to backend
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
          rotation: item.rotation || 0,
          categories: item.type === "shelf" ? item.categories : [],
        })),
        gridSize,
        lastModified: new Date().toISOString(),
      };
      
      const response = await fetch('http://127.0.0.1:8000/layouts/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(layoutData),
      });

      if (!response.ok) {
        throw new Error('Failed to save layout');
      }

      setMessage({
        text: 'Layout saved successfully!',
        success: true,
        visible: true
      });
      
      setTimeout(() => {
        setMessage(prev => ({
          ...prev,
          visible: false
        }));
      }, 3000);

    } catch (error) {
      console.error('Error saving layout:', error);
      setMessage({
        text: 'Error saving layout',
        success: false,
        visible: true
      });
      
      setTimeout(() => {
        setMessage(prev => ({
          ...prev,
          visible: false
        }));
      }, 3000);
    }
  }, [layout, gridSize]);



  const handleUndo = useCallback(() => {
    const previousState = undo();
    setLayout(previousState);
    setSelectedItem(null);
  }, [undo]);



  const handleRedo = useCallback(() => {
    const nextState = redo();
    setLayout(nextState);
    setSelectedItem(null);
  }, [redo]);



  const handleReset = useCallback(async () => {
    setShowResetConfirm(true);
  }, []);



  const confirmReset = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/layouts/', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reset layout');
      }

      const emptyState = reset();
      setLayout(emptyState);
      
      setMessage({
        text: 'Layout reset successfully!',
        success: true,
        visible: true
      });
    } catch (error) {
      console.error('Error resetting layout:', error);
      setMessage({
        text: 'Error resetting layout',
        success: false,
        visible: true
      });
    } finally {
      setShowResetConfirm(false);
      setTimeout(() => {
        setMessage(prev => ({
          ...prev,
          visible: false
        }));
      }, 3000);
    }
  };



  const handleKeyDown = useCallback((e) => {
    // Ignore if focus is in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // Copy: Ctrl/Cmd + C
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedItem) {
      setClipboard({ ...selectedItem });
      e.preventDefault();
    }

    // Paste: Ctrl/Cmd + V
    if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboard) {
      const newItem = {
        ...clipboard,
        id: `${clipboard.type}-${Date.now()}`,
        position_x: clipboard.position_x + gridSize,
        position_y: clipboard.position_y + gridSize,
      };
      handleAddItem(newItem, { 
        x: newItem.position_x, 
        y: newItem.position_y,
      });
      e.preventDefault();
    }

    // Delete: Delete or Backspace
    if ((e.key === 'Delete') && selectedItem) {
      handleDeleteItem(selectedItem.id);
      setSelectedItem(null);
      e.preventDefault();
    }

    if ((e.key === 'Escape') && selectedItem) {
      setSelectedItem(null);
      e.preventDefault();
    }

    if ((e.key === 'z') && (e.ctrlKey || e.metaKey)) {
      handleUndo();
      e.preventDefault();
    }
    if ((e.key === 'y') && (e.ctrlKey || e.metaKey)) {
      handleRedo();
      e.preventDefault();
    }
  }, [selectedItem, clipboard, canUndo, canRedo, handleUndo, handleRedo, handleDeleteItem, gridSize]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);



  return (
    <DndProvider backend={HTML5Backend}>
      <EditorContainer>
        <Message 
          $success={message.success} 
          $isVisible={message.visible}
        >
          {message.text}
        </Message>
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
            onPreview={() => setShowPreview(true)}
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
        
        {showResetConfirm && (
          <DialogOverlay>
            <DialogContent>
              <DialogTitle>Reset Layout</DialogTitle>
              <DialogText>
                Are you sure you want to reset the layout? This action cannot be undone.
              </DialogText>
              <DialogButtons>
                <CancelButton onClick={() => setShowResetConfirm(false)}>
                  Cancel
                </CancelButton>
                <ConfirmButton onClick={confirmReset}>
                  Reset Layout
                </ConfirmButton>
              </DialogButtons>
            </DialogContent>
          </DialogOverlay>
        )}
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          layout={layout}
          gridSize={gridSize}
        />
      </EditorContainer>
    </DndProvider>
  );
};

export default LayoutEditor; 