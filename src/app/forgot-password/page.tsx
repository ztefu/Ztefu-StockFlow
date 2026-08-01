import { resetPassword } from './actions'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { ShieldAlert, Key, LockKeyhole } from 'lucide-react'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const resolvedParams = await searchParams
  const error = resolvedParams.error === 'true'
  const message = resolvedParams.message

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-gray-900 selection:bg-primary/30">
      
      {/* Left Section - Form (1/3 width on lg) */}
      <div className="w-full flex-1 lg:flex-none lg:w-1/3 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative bg-gray-50 lg:bg-white dark:bg-gray-900 z-50 border-r border-gray-100 dark:border-gray-800">
        
        {/* Mobile Background Decoration */}
        <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent blur-3xl opacity-60"></div>
        </div>

        <div className="w-full max-w-sm bg-white dark:bg-dark-surface lg:bg-transparent lg:dark:bg-transparent lg:shadow-none lg:border-none rounded-2xl shadow-xl border border-white/20 dark:border-gray-800/50 p-6 sm:p-8 z-10 relative">
          
          <div className="mb-8">
            <Link href="/" className="flex items-center justify-center gap-2 mb-6 hover:opacity-80 transition-opacity">
              <Logo size="md" />
              <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">StockFlow AF</span>
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mot de passe oublié</h1>
              <p className="text-sm text-gray-500 mt-2">Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 text-center">
              {message || "Une erreur est survenue."}
            </div>
          )}
          {!error && message && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-600 dark:text-green-400 text-center">
              {message}
            </div>
          )}

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Adresse Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                placeholder="vous@entreprise.com"
              />
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                formAction={resetPassword}
                className="w-full px-4 py-2.5 bg-primary hover:bg-primary-dark active:scale-[0.98] text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-primary/30"
              >
                Envoyer le lien
              </button>
              <div className="text-center mt-4">
                <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  &larr; Retour à la connexion
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right Section - Graphic / Illustration (2/3 width on lg) */}
      <div className="hidden lg:flex lg:w-2/3 relative bg-gray-50/50 dark:bg-gray-900 flex-col justify-center items-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-bl from-primary/10 via-transparent to-primary/5 blur-3xl opacity-60 -z-10"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-2/3 bg-gradient-to-tl from-blue-400/10 to-transparent blur-3xl -z-10"></div>
        
        <div className="w-full max-w-2xl p-8 relative z-10 flex flex-col items-center">
          <div className="mb-10 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Sécurité maximale.</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Vos données sont protégées avec les meilleurs standards de sécurité.</p>
          </div>

          <div className="relative w-full aspect-square md:aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm group floating-image-alt">
            <img 
              className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105" 
              src="/forgot_password_illustration.png"
              alt="StockFlow AF Security"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          
          {/* Floating Micro-Animations */}
          <div className="absolute top-1/3 -left-2 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 floating-icon-delayed z-20">
            <ShieldAlert className="text-primary" size={24} />
          </div>
          
          <div className="absolute bottom-1/3 -right-2 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 floating-icon z-20">
            <LockKeyhole className="text-amber-500" size={24} />
          </div>

          <div className="absolute -top-4 right-1/3 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 animate-float-pulse z-20">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 p-1.5 rounded-full">
              <Key size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
