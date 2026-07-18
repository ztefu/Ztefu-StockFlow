import { ShoppingBag, HeartPulse, Hammer, Store, Truck, Coffee, Laptop, Dumbbell, Briefcase, Scissors } from 'lucide-react'

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
    <section className="py-12 bg-white dark:bg-dark-surface border-y border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-10 text-center">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-widest">Ils nous font confiance pour leur croissance</p>
      </div>
      
      <div className="w-full overflow-hidden whitespace-nowrap relative">
        <div className="scrolling-wrapper flex gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 pl-12 md:pl-20">
          {/* First set of logos */}
          {companies.map((company, i) => (
            <div key={`set1-${i}`} className="flex items-center gap-2">
              <div className="text-gray-600 dark:text-gray-400">{company.icon}</div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{company.name}</span>
            </div>
          ))}
          {/* Duplicated set for infinite loop */}
          {companies.map((company, i) => (
            <div key={`set2-${i}`} className="flex items-center gap-2">
              <div className="text-gray-600 dark:text-gray-400">{company.icon}</div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{company.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
