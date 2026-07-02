'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Figure } from '@/lib/types';

interface FiguresContextType {
  allFigures: Figure[];
  addFigure: (name: string, price: number, imageData: string) => Promise<void>;
  loading: boolean;
}

const FiguresContext = createContext<FiguresContextType>({} as FiguresContextType);

export function FiguresProvider({ children }: { children: ReactNode }) {
  const [allFigures, setAllFigures] = useState<Figure[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFigures = useCallback(async () => {
    try {
      const res = await fetch('/api/figures');
      const data = await res.json();
      setAllFigures(data);
    } catch (err) {
      console.error('Failed to fetch figures:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFigures();
  }, [fetchFigures]);

  const addFigure = useCallback(async (name: string, price: number, imageData: string) => {
    const res = await fetch('/api/figures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, image: imageData }),
    });
    const newFigure = await res.json();
    setAllFigures(prev => [...prev, newFigure]);
  }, []);

  return (
    <FiguresContext.Provider value={{ allFigures, addFigure, loading }}>
      {children}
    </FiguresContext.Provider>
  );
}

export const useFigures = () => useContext(FiguresContext);
