import { Star } from 'lucide-react'

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Adopté par des milliers d'entrepreneurs</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Découvrez comment StockFlow AF transforme le quotidien des commerçants à travers le continent.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex text-yellow-400 mb-6 justify-center md:justify-start w-full">
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-8 italic">"Avant StockFlow AF, je perdais des heures à faire mon inventaire chaque semaine. Maintenant, tout est automatisé et je sais exactement quand recommander mes articles les plus vendus."</p>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-xl shrink-0">A</div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Amina N.</h4>
                <p className="text-sm text-gray-500">Gérante de Boutique</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex text-yellow-400 mb-6 justify-center md:justify-start w-full">
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-8 italic">"La gestion des dates de péremption était un cauchemar. Les alertes de StockFlow AF nous ont fait économiser des milliers de francs CFA en évitant les pertes de médicaments."</p>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xl shrink-0">K</div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Kwame T.</h4>
                <p className="text-sm text-gray-500">Directeur de Pharmacie</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex text-yellow-400 mb-6 justify-center md:justify-start w-full">
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-8 italic">"Le scan des codes QR avec le téléphone a révolutionné notre façon de travailler. Mes employés n'ont même plus besoin de passer par le bureau pour mettre à jour le stock de matériaux."</p>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center font-bold text-xl shrink-0">S</div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Seydou B.</h4>
                <p className="text-sm text-gray-500">Gérant de Quincaillerie</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
