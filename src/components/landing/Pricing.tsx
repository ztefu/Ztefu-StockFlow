import { CheckCircle2 } from 'lucide-react'

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Des tarifs adaptés à votre croissance</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Choisissez le plan qui correspond le mieux aux besoins de votre entreprise.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
          {/* Free Plan */}
          <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Gratuit</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Pour démarrer sereinement.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">0 CFA</span>
              <span className="text-gray-500">/mois</span>
            </div>
            <ul className="space-y-4 mb-8 w-full">
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-primary shrink-0" size={20} /><span className="text-gray-600 dark:text-gray-300">Jusqu'à 100 produits</span></li>
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-primary shrink-0" size={20} /><span className="text-gray-600 dark:text-gray-300">1 utilisateur</span></li>
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-primary shrink-0" size={20} /><span className="text-gray-600 dark:text-gray-300">Support par email</span></li>
            </ul>
            <button className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-3 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mt-auto">Commencer</button>
          </div>
          
          {/* Pro Plan (Highlighted) */}
          <div className="bg-primary p-8 rounded-2xl border border-primary shadow-xl relative transform md:-translate-y-4 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-900 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap">Le plus populaire</div>
            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
            <p className="text-blue-100 mb-6">Pour les commerces en pleine croissance.</p>
            <div className="mb-8 text-white">
              <span className="text-4xl font-bold">5000 CFA</span>
              <span className="text-blue-200">/mois</span>
            </div>
            <ul className="space-y-4 mb-8 text-white w-full">
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-blue-300 shrink-0" size={20} /><span>Produits illimités</span></li>
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-blue-300 shrink-0" size={20} /><span>Jusqu'à 5 utilisateurs</span></li>
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-blue-300 shrink-0" size={20} /><span>Alertes par SMS & Email</span></li>
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-blue-300 shrink-0" size={20} /><span>Support prioritaire</span></li>
            </ul>
            <button className="w-full bg-white text-primary py-3 rounded-full font-medium hover:bg-gray-50 transition-colors shadow-lg btn-cta mt-auto">Commencer gratuitement</button>
          </div>
          
          {/* Business Plan */}
          <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Business</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Pour les réseaux de points de vente.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">15000 CFA</span>
              <span className="text-gray-500">/mois</span>
            </div>
            <ul className="space-y-4 mb-8 w-full">
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-primary shrink-0" size={20} /><span className="text-gray-600 dark:text-gray-300">Tout du plan Pro</span></li>
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-primary shrink-0" size={20} /><span className="text-gray-600 dark:text-gray-300">Utilisateurs illimités</span></li>
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-primary shrink-0" size={20} /><span className="text-gray-600 dark:text-gray-300">Multi-boutiques</span></li>
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-primary shrink-0" size={20} /><span className="text-gray-600 dark:text-gray-300">Accompagnement dédié</span></li>
            </ul>
            <button className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-3 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mt-auto">Contacter les ventes</button>
          </div>
        </div>
      </div>
    </section>
  )
}
