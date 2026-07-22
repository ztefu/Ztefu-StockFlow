"use client";

import { useState, useEffect } from "react";
import { PlayCircle, X } from "lucide-react";

export function DemoVideoModal() {
  const [isOpen, setIsOpen] = useState(false);
  // Remplacez cette URL par l'URL de votre vraie vidéo (YouTube, Vimeo, etc.)
  const videoUrl = ""; 
  
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(2); // "Comment ça marche" par défaut
  const [isPaused, setIsPaused] = useState(false);
  const DURATION_MS = 14000; // 14 secondes par colonne pour défiler calmement

  useEffect(() => {
    if (!isOpen || isPaused) return;
    const timer = setInterval(() => {
      setActiveCategoryIndex((prev) => (prev + 1) % 3);
    }, DURATION_MS);
    return () => clearInterval(timer);
  }, [isOpen, isPaused]);
  
  const sections = [
    {
      title: "Les Problèmes",
      color: "text-red-400",
      bgBadge: "bg-red-500/20 text-red-400",
      icon: "⚠️",
      items: [
        { title: "Pertes financières", desc: "Vols et produits périmés non suivis" },
        { title: "Ruptures de stock", desc: "Perte de ventes faute de marchandise" },
        { title: "Gestion papier/Excel", desc: "Erreurs manuelles chronophages" },
        { title: "Visibilité limitée", desc: "Impossible de suivre plusieurs points de vente" },
        { title: "Suivi complexe", desc: "Difficulté à connaître le bénéfice réel" }
      ]
    },
    {
      title: "Nos Solutions",
      color: "text-green-400",
      bgBadge: "bg-green-500/20 text-green-400",
      icon: "✨",
      items: [
        { title: "Catalogue Global", desc: "Création instantanée sans doublons" },
        { title: "Multi-Boutiques", desc: "Centralisez la gestion de votre réseau" },
        { title: "Temps Réel", desc: "Suivi exact des mouvements de stock" },
        { title: "Tableaux de bord", desc: "Rapports de performances clairs" },
        { title: "Alertes intelligentes", desc: "Notifications sur les stocks critiques" }
      ]
    },
    {
      title: "Comment ça marche ?",
      color: "text-primary",
      bgBadge: "bg-primary/20 text-primary",
      icon: "🚀",
      items: [
        { title: "1. Inscription", desc: "Créez votre compte en 2 minutes" },
        { title: "2. Configuration", desc: "Ajoutez vos catégories et produits" },
        { title: "3. Mouvements", desc: "Gérez vos entrées et sorties de stock" },
        { title: "4. Alertes", desc: "Soyez notifié des ruptures de stock" },
        { title: "5. Analyses", desc: "Suivez vos performances en temps réel" }
      ]
    }
  ];

  return (
    <>
      <style>{`
        @keyframes categoryScroll {
          0% { transform: translateY(30px); opacity: 0; }
          5% { transform: translateY(0); opacity: 1; }
          20% { transform: translateY(0); opacity: 1; }
          80% { transform: translateY(calc(-100% + 256px)); opacity: 1; }
          95% { transform: translateY(calc(-100% + 256px)); opacity: 1; }
          100% { transform: translateY(calc(-100% + 256px)); opacity: 0; }
        }
        .animate-category-scroll {
          animation-name: categoryScroll;
          animation-timing-function: ease-in-out;
          animation-fill-mode: forwards;
        }
        .is-paused .animate-category-scroll {
          animation-play-state: paused !important;
        }
      `}</style>
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
          <div className="relative w-full max-w-6xl bg-black rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-30 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            <div className="relative w-full aspect-[4/3] md:aspect-[21/9] flex items-center justify-center bg-gray-900 min-h-[500px]">
              {videoUrl ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={videoUrl}
                  title="StockFlow AF Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div 
                  className={`absolute inset-0 w-full h-full p-4 sm:p-8 flex flex-col items-center justify-center bg-gray-900 overflow-hidden ${isPaused ? 'is-paused' : ''}`}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  onTouchStart={() => setIsPaused(true)}
                  onTouchEnd={() => setIsPaused(false)}
                >
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 z-10 text-center">Découvrez StockFlow AF</h3>
                  <p className="text-gray-400 mb-8 z-10 text-center text-sm">Survolez pour mettre en pause la lecture</p>
                  
                  <div className="relative w-full h-full max-h-[400px] z-10 max-w-5xl mx-auto flex items-center justify-center">
                    {sections.map((section, sIdx) => {
                      const isActive = activeCategoryIndex === sIdx;
                      const isLeft = (activeCategoryIndex - 1 + 3) % 3 === sIdx;
                      const isRight = (activeCategoryIndex + 1) % 3 === sIdx;

                      let positionClasses = "";
                      if (isActive) {
                        positionClasses = "left-1/2 -translate-x-1/2 scale-100 md:scale-105 opacity-100 z-20 blur-none pointer-events-auto";
                      } else if (isLeft) {
                        positionClasses = "left-0 md:left-[15%] -translate-x-full md:-translate-x-1/2 scale-75 opacity-0 md:opacity-40 z-10 blur-[2px] pointer-events-none md:pointer-events-auto cursor-pointer";
                      } else if (isRight) {
                        positionClasses = "left-full md:left-[85%] translate-x-0 md:-translate-x-1/2 scale-75 opacity-0 md:opacity-40 z-10 blur-[2px] pointer-events-none md:pointer-events-auto cursor-pointer";
                      }

                      return (
                        <div 
                          key={sIdx} 
                          className={`absolute top-0 w-full max-w-sm transition-all duration-1000 ease-in-out flex flex-col items-center h-full ${positionClasses}`}
                          onClick={() => { if (!isActive) setActiveCategoryIndex(sIdx); }}
                        >
                          <h4 className={`text-xl font-bold ${section.color} mb-6 flex items-center gap-2 transition-transform duration-500 ${isActive ? 'scale-110' : ''}`}>
                            <span>{section.icon}</span> {section.title}
                          </h4>
                          
                          {/* Container avec masque pour l'effet de fondu aux bords */}
                          <div className="w-full h-64 overflow-hidden relative" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}>
                            <div 
                              key={isActive ? `active-${sIdx}` : `inactive-${sIdx}`}
                              className={`w-full flex flex-col gap-3 pt-4 pb-4 ${isActive ? 'animate-category-scroll' : ''}`}
                              style={{ animationDuration: `${DURATION_MS}ms` }}
                            >
                              {section.items.map((item, idx) => (
                                <div 
                                  key={idx} 
                                  className={`flex items-start gap-3 p-4 rounded-xl shadow-md transition-all duration-300 ${isActive ? 'bg-gray-800/90 border border-gray-600/50 hover:bg-gray-700' : 'bg-gray-900/50 border border-gray-800/50'}`}
                                >
                                  <div className={`mt-0.5 w-7 h-7 rounded-full ${section.bgBadge} flex items-center justify-center shrink-0`}>
                                    <span className="text-sm font-bold">{idx + 1}</span>
                                  </div>
                                  <div>
                                    <h4 className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}>{item.title}</h4>
                                    <p className={`text-xs mt-1 leading-relaxed ${isActive ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="absolute inset-0 pointer-events-none rounded-2xl shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
