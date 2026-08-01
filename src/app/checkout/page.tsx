import { CheckoutClient } from './CheckoutClient'

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; price?: string; cycle?: string }>
}) {
  const resolvedParams = await searchParams

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-gray-900 selection:bg-primary/30">

      {/* Left Section - Form */}
      <div className="w-full flex-1 lg:flex-none lg:w-1/3 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative bg-gray-50 lg:bg-white dark:bg-gray-900 z-10 lg:border-r lg:border-gray-100 lg:dark:border-gray-800">

        {/* Mobile Background Decoration */}
        <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent blur-3xl opacity-60"></div>
        </div>

        <div className="w-full max-w-lg bg-white dark:bg-dark-surface lg:bg-transparent lg:dark:bg-transparent lg:shadow-none lg:border-none rounded-2xl shadow-xl border border-white/20 dark:border-gray-800/50 p-6 sm:p-8 z-10 relative">

          <CheckoutClient
            plan={resolvedParams.plan || 'Inconnu'}
            price={resolvedParams.price ? parseInt(resolvedParams.price) : 0}
            cycle={(resolvedParams.cycle as 'monthly' | 'annual') || 'monthly'}
          />
        </div>
      </div>

      {/* Right Section - Graphic / Illustration */}
      <div className="hidden lg:flex lg:w-2/3 relative bg-gray-50/50 dark:bg-gray-900 flex-col justify-center items-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-bl from-primary/10 via-transparent to-primary/5 blur-3xl opacity-60 -z-10"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-2/3 bg-gradient-to-tl from-blue-400/10 to-transparent blur-3xl -z-10"></div>

        <div className="w-full max-w-2xl p-8 relative z-10 flex flex-col items-center text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">Paiement Simple et Sécurisé.</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-16">Réglez votre abonnement en toute sécurité avec Stripe. Vous pouvez utiliser votre carte bancaire classique ou les cartes virtuelles générées via vos opérateurs locaux.</p>

          <div className="flex gap-6 items-center justify-center bg-white/50 dark:bg-gray-800/50 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 backdrop-blur-md shadow-2xl relative">

            {/* Floating elements to add animation */}
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
        </div>
      </div>
    </div>
  )
}
