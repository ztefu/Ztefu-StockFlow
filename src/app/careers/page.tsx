import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Carrières - StockFlow AF',
  description: 'Rejoignez l\'équipe de StockFlow AF.',
}

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg selection:bg-primary/30 flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 md:px-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Rejoignez l'aventure</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Contribuez à bâtir le futur de la gestion de stock en Afrique. Nous sommes toujours à la recherche de talents passionnés.
            </p>
          </div>
          
          <div className="bg-white dark:bg-dark-surface p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🚀</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Aucun poste ouvert pour le moment</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
              Nous n'avons pas d'offres d'emploi spécifiques en ce moment, mais nous sommes toujours ravis de découvrir des profils exceptionnels.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Candidature spontanée
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
              <div className="text-3xl mb-4">🌍</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Télétravail</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Travaillez d'où vous voulez. Nous privilégions les résultats à la présence au bureau.</p>
            </div>
            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
              <div className="text-3xl mb-4">💡</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Innovation</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Vos idées comptent. Nous encourageons la créativité et l'initiative personnelle.</p>
            </div>
            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Évolution</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Grandissez avec nous. Nous investissons dans la formation de notre équipe.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
