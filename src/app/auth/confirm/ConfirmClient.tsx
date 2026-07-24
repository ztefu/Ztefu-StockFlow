"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Logo } from "@/components/ui/logo";

export default function ConfirmClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as any;
  const next = searchParams.get("next") || "/login";

  const handleConfirm = async () => {
    if (!token_hash || !type) {
      setStatus("error");
      setErrorMessage("Le lien est invalide ou incomplet.");
      return;
    }

    setStatus("loading");
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type,
      });

      if (error) {
        throw error;
      }

      setStatus("success");
      toast.success("Votre compte a été vérifié avec succès !");
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(next);
        router.refresh();
      }, 1500);
      
    } catch (error: any) {
      console.error("Erreur de vérification:", error);
      setStatus("error");
      
      if (error.message?.includes("expired") || error.code === "otp_expired") {
        setErrorMessage("Le lien a expiré ou a déjà été utilisé.");
      } else {
        setErrorMessage(error.message || "Une erreur est survenue lors de la vérification.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Logo size="md" />
          <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">StockFlow AF</span>
        </div>

        {status === "idle" && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Invitation reçue
              </h1>
              <p className="text-gray-500 text-sm">
                Vous avez été invité à rejoindre StockFlow AF. Cliquez sur le bouton ci-dessous pour valider votre compte.
              </p>
            </div>
            <button
              onClick={handleConfirm}
              className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-all active:scale-95 shadow-sm shadow-primary/30"
            >
              Accepter l'invitation
            </button>
          </div>
        )}

        {status === "loading" && (
          <div className="space-y-6 py-4 animate-in fade-in duration-300">
            <div className="animate-bounce flex justify-center">
              <Logo size="lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Vérification en cours...
              </h1>
              <p className="text-gray-500 text-sm">
                Veuillez patienter pendant que nous validons votre accès sécurisé.
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6 py-4 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Vérification réussie !
              </h1>
              <p className="text-gray-500 text-sm">
                Vous allez être redirigé dans un instant...
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6 py-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Échec de la vérification
              </h1>
              <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                {errorMessage}
              </p>
            </div>
            <div className="pt-4">
              <Link 
                href="/login"
                className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
              >
                Retour à la connexion
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
