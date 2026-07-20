'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80; // Offset for navbar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="flex justify-between items-center w-full px-4 md:px-10 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">StockFlow AF</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <a onClick={(e) => scrollToSection(e, 'how-it-works')} href="#how-it-works" className="text-gray-600 dark:text-gray-300 font-medium hover:text-primary dark:hover:text-primary transition-colors text-sm">Comment ça marche</a>
          <a onClick={(e) => scrollToSection(e, 'features')} href="#features" className="text-gray-600 dark:text-gray-300 font-medium hover:text-primary dark:hover:text-primary transition-colors text-sm">Fonctionnalités</a>
          <a onClick={(e) => scrollToSection(e, 'testimonials')} href="#testimonials" className="text-gray-600 dark:text-gray-300 font-medium hover:text-primary dark:hover:text-primary transition-colors text-sm">Témoignages</a>
          <a onClick={(e) => scrollToSection(e, 'pricing')} href="#pricing" className="text-gray-600 dark:text-gray-300 font-medium hover:text-primary dark:hover:text-primary transition-colors text-sm">Tarifs</a>
          <a onClick={(e) => scrollToSection(e, 'faq')} href="#faq" className="text-gray-600 dark:text-gray-300 font-medium hover:text-primary dark:hover:text-primary transition-colors text-sm">FAQ</a>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-gray-900 dark:text-white font-medium text-sm hover:text-primary transition-colors">Connexion</Link>
          <Link href="/register" className="bg-primary text-white px-6 py-2 rounded-full font-medium text-sm hover:bg-primary-dark transition-colors shadow-sm hover:shadow-md btn-cta">Essai gratuit</Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-900 dark:text-white p-2">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-lg absolute w-full left-0">
          <div className="px-4 py-6 space-y-4 flex flex-col">
            <a onClick={(e) => scrollToSection(e, 'how-it-works')} href="#how-it-works" className="text-gray-600 dark:text-gray-300 font-medium text-base py-2">Comment ça marche</a>
            <a onClick={(e) => scrollToSection(e, 'features')} href="#features" className="text-gray-600 dark:text-gray-300 font-medium text-base py-2">Fonctionnalités</a>
            <a onClick={(e) => scrollToSection(e, 'testimonials')} href="#testimonials" className="text-gray-600 dark:text-gray-300 font-medium text-base py-2">Témoignages</a>
            <a onClick={(e) => scrollToSection(e, 'pricing')} href="#pricing" className="text-gray-600 dark:text-gray-300 font-medium text-base py-2">Tarifs</a>
            <a onClick={(e) => scrollToSection(e, 'faq')} href="#faq" className="text-gray-600 dark:text-gray-300 font-medium text-base py-2">FAQ</a>
            <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
            <Link onClick={() => setMobileMenuOpen(false)} href="/login" className="text-gray-900 dark:text-white font-medium text-base py-2">Connexion</Link>
            <Link onClick={() => setMobileMenuOpen(false)} href="/register" className="bg-primary text-white px-6 py-3 rounded-xl font-medium text-center mt-2">Essai gratuit</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
