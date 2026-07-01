'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Figure } from '@/lib/types';

interface FavoritesContextType {
  favorites: Figure[];
  addFavorite: (figure: Figure) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({} as FavoritesContextType);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Figure[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (figure: Figure) => {
    setFavorites(prev => [...prev, figure]);
  };

  const removeFavorite = (id: number) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  const isFavorite = (id: number) => {
    return favorites.some(f => f.id === id);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
