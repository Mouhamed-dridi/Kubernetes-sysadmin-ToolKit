'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AddFigureModal from '@/components/AddFigureModal';
import { useFigures } from '@/context/FiguresContext';
import Image from 'next/image';

export default function AdminPage() {
  const [showModal, setShowModal] = useState(false);
  const { allFigures } = useFigures();

  return (
    <ProtectedRoute>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your figure collection</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors active:scale-95"
          >
            + Add Figure
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Image</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Name</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Category</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Price</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Type</th>
                </tr>
              </thead>
              <tbody>
                {allFigures.map((figure) => (
                  <tr key={figure.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                        {figure.image.startsWith('data:') ? (
                          <img src={figure.image} alt={figure.name} className="w-full h-full object-cover" />
                        ) : (
                          <Image src={figure.image} alt={figure.name} fill className="object-cover" sizes="48px" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{figure.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{figure.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">${figure.price}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${figure.category === 'Custom' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {figure.category === 'Custom' ? 'Custom' : 'Default'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && <AddFigureModal onClose={() => setShowModal(false)} />}
      </div>
    </ProtectedRoute>
  );
}
