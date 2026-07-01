'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const { favorites } = useFavorites();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <span className="text-xl font-bold text-purple-700">AnimeFigure</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Home
            </Link>
            <Link href="/mypage" className="relative text-gray-700 hover:text-purple-600 font-medium transition-colors">
              My Items
              {favorites.length > 0 && (
                <span className="absolute -top-2 -right-5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Contact
            </Link>
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link href="/admin" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                  Admin
                </Link>
                <span className="text-sm text-gray-600">Hi, {user}</span>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
