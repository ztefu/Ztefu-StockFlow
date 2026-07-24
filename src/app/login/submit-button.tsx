"use client";

import { useFormStatus } from "react-dom";
import { Logo } from "@/components/ui/logo";

export function SubmitButton({ 
  text = "Se connecter", 
  loadingText = "Connexion en cours..." 
}: { 
  text?: string; 
  loadingText?: string; 
}) {
  const { pending } = useFormStatus();

  return (
    <>
      <button
        type="submit"
        disabled={pending}
        className="w-full px-4 py-3 bg-primary hover:bg-primary-dark active:scale-[0.98] text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-primary/30 disabled:opacity-50"
      >
        {text}
      </button>

      {pending && (
        <div className="fixed inset-0 z-[9999] bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="flex flex-col items-center">
            <div className="animate-bounce">
              <Logo size="lg" />
            </div>
            <p className="mt-6 text-lg font-bold text-gray-900 dark:text-white animate-pulse">
              {loadingText}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
