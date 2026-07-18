import Link from 'next/link'
import { ArrowRight, PlayCircle, LineChart, Box, BellRing } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900 -z-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-primary/10 to-transparent blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-gradient-to-tr from-blue-400/10 to-transparent blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-10 grid lg:grid-cols-2 gap-12 items-center">
        <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
            Gérez votre stock comme un pro, sans effort.
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Oubliez les fichiers Excel complexes et les erreurs de saisie. StockFlow vous offre une plateforme intuitive pour suivre votre inventaire en temps réel et optimiser votre activité.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link href="/register" className="bg-primary text-white px-8 py-3.5 rounded-full font-medium hover:bg-primary-dark transition-all flex items-center justify-center gap-2 btn-cta">
              Commencer gratuitement
              <ArrowRight size={18} />
            </Link>
            <a href="#features" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-8 py-3.5 rounded-full font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
              Voir la démonstration
              <PlayCircle size={18} />
            </a>
          </div>
        </div>
        
        <div className="relative w-full aspect-square lg:aspect-[4/3] rounded-2xl p-4 mt-8 lg:mt-0">
          <div className="relative w-full h-full rounded-2xl overflow-hidden glass-card floating-icon z-10">
            <img 
              className="w-full h-full object-cover rounded-xl shadow-lg border border-gray-100 dark:border-gray-800" 
              src="/dashboard-mockup.png"
              alt="StockFlow Dashboard Mockup"
            />
          </div>
          
          {/* Floating Micro-Animations */}
          <div className="absolute top-4 left-2 md:top-10 md:-left-10 bg-white dark:bg-gray-800 p-3 md:p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 floating-icon-delayed z-20">
            <LineChart className="text-primary" size={24} />
          </div>
          
          <div className="absolute bottom-10 right-2 md:bottom-20 md:-right-8 bg-white dark:bg-gray-800 p-3 md:p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 floating-icon z-20">
            <Box className="text-green-500" size={24} />
          </div>

          <div className="absolute -top-2 right-4 md:-top-4 md:right-10 bg-white dark:bg-gray-800 p-2 md:p-3 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 floating-icon-delayed z-20">
            <div className="bg-red-100 dark:bg-red-900/30 text-red-500 p-1.5 md:p-2 rounded-full">
              <BellRing size={16} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
