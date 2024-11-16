import React, { createContext, useState, useContext } from 'react';

const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
  const [storeLayout, setStoreLayout] = useState(null);
  const [isLayoutEditing, setIsLayoutEditing] = useState(false);

  const value = {
    storeLayout,
    setStoreLayout,
    isLayoutEditing,
    setIsLayoutEditing,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};