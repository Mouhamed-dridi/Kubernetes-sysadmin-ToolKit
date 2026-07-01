'use client';

import { useFigures } from '@/context/FiguresContext';
import FigureCard from '@/components/FigureCard';

export default function Home() {
  const { allFigures } = useFigures();

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Premium Anime Figures
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover our exclusive collection of handcrafted anime figures.
          Each piece is a tribute to your favorite characters.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allFigures.map((figure) => (
          <FigureCard key={figure.id} figure={figure} />
        ))}
      </div>
    </div>
  );
}
