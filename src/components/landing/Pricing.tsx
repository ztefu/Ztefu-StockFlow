'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)

  // Prix de base (Mensuel)
  const proMonthly = 5000
  const businessMonthly = 15000

  // Equivalent mensuel avec -20%
  const proMonthlyEquiv = proMonthly * 0.8
  const businessMonthlyEquiv = businessMonthly * 0.8

  // Total facturé par an
  const proAnnualTotal = proMonthlyEquiv * 12
  const businessAnnualTotal = businessMonthlyEquiv * 12

  const cycleParam = isAnnual ? '&cycle=annual' : ''

  return (
    <section id="pricing" className="py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-10 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Des tarifs adaptés à votre croissance</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">Choisissez le plan qui correspond le mieux aux besoins de votre entreprise.</p>
          
          {/* Toggle Mensuel / Annuel */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Mensuel</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-7 w-14 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Annuel</span>
              <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">-20%</span>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
          {/* Free Plan */}
          <div className="bg-white/60 dark:bg-dark-surface/60 backdrop-blur-md p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col items-center md:items-start text-center md:text-left h-full">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Gratuit</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Pour démarrer sereinement.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">0 CFA</span>
              <span className="text-gray-500">/mois</span>
            </div>
            <ul className="space-y-4 mb-8 w-full">
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-primary shrink-0" size={20} /><span className="text-gray-600 dark:text-gray-300">Jusqu'à 50 produits</span></li>
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-primary shrink-0" size={20} /><span className="text-gray-600 dark:text-gray-300">1 utilisateur</span></li>
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-primary shrink-0" size={20} /><span className="text-gray-600 dark:text-gray-300">Support par email</span></li>
            </ul>
            <Link href={`/register?plan=Gratuit${cycleParam}`} className="w-full text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-3 rounded-full font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mt-auto border border-gray-200 dark:border-gray-700 block">Commencer</Link>
          </div>
          
          {/* Pro Plan (Highlighted) */}
          <div className="bg-primary p-8 rounded-3xl border border-primary shadow-xl shadow-primary/20 relative transform md:-translate-y-6 hover:-translate-y-8 transition-all duration-300 flex flex-col items-center md:items-start text-center md:text-left h-full">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-900 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-lg">Le plus populaire</div>
            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
            <p className="text-blue-100 mb-6">Pour les commerces en pleine croissance.</p>
            <div className="mb-8 text-white min-h-[80px]">
              <span className="text-4xl font-bold">{isAnnual ? proMonthlyEquiv : proMonthly} CFA</span>
              <span className="text-blue-200">/mois</span>
              {isAnnual && (
                <div className="text-sm text-blue-200 mt-1 font-medium">
                  Facturé {proAnnualTotal.toLocaleString('fr-FR')} CFA par an
                </div>
              )}
            </div>
            <ul className="space-y-4 mb-8 text-white w-full">
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-blue-300 shrink-0" size={20} /><span>Jusqu'à 2000 produits</span></li>
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-blue-300 shrink-0" size={20} /><span>Jusqu'à 5 utilisateurs</span></li>
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-blue-300 shrink-0" size={20} /><span>Alertes par SMS & Email</span></li>
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-blue-300 shrink-0" size={20} /><span>Support prioritaire</span></li>
            </ul>
            <Link href={`/register?plan=Pro${cycleParam}`} className="w-full text-center bg-white text-primary py-3 rounded-full font-medium hover:bg-gray-50 transition-colors shadow-lg btn-cta mt-auto block">Souscrire au plan Pro</Link>
          </div>
          
          {/* Business Plan */}
          <div className="bg-white/60 dark:bg-dark-surface/60 backdrop-blur-md p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col items-center md:items-start text-center md:text-left h-full">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Business</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Pour les réseaux de points de vente.</p>
            <div className="mb-8 min-h-[80px]">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">{isAnnual ? businessMonthlyEquiv : businessMonthly} CFA</span>
              <span className="text-gray-500">/mois</span>
              {isAnnual && (
                <div className="text-sm text-gray-500 mt-1 font-medium">
                  Facturé {businessAnnualTotal.toLocaleString('fr-FR')} CFA par an
                </div>
              )}
            </div>
            <ul className="space-y-4 mb-8 w-full">
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-primary shrink-0" size={20} /><span className="text-gray-600 dark:text-gray-300">Produits illimités</span></li>
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-primary shrink-0" size={20} /><span className="text-gray-600 dark:text-gray-300">Utilisateurs illimités</span></li>
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-primary shrink-0" size={20} /><span className="text-gray-600 dark:text-gray-300">Multi-boutiques</span></li>
              <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle2 className="text-primary shrink-0" size={20} /><span className="text-gray-600 dark:text-gray-300">Accompagnement dédié</span></li>
            </ul>
            <Link href={`/register?plan=Business${cycleParam}`} className="w-full text-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-3 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mt-auto block">Souscrire au plan Business</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
