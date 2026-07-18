import Link from 'next/link'

export function CTA() {
  return (
    <section className="py-24 bg-primary text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-700 opacity-90 z-0"></div>
      <div className="max-w-7xl mx-auto px-4 md:px-10 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Prêt à transformer votre gestion ?</h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Rejoignez des milliers d'entrepreneurs qui ont déjà simplifié leur quotidien avec StockFlow.</p>
        <Link href="/register" className="inline-block bg-white text-primary px-10 py-4 rounded-full font-semibold hover:bg-gray-50 transition-colors shadow-lg text-lg btn-cta">
            Commencer gratuitement
        </Link>
      </div>
    </section>
  )
}
