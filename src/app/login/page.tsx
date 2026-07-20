import { login } from './actions'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const resolvedParams = await searchParams
  const error = resolvedParams.error === 'true'
  const message = resolvedParams.message

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 relative overflow-hidden">
      {/* Background decoration from landing page */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-primary/10 to-transparent blur-3xl opacity-60 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-gradient-to-tr from-blue-400/10 to-transparent blur-3xl -z-10"></div>

      <div className="w-full max-w-md bg-white/90 dark:bg-dark-surface/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-800/50 p-8 z-10 relative">
        <div className="mb-8">
          <Link href="/" className="flex items-center justify-center gap-2 mb-6 hover:opacity-80 transition-opacity">
            <Logo size="md" />
            <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">StockFlow AF</span>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Se connecter</h1>
            <p className="text-sm text-gray-500 mt-2">Connectez-vous pour accéder à votre espace de gestion.</p>
          </div>
        </div>

        <div className="bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-xl flex items-center mb-8">
          <Link href="/login" className="flex-1 text-center py-2 text-sm font-semibold rounded-lg bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white transition-all">
            Connexion
          </Link>
          <Link href="/register" className="flex-1 text-center py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
            Inscription
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center justify-center">
            {message || "Une erreur est survenue lors de l'authentification."}
          </div>
        )}
        {!error && message && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-600 dark:text-green-400 flex items-center justify-center">
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
          
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mot de passe
              </label>
              <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
              placeholder="********"
            />
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              formAction={login}
              className="w-full px-4 py-3 bg-primary hover:bg-primary-dark active:scale-[0.98] text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-primary/30"
            >
              Se connecter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
