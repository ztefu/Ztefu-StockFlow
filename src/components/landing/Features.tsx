import { Box, Tags, ArrowRightLeft, BellRing, QrCode, LineChart } from 'lucide-react'

export function Features() {
  return (
    <section id="features" className="py-24 bg-transparent relative overflow-hidden">
      {/* Subtle background element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Tout ce dont vous avez besoin</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Une suite complète d'outils pensés pour la croissance de votre entreprise.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                <Box size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gestion des Produits</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Ajoutez, modifiez et organisez vos produits avec une interface claire et intuitive.</p>
          </div>
          
          {/* Feature 2 */}
          <div className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                <Tags size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Catégories</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Structurez votre catalogue avec des catégories personnalisées pour une navigation rapide.</p>
          </div>
          
          {/* Feature 3 */}
          <div className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center shrink-0">
                <ArrowRightLeft size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Entrées/Sorties</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Enregistrez les entrées et sorties de stock en quelques clics pour une précision absolue.</p>
          </div>
          
          {/* Feature 4 */}
          <div className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center shrink-0">
                <BellRing size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Alertes</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Recevez des notifications automatiques lorsque le niveau d'un produit devient critique.</p>
          </div>
          
          {/* Feature 5 */}
          <div className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg flex items-center justify-center shrink-0">
                <QrCode size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Codes QR</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Générez et scannez des QR codes pour un inventaire ultra-rapide depuis votre mobile.</p>
          </div>
          
          {/* Feature 6 */}
          <div className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center shrink-0">
                <LineChart size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Rapports</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Visualisez vos performances avec des tableaux de bord clairs et des rapports détaillés.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
