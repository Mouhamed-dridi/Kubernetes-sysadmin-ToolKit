'use client';

import FigureCard from '@/components/FigureCard';
import { useFavorites } from '@/context/FavoritesContext';
import Link from 'next/link';

export default function MyPage() {
  const { favorites } = useFavorites();

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">My Collection</h1>
        <p className="text-lg text-gray-600">
          {favorites.length > 0
            ? `You have ${favorites.length} figure${favorites.length > 1 ? 's' : ''} in your collection`
            : 'Your collection is empty'}
        </p>
      </div>
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((figure) => (
            <FigureCard key={figure.id} figure={figure} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-6">💔</div>
          <p className="text-xl text-gray-500 mb-6">No figures saved yet</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Browse Figures
          </Link>
        </div>
      )}
    </div>
  );
}
