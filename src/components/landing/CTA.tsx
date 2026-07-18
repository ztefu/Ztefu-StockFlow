import Link from 'next/link'

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden bg-transparent">
      <div className="max-w-5xl mx-auto px-4 md:px-10 relative z-10">
        <div className="group relative bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-3xl p-12 md:p-20 text-center shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-primary/20 hover:-translate-y-1">
          {/* subtle animated glow inside */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] transition-transform duration-700 group-hover:scale-150"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] transition-transform duration-700 group-hover:scale-150"></div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white relative z-10">Prêt à transformer votre gestion ?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto relative z-10">Rejoignez des milliers d'entrepreneurs qui ont déjà simplifié leur quotidien avec StockFlow.</p>
          <Link href="/register" className="inline-block bg-primary text-white px-10 py-4 rounded-full font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 text-lg btn-cta relative z-10">
              Commencer gratuitement
          </Link>
        </div>
      </div>
    </section>
  )
}
