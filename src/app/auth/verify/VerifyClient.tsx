"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, KeyRound, AlertCircle, MailCheck, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import toast from "react-hot-toast";

export default function VerifyClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  
  const email = searchParams.get("email");
  const type = searchParams.get("type") || "signup";
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
      const result = await verifyOTP(email, fullCode, type as any);

      if (!result.success) {
        throw new Error(result.error);
      }

      setStatus("success");
      toast.success("Code vérifié avec succès !");
      
      const plan = searchParams.get("plan");
      const cycle = searchParams.get("cycle") || "monthly";
      setTimeout(() => {
        if (type === "recovery") {
          router.push("/update-password");
        } else if (plan === "Pro" || plan === "Business") {
          router.push(`/settings?plan=${plan}&cycle=${cycle}#billing`);
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-gray-900 selection:bg-primary/30">
      
      {/* Left Section - Form (1/3 width on lg) */}
      <div className="w-full flex-1 lg:flex-none lg:w-1/3 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative bg-gray-50 lg:bg-white dark:bg-gray-900 z-50 border-r border-gray-100 dark:border-gray-800">
        
        {/* Mobile Background Decoration */}
        <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent blur-3xl opacity-60"></div>
        </div>

        <div className="w-full max-w-sm bg-white dark:bg-dark-surface lg:bg-transparent lg:dark:bg-transparent lg:shadow-none lg:border-none rounded-2xl shadow-xl border border-white/20 dark:border-gray-800/50 p-6 sm:p-8 text-center z-10 relative">
          
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
                  {type === "recovery" ? "Réinitialisation" : "Vérifiez votre e-mail"}
                </h1>
                <p className="text-gray-500 text-sm">
                  Un code à 8 chiffres a été envoyé à <strong>{email}</strong>. Saisissez-le ci-dessous {type === "recovery" ? "pour créer un nouveau mot de passe." : "pour confirmer votre inscription."}
                </p>
              </div>
              
              <div className="flex justify-center gap-1 sm:gap-1.5 my-8">
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
                    className="w-8 h-10 sm:w-10 sm:h-12 text-center text-lg font-bold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white shrink-0"
                  />
                ))}
              </div>

              {status === "error" && (
                <div className="flex items-center justify-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
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
              <div className="animate-bounce flex justify-center">
                <Logo size="lg" />
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

      {/* Right Section - Graphic / Illustration (2/3 width on lg) */}
      <div className="hidden lg:flex lg:w-2/3 relative bg-gray-50/50 dark:bg-gray-900 flex-col justify-center items-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-bl from-primary/10 via-transparent to-primary/5 blur-3xl opacity-60 -z-10"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-2/3 bg-gradient-to-tl from-blue-400/10 to-transparent blur-3xl -z-10"></div>
        
        <div className="w-full max-w-2xl p-8 relative z-10 flex flex-col items-center">
          <div className="mb-10 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Vérification sécurisée.</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Pour votre sécurité, nous vérifions chaque accès à la plateforme.</p>
          </div>

          <div className="relative w-full aspect-square md:aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm group floating-image-alt">
            <img 
              className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105" 
              src="/verify_email_illustration.png"
              alt="StockFlow AF Verification"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          
          {/* Floating Micro-Animations */}
          <div className="absolute top-1/3 -left-2 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 floating-icon-delayed z-20">
            <MailCheck className="text-primary" size={24} />
          </div>
          
          <div className="absolute bottom-1/3 -right-2 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 floating-icon z-20">
            <ShieldCheck className="text-teal-500" size={24} />
          </div>

          <div className="absolute -top-4 right-1/3 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 animate-float-pulse z-20">
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-500 p-1.5 rounded-full">
              <CheckCircle2 size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
