'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import Link from 'next/link'

type FeatureValue = string | boolean

interface PlanFeature {
  name: string
  free: FeatureValue
  pro: FeatureValue
  business: FeatureValue
}

const featuresList: PlanFeature[] = [
  { name: 'Produits', free: '50', pro: '2000', business: 'Illimités' },
  { name: 'Utilisateurs', free: '1', pro: '5', business: 'Illimités' },
  { name: 'Catégories', free: '5', pro: 'Illimitées', business: 'Illimitées' },
  { name: 'Mouvements / mois', free: '200', pro: 'Illimités', business: 'Illimités' },
  { name: 'Export PDF/CSV', free: false, pro: true, business: true },
  { name: 'QR Code', free: true, pro: true, business: true },
  { name: 'Scanner QR', free: false, pro: true, business: true },
  { name: 'Rapports avancés', free: false, pro: true, business: true },
  { name: 'Alertes', free: 'Basiques', pro: 'Avancées', business: 'Avancées' },
  { name: 'Multi-utilisateurs', free: false, pro: true, business: true },
  { name: 'Support', free: 'Communauté', pro: 'Email', business: 'Prioritaire + Tél' },
  { name: 'Logo personnalisé', free: false, pro: true, business: true },
  { name: 'Import CSV', free: false, pro: true, business: true },
]

// Les 4 premières fonctionnalités sont considérées comme "basiques" (toujours visibles)
const BASIC_FEATURES_COUNT = 4

const FeatureItem = ({ value, name, isHighlighted }: { value: FeatureValue, name: string, isHighlighted?: boolean }) => {
  const textColor = isHighlighted ? "text-white" : "text-gray-700 dark:text-gray-200";
  const iconColor = isHighlighted ? "text-white" : "text-primary";
  const disabledColor = isHighlighted ? "text-white/50" : "text-gray-500";
  const disabledIconColor = isHighlighted ? "text-white/40" : "text-red-400";
  
  if (value === false) {
    return (
      <li className="flex items-center gap-3 opacity-70">
        <XCircle className={`${disabledIconColor} shrink-0`} size={20} />
        <span className={`${disabledColor} line-through text-sm`}>{name}</span>
      </li>
    )
  }
  
  const stringValue = String(value);
  const isIllimite = stringValue.toLowerCase().includes('illimité');

  return (
    <li className="flex items-center gap-3">
      <CheckCircle2 className={`${iconColor} shrink-0`} size={20} />
      <span className={`${textColor} text-sm`}>
        {name === 'Support' ? (
          <>Support <span className="font-bold">{stringValue.toLowerCase()}</span></>
        ) : name === 'Alertes' ? (
          <>Alertes <span className="font-bold">{stringValue.toLowerCase()}</span></>
        ) : isIllimite ? (
          <>{name} <span className="font-bold">{stringValue.toLowerCase()}</span></>
        ) : (
          <>Jusqu'à <span className="font-bold">{value}</span> {name.toLowerCase()}</>
        )}
      </span>
    </li>
  )
}

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  // Prix en promotion
  const proMonthly = 5000
  const proOldMonthly = 9900
  const businessMonthly = 15000
  const businessOldMonthly = 19900

  // Equivalent mensuel avec -20% pour l'annuel (basé sur le prix promo)
  const proMonthlyEquiv = proMonthly * 0.8
  const businessMonthlyEquiv = businessMonthly * 0.8

  // Total facturé par an
  const proAnnualTotal = proMonthlyEquiv * 12
  const businessAnnualTotal = businessMonthlyEquiv * 12

  const cycleParam = isAnnual ? '&cycle=annual' : ''

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

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
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          {/* Free Plan */}
          <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Gratuit</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Pour démarrer sereinement.</p>
            <div className="mb-8 min-h-[80px]">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">0 XAF</span>
              <span className="text-gray-500">/mois</span>
            </div>
            
            <ul className="space-y-4 mb-6 flex-grow">
              {featuresList.slice(0, isExpanded ? featuresList.length : BASIC_FEATURES_COUNT).map((feat, idx) => (
                <FeatureItem key={idx} name={feat.name} value={feat.free} />
              ))}
            </ul>
            
            <button 
              onClick={toggleExpand}
              className="text-primary text-sm font-medium flex items-center gap-1 mb-8 hover:underline"
            >
              {isExpanded ? (
                <>Voir moins <ChevronUp size={16}/></>
              ) : (
                <>Voir la liste détaillée <ChevronDown size={16}/></>
              )}
            </button>

            <Link href={`/register?plan=Gratuit${cycleParam}`} className="w-full text-center bg-white text-gray-900 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 mt-auto">Commencer</Link>
          </div>
          
          {/* Pro Plan (Highlighted) */}
          <div className="bg-[#1a56db] dark:bg-blue-600 p-8 rounded-3xl relative transform md:-translate-y-4 transition-all duration-300 flex flex-col h-full shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1e40af] dark:bg-blue-900 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-md">Le plus populaire</div>
            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
            <p className="text-blue-100 mb-6">Pour les commerces en pleine croissance.</p>
            
            <div className="mb-8 min-h-[80px] flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-xl text-blue-200 line-through">{proOldMonthly}</span>
                <span className="text-4xl font-bold text-white">{isAnnual ? proMonthlyEquiv : proMonthly} XAF</span>
                <span className="text-blue-200">/mois</span>
              </div>
              {isAnnual && (
                <div className="mt-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-white">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    Facturé {proAnnualTotal.toLocaleString('fr-FR')} XAF / an
                  </span>
                </div>
              )}
            </div>
            
            <ul className="space-y-4 mb-6 flex-grow">
              {featuresList.slice(0, isExpanded ? featuresList.length : BASIC_FEATURES_COUNT).map((feat, idx) => (
                <FeatureItem key={idx} name={feat.name} value={feat.pro} isHighlighted={true} />
              ))}
            </ul>

            <button 
              onClick={toggleExpand}
              className="text-white text-sm font-medium flex items-center gap-1 mb-8 hover:underline opacity-90"
            >
              {isExpanded ? (
                <>Voir moins <ChevronUp size={16}/></>
              ) : (
                <>Voir la liste détaillée <ChevronDown size={16}/></>
              )}
            </button>

            <Link href={`/register?plan=Pro${cycleParam}`} className="w-full text-center bg-white text-[#1a56db] py-3 rounded-full font-bold hover:bg-gray-50 transition-colors shadow-lg mt-auto">Souscrire au plan Pro</Link>
          </div>
          
          {/* Business Plan */}
          <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Business</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Pour les réseaux de points de vente.</p>
            
            <div className="mb-8 min-h-[80px] flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-xl text-gray-400 line-through">{businessOldMonthly}</span>
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{isAnnual ? businessMonthlyEquiv : businessMonthly} XAF</span>
                <span className="text-gray-500">/mois</span>
              </div>
              {isAnnual && (
                <div className="mt-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full text-xs font-bold text-blue-700 dark:text-blue-400">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    Facturé {businessAnnualTotal.toLocaleString('fr-FR')} XAF / an
                  </span>
                </div>
              )}
            </div>
            
            <ul className="space-y-4 mb-6 flex-grow">
              {featuresList.slice(0, isExpanded ? featuresList.length : BASIC_FEATURES_COUNT).map((feat, idx) => (
                <FeatureItem key={idx} name={feat.name} value={feat.business} />
              ))}
            </ul>

            <button 
              onClick={toggleExpand}
              className="text-primary text-sm font-medium flex items-center gap-1 mb-8 hover:underline"
            >
              {isExpanded ? (
                <>Voir moins <ChevronUp size={16}/></>
              ) : (
                <>Voir la liste détaillée <ChevronDown size={16}/></>
              )}
            </button>

            <Link href={`/register?plan=Business${cycleParam}`} className="w-full text-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-3 rounded-full font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mt-auto">Souscrire au plan Business</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

