'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Figure } from '@/lib/types';
import staticFigures from '@/lib/figures';

interface FiguresContextType {
  allFigures: Figure[];
  addFigure: (name: string, price: number, imageData: string) => void;
}

const FiguresContext = createContext<FiguresContextType>({} as FiguresContextType);

const CUSTOM_KEY = 'custom_figures';
let nextCustomId = 1000;

export function FiguresProvider({ children }: { children: ReactNode }) {
  const [customFigures, setCustomFigures] = useState<Figure[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(CUSTOM_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setCustomFigures(parsed);
      if (parsed.length > 0) {
        nextCustomId = Math.max(...parsed.map((f: Figure) => f.id)) + 1;
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(customFigures));
    } catch {
      console.warn('localStorage quota exceeded. Unable to save custom figures.');
    }
  }, [customFigures]);

  const addFigure = useCallback((name: string, price: number, imageData: string) => {
    const newFigure: Figure = {
      id: nextCustomId++,
      name,
      price,
      image: imageData,
      category: 'Custom',
    };
    setCustomFigures(prev => [...prev, newFigure]);
  }, []);

  const allFigures = [...staticFigures, ...customFigures];

  return (
    <FiguresContext.Provider value={{ allFigures, addFigure }}>
      {children}
    </FiguresContext.Provider>
  );
}

export const useFigures = () => useContext(FiguresContext);
