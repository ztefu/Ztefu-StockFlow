"use client";

import { ShoppingBag, HeartPulse, Hammer, Store, Truck, Coffee, Laptop, Dumbbell, Briefcase, Scissors } from 'lucide-react'
import { motion } from 'framer-motion'

export function SocialProof() {
  const companies = [
    { name: "AfriMarket", icon: <ShoppingBag size={20} /> },
    { name: "PharmaPlus", icon: <HeartPulse size={20} /> },
    { name: "BuildPro", icon: <Hammer size={20} /> },
    { name: "RetailMax", icon: <Store size={20} /> },
    { name: "ExpressLog", icon: <Truck size={20} /> },
    { name: "CaféDélice", icon: <Coffee size={20} /> },
    { name: "TechStore", icon: <Laptop size={20} /> },
    { name: "FitLife", icon: <Dumbbell size={20} /> },
    { name: "OfficePro", icon: <Briefcase size={20} /> },
    { name: "StyleCoiff", icon: <Scissors size={20} /> },
  ];

  return (
    <section className="pb-16 bg-transparent overflow-hidden relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 md:px-10"
      >
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-widest text-center">Ils nous font confiance pour leur croissance</p>
        
        <div className="w-full overflow-hidden whitespace-nowrap relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
          <div className="scrolling-wrapper flex gap-12 md:gap-20 transition-all duration-500 py-4">
          {/* First set of logos */}
          {companies.map((company, i) => (
            <div key={`set1-${i}`} className="group flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-125">
              <div className="text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors duration-300">{company.icon}</div>
              <span className="text-sm font-medium text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors duration-300">{company.name}</span>
            </div>
          ))}
          {/* Duplicated set for infinite loop */}
          {companies.map((company, i) => (
            <div key={`set2-${i}`} className="group flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-125">
              <div className="text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors duration-300">{company.icon}</div>
              <span className="text-sm font-medium text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors duration-300">{company.name}</span>
            </div>
          ))}
        </div>
      </div>
      </motion.div>
    </section>
  )
}
