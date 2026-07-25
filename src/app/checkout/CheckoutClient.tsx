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
  const [acceptedCGU, setAcceptedCGU] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePay = async () => {
    if (!acceptedCGU) return;

    setIsLoading(true);
    const toastId = toast.loading("Génération du lien de paiement...");

    try {
      const res = await fetch('/api/billing/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, price, cycle })
      });
      const data = await res.json();

      if (data.link) {
        window.location.href = data.link;
      } else {
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
    <>
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
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-5 flex gap-4 text-sm text-blue-800 dark:text-blue-300 shadow-sm">
          <ShieldCheck className="w-6 h-6 flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
          <div className="leading-relaxed">
            <p className="font-bold mb-2 text-base">Moyens de paiement acceptés</p>
            <p>Le paiement est traité par Stripe. Outre les cartes bancaires classiques (Visa, Mastercard), vous pouvez payer avec votre compte <strong>MTN Mobile Money</strong> ou <strong>Orange Money</strong>.</p>
            <p className="mt-2 text-blue-700 dark:text-blue-200">
              <CheckCircle2 className="inline w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" />
              Générez simplement une <strong>carte bancaire virtuelle</strong> depuis l&apos;application de votre opérateur et insérez-la sur la page de paiement Stripe.
            </p>
          </div>
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
    </>
  );
}
