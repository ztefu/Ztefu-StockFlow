import { BookOpen, Table, PackageX, Banknote } from 'lucide-react'

export function Problems() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 md:px-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Les défis de la gestion manuelle</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-16">Pourquoi continuer avec des méthodes dépassées quand la technologie peut vous simplifier la vie ?</p>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center md:text-left">
          {/* Problem Card 1 */}
          <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col items-center md:items-start">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
              <BookOpen size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Cahiers perdus</h3>
            <p className="text-gray-600 dark:text-gray-400">Des heures perdues à chercher des informations griffonnées sur des carnets égarés.</p>
          </div>
          
          {/* Problem Card 2 */}
          <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col items-center md:items-start">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center mb-6">
              <Table size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Excel complexe</h3>
            <p className="text-gray-600 dark:text-gray-400">Des formules cassées et des fichiers lourds qui ralentissent votre productivité.</p>
          </div>
          
          {/* Problem Card 3 */}
          <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col items-center md:items-start">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mb-6">
              <PackageX size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ruptures de stock</h3>
            <p className="text-gray-600 dark:text-gray-400">Des ventes manquées à cause d'une mauvaise anticipation des niveaux de stock.</p>
          </div>
          
          {/* Problem Card 4 */}
          <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col items-center md:items-start">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-6">
              <Banknote size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pertes financières</h3>
            <p className="text-gray-600 dark:text-gray-400">Des produits périmés ou volés qui impactent directement votre rentabilité.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
