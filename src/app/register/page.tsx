import { signup } from '@/app/login/actions'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const resolvedParams = await searchParams
  const error = resolvedParams.error === 'true'
  const message = resolvedParams.message

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Logo size="md" />
            <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">StockFlow</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Creer un compte</h1>
            <p className="text-sm text-gray-500 mt-2">Rejoignez StockFlow pour gérer vos stocks efficacement.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {message || "Une erreur est survenue lors de l'inscription."}
          </div>
        )}

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom complet
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Jean Dupont"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom de l'entreprise
            </label>
            <input
              id="company_name"
              name="company_name"
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Ma Super Entreprise"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Adresse Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="vous@entreprise.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="********"
            />
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              formAction={signup}
              className="w-full px-4 py-2.5 bg-primary hover:bg-primary-dark active:scale-[0.98] text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-primary/30"
            >
              Creer mon compte
            </button>
            <div className="text-center mt-2">
              <span className="text-sm text-gray-500">Deja un compte ? </span>
              <Link href="/login" className="text-sm text-primary hover:underline font-medium">
                Se connecter
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
