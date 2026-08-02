"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";

export function VersionChecker() {
  const [currentVersion, setCurrentVersion] = useState<number | null>(null);

  useEffect(() => {
    // Fetch the initial version on mount
    const fetchInitialVersion = async () => {
      try {
        const res = await fetch(`/build.json?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setCurrentVersion(data.timestamp);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de la version", err);
      }
    };

    fetchInitialVersion();
  }, []);

  useEffect(() => {
    if (!currentVersion) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/build.json?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.timestamp && data.timestamp !== currentVersion) {
            // New version detected!
            toast(
              (t) => (
                <div className="flex flex-col gap-2">
                  <div className="font-medium text-sm text-gray-900">
                    Une nouvelle mise à jour est disponible !
                  </div>
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      window.location.reload();
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Mettre à jour maintenant
                  </button>
                </div>
              ),
              {
                duration: Infinity, // don't auto close
                position: "bottom-right",
                icon: '🚀',
                style: {
                  minWidth: '300px',
                },
              }
            );
            // Clear interval so we don't keep showing toasts
            clearInterval(interval);
          }
        }
      } catch (err) {
        // Silent fail on network error
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [currentVersion]);

  return null; // This is a logic-only component
}
