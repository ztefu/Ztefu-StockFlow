'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const faqs = [
    {
      question: "Dois-je avoir une connexion internet pour utiliser StockFlow ?",
      answer: "StockFlow nécessite une connexion internet pour synchroniser vos données en temps réel sur tous vos appareils. Cependant, une application mobile avec mode hors-ligne basique est en cours de développement."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Absolument. Vos données sont cryptées et sauvegardées quotidiennement sur des serveurs hautement sécurisés. Seuls vous et les membres de votre équipe autorisés y avez accès."
    },
    {
      question: "Puis-je importer mon stock actuel depuis Excel ?",
      answer: "Oui, nous proposons une fonctionnalité d'importation CSV/Excel très simple. Vous pouvez transférer tout votre catalogue actuel en quelques clics sans avoir à tout retaper manuellement."
    }
  ]

  return (
    <section id="faq" className="py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Questions fréquentes</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Tout ce que vous devez savoir sur StockFlow.</p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden transition-all duration-300"
            >
              <button 
                onClick={() => toggleFaq(index)}
                className="w-full flex justify-between items-center text-left p-6 font-medium text-lg text-gray-900 dark:text-white"
              >
                <span>{faq.question}</span>
                <ChevronDown 
                  className={`transition-transform duration-300 text-gray-500 ${openIndex === index ? 'rotate-180' : ''}`} 
                  size={24} 
                />
              </button>
              <div 
                className={`px-6 text-gray-600 dark:text-gray-400 transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === index ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
