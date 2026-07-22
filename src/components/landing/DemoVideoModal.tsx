"use client";

import { useState } from "react";
import { PlayCircle, X } from "lucide-react";

export function DemoVideoModal() {
  const [isOpen, setIsOpen] = useState(false);
  // Remplacez cette URL par l'URL de votre vraie vidéo (YouTube, Vimeo, etc.)
  // Exemple: "https://www.youtube.com/embed/VOTRE_ID_VIDEO"
  const videoUrl = ""; // Laissez vide si pas encore de vidéo

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-8 py-3.5 rounded-full font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
      >
        Voir la démonstration
        <PlayCircle size={18} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            <div className="relative w-full aspect-video flex items-center justify-center bg-gray-900">
              {videoUrl ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={videoUrl}
                  title="StockFlow AF Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="text-center text-gray-400 p-8">
                  <PlayCircle size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-medium text-white mb-2">Vidéo de démonstration à venir</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
