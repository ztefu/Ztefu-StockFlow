"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes en millisecondes

export function AutoLogout() {
  const router = useRouter();
  const supabase = createClient();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.error("Vous avez été déconnecté suite à 30 minutes d'inactivité.", {
        duration: 5000,
        icon: '🔒'
      });
      router.push("/login?message=Vous+avez+été+déconnecté+pour+inactivité.+Veuillez+vous+reconnecter.");
    } catch (error) {
      console.error("Erreur lors de la déconnexion automatique:", error);
    }
  };

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    // Initialiser le timeout
    resetTimeout();

    // Événements à écouter pour détecter l'activité
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click"
    ];

    // Ajouter les écouteurs d'événements
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, { passive: true });
    });

    // Nettoyer les écouteurs et le timeout lors du démontage du composant
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout);
      });
    };
  }, []);

  return null;
}
