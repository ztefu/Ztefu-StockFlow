import { Logo } from '@/components/ui/logo'
import Link from 'next/link'

export function Footer() {
  return (
    <footer id="contact" className="w-full py-12 md:py-16 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-gray-800">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10 max-w-7xl mx-auto px-4 md:px-10 text-center md:text-left">
        <div className="col-span-2 flex flex-col items-center md:items-start mb-4 md:mb-0">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <Logo size="sm" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">StockFlow</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto md:mx-0">Gérez votre inventaire avec précision et simplicité.</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 hidden md:block">© {new Date().getFullYear()} StockFlow. Tous droits réservés.</p>
        </div>
        
        <div className="col-span-1">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4">Produit</h4>
          <ul className="space-y-3">
            <li><a href="#features" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Fonctionnalités</a></li>
            <li><a href="#pricing" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Tarifs</a></li>
            <li><Link href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Intégrations</Link></li>
          </ul>
        </div>
        
        <div className="col-span-1">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4">Entreprise</h4>
          <ul className="space-y-3">
            <li><Link href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">À propos</Link></li>
            <li><Link href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Carrières</Link></li>
            <li><Link href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Contact</Link></li>
          </ul>
        </div>
        
        <div className="col-span-2 md:col-span-1 mt-4 md:mt-0">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4">Légal</h4>
          <ul className="space-y-3 flex flex-col items-center md:items-start">
            <li><Link href="/legal/confidentialite" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Politique de confidentialité</Link></li>
            <li><Link href="/legal/cgu" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Conditions d'utilisation</Link></li>
          </ul>
        </div>

        <div className="col-span-2 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 md:hidden">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">© {new Date().getFullYear()} StockFlow. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
