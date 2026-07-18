import { resetPassword } from './actions'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export default async function ForgotPasswordPage({
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mot de passe oublié</h1>
            <p className="text-sm text-gray-500 mt-2">Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {message || "Une erreur est survenue."}
          </div>
        )}
        {!error && message && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-600 dark:text-green-400">
            {message}
          </div>
        )}

        <form className="space-y-4">
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

          <div className="pt-4 flex flex-col gap-3">
            <button
              formAction={resetPassword}
              className="w-full px-4 py-2.5 bg-primary hover:bg-primary-dark active:scale-[0.98] text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-primary/30"
            >
              Envoyer le lien
            </button>
            <div className="text-center mt-2">
              <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                Retour à la connexion
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
