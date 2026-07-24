import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export const metadata = {
  title: 'À propos - StockFlow AF',
  description: 'Découvrez l\'histoire et la mission de StockFlow AF.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg selection:bg-primary/30 flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 md:px-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 text-center">À propos de StockFlow AF</h1>
          
          <div className="bg-white dark:bg-dark-surface p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Notre Mission</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Chez StockFlow AF, notre mission est de simplifier et de démocratiser la gestion des stocks pour les petites et moyennes entreprises en Afrique. Nous croyons que chaque entrepreneur mérite des outils performants pour développer son activité sans se soucier des complexités techniques ou des coûts exorbitants.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Notre Histoire</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Né de l'observation des défis quotidiens rencontrés par les commerçants locaux, StockFlow AF a été conçu pour remplacer les méthodes traditionnelles sur papier ou les tableurs complexes. 
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Depuis notre lancement, nous accompagnons des milliers d'entrepreneurs dans leur transition numérique, en leur offrant une solution intuitive, fiable et adaptée à leurs réalités.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nos Valeurs</h2>
              <ul className="list-disc pl-6 space-y-3 text-lg text-gray-600 dark:text-gray-400">
                <li><strong className="text-gray-900 dark:text-gray-200">Simplicité :</strong> Des interfaces claires, sans superflu.</li>
                <li><strong className="text-gray-900 dark:text-gray-200">Fiabilité :</strong> Vos données sont en sécurité et toujours accessibles.</li>
                <li><strong className="text-gray-900 dark:text-gray-200">Proximité :</strong> Un support à l'écoute et ancré dans les réalités de nos utilisateurs.</li>
                <li><strong className="text-gray-900 dark:text-gray-200">Innovation :</strong> L'amélioration continue de nos outils pour toujours mieux vous servir.</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
