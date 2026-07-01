import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { FiguresProvider } from "@/context/FiguresContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "AnimeFigure Store",
  description: "Your ultimate anime figure collection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 font-sans antialiased">
        <AuthProvider>
          <FavoritesProvider>
            <FiguresProvider>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
          </FiguresProvider>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
