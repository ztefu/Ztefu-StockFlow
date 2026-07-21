"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, KeyRound, AlertCircle } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import toast from "react-hot-toast";

export default function VerifyClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  
  const email = searchParams.get("email");
  const [code, setCode] = useState(["", "", "", "", "", "", "", ""]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    // N'accepter que les chiffres
    if (!/^[0-9]*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value !== "" && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8);
    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);
      if (pastedData.length < 8) {
        inputRefs.current[pastedData.length]?.focus();
      } else {
        inputRefs.current[7]?.focus();
      }
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 8) {
      toast.error("Veuillez entrer les 8 chiffres du code.");
      return;
    }
    
    if (!email) return;

    setStatus("loading");
    
    try {
      // Appel de l'action serveur pour vérifier l'OTP afin de préserver le cookie PKCE (code_verifier)
      const { verifyOTP } = await import("@/app/login/actions");
      const result = await verifyOTP(email, fullCode);

      if (!result.success) {
        throw new Error(result.error);
      }

      setStatus("success");
      toast.success("Compte vérifié avec succès !");
      
      const plan = searchParams.get("plan");
      setTimeout(() => {
        if (plan === "Pro" || plan === "Business") {
          router.push("/settings#billing");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }, 1500);
      
    } catch (error: any) {
      console.error("Erreur de vérification OTP:", error);
      setStatus("error");
      if (error.message?.includes("expired")) {
        setErrorMessage("Le code a expiré ou est invalide. Veuillez demander un nouveau code.");
      } else {
        setErrorMessage("Le code saisi est incorrect ou a expiré.");
      }
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-xl bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Logo size="md" />
          <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">StockFlow AF</span>
        </div>

        {status !== "success" ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
              <KeyRound className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Vérifiez votre e-mail
              </h1>
              <p className="text-gray-500 text-sm">
                Un code à 8 chiffres a été envoyé à <strong>{email}</strong>. Saisissez-le ci-dessous.
              </p>
            </div>
            
            <div className="flex justify-center gap-1 sm:gap-2 my-8 overflow-x-auto pb-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white shrink-0"
                />
              ))}
            </div>

            {status === "error" && (
              <div className="flex items-center justify-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={status === "loading" || code.join("").length !== 8}
              className="w-full py-3 px-4 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white rounded-xl font-medium transition-all active:scale-95 shadow-sm shadow-primary/30 flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Vérifier mon compte"
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6 py-4 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Vérification réussie !
              </h1>
              <p className="text-gray-500 text-sm">
                Connexion à votre espace en cours...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
