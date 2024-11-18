import { useState, useCallback, useRef } from 'react';

export const useLayoutHistory = (initialState) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const historyRef = useRef([initialState]);

  const reset = useCallback(() => {
    historyRef.current = [[]];
    setCurrentIndex(0);
    return [];
  }, []);

  const addToHistory = useCallback((newState) => {
    historyRef.current = historyRef.current.slice(0, currentIndex + 1);
    historyRef.current.push(newState);
    setCurrentIndex(currentIndex + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
      return historyRef.current[currentIndex - 1];
    }
    return historyRef.current[currentIndex];
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < historyRef.current.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
      return historyRef.current[currentIndex + 1];
    }
    return historyRef.current[currentIndex];
  }, [currentIndex]);

  return {
    undo,
    redo,
    addToHistory,
    reset,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < historyRef.current.length - 1,
  };
}; 