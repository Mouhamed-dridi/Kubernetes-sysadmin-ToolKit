'use client';

import { Figure } from '@/lib/types';
import { useFavorites } from '@/context/FavoritesContext';

export default function LikeButton({ figure }: { figure: Figure }) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const liked = isFavorite(figure.id);

  return (
    <button
      onClick={() => (liked ? removeFavorite(figure.id) : addFavorite(figure))}
      className={`p-2.5 rounded-full backdrop-blur-sm transition-all duration-200 ${
        liked
          ? 'bg-red-500 text-white scale-110 shadow-lg'
          : 'bg-white/80 text-gray-600 hover:bg-white hover:scale-110'
      }`}
      aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}
