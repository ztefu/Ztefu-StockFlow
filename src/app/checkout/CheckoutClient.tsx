"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import toast from 'react-hot-toast';
import { ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface CheckoutClientProps {
  plan: string;
  price: number;
  cycle: 'monthly' | 'annual';
}

export function CheckoutClient({ plan, price, cycle }: CheckoutClientProps) {
  const [paymentMethod, setPaymentMethod] = useState<'chariow' | 'stripe'>('chariow');
  const [acceptedCGU, setAcceptedCGU] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePay = async () => {
    if (!acceptedCGU) return;

    setIsLoading(true);
    const toastId = toast.loading("Génération du lien de paiement...");

    try {
      const endpoint = paymentMethod === 'stripe' ? '/api/billing/stripe' : '/api/billing/chariow';
      
      // We pass companyId for Chariow, but we don't have it directly in props here.
      // Wait, let's just pass plan and price. The API can extract companyId from the session if needed.
      // But we made /api/billing/chariow require companyId in the body...
      // Let's modify the body to pass plan, price, cycle.
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, price, cycle })
      });
      const data = await res.json();

      const redirectUrl = data.link || data.url || data.checkout_url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        console.error("API response missing link:", data);
        toast.error("Impossible de générer le lien de paiement", { id: toastId });
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur de connexion au serveur", { id: toastId });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-gray-900 selection:bg-primary/30">
      {/* Left Section - Form */}
      <div className="w-full flex-1 lg:flex-none lg:w-1/3 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative bg-gray-50 lg:bg-white dark:bg-gray-900 z-10 lg:border-r lg:border-gray-100 lg:dark:border-gray-800">
        {/* Mobile Background Decoration */}
        <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent blur-3xl opacity-60"></div>
        </div>

        <div className="w-full max-w-lg bg-white dark:bg-dark-surface lg:bg-transparent lg:dark:bg-transparent lg:shadow-none lg:border-none rounded-2xl shadow-xl border border-white/20 dark:border-gray-800/50 p-6 sm:p-8 z-10 relative">
          <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-10 w-fit"
      >
        <ArrowLeft size={18} />
        Retour aux paramètres
      </button>

      <div className="flex flex-col items-center mb-8 text-center">
        <Link href="#" className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
          <Logo size="md" />
          <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">StockFlow AF</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Validation du paiement</h1>
          <p className="text-sm text-gray-500 mt-2">Récapitulatif de votre commande et modalités.</p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 mb-8 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-600 dark:text-gray-400">Plan sélectionné</span>
          <span className="font-bold text-gray-900 dark:text-white text-lg">{plan}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600 dark:text-gray-400">Périodicité</span>
          <span className="font-medium text-gray-900 dark:text-white capitalize bg-white dark:bg-gray-700 px-3 py-1 rounded-full shadow-sm text-sm border border-gray-100 dark:border-gray-600">
            {cycle === 'annual' ? 'Annuel' : 'Mensuel'}
          </span>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900 dark:text-white">Total à payer</span>
          <span className="text-2xl font-bold text-primary">{price.toLocaleString('fr-FR')} XAF</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <p className="font-bold text-gray-900 dark:text-white mb-2">Choisissez votre méthode de paiement</p>
          
          <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'chariow' ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-700 hover:border-primary/50'}`}>
            <input 
              type="radio" 
              name="paymentMethod" 
              value="chariow" 
              checked={paymentMethod === 'chariow'} 
              onChange={() => setPaymentMethod('chariow')}
              className="w-5 h-5 text-primary focus:ring-primary border-gray-300"
            />
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 dark:text-white">Mobile Money (Chariow)</span>
              <span className="text-sm text-gray-500">Payer directement avec MTN, Orange Money ou Wave.</span>
            </div>
          </label>

          <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-700 hover:border-primary/50'}`}>
            <input 
              type="radio" 
              name="paymentMethod" 
              value="stripe" 
              checked={paymentMethod === 'stripe'} 
              onChange={() => setPaymentMethod('stripe')}
              className="w-5 h-5 text-primary focus:ring-primary border-gray-300"
            />
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 dark:text-white">Carte Bancaire (Stripe)</span>
              <span className="text-sm text-gray-500">Payer par carte Visa, Mastercard, etc.</span>
            </div>
          </label>
        </div>

        <label className="flex items-start gap-4 cursor-pointer group p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <div className="flex items-center h-5 mt-1">
            <input
              type="checkbox"
              checked={acceptedCGU}
              onChange={(e) => setAcceptedCGU(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-primary transition-colors cursor-pointer shadow-sm"
            />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            J&apos;ai lu et j&apos;accepte les <Link href="/legal/cgu" className="text-primary hover:underline font-medium">Conditions Générales d&apos;Utilisation</Link> et la <Link href="/legal/privacy" className="text-primary hover:underline font-medium">Politique de Confidentialité</Link>. Je comprends que mon paiement sera traité de manière entièrement sécurisée.
          </span>
        </label>

        <button
          onClick={handlePay}
          disabled={!acceptedCGU || isLoading}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-base ${acceptedCGU
            ? 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/30 hover:shadow-primary/40 active:scale-[0.98]'
            : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700'
          }`}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            'Payer en toute sécurité'
          )}
        </button>
      </div>
        </div>
      </div>

      {/* Right Section - Graphic / Illustration */}
      <div className="hidden lg:flex lg:w-2/3 relative bg-gray-50/50 dark:bg-gray-900 flex-col justify-center items-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-bl from-primary/10 via-transparent to-primary/5 blur-3xl opacity-60 -z-10"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-2/3 bg-gradient-to-tl from-blue-400/10 to-transparent blur-3xl -z-10"></div>

        <div className="w-full max-w-2xl p-8 relative z-10 flex flex-col items-center text-center">
          {paymentMethod === 'stripe' ? (
            <>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">Paiement Simple et Sécurisé.</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-16">Réglez votre abonnement en toute sécurité avec Stripe. Vous pouvez utiliser votre carte bancaire classique ou les cartes virtuelles générées via vos opérateurs locaux.</p>

              <div className="flex gap-6 items-center justify-center bg-white/50 dark:bg-gray-800/50 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 backdrop-blur-md shadow-2xl relative">
                <div className="absolute -top-6 -left-6 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                  <span className="text-green-600 dark:text-green-400 text-xl font-bold">✓</span>
                </div>
                <div className="absolute -bottom-6 -right-6 w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                  <span className="text-blue-600 dark:text-blue-400 text-2xl font-bold">🔒</span>
                </div>

                <div className="flex flex-col items-center gap-4 hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-24 h-24 bg-[#FFCC00] rounded-3xl flex items-center justify-center text-[#000000] font-bold text-3xl shadow-xl border border-white/30">MTN</div>
                  <span className="text-base font-bold text-gray-700 dark:text-gray-300">MoMo</span>
                </div>
                <div className="text-gray-400 px-4 text-3xl font-light">+</div>
                <div className="flex flex-col items-center gap-4 hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-24 h-24 bg-[#FF6600] rounded-3xl flex items-center justify-center text-white font-bold text-2xl shadow-xl border border-white/30">Orange</div>
                  <span className="text-base font-bold text-gray-700 dark:text-gray-300">Money</span>
                </div>
                <div className="text-gray-400 px-4 text-3xl font-light">=</div>
                <div className="flex flex-col items-center gap-4 hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-24 h-24 bg-[#635BFF] rounded-3xl flex items-center justify-center text-white font-bold text-4xl shadow-xl border border-white/30">S</div>
                  <span className="text-base font-bold text-gray-700 dark:text-gray-300">Stripe</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">Mobile Money Rapide & Direct.</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-16">Payez en quelques secondes avec votre compte Mobile Money. Aucun besoin de carte bancaire, validez directement depuis votre téléphone mobile !</p>

              <div className="flex gap-6 items-center justify-center bg-white/50 dark:bg-gray-800/50 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 backdrop-blur-md shadow-2xl relative">
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                  <span className="text-primary text-xl font-bold">⚡</span>
                </div>
                <div className="absolute -bottom-6 -left-6 w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                  <span className="text-green-600 dark:text-green-400 text-2xl font-bold">📱</span>
                </div>

                <div className="flex flex-col items-center gap-4 hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-24 h-24 bg-[#FFCC00] rounded-3xl flex items-center justify-center text-[#000000] font-bold text-3xl shadow-xl border border-white/30">MTN</div>
                  <span className="text-base font-bold text-gray-700 dark:text-gray-300">MoMo</span>
                </div>
                <div className="text-gray-400 px-4 text-3xl font-light">OU</div>
                <div className="flex flex-col items-center gap-4 hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-24 h-24 bg-[#FF6600] rounded-3xl flex items-center justify-center text-white font-bold text-2xl shadow-xl border border-white/30">Orange</div>
                  <span className="text-base font-bold text-gray-700 dark:text-gray-300">Money</span>
                </div>
                <div className="text-gray-400 px-4 text-3xl font-light">👉</div>
                <div className="flex flex-col items-center gap-4 hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-24 h-24 bg-gray-900 dark:bg-black rounded-3xl flex items-center justify-center text-white font-bold text-2xl shadow-xl border border-white/30">
                    <span className="text-[#00C2FF]">C</span>
                    <span className="text-white">hariow</span>
                  </div>
                  <span className="text-base font-bold text-gray-700 dark:text-gray-300">Instantané</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
