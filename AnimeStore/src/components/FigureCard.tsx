'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Figure } from '@/lib/types';
import { useFavorites } from '@/context/FavoritesContext';

export default function FigureCard({ figure }: { figure: Figure }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const loved = isFavorite(figure.id);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setTilt({
      x: (y - centerY) / 15,
      y: (centerX - x) / 15,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const toggleLove = () => {
    if (loved) {
      removeFavorite(figure.id);
    } else {
      addFavorite(figure);
    }
  };

  const isBase64 = figure.image.startsWith('data:');

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`
            : 'rotateX(0deg) rotateY(0deg)',
        }}
      >
        <div className="relative h-64 w-full overflow-hidden bg-gradient-to-b from-purple-100 to-pink-100">
          {isBase64 ? (
            <img src={figure.image} alt={figure.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <Image
              src={figure.image}
              alt={figure.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900">{figure.name}</h3>
          <p className="text-sm text-gray-500">{figure.category}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xl font-bold text-purple-600">${figure.price}</span>
            <button
              onClick={toggleLove}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 active:scale-95 ${
                loved
                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill={loved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {loved ? 'Loved' : 'Love'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
