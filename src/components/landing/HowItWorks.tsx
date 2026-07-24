"use client";

import { UserPlus, PackagePlus, LineChart } from 'lucide-react'
import { motion } from 'framer-motion'

export function HowItWorks() {
  const steps = [
    {
      icon: <UserPlus className="text-primary" size={32} />,
      title: "1. Inscription",
      description: "Créez votre compte en quelques secondes. C'est rapide, gratuit et sans engagement."
    },
    {
      icon: <PackagePlus className="text-primary" size={32} />,
      title: "2. Ajoutez vos produits",
      description: "Importez votre catalogue ou ajoutez vos produits manuellement avec leurs niveaux de stock."
    },
    {
      icon: <LineChart className="text-primary" size={32} />,
      title: "3. Suivez vos mouvements",
      description: "Gérez vos entrées et sorties, et visualisez vos performances grâce au tableau de bord intuitif."
    }
  ]

  return (
    <section id="how-it-works" className="py-24 bg-transparent border-t border-gray-100/50 dark:border-gray-800/50 relative overflow-hidden">
      {/* Subtle background element */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 md:px-10"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Comment ça marche ?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Commencez à gérer votre stock comme un professionnel en trois étapes simples.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-[20%] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent z-0"></div>
          
          {steps.map((step, i) => (
            <div key={i} className="group relative z-10 flex flex-col items-center text-center p-6 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:bg-white/80 dark:hover:bg-gray-800/80">
              <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mb-6 shadow-md border border-gray-100 dark:border-gray-700 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-primary/20">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 transition-colors group-hover:text-primary">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
